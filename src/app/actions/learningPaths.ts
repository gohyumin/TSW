"use server";

import { sql } from "@/lib/db";
import { getCurrentStudent } from "./auth";
import { revalidatePath } from "next/cache";
import { getLessonsForCourse } from "@/lib/courseLessons";

export async function getLearningPathItems() {
  const student = await getCurrentStudent();
  if (!student) return [];

  try {
    const res = await sql`
      SELECT c.id, c.title, c.instructor, c.price, c.gradient_class as gradient, c.emoji,
             (SELECT COUNT(DISTINCT lesson_id) FROM student_quiz_results WHERE student_id = ${student.id} AND course_id = c.id AND score >= 70) as completed_count
      FROM student_learning_paths r
      JOIN courses c ON r.course_id = c.id
      WHERE r.student_id = ${student.id}
      ORDER BY r.added_at DESC
    `;

    return res.map((item) => {
      const completedCount = Number(item.completed_count || 0);
      const progress = Math.min(100, Math.round((completedCount / 3) * 100));
      return {
        id: item.id,
        title: item.title,
        instructor: item.instructor,
        price: Number(item.price),
        gradient: item.gradient,
        emoji: item.emoji,
        progress: progress,
        completedCount: completedCount
      };
    });
  } catch (error) {
    console.error("Failed to get learning path items:", error);
    return [];
  }
}

export async function getCompletedLessonsForCourse(courseId: number): Promise<number[]> {
  const student = await getCurrentStudent();
  if (!student) return [];
  try {
    const results = await sql`
      SELECT lesson_id, score 
      FROM student_quiz_results 
      WHERE student_id = ${student.id} AND course_id = ${courseId}
    `;
    // A lesson is considered completed if they have a quiz score >= 70
    return results.filter((r: any) => Number(r.score) >= 70).map((r: any) => Number(r.lesson_id));
  } catch (error) {
    console.error("Failed to load completed lessons:", error);
    return [];
  }
}

export async function enrollInCourse(courseId: number) {
  const student = await getCurrentStudent();
  if (!student) {
    return { success: false, error: "Please log in to enroll in this course." };
  }

  try {
    await sql`
      INSERT INTO student_learning_paths (student_id, course_id)
      VALUES (${student.id}, ${courseId})
      ON CONFLICT (student_id, course_id) DO NOTHING
    `;

    revalidatePath("/my-learning");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to enroll in course:", error);
    return { success: false, error: "Database error." };
  }
}

export async function removeFromLearningPath(courseId: number) {
  const student = await getCurrentStudent();
  if (!student) {
    return { success: false, error: "Student session expired." };
  }

  try {
    await sql`
      DELETE FROM student_learning_paths
      WHERE student_id = ${student.id} AND course_id = ${courseId}
    `;

    revalidatePath("/my-learning");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove from learning path:", error);
    return { success: false, error: "Database error." };
  }
}

export async function saveQuizResult(
  courseId: number,
  lessonId: number,
  score: number,
  skillsPerformance: Record<string, number>
) {
  const student = await getCurrentStudent();
  if (!student) {
    return { success: false, error: "Please log in to save quiz results." };
  }

  try {
    const performanceJson = JSON.stringify(skillsPerformance);
    await sql`
      INSERT INTO student_quiz_results (student_id, course_id, lesson_id, score, skills_performance)
      VALUES (${student.id}, ${courseId}, ${lessonId}, ${score}, ${performanceJson}::jsonb)
      ON CONFLICT (student_id, course_id, lesson_id)
      DO UPDATE SET
        score = EXCLUDED.score,
        skills_performance = EXCLUDED.skills_performance,
        created_at = NOW()
    `;

    revalidatePath("/my-learning");
    return { success: true };
  } catch (error) {
    console.error("Failed to save quiz result:", error);
    return { success: false, error: "Database error." };
  }
}

export async function removeFromLearningPathWithReason(courseId: number, reasonKey: string) {
  const student = await getCurrentStudent();
  if (!student) {
    return { success: false, error: "Student session expired." };
  }

  try {
    // 1. Delete course from learning path
    await sql`
      DELETE FROM student_learning_paths
      WHERE student_id = ${student.id} AND course_id = ${courseId}
    `;

    // 2. Fetch course data (category, subcategory) to apply semantic feedback
    const courseRes = await sql`
      SELECT c.title, cat.category_name, sub.name as subcategory_name
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
      WHERE c.id = ${courseId}
    `;

    if (courseRes.length > 0) {
      const course = courseRes[0];
      const category = course.category_name;
      const subcategory = course.subcategory_name;

      if (reasonKey === "too-easy") {
        // Mark course lessons concepts as Mastered (100% quiz result)
        const lessons = getLessonsForCourse(courseId, category, subcategory);
        for (const lesson of lessons) {
          const skillsPerf: Record<string, number> = {};
          lesson.questions.forEach((q: any) => {
            if (q.concept) {
              skillsPerf[q.concept] = 100;
            }
          });
          const performanceJson = JSON.stringify(skillsPerf);
          await sql`
            INSERT INTO student_quiz_results (student_id, course_id, lesson_id, score, skills_performance)
            VALUES (${student.id}, ${courseId}, ${lesson.id}, 100, ${performanceJson}::jsonb)
            ON CONFLICT (student_id, course_id, lesson_id)
            DO UPDATE SET score = 100, skills_performance = EXCLUDED.skills_performance, created_at = NOW()
          `;
        }
      } else if (reasonKey === "too-difficult") {
        // Mark course lessons concepts as Weakness (30% quiz result)
        const lessons = getLessonsForCourse(courseId, category, subcategory);
        for (const lesson of lessons) {
          const skillsPerf: Record<string, number> = {};
          lesson.questions.forEach((q: any) => {
            if (q.concept) {
              skillsPerf[q.concept] = 30; // weakness triggers score < 70
            }
          });
          const performanceJson = JSON.stringify(skillsPerf);
          await sql`
            INSERT INTO student_quiz_results (student_id, course_id, lesson_id, score, skills_performance)
            VALUES (${student.id}, ${courseId}, ${lesson.id}, 30, ${performanceJson}::jsonb)
            ON CONFLICT (student_id, course_id, lesson_id)
            DO UPDATE SET score = 30, skills_performance = EXCLUDED.skills_performance, created_at = NOW()
          `;
        }
      } else if (reasonKey === "not-interested") {
        // Remove subcategory interest from student_interests
        if (subcategory) {
          await sql`
            DELETE FROM student_interests
            WHERE student_id = ${student.id} AND interest_name = ${subcategory}
          `;
        }
      } else if (reasonKey === "poor-quality") {
        // Add a 1-star review to block it from future recommendations
        await sql`
          INSERT INTO course_reviews (student_id, course_id, rating, review_text)
          VALUES (${student.id}, ${courseId}, 1, 'Removed from learning path due to poor content quality/low relevance.')
          ON CONFLICT (student_id, course_id)
          DO UPDATE SET rating = 1, review_text = EXCLUDED.review_text
        `;
      }
    }

    revalidatePath("/my-learning");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove course with reason:", error);
    return { success: false, error: "Database error." };
  }
}

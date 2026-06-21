"use server";

import { sql } from "@/lib/db";
import { getCurrentStudent } from "./auth";

export interface CourseData {
  id: number;
  title: string;
  description: string;
  instructor: string;
  price: number;
  category_id: number;
  category_name: string;
  difficulty_level: string;
  duration_hours: number;
  learning_outcome: string;
  career_path: string;
  gradient_class: string;
  emoji: string;
  is_bestseller: boolean;
  rating?: number;
  subcategory_name?: string;
}

export async function getCourses(): Promise<CourseData[]> {
  try {
    const res = await sql`
      SELECT c.*, cat.category_name, 
             COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      ORDER BY c.id ASC
    `;
    
    return res.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      instructor: row.instructor,
      price: Number(row.price),
      category_id: row.category_id,
      category_name: row.category_name,
      difficulty_level: row.difficulty_level,
      duration_hours: Number(row.duration_hours),
      learning_outcome: row.learning_outcome,
      career_path: row.career_path,
      gradient_class: row.gradient_class,
      emoji: row.emoji,
      is_bestseller: row.is_bestseller,
      rating: Number(row.rating) ? Math.round(Number(row.rating) * 10) / 10 : 0
    }));
  } catch (error) {
    console.error("Failed to get courses:", error);
    return [];
  }
}

export async function getCourseById(courseId: number): Promise<any | null> {
  try {
    const coursesRes = await sql`
      SELECT c.*, cat.category_name, sub.name as subcategory_name,
             COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating,
             COALESCE((SELECT COUNT(*) FROM course_reviews WHERE course_id = c.id), 0) as reviews_count
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
      WHERE c.id = ${courseId}
    `;

    if (coursesRes.length === 0) return null;

    const course = coursesRes[0];

    // Fetch required skills
    const skillsRes = await sql`
      SELECT skill_name, skill_level_required
      FROM course_skills
      WHERE course_id = ${courseId}
    `;

    // Fetch course reviews
    const reviewsRes = await sql`
      SELECT r.id, r.rating, r.review_text, r.created_at, s.name as user_name
      FROM course_reviews r
      JOIN students s ON r.student_id = s.id
      WHERE r.course_id = ${courseId}
      ORDER BY r.created_at DESC
    `;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: Number(course.price),
      category_id: course.category_id,
      category_name: course.category_name,
      subcategory_name: course.subcategory_name,
      difficulty_level: course.difficulty_level,
      duration_hours: Number(course.duration_hours),
      learning_outcome: course.learning_outcome,
      career_path: course.career_path,
      gradient_class: course.gradient_class,
      emoji: course.emoji,
      is_bestseller: course.is_bestseller,
      rating: Number(course.rating) ? Math.round(Number(course.rating) * 10) / 10 : 0,
      reviews_count: Number(course.reviews_count),
      skillsRequired: skillsRes.map((s) => ({
        name: s.skill_name,
        level: s.skill_level_required
      })),
      reviews: reviewsRes.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.review_text,
        userName: r.user_name,
        createdAt: r.created_at
      }))
    };
  } catch (error) {
    console.error("Failed to get course by id:", error);
    return null;
  }
}

export async function searchCourses(
  query?: string,
  categoryId?: number,
  difficultyLevel?: string,
  subcategoryId?: number
): Promise<CourseData[]> {
  try {
    const searchPattern = query ? `%${query}%` : null;
    const hasCategory = categoryId !== undefined && categoryId !== null;
    const hasLevel = difficultyLevel !== undefined && difficultyLevel !== null && difficultyLevel !== "All";
    const hasSubcategory = subcategoryId !== undefined && subcategoryId !== null;

    const res = await sql`
      SELECT c.*, cat.category_name, 
             COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      WHERE (${searchPattern}::text IS NULL OR c.title ILIKE ${searchPattern} OR c.description ILIKE ${searchPattern} OR c.instructor ILIKE ${searchPattern})
        AND (${hasCategory}::boolean = false OR c.category_id = ${categoryId})
        AND (${hasLevel}::boolean = false OR c.difficulty_level = ${difficultyLevel})
        AND (${hasSubcategory}::boolean = false OR c.subcategory_id = ${subcategoryId})
      ORDER BY c.id ASC
    `;

    return res.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      instructor: row.instructor,
      price: Number(row.price),
      category_id: row.category_id,
      category_name: row.category_name,
      difficulty_level: row.difficulty_level,
      duration_hours: Number(row.duration_hours),
      learning_outcome: row.learning_outcome,
      career_path: row.career_path,
      gradient_class: row.gradient_class,
      emoji: row.emoji,
      is_bestseller: row.is_bestseller,
      rating: Number(row.rating) ? Math.round(Number(row.rating) * 10) / 10 : 0
    }));
  } catch (error) {
    console.error("Failed to search courses:", error);
    return [];
  }
}

export async function getCategories(): Promise<any[]> {
  try {
    const res = await sql`
      SELECT id, category_name as name FROM categories ORDER BY id ASC
    `;
    return res;
  } catch (error) {
    console.error("Failed to get categories:", error);
    return [];
  }
}

export async function submitCourseReview(
  courseId: number,
  rating: number,
  reviewText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return { success: false, error: "You must be logged in to submit a review." };
    }

    const studentId = student.id;

    // Upsert review (students can only review a course once)
    await sql`
      INSERT INTO course_reviews (student_id, course_id, rating, review_text)
      VALUES (${studentId}, ${courseId}, ${rating}, ${reviewText})
      ON CONFLICT (student_id, course_id) DO UPDATE
        SET rating = EXCLUDED.rating,
            review_text = EXCLUDED.review_text,
            created_at = NOW()
    `;

    // Seed semantic tags based on the rating
    const reviewRes = await sql`
      SELECT id FROM course_reviews WHERE student_id = ${studentId} AND course_id = ${courseId}
    `;
    if (reviewRes.length > 0) {
      const reviewId = reviewRes[0].id;
      // Clean old semantics if updating
      await sql`DELETE FROM review_semantics WHERE review_id = ${reviewId}`;
      // Insert updated semantic tags
      const suitableFor = rating >= 4 ? "Beginner" : rating >= 3 ? "Intermediate" : "Advanced";
      await sql`
        INSERT INTO review_semantics (review_id, concept, relationship) VALUES
        (${reviewId}, ${suitableFor}, 'suitableFor'),
        (${reviewId}, 'Completed', 'mentionsSkill'),
        (${reviewId}, 'Programming', 'relatedTo')
        ON CONFLICT DO NOTHING
      `;
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "Failed to submit review. Please try again." };
  }
}

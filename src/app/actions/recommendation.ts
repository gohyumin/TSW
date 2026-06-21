"use server";

import { sql } from "@/lib/db";
import { CourseData } from "./courses";
import { runMockInferenceReasoning } from "@/lib/semantic/inferenceService";

export interface RecommendedCourse extends CourseData {
  reasons: string[];
}

/**
 * recommendation.ts
 * Implements the action layer abstraction for recommendations.
 * Fetches user profile inputs and applies Cold Start and Review Semantic Matching.
 */
const SUBCAT_TO_CAT: Record<string, string> = {
  "Python": "Programming",
  "Web Development": "Programming",
  "Business Strategy": "Business",
  "Contract Law": "Law",
  "Robotics & Automation": "Engineering"
};

export async function getRecommendations(studentId: number): Promise<RecommendedCourse[]> {
  try {
    // 1. Fetch Student Profile
    const profileRes = await sql`
      SELECT learning_goal, skill_level, education_background 
      FROM student_profiles 
      WHERE student_id = ${studentId}
    `;
    
    if (profileRes.length === 0) {
      // Default fallback if no profile exists
      return getFallbackFeaturedRecommendations();
    }
    
    const profile = profileRes[0];
    const learningGoal = profile.learning_goal;
    const skillLevel = profile.skill_level;
    const educationBackground = profile.education_background;

    // Fetch Student Interests
    const interestsRes = await sql`
      SELECT interest_name FROM student_interests WHERE student_id = ${studentId}
    `;
    const interestsSet = new Set<string>(interestsRes.map((r) => r.interest_name));

    // Fetch subcategories of courses in active learning path (enrolled) to dynamically capture interest
    const enrolledSubcatsRes = await sql`
      SELECT DISTINCT s.name as sub_name
      FROM student_learning_paths slp
      JOIN courses c ON slp.course_id = c.id
      JOIN subcategories s ON c.subcategory_id = s.id
      WHERE slp.student_id = ${studentId}
    `;
    enrolledSubcatsRes.forEach(r => interestsSet.add(r.sub_name));

    // Fetch subcategories of courses in wishlist to dynamically capture interest
    const wishlistSubcatsRes = await sql`
      SELECT DISTINCT s.name as sub_name
      FROM student_wishlist sw
      JOIN courses c ON sw.course_id = c.id
      JOIN subcategories s ON c.subcategory_id = s.id
      WHERE sw.student_id = ${studentId}
    `;
    wishlistSubcatsRes.forEach(r => interestsSet.add(r.sub_name));

    const interests = Array.from(interestsSet);

    // Fetch Student Skills
    const skillsRes = await sql`
      SELECT skill_name, skill_level FROM student_skills WHERE student_id = ${studentId}
    `;
    const skills = skillsRes.map((r) => ({ name: r.skill_name, level: r.skill_level }));

    // Fetch Completed Courses
    const completedRes = await sql`
      SELECT course_id FROM student_learning_history 
      WHERE student_id = ${studentId} AND completion_status = 'Completed'
    `;
    const completedCourses = completedRes.map(r => r.course_id);

    // Fetch user's own reviews to exclude low-rated courses (rating < 3)
    const studentReviews = await sql`
      SELECT course_id, rating FROM course_reviews WHERE student_id = ${studentId}
    `;
    const lowRatedCourseIds = new Set<number>(
      studentReviews.filter((r: any) => r.rating < 3).map((r: any) => r.course_id)
    );

    // Fetch Quiz Results
    const quizRes = await sql`
      SELECT course_id, lesson_id, score, skills_performance 
      FROM student_quiz_results 
      WHERE student_id = ${studentId}
    `;
    const quizResults = quizRes.map(r => ({
      courseId: r.course_id,
      lessonId: r.lesson_id,
      score: r.score,
      skillsPerformance: typeof r.skills_performance === "string" ? JSON.parse(r.skills_performance) : r.skills_performance
    }));

    // Fetch all subcategories from database to map parent categories
    const allSubsDb = await sql`
      SELECT s.name as sub_name, c.category_name
      FROM subcategories s
      JOIN categories c ON s.parent_category_id = c.id
    `;
    
    // Matched categories and subcategories in user interests
    const userCategoryInterests = new Set<string>();
    const userSubcategoryInterests = new Set<string>();
    
    interests.forEach(interest => {
      const isSub = allSubsDb.some(s => s.sub_name === interest);
      if (isSub) {
        userSubcategoryInterests.add(interest);
      } else {
        userCategoryInterests.add(interest);
      }
    });

    const allowedSubcategories = new Set<string>();
    
    // 1. Add explicitly selected subcategory interests
    userSubcategoryInterests.forEach(sub => allowedSubcategories.add(sub));
    
    // 2. Add subcategories of selected category interests,
    // ONLY IF the user has not selected any specific subcategories in that category.
    userCategoryInterests.forEach(catName => {
      const subcategoriesOfCat = allSubsDb.filter(s => s.category_name === catName).map(s => s.sub_name);
      const userHasSpecificSubInCat = subcategoriesOfCat.some(sub => userSubcategoryInterests.has(sub));
      if (!userHasSpecificSubInCat) {
        subcategoriesOfCat.forEach(sub => allowedSubcategories.add(sub));
      }
    });
    
    // 3. Strict subcategory filtering (no relatedTo expansion)

    // Determine relevant categories for this student based on learning goal & interests
    const relevantCategories = new Set<string>();
    if (learningGoal) {
      if (["Software Developer"].includes(learningGoal)) {
        relevantCategories.add("Programming");
        relevantCategories.add("Engineering");
      } else if (["Business Manager"].includes(learningGoal)) {
        relevantCategories.add("Business");
      } else if (["Legal Counsel"].includes(learningGoal)) {
        relevantCategories.add("Law");
      } else if (["Robotics Engineer"].includes(learningGoal)) {
        relevantCategories.add("Engineering");
        relevantCategories.add("Programming");
      }
    }
    interests.forEach((interest) => {
      if (["Programming", "Business", "Law", "Engineering"].includes(interest)) {
        relevantCategories.add(interest);
      } else {
        const mappedCat = SUBCAT_TO_CAT[interest];
        if (mappedCat) {
          relevantCategories.add(mappedCat);
        }
      }
    });

    // Initialize list of recommendations
    const recommendedList: Record<number, RecommendedCourse> = {};

    // --- SOLUTION 1: COLD START MATCHING ---
    // Rule A: Matches Target Career Path (Learning Goal)
    if (learningGoal) {
      const pathMatches = await sql`
        SELECT c.*, cat.category_name, sub.name as subcategory_name,
               COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating
        FROM courses c
        JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
        WHERE c.career_path = ${learningGoal}
      `;
      
      pathMatches.forEach((row) => {
        addOrUpdateRecommendation(recommendedList, row, `Matches your career goal (${learningGoal})`);
        if (row.difficulty_level === skillLevel) {
          addOrUpdateRecommendation(recommendedList, row, `Matches your skill level preference (${skillLevel})`);
        }
      });
    }

    // --- Rule B & Rule G: Category and Subcategory Interest Matching ---
    if (interests.length > 0) {
      // Fetch category names to separate category interests from subcategory interests
      const matchedCats = await sql`
        SELECT category_name FROM categories WHERE category_name = ANY(${interests})
      `;
      const catNames = matchedCats.map((c) => c.category_name);
      const categoryInterests = interests.filter((i) => catNames.includes(i));
      const subcategoryInterests = interests.filter((i) => !catNames.includes(i));

      // Rule B: Matches Expressed Category Interests (filtered by relevantCategories)
      for (const interest of categoryInterests) {
        // Skip category interests that don't align with user's career goal
        if (relevantCategories.size > 0 && !relevantCategories.has(interest)) {
          continue;
        }
        const interestMatches = await sql`
          SELECT c.*, cat.category_name, sub.name as subcategory_name,
                 COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating
          FROM courses c
          JOIN categories cat ON c.category_id = cat.id
          LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
          WHERE cat.category_name = ${interest}
        `;
        
        interestMatches.forEach((row) => {
          addOrUpdateRecommendation(recommendedList, row, `Follows your learning pathway (${interest})`);
          if (row.difficulty_level === skillLevel) {
            addOrUpdateRecommendation(recommendedList, row, `Matches your skill level preference (${skillLevel})`);
          }
        });
      }

      // Rule G: Matches Subcategory Interests & RDF Ontology Relations
      for (const subName of subcategoryInterests) {
        // 1. Direct subcategory matches
        const directMatches = await sql`
          SELECT c.*, cat.category_name, sub.name as subcategory_name,
                 COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating
          FROM courses c
          JOIN categories cat ON c.category_id = cat.id
          JOIN subcategories sub ON c.subcategory_id = sub.id
          WHERE sub.name = ${subName}
        `;

        directMatches.forEach((row) => {
          addOrUpdateRecommendation(recommendedList, row, `Follows your learning pathway (${subName})`);
          if (row.difficulty_level === skillLevel) {
            addOrUpdateRecommendation(recommendedList, row, `Matches your skill level preference (${skillLevel})`);
          }
        });

        // No related subcategory traversal (strictly follow selected subcategory)
      }
    }

    // Rule C: Matches Skills User Possesses
    if (skills.length > 0) {
      for (const skill of skills) {
        const skillMatches = await sql`
          SELECT c.*, cat.category_name, sub.name as subcategory_name,
                 COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating
          FROM courses c
          JOIN categories cat ON c.category_id = cat.id
          LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
          JOIN course_skills cs ON cs.course_id = c.id
          WHERE cs.skill_name = ${skill.name} AND cs.skill_level_required = ${skill.level}
        `;
        
        skillMatches.forEach((row) => {
          addOrUpdateRecommendation(recommendedList, row, `Fills your missing skill (${skill.name})`);
          if (row.difficulty_level === skillLevel) {
            addOrUpdateRecommendation(recommendedList, row, `Matches your skill level preference (${skillLevel})`);
          }
        });
      }
    }

    // --- Rule E: Matches Academic Background (Education Background) ---
    if (educationBackground) {
      let matchedCategories: string[] = [];
      let reasonText = "";
      if (educationBackground === "Computer Science") {
        matchedCategories = ["Programming"];
        reasonText = `Recommended programming pathway for your Computer Science background`;
      } else if (educationBackground === "Engineering") {
        matchedCategories = ["Engineering", "Programming"];
        reasonText = `Recommended technical pathway for your Engineering background`;
      } else if (educationBackground === "Business") {
        matchedCategories = ["Business"];
        reasonText = `Suggested business pathway for your Business background`;
      } else if (educationBackground === "Arts & Humanities") {
        matchedCategories = ["Business", "Law"];
        reasonText = `Creative and analytical pathway matching your Arts & Humanities background`;
      } else if (educationBackground === "Law") {
        matchedCategories = ["Law"];
        reasonText = `Recommended legal pathway for your Law background`;
      } else {
        matchedCategories = ["Programming"];
        reasonText = `Recommended general programming pathway`;
      }

      if (matchedCategories.length > 0) {
        for (const catName of matchedCategories) {
          // Filter out categories not relevant to user's goal/interests
          if (relevantCategories.size > 0 && !relevantCategories.has(catName)) {
            continue;
          }
          const catMatches = await sql`
            SELECT c.*, cat.category_name, sub.name as subcategory_name,
                   COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating
            FROM courses c
            JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
            WHERE cat.category_name = ${catName}
          `;
          catMatches.forEach((row) => {
            addOrUpdateRecommendation(recommendedList, row, reasonText);
          });
        }
      }
    }



    // --- SOLUTION 2: RDF + OWL ONTOLOGY & INFERENCE ENGINE ---
    try {
      // 1. Fetch all courses with category and subcategory info
      const allCourses = await sql`
        SELECT c.*, cat.category_name, sub.name as subcategory_name,
               COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating
        FROM courses c
        JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
      `;

      // 2. Fetch all review semantics feedback concepts
      const reviewsRes = await sql`
        SELECT cr.id, cr.course_id, cr.rating, rs.concept, rs.relationship
        FROM course_reviews cr
        JOIN review_semantics rs ON rs.review_id = cr.id
      `;

      // 3. Run SWRL/OWL rule reasoning engine
      const inferredRecommendations = runMockInferenceReasoning({
        id: studentId,
        learningGoal: learningGoal,
        skillLevel: skillLevel,
        skills: skills,
        interests: interests,
        completedCourses: completedCourses,
        quizResults: quizResults
      }, allCourses, reviewsRes);

      // 4. Map derived facts into recommendations
      inferredRecommendations.forEach((inf) => {
        const matchedRow = allCourses.find((c) => c.id === inf.courseId);
        if (matchedRow) {
          inf.reasons.forEach((r: string) => {
            addOrUpdateRecommendation(recommendedList, matchedRow, r);
          });
        }
      });
    } catch (reasoningError) {
      console.error("OWL reasoning engine failed to execute:", reasoningError);
    }

    let finalRecs = Object.values(recommendedList);
    
    // Exclude courses that the student reviewed with a low rating (rating < 3)
    finalRecs = finalRecs.filter(course => !lowRatedCourseIds.has(course.id));

    if (allowedSubcategories.size > 0) {
      finalRecs = finalRecs.filter(course => {
        return course.subcategory_name && allowedSubcategories.has(course.subcategory_name);
      });
    }

    // --- SMART SKILL-LEVEL FILTERING ---
    // When multiple courses exist in the same subcategory at different difficulty levels,
    // only recommend the one matching the student's current or next appropriate level.
    const DIFFICULTY_ORDER = ["Beginner", "Intermediate", "Advanced"];

    // Determine the student's effective level per subcategory based on quiz mastery
    const subcatEffectiveLevel: Record<string, string> = {};
    
    // Check quiz results: if student scored >= 70 on a course in a subcategory,
    // they should be recommended the next difficulty level in that subcategory
    for (const qr of quizResults) {
      if (qr.score >= 70) {
        const matchedCourse = finalRecs.find(c => c.id === qr.courseId);
        if (matchedCourse && matchedCourse.subcategory_name) {
          const subName = matchedCourse.subcategory_name;
          const currentIdx = DIFFICULTY_ORDER.indexOf(matchedCourse.difficulty_level);
          const nextLevel = currentIdx < DIFFICULTY_ORDER.length - 1 
            ? DIFFICULTY_ORDER[currentIdx + 1] 
            : DIFFICULTY_ORDER[currentIdx];
          
          // Keep the highest advancement per subcategory
          const existingIdx = DIFFICULTY_ORDER.indexOf(subcatEffectiveLevel[subName] || "");
          const nextIdx = DIFFICULTY_ORDER.indexOf(nextLevel);
          if (nextIdx > existingIdx) {
            subcatEffectiveLevel[subName] = nextLevel;
          }
        }
      }
    }

    // Group courses by subcategory to detect multi-level duplicates
    const subcatGroups: Record<string, RecommendedCourse[]> = {};
    const noSubcatCourses: RecommendedCourse[] = [];
    
    for (const course of finalRecs) {
      if (course.subcategory_name) {
        if (!subcatGroups[course.subcategory_name]) {
          subcatGroups[course.subcategory_name] = [];
        }
        subcatGroups[course.subcategory_name].push(course);
      } else {
        noSubcatCourses.push(course);
      }
    }

    const filteredByLevel: RecommendedCourse[] = [...noSubcatCourses];
    
    for (const [subName, courses] of Object.entries(subcatGroups)) {
      if (courses.length <= 1) {
        // Only one course in this subcategory, keep it
        filteredByLevel.push(...courses);
        continue;
      }
      
      // Multiple courses in same subcategory — pick the right difficulty level
      const targetLevel = subcatEffectiveLevel[subName] || skillLevel || "Beginner";
      const targetIdx = DIFFICULTY_ORDER.indexOf(targetLevel);
      
      // Try exact match first
      const exactMatch = courses.filter(c => c.difficulty_level === targetLevel);
      if (exactMatch.length > 0) {
        filteredByLevel.push(...exactMatch);
      } else {
        // Fallback: pick closest level that is >= target
        const closestAbove = courses
          .filter(c => DIFFICULTY_ORDER.indexOf(c.difficulty_level) >= targetIdx)
          .sort((a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty_level) - DIFFICULTY_ORDER.indexOf(b.difficulty_level));
        
        if (closestAbove.length > 0) {
          filteredByLevel.push(closestAbove[0]);
        } else {
          // All courses are below target level, pick highest available
          const sorted = courses.sort((a, b) => 
            DIFFICULTY_ORDER.indexOf(b.difficulty_level) - DIFFICULTY_ORDER.indexOf(a.difficulty_level)
          );
          filteredByLevel.push(sorted[0]);
        }
      }
    }

    return filteredByLevel;
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    return getFallbackFeaturedRecommendations();
  }
}

function addOrUpdateRecommendation(
  list: Record<number, RecommendedCourse>,
  row: any,
  reason: string
) {
  const ratingVal = Number(row.rating) ? Math.round(Number(row.rating) * 10) / 10 : 0;
  if (list[row.id]) {
    if (!list[row.id].reasons.includes(reason)) {
      list[row.id].reasons.push(reason);
    }
  } else {
    list[row.id] = {
      id: row.id,
      title: row.title,
      description: row.description,
      instructor: row.instructor,
      price: Number(row.price),
      category_id: row.category_id,
      category_name: row.category_name,
      subcategory_name: row.subcategory_name,
      difficulty_level: row.difficulty_level,
      duration_hours: Number(row.duration_hours),
      learning_outcome: row.learning_outcome,
      career_path: row.career_path,
      gradient_class: row.gradient_class,
      emoji: row.emoji,
      is_bestseller: row.is_bestseller,
      rating: ratingVal,
      reasons: [reason]
    };
  }
}

async function getFallbackFeaturedRecommendations(): Promise<RecommendedCourse[]> {
  try {
    const featured = await sql`
      SELECT c.*, cat.category_name, sub.name as subcategory_name,
             COALESCE((SELECT AVG(rating) FROM course_reviews WHERE course_id = c.id), 0.0) as rating
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
      WHERE c.is_bestseller = true
      LIMIT 2
    `;

    return featured.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      instructor: row.instructor,
      price: Number(row.price),
      category_id: row.category_id,
      category_name: row.category_name,
      subcategory_name: row.subcategory_name,
      difficulty_level: row.difficulty_level,
      duration_hours: Number(row.duration_hours),
      learning_outcome: row.learning_outcome,
      career_path: row.career_path,
      gradient_class: row.gradient_class,
      emoji: row.emoji,
      is_bestseller: row.is_bestseller,
      rating: Number(row.rating) ? Math.round(Number(row.rating) * 10) / 10 : 0,
      reasons: ["Featured bestseller course loved by our community."]
    }));
  } catch {
    return [];
  }
}

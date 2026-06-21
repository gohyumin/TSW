/**
 * rdfMapper.ts
 * Solution 1 & 2: Maps SQL records into RDF Turtle format.
 */

import { getLessonsForCourse } from "../courseLessons";

interface RdfStudent {
  id: number;
  learningGoal: string;
  skillLevel: string;
  interests: string[];
  skills: Array<{ name: string; level: string }>;
  completedCourses?: number[]; // Course IDs completed by student
  quizResults?: Array<{
    courseId: number;
    lessonId: number;
    score: number;
    skillsPerformance: Record<string, number>;
  }>;
}

interface RdfCourse {
  id: number;
  title: string;
  durationHours: number;
  careerPath: string;
  skills: Array<{ name: string; levelRequired: string }>;
  categoryName?: string;
  subcategoryName?: string;
  teachesSkills?: string[];
  requiresSkills?: string[];
}

interface RdfReview {
  id: number;
  courseId: number;
  rating: number;
  text: string;
  semantics: Array<{ concept: string; relationship: string }>;
}

export function mapStudentToRdf(student: RdfStudent): string {
  const subject = `ex:Student${student.id}`;
  const goalUri = `ex:${formatUriSegment(student.learningGoal)}`;
  
  let turtle = `@prefix ex: <http://example.org/learnwise#> .\n@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n\n`;
  
  // 1. Learner Entity (rdf:type ex:Learner)
  turtle += `${subject} rdf:type ex:Learner ;\n`;
  turtle += `    ex:hasGoal ${goalUri} ;\n`;
  turtle += `    ex:hasSkillLevel "${escapeTurtleLiteral(student.skillLevel)}"`;

  student.interests.forEach((interest) => {
    turtle += ` ;\n    ex:hasInterest ex:${formatUriSegment(interest)}`;
  });

  student.skills.forEach((skill) => {
    turtle += ` ;\n    ex:hasSkill ex:${formatUriSegment(skill.name)}`;
  });

  // Map completed courses
  student.completedCourses?.forEach((courseId) => {
    turtle += ` ;\n    ex:completedCourse ex:Course${courseId}`;
  });

  // Map attempted quiz results
  student.quizResults?.forEach((qr) => {
    const qrUri = `ex:QuizResult_${student.id}_${qr.courseId}_${qr.lessonId}`;
    turtle += ` ;\n    ex:attemptedQuiz ${qrUri} ;\n    ex:hasQuizResult ${qrUri}`;
  });

  turtle += " .\n\n";

  // 2. Career Goal Entity (rdf:type ex:CareerGoal) and required skills
  turtle += `${goalUri} rdf:type ex:CareerGoal ;\n`;
  turtle += `    ex:name "${escapeTurtleLiteral(student.learningGoal)}"`;

  let requiredSkills: string[] = [];
  if (student.learningGoal === "Software Developer") {
    requiredSkills = ["Programming", "Python", "WebDevelopment"];
  } else if (student.learningGoal === "Business Manager") {
    requiredSkills = ["Management", "BusinessStrategy"];
  } else if (student.learningGoal === "Legal Counsel") {
    requiredSkills = ["Ethics", "ContractLaw"];
  } else if (student.learningGoal === "Robotics Engineer") {
    requiredSkills = ["Physics", "RoboticsAutomation"];
  } else {
    requiredSkills = ["Programming", "Python"];
  }

  requiredSkills.forEach((skill) => {
    turtle += ` ;\n    ex:requiresSkill ex:${skill}`;
  });
  turtle += " .\n\n";

  // 3. Serialize Quiz Result Details & dynamic weaknesses/masteries
  if (student.quizResults && student.quizResults.length > 0) {
    turtle += `# Quiz Attempt Details\n`;
    student.quizResults.forEach((qr) => {
      const qrUri = `ex:QuizResult_${student.id}_${qr.courseId}_${qr.lessonId}`;
      turtle += `${qrUri} rdf:type ex:QuizResult ;\n`;
      turtle += `    ex:score ${qr.score} ;\n`;
      turtle += `    ex:aboutCourse ex:Course${qr.courseId} ;\n`;
      turtle += `    ex:aboutLesson ${qr.lessonId}`;

      Object.entries(qr.skillsPerformance).forEach(([concept, score]) => {
        const conceptUri = `ex:${formatUriSegment(concept)}`;
        turtle += ` ;\n    ex:testsSkill ${conceptUri}`;
      });
      turtle += " .\n";
    });
    turtle += `\n`;
  }

  return turtle;
}

export function mapCourseToRdf(course: RdfCourse): string {
  const subject = `ex:Course${course.id}`;
  let turtle = `@prefix ex: <http://example.org/learnwise#> .\n@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n\n`;
  turtle += `${subject} rdf:type ex:Course ;\n`;
  turtle += `    ex:title "${escapeTurtleLiteral(course.title)}" ;\n`;
  turtle += `    ex:durationHours ${course.durationHours} ;\n`;
  turtle += `    ex:careerPath "${escapeTurtleLiteral(course.careerPath)}"`;

  if (course.categoryName) {
    turtle += ` ;\n    ex:hasCategory ex:${formatUriSegment(course.categoryName)}`;
  }
  if (course.subcategoryName) {
    turtle += ` ;\n    ex:hasSubcategory ex:${formatUriSegment(course.subcategoryName)}`;
  }

  course.skills.forEach((skill) => {
    turtle += ` ;\n    ex:teachesSkill ex:${formatUriSegment(skill.name)}`;
  });

  // Map teachesSkills and requiresSkills explicitly
  course.teachesSkills?.forEach((skill) => {
    turtle += ` ;\n    ex:teachesSkill ex:${formatUriSegment(skill)}`;
  });
  course.requiresSkills?.forEach((skill) => {
    turtle += ` ;\n    ex:requiresSkill ex:${formatUriSegment(skill)}`;
  });

  turtle += " .\n\n";

  if (course.categoryName) {
    turtle += `ex:${formatUriSegment(course.categoryName)} rdf:type ex:Category ;\n    ex:name "${escapeTurtleLiteral(course.categoryName)}" .\n\n`;
  }
  if (course.subcategoryName) {
    turtle += `ex:${formatUriSegment(course.subcategoryName)} rdf:type ex:Subcategory ;\n    ex:name "${escapeTurtleLiteral(course.subcategoryName)}"`;
    if (course.categoryName) {
      turtle += ` ;\n    ex:belongsToCategory ex:${formatUriSegment(course.categoryName)}`;
    }
    turtle += " .\n\n";
  }

  // 4. Map the course's individual Quiz Questions and their tested concepts
  const lessons = getLessonsForCourse(course.id, course.categoryName, course.subcategoryName);
  if (lessons.length > 0) {
    turtle += `# Course Quiz Questions\n`;
    lessons.forEach((lesson) => {
      lesson.questions.forEach((q) => {
        const questionUri = `ex:QuizQuestion_${course.id}_${lesson.id}_${q.id}`;
        turtle += `${questionUri} rdf:type ex:QuizQuestion ;\n`;
        turtle += `    ex:testsConcept ex:${formatUriSegment(q.concept)} .\n`;
        turtle += `ex:Course${course.id} ex:hasQuestion ${questionUri} .\n`;
      });
    });
    turtle += `\n`;
  }

  return turtle;
}

export function mapReviewToRdf(review: RdfReview): string {
  const subject = `ex:Review${review.id}`;
  let turtle = `@prefix ex: <http://example.org/learnwise#> .\n@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n\n`;
  turtle += `${subject} rdf:type ex:Review ;\n`;
  turtle += `    ex:aboutCourse ex:Course${review.courseId} ;\n`;
  turtle += `    ex:rating ${review.rating} ;\n`;
  turtle += `    ex:text "${escapeTurtleLiteral(review.text)}"`;

  review.semantics.forEach((sem) => {
    turtle += ` ;\n    ex:${sem.relationship} ex:${formatUriSegment(sem.concept)}`;
  });

  turtle += " .\n";
  return turtle;
}

function escapeTurtleLiteral(val: string): string {
  if (!val) return "";
  return val.replace(/["\\]/g, "\\$&").replace(/\n/g, "\\n");
}

function formatUriSegment(val: string): string {
  if (!val) return "";
  return val.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * inferenceService.ts
 * Solution 2: Implements the SWRL rule inference engine and Turtle RDF parsing service.
 * Consumes RDF Turtle strings (Category 2) and runs OWL rule reasoning (Category 3).
 */

import { mapStudentToRdf, mapCourseToRdf, mapReviewToRdf } from "./rdfMapper";
import { ONTOLOGY } from "./ontology";
import { executeSparqlQuery, RDFTriple } from "./sparqlService";

/**
 * Parses a Turtle format RDF string into structured RDFTriple objects.
 * Supports basic Turtle namespaces (prefixes), multi-line predicates, and subject continuation.
 */
export function parseTurtleToTriples(turtle: string): RDFTriple[] {
  const triples: RDFTriple[] = [];
  const lines = turtle.split("\n");
  let currentSubject = "";

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    // Skip empty lines, prefix declarations, and comments
    if (!line || line.startsWith("@prefix") || line.startsWith("#")) {
      return;
    }

    const isContinuation = rawLine.startsWith(" ") || rawLine.startsWith("\t");

    if (!isContinuation) {
      // Match new subject lines. Example: ex:User1 rdf:type ex:Learner ;
      const subjectMatch = line.match(/^([a-zA-Z0-9_:]+)\s+([a-zA-Z0-9_:]+)\s+(.+)$/);
      if (subjectMatch) {
        currentSubject = subjectMatch[1];
        const predicate = subjectMatch[2];
        let object = subjectMatch[3].trim();
        
        // Remove ending Turtle delimiters (; or . or ,)
        if (object.endsWith(";") || object.endsWith(".") || object.endsWith(",")) {
          object = object.slice(0, -1).trim();
        }
        triples.push({ s: currentSubject, p: predicate, o: object });
      }
    } else if (currentSubject) {
      // Match continuation lines sharing the active subject. Example: ex:hasGoal ex:DataScientist ;
      const continuationMatch = line.match(/^([a-zA-Z0-9_:]+)\s+(.+)$/);
      if (continuationMatch) {
        const predicate = continuationMatch[1];
        let object = continuationMatch[2].trim();
        
        if (object.endsWith(";") || object.endsWith(".") || object.endsWith(",")) {
          object = object.slice(0, -1).trim();
        }
        triples.push({ s: currentSubject, p: predicate, o: object });
      }
    }
  });

  return triples;
}

/**
 * Executes a SWRL/OWL rule reasoning engine by first generating and then parsing Turtle format RDF triples.
 * Consumes RDF Turtle structures (Category 2) and evaluates OWL SWRL rules (Category 3).
 */
export function runMockInferenceReasoning(userProfile: any, courses: any[], reviews: any[] = []): any[] {
  console.log("[OWL Inference Engine] Solution 2 Pipeline: Generating and parsing RDF Turtle representations...");
  let allRdfTriples: RDFTriple[] = [];

  // 1. Pre-process courses to assign enhanced dynamic teaches/requires skills
  const enhancedCourses = courses.map(c => {
    let teaches: string[] = [];
    let requires: string[] = [];
    
    const subName = c.subcategory_name || "";
    
    if (subName === "Web Development") {
      teaches = ["HTMLConcept", "CSSLayouts", "ReactComponents"];
    } else if (subName === "Python") {
      teaches = ["VariableConcept", "LoopConcept", "FunctionConcept"];
      requires = ["Programming"];
    } else if (subName === "Business Strategy") {
      teaches = ["BusinessOperations", "SWOTAnalysis", "FinancialBudgeting"];
      requires = ["Management"];
    } else if (subName === "Contract Law") {
      teaches = ["CommercialContracts", "ContractLiability", "IntellectualProperty"];
      requires = ["BusinessOperations"];
    } else if (subName === "Robotics & Automation") {
      teaches = ["RoboticKinematics", "PIDFeedbackControl", "TrajectoryPlanning"];
      requires = ["VariableConcept", "LoopConcept"];
    } else {
      if (subName) {
        teaches = [subName];
        if (c.category_name === "Programming") {
          requires = ["Programming"];
        } else if (c.category_name === "Business") {
          requires = ["Management"];
        } else if (c.category_name === "Law") {
          requires = ["Ethics"];
        } else if (c.category_name === "Engineering") {
          requires = ["Physics"];
        }
      }
    }
    
    return {
      ...c,
      teachesSkills: teaches,
      requiresSkills: requires
    };
  });

  // 2. Generate & Parse Student Profile RDF Turtle (Category 2)
  if (userProfile && userProfile.id) {
    const studentTurtle = mapStudentToRdf({
      id: userProfile.id,
      learningGoal: userProfile.learningGoal || "",
      skillLevel: userProfile.skillLevel || "Beginner",
      interests: userProfile.interests || [],
      skills: userProfile.skills || [],
      completedCourses: userProfile.completedCourses || [],
      quizResults: userProfile.quizResults || []
    });

    const parsedStudentTriples = parseTurtleToTriples(studentTurtle);
    allRdfTriples = allRdfTriples.concat(parsedStudentTriples);
  }

  // 3. Generate & Parse Course RDF Turtles (Category 2)
  enhancedCourses.forEach(c => {
    const courseTurtle = mapCourseToRdf({
      id: c.id,
      title: c.title,
      durationHours: Number(c.duration_hours || c.durationHours || 0),
      careerPath: c.career_path || c.careerPath || "",
      skills: [],
      categoryName: c.category_name,
      subcategoryName: c.subcategory_name,
      teachesSkills: c.teachesSkills,
      requiresSkills: c.requiresSkills
    });

    const parsedCourseTriples = parseTurtleToTriples(courseTurtle);
    allRdfTriples = allRdfTriples.concat(parsedCourseTriples);
  });

  // 4. Generate & Parse Review RDF Turtles (Category 2)
  const defaultMockReviews = [
    { id: 101, courseId: 2, rating: 5, text: "Beginner level Python", semantics: [
      { concept: "Python", relationship: "mentionsSkill" },
      { concept: "Beginner", relationship: "suitableFor" }
    ] },
    { id: 102, courseId: 3, rating: 5, text: "Excellent Business Strategy introduction", semantics: [
      { concept: "Business Strategy", relationship: "mentionsSkill" },
      { concept: "Beginner", relationship: "suitableFor" }
    ] },
    { id: 103, courseId: 4, rating: 5, text: "Solid introduction to Contract Law", semantics: [
      { concept: "Contract Law", relationship: "mentionsSkill" },
      { concept: "Beginner", relationship: "suitableFor" }
    ] }
  ];

  const rawReviews = reviews && reviews.length > 0 ? reviews : defaultMockReviews;
  rawReviews.forEach(r => {
    let semantics = r.semantics || [];
    if (semantics.length === 0 && r.concept && r.relationship) {
      semantics = [{ concept: r.concept, relationship: r.relationship }];
    }

    const reviewTurtle = mapReviewToRdf({
      id: r.id,
      courseId: r.course_id || r.courseId,
      rating: r.rating || 5,
      text: r.review_text || r.text || "",
      semantics: semantics
    });

    const parsedReviewTriples = parseTurtleToTriples(reviewTurtle);
    allRdfTriples = allRdfTriples.concat(parsedReviewTriples);
  });

  // 5. Inject Core Ontology Prerequisites (OWL Axioms represented as RDF)
  const skillPrerequisites = [
    { skill: "Python", prereq: "Programming" },
    { skill: "Web Development", prereq: "Python" },
    { skill: "Business Strategy", prereq: "Management" },
    { skill: "Contract Law", prereq: "Ethics" },
    { skill: "Robotics & Automation", prereq: "Physics" }
  ];

  skillPrerequisites.forEach(p => {
    allRdfTriples.push({
      s: `ex:${formatUriSegment(p.skill)}`,
      p: "ex:hasPrerequisite",
      o: `ex:${formatUriSegment(p.prereq)}`
    });
  });

  // 6. RUN SWRL RULE INFERENCE ENGINE (Deducing new triples in-place)
  console.log(`[OWL Inference Engine] Successfully constructed and parsed ${allRdfTriples.length} RDF triples in graph store.`);
  
  if (!userProfile || !userProfile.id) return [];
  const userUri = `ex:Student${userProfile.id}`;

  const hasTriple = (s: string, p: string, o: string) => {
    return allRdfTriples.some(t => t.s === s && t.p === p && t.o === o);
  };

  // Inject ex:notCompleted for courses the user has not completed
  const completedIds = userProfile.completedCourses || [];
  enhancedCourses.forEach(c => {
    if (!completedIds.includes(c.id)) {
      allRdfTriples.push({
        s: userUri,
        p: "ex:notCompleted",
        o: `ex:Course${c.id}`
      });
    }
  });

  // Inject ex:mastered for learner profile skills (Learner(?l) ^ hasSkill(?l, ?s) -> mastered(?l, ?s))
  const profileSkills = allRdfTriples.filter(t => t.s === userUri && t.p === "ex:hasSkill").map(t => t.o);
  profileSkills.forEach(skillUri => {
    if (!hasTriple(userUri, "ex:mastered", skillUri)) {
      allRdfTriples.push({ s: userUri, p: "ex:mastered", o: skillUri });
    }
  });

  // Rule 1: Detect learning weaknesses and strengths based on quiz scores
  // Learner(?l) ^ attemptedQuiz(?l, ?qr) ^ QuizResult(?qr) ^ score(?qr, ?score) ^ testsSkill(?qr, ?s) ^ swrlb:lessThan(?score, 70) -> hasWeakness(?l, ?s)
  const quizResults = allRdfTriples.filter(t => t.p === "rdf:type" && t.o === "ex:QuizResult").map(t => t.s);
  quizResults.forEach(qr => {
    const scoreTriple = allRdfTriples.find(t => t.s === qr && t.p === "ex:score");
    const testsSkillTriples = allRdfTriples.filter(t => t.s === qr && t.p === "ex:testsSkill");
    
    if (scoreTriple && testsSkillTriples.length > 0) {
      const scoreVal = parseInt(scoreTriple.o);
      testsSkillTriples.forEach(tst => {
        const skillUri = tst.o;
        if (scoreVal < 70) {
          if (!hasTriple(userUri, "ex:hasWeakness", skillUri)) {
            allRdfTriples.push({ s: userUri, p: "ex:hasWeakness", o: skillUri });
          }
        } else {
          if (!hasTriple(userUri, "ex:mastered", skillUri)) {
            allRdfTriples.push({ s: userUri, p: "ex:mastered", o: skillUri });
          }
        }
      });
    }
  });

  // Rule 2: Recommend improvement course
  // Learner(?l) ^ hasWeakness(?l, ?s) ^ Course(?c) ^ teachesSkill(?c, ?s) -> recommendedFor(?c, ?l)
  const weaknesses = allRdfTriples.filter(t => t.s === userUri && t.p === "ex:hasWeakness").map(t => t.o);
  enhancedCourses.forEach(c => {
    const courseUri = `ex:Course${c.id}`;
    const courseTeachesSkills = allRdfTriples.filter(t => t.s === courseUri && t.p === "ex:teachesSkill").map(t => t.o);
    courseTeachesSkills.forEach(skillUri => {
      if (weaknesses.includes(skillUri)) {
        if (!hasTriple(courseUri, "ex:recommendedFor", userUri)) {
          allRdfTriples.push({ s: courseUri, p: "ex:recommendedFor", o: userUri });
        }
      }
    });
  });

  // Rule 3: Recommend next learning step
  // Learner(?l) ^ mastered(?l, ?s) ^ Course(?c) ^ requiresSkill(?c, ?s) ^ notCompleted(?l, ?c) -> suitableFor(?c, ?l)
  const studentMasteries = allRdfTriples.filter(t => t.s === userUri && t.p === "ex:mastered").map(t => t.o);
  enhancedCourses.forEach(c => {
    const courseUri = `ex:Course${c.id}`;
    if (hasTriple(userUri, "ex:notCompleted", courseUri)) {
      const courseReqSkills = allRdfTriples.filter(t => t.s === courseUri && t.p === "ex:requiresSkill").map(t => t.o);
      courseReqSkills.forEach(reqSkillUri => {
        if (studentMasteries.includes(reqSkillUri)) {
          if (!hasTriple(courseUri, "ex:suitableFor", userUri)) {
            allRdfTriples.push({ s: courseUri, p: "ex:suitableFor", o: userUri });
          }
        }
      });
    }
  });

  // 7. RUN SPARQL QUERIES TO EXTRACT RECOMMENDATIONS WITH EXPLANATIONS
  const inferredRecommendations: any[] = [];
  const combinedRecs: Record<number, { courseId: number; courseTitle: string; reasons: string[] }> = {};
  const courseWeaknesses: Record<number, string[]> = {};

  const addReason = (courseId: number, title: string, reason: string) => {
    if (!combinedRecs[courseId]) {
      combinedRecs[courseId] = { courseId, courseTitle: title, reasons: [] };
    }
    if (!combinedRecs[courseId].reasons.includes(reason)) {
      combinedRecs[courseId].reasons.push(reason);
    }
  };

  // SPARQL Query 1: Find courses that reinforce weaknesses
  const query1 = `
    SELECT DISTINCT ?course ?skill WHERE {
      ${userUri} ex:hasWeakness ?skill .
      ?course ex:teachesSkill ?skill .
    }
  `;
  const weaknessResults = executeSparqlQuery(query1, allRdfTriples);
  weaknessResults.forEach(res => {
    const cId = parseInt(res.course.replace("ex:Course", ""));
    const course = enhancedCourses.find(item => item.id === cId);
    if (course) {
      const skillName = res.skill.replace("ex:", "");
      addReason(course.id, course.title, `Recommended because your quiz performance indicates a weakness in **${skillName}** concepts, and this course helps strengthen the required skill.`);
      if (!courseWeaknesses[course.id]) {
        courseWeaknesses[course.id] = [];
      }
      if (!courseWeaknesses[course.id].includes(skillName)) {
        courseWeaknesses[course.id].push(skillName);
      }
    }
  });

  // SPARQL Query 2: Find courses that are next step (suitableFor)
  const query2 = `
    SELECT DISTINCT ?course WHERE {
      ?course ex:suitableFor ${userUri} .
    }
  `;
  const suitableResults = executeSparqlQuery(query2, allRdfTriples);
  suitableResults.forEach(res => {
    const cId = parseInt(res.course.replace("ex:Course", ""));
    const course = enhancedCourses.find(item => item.id === cId);
    if (course) {
      const reqSkills = allRdfTriples.filter(t => t.s === res.course && t.p === "ex:requiresSkill").map(t => t.o.replace("ex:", ""));
      addReason(course.id, course.title, `Recommended because you have mastered the prerequisite **${reqSkills.join(", ")}** concepts, and this course represents your next learning step.`);
    }
  });

  // SPARQL Query 3: Goal-driven requirements (Rule 1)
  const query3 = `
    SELECT DISTINCT ?course ?skill WHERE {
      ${userUri} ex:hasGoal ?goal .
      ?goal ex:requiresSkill ?skill .
      ?course ex:teachesSkill ?skill .
    }
  `;
  const goalResults = executeSparqlQuery(query3, allRdfTriples);
  goalResults.forEach(res => {
    const cId = parseInt(res.course.replace("ex:Course", ""));
    const course = enhancedCourses.find(item => item.id === cId);
    if (course) {
      const skillName = res.skill.replace("ex:", "");
      const goalName = userProfile.learningGoal || "Software Developer";
      addReason(course.id, course.title, `Recommended because your career goal is **${goalName}**, which requires mastering **${skillName}**.`);
    }
  });

  // SPARQL Query 4: Highly rated reviews matching user interests
  const query4 = `
    SELECT DISTINCT ?course ?concept WHERE {
      ${userUri} ex:hasInterest ?concept .
      ?review rdf:type ex:Review .
      ?review ex:aboutCourse ?course .
      ?review ex:rating ?rating .
      ?review ex:mentionsSkill ?concept .
      FILTER (?rating >= 4)
    }
  `;
  const reviewSemMatches = executeSparqlQuery(query4, allRdfTriples);
  reviewSemMatches.forEach(res => {
    const cId = parseInt(res.course.replace("ex:Course", ""));
    const course = enhancedCourses.find(item => item.id === cId);
    if (course) {
      const conceptName = res.concept.replace("ex:", "");
      addReason(course.id, course.title, `Recommended because a highly rated review mentions it teaches **${conceptName}**, matching your interests.`);
    }
  });

  // Convert combinedRecs to return array
  Object.values(combinedRecs).forEach(rec => {
    const isWeakness = !!courseWeaknesses[rec.courseId];
    inferredRecommendations.push({
      courseId: rec.courseId,
      courseTitle: rec.courseTitle,
      reasons: rec.reasons,
      ruleTriggered: "Semantic Pathway Rules",
      isWeakness: isWeakness,
      weaknessSkills: courseWeaknesses[rec.courseId] || []
    });
  });

  return inferredRecommendations;
}

function formatUriSegment(val: string): string {
  if (!val) return "";
  return val.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * ontology.ts
 * Solution 2: Defines the OWL ontology structures and SWRL inference rules for LearnWise.
 * Serves as the pure OWL Ontology Schema design layer.
 */

// Ontology Definitions for TSW6223 Project
export const ONTOLOGY = {
  namespace: "http://example.org/learnwise#",
  classes: [
    { name: "Learner", comment: "Represents student users in the platform." },
    { name: "Course", comment: "Represents educational course elements." },
    { name: "Skill", comment: "Represents technical/professional skills (e.g. Python, React)." },
    { name: "QuizQuestion", comment: "Represents individual quiz questions." },
    { name: "QuizResult", comment: "Represents outcomes of a student taking a lesson quiz." },
    { name: "CareerGoal", comment: "Represents user career paths (e.g. Software Developer)." }
  ],
  // Skill Hierarchy Taxonomy
  skills: [
    { name: "ProgrammingSkill", parent: "Skill" },
    { name: "PythonSkill", parent: "ProgrammingSkill" },
    { name: "DatabaseSkill", parent: "ProgrammingSkill" },
    { name: "MachineLearningSkill", parent: "ProgrammingSkill" },
    { name: "WebDevelopmentSkill", parent: "ProgrammingSkill" },
    { name: "BusinessSkill", parent: "Skill" },
    { name: "BusinessStrategySkill", parent: "BusinessSkill" },
    { name: "LawSkill", parent: "Skill" },
    { name: "ContractLawSkill", parent: "LawSkill" },
    { name: "EngineeringSkill", parent: "Skill" },
    { name: "RoboticsAutomationSkill", parent: "EngineeringSkill" }
  ],
  // Goal Hierarchy Taxonomy
  goals: [
    { name: "AIEngineer", parent: "CareerGoal" },
    { name: "SoftwareDeveloper", parent: "CareerGoal" },
    { name: "BusinessManager", parent: "CareerGoal" },
    { name: "LegalCounsel", parent: "CareerGoal" },
    { name: "RoboticsEngineer", parent: "CareerGoal" }
  ],
  objectProperties: [
    { name: "hasGoal", domain: "Learner", range: "CareerGoal", comment: "Associates user with their target career goals." },
    { name: "hasSkill", domain: "Learner", range: "Skill", comment: "Associates user with their existing skills." },
    { name: "requiresSkill", domain: "CareerGoal", range: "Skill", comment: "Associates career goals with required skills." },
    { name: "teachesSkill", domain: "Course", range: "Skill", comment: "Associates course with skills taught." },
    { name: "requiresSkill", domain: "Course", range: "Skill", comment: "Associates course with prerequisite skills required." },
    { name: "hasPrerequisite", domain: "Skill", range: "Skill", comment: "Skill prerequisite ordering relationship." },
    { name: "completedCourse", domain: "Learner", range: "Course", comment: "Tracks completed courses." },
    { name: "notCompleted", domain: "Learner", range: "Course", comment: "Represents that a learner has not completed a course." },
    { name: "attemptedQuiz", domain: "Learner", range: "QuizResult", comment: "Binds user to quiz results." },
    { name: "hasQuizResult", domain: "Learner", range: "QuizResult", comment: "Binds user to quiz results (alternative predicate)." },
    { name: "testsSkill", domain: "QuizResult", range: "Skill", comment: "Maps quiz result to the skill concept it tests." },
    { name: "testsConcept", domain: "QuizQuestion", range: "Skill", comment: "Maps quiz question to the skill concept it tests." },
    { name: "aboutCourse", domain: "QuizResult", range: "Course", comment: "Binds quiz result to course." },
    { name: "hasQuestion", domain: "Course", range: "QuizQuestion", comment: "Connects course to its quiz questions." },
    { name: "mastered", domain: "Learner", range: "Skill", comment: "Inferred or mapped concept showing high mastery." },
    { name: "hasWeakness", domain: "Learner", range: "Skill", comment: "Inferred concept showing low test performance." },
    { name: "recommendedFor", domain: "Course", range: "Learner", comment: "Inferred recommendation." },
    { name: "suitableFor", domain: "Course", range: "Learner", comment: "Inferred suitability." }
  ],
  swrlRules: [
    {
      id: "Rule1_DetectWeakness",
      rule: "Learner(?l) ^ attemptedQuiz(?l, ?qr) ^ QuizResult(?qr) ^ score(?qr, ?score) ^ testsSkill(?qr, ?s) ^ swrlb:lessThan(?score, 70) -> hasWeakness(?l, ?s)",
      comment: "If a learner scores less than 70% on a quiz testing a skill, infer that they have a weakness in that skill."
    },
    {
      id: "Rule2_RecommendCourseForWeakness",
      rule: "Learner(?l) ^ hasWeakness(?l, ?s) ^ Course(?c) ^ teachesSkill(?c, ?s) -> recommendedFor(?c, ?l)",
      comment: "If a learner has a weakness in a skill, recommend courses that teach that skill to reinforce it."
    },
    {
      id: "Rule3_RecommendNextStepPrereqMastered",
      rule: "Learner(?l) ^ mastered(?l, ?s) ^ Course(?c) ^ requiresSkill(?c, ?s) ^ notCompleted(?l, ?c) -> suitableFor(?c, ?l)",
      comment: "If a learner has mastered the prerequisite skills required by a course and has not completed it, infer that the course is suitable for them."
    }
  ],
  skillHierarchy: {
    "Software Developer": [
      { name: "Programming", prerequisite: null },
      { name: "Python", prerequisite: "Programming" },
      { name: "Web Development", prerequisite: "Python" }
    ],
    "Business Manager": [
      { name: "Management", prerequisite: null },
      { name: "Business Strategy", prerequisite: "Management" }
    ],
    "Legal Counsel": [
      { name: "Ethics", prerequisite: null },
      { name: "Contract Law", prerequisite: "Ethics" }
    ],
    "Robotics Engineer": [
      { name: "Physics", prerequisite: null },
      { name: "Robotics & Automation", prerequisite: "Physics" }
    ]
  }
};

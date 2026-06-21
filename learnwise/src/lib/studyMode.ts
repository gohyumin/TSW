export type StudyMode = "Practical" | "Visual" | "Theoretical" | string | null | undefined;

export function getLevelOneLessonsForStudyMode(mode: StudyMode): string[] {
  if (mode === "Visual") {
    return [
      "Video 1.1: Course Overview & Key Concepts",
      "Video 1.2: Guided Setup Walkthrough",
      "Video 1.3: First Example Demonstration",
      "Video Resource: Visual Concept Recap"
    ];
  }

  if (mode === "Theoretical") {
    return [
      "Lecture Notes 1.1: Core Overview & Terminology",
      "Lecture Notes 1.2: Foundational Concepts",
      "Lecture Notes 1.3: Worked Reading Examples",
      "PDF Resource: Quick Reference Notes"
    ];
  }

  return [
    "Quiz 1.1: Core Overview Check",
    "Quiz 1.2: Setup Knowledge Check",
    "Quiz 1.3: Hello World Practice Quiz",
    "Quiz Resource: Baseline Skills Assessment"
  ];
}

export function getLevelOneSummaryForStudyMode(mode: StudyMode): string {
  if (mode === "Visual") {
    return "Video overview, setup walkthrough, examples";
  }

  if (mode === "Theoretical") {
    return "Lecture notes, concepts, reading examples";
  }

  return "Core overview quizzes, setup checks, baseline quiz";
}

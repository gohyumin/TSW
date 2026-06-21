export interface StudentProfileXmlData {
  studentId: number;
  name: string;
  email: string;
  learningGoal: string;
  skillLevel: string;
  interests: string[];
  skills: Array<{ name: string; level: string }>;
}

/**
 * xmlMapper.ts
 * Solution 1: Serializes the Student Profile into XML format to support Cold Start solutions.
 */
export function mapProfileToXml(data: StudentProfileXmlData): string {
  const interestsXml = data.interests
    .map((interest) => `    <Interest>${escapeXml(interest)}</Interest>`)
    .join("\n");

  const skillsXml = data.skills
    .map(
      (skill) =>
        `    <Skill>\n      <Name>${escapeXml(skill.name)}</Name>\n      <Level>${escapeXml(
          skill.level
        )}</Level>\n    </Skill>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<StudentProfile id="Student${data.studentId}">
  <BasicInfo>
    <Name>${escapeXml(data.name)}</Name>
    <Email>${escapeXml(data.email)}</Email>
  </BasicInfo>
  <Preferences>
    <LearningGoal>${escapeXml(data.learningGoal)}</LearningGoal>
    <SkillLevel>${escapeXml(data.skillLevel)}</SkillLevel>
  </Preferences>
  <Interests>
\n${interestsXml}
  </Interests>
  <ExistingSkills>
\n${skillsXml}
  </ExistingSkills>
</StudentProfile>`;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

"use server";

import { sql } from "@/lib/db";
import { getCurrentStudent } from "./auth";
import { mapProfileToXml } from "@/lib/semantic/xmlMapper";
import { mapStudentToRdf } from "@/lib/semantic/rdfMapper";
import { revalidatePath } from "next/cache";
import { generateColdStartSparql } from "@/lib/semantic/sparqlService";
import { ONTOLOGY } from "@/lib/semantic/ontology";

export interface ProfileData {
  learningGoal: string;
  skillLevel: string;
  educationBackground: string;
  interests: string[];
  skills: Array<{ name: string; level: string }>;
}

export async function getStudentProfileData(): Promise<ProfileData | null> {
  const student = await getCurrentStudent();
  if (!student) return null;

  try {
    const profileRes = await sql`
      SELECT learning_goal, skill_level, education_background
      FROM student_profiles
      WHERE student_id = ${student.id}
    `;

    if (profileRes.length === 0) return null;
    const p = profileRes[0];

    const interestsRes = await sql`
      SELECT interest_name FROM student_interests WHERE student_id = ${student.id}
    `;

    const skillsRes = await sql`
      SELECT skill_name, skill_level FROM student_skills WHERE student_id = ${student.id}
    `;

    return {
      learningGoal: p.learning_goal || "",
      skillLevel: p.skill_level || "",
      educationBackground: p.education_background || "",
      interests: interestsRes.map((r) => r.interest_name),
      skills: skillsRes.map((r) => ({ name: r.skill_name, level: r.skill_level }))
    };
  } catch (error) {
    console.error("Failed to get student profile data:", error);
    return null;
  }
}

export async function updateStudentProfileData(data: Partial<ProfileData>): Promise<{ success: boolean; error?: string }> {
  const student = await getCurrentStudent();
  if (!student) return { success: false, error: "Authentication expired." };

  try {
    // Verify student still exists in DB (session cookie may be stale after re-seed)
    const existsCheck = await sql`SELECT id FROM students WHERE id = ${student.id}`;
    if (existsCheck.length === 0) {
      return { success: false, error: "Session expired. Please log out and log in again." };
    }

    // 1. Upsert student_profiles (INSERT if missing, UPDATE if exists)
    await sql`
      INSERT INTO student_profiles (student_id, learning_goal, skill_level, education_background, updated_at)
      VALUES (${student.id}, ${data.learningGoal || ""}, ${data.skillLevel || ""}, ${data.educationBackground || ""}, CURRENT_TIMESTAMP)
      ON CONFLICT (student_id)
      DO UPDATE SET
        learning_goal = ${data.learningGoal || ""},
        skill_level = ${data.skillLevel || ""},
        education_background = ${data.educationBackground || ""},
        updated_at = CURRENT_TIMESTAMP
    `;

    // 2. Update student_interests (delete and insert)
    if (data.interests) {
      await sql`DELETE FROM student_interests WHERE student_id = ${student.id}`;
      for (const interest of data.interests) {
        await sql`
          INSERT INTO student_interests (student_id, interest_name)
          VALUES (${student.id}, ${interest})
        `;
      }
    }

    // 3. Update student_skills (delete and insert)
    if (data.skills) {
      await sql`DELETE FROM student_skills WHERE student_id = ${student.id}`;
      for (const skill of data.skills) {
        await sql`
          INSERT INTO student_skills (student_id, skill_name, skill_level)
          VALUES (${student.id}, ${skill.name}, ${skill.level})
        `;
      }
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update student profile data:", error);
    const msg = error?.message || "";
    if (msg.includes("foreign key") || msg.includes("violates")) {
      return { success: false, error: "Session expired. Please log out and log in again." };
    }
    return { success: false, error: msg || "Database error." };
  }
}

export async function getSemanticStudentProfileCode(): Promise<{ xml: string; rdf: string; sparql: string; swrl: string } | null> {
  const student = await getCurrentStudent();
  if (!student) return null;

  try {
    const profile = await getStudentProfileData();
    if (!profile) return null;

    const xml = mapProfileToXml({
      studentId: student.id,
      name: student.name,
      email: student.email,
      learningGoal: profile.learningGoal,
      skillLevel: profile.skillLevel,
      interests: profile.interests,
      skills: profile.skills
    });

    const rdf = mapStudentToRdf({
      id: student.id,
      learningGoal: profile.learningGoal,
      skillLevel: profile.skillLevel,
      interests: profile.interests,
      skills: profile.skills
    });

    const sparql = generateColdStartSparql(
      student.id,
      profile.interests,
      profile.learningGoal,
      profile.skills.map((s) => s.name)
    );

    const swrlRulesText = ONTOLOGY.swrlRules.map(
      (rule) => `Rule ID: ${rule.id}\nRule: ${rule.rule}\nComment: ${rule.comment}\n`
    ).join("\n");

    const swrl = `@prefix owl: <http://www.w3.org/2002/07/owl#> .\n` +
      `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n` +
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n` +
      `@prefix ex: <${ONTOLOGY.namespace}> .\n\n` +
      `# LearnWise Core OWL Ontology Classes\n` +
      ONTOLOGY.classes.map(c => `ex:${c.name} rdf:type owl:Class ;\n    rdfs:comment "${c.comment}" .`).join("\n\n") +
      `\n\n# LearnWise Object Properties\n` +
      ONTOLOGY.objectProperties.map(p => `ex:${p.name} rdf:type owl:ObjectProperty ;\n    rdfs:domain ex:${p.domain} ;\n    rdfs:range ex:${p.range} ;\n    rdfs:comment "${p.comment}" .`).join("\n\n") +
      `\n\n# SWRL Logical Inference Rules\n` +
      swrlRulesText;

    return { xml, rdf, sparql, swrl };
  } catch (error) {
    console.error("Failed to get semantic code maps:", error);
    return null;
  }
}

export async function getStudentQuizResults(): Promise<any[]> {
  const student = await getCurrentStudent();
  if (!student) return [];

  try {
    const results = await sql`
      SELECT course_id, lesson_id, score, skills_performance
      FROM student_quiz_results
      WHERE student_id = ${student.id}
    `;

    return results.map(r => ({
      courseId: Number(r.course_id),
      lessonId: Number(r.lesson_id),
      score: Number(r.score),
      skillsPerformance: typeof r.skills_performance === "string" ? JSON.parse(r.skills_performance) : r.skills_performance
    }));
  } catch (error) {
    console.error("Failed to get student quiz results:", error);
    return [];
  }
}


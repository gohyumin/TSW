"use server";

import { cookies } from "next/headers";
import { sql } from "@/lib/db";

const COOKIE_NAME = "learnwise_student_session";

// Standard Web Crypto SHA-256 password hasher
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

function generateSalt(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  student?: {
    id: number;
    name: string;
    email: string;
  };
}

export async function registerStudent(
  name: string,
  email: string,
  password: string,
  learningGoal?: string,
  skillLevel?: string,
  interests?: string[],
  educationBackground?: string
): Promise<AuthResponse> {
  if (!name || !email || !password) {
    return { success: false, error: "Please fill in all fields." };
  }

  try {
    // Check if student already exists
    const existing = await sql`
      SELECT id FROM students WHERE email = ${email}
    `;

    if (existing.length > 0) {
      return { success: false, error: "Email is already registered." };
    }

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    // Store salt and hash separated by a colon
    const passwordHashField = `${salt}:${hash}`;

    // Insert student
    const res = await sql`
      INSERT INTO students (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHashField})
      RETURNING id, name, email
    `;

    const student = {
      id: res[0].id,
      name: res[0].name,
      email: res[0].email,
    };

    // Create student_profiles row with onboarding choices
    await sql`
      INSERT INTO student_profiles (student_id, learning_goal, skill_level, education_background)
      VALUES (${student.id}, ${learningGoal || "Software Developer"}, ${skillLevel || "Beginner"}, ${educationBackground || "Other"})
    `;

    // Create student interests rows
    if (interests && interests.length > 0) {
      for (const interest of interests) {
        await sql`
          INSERT INTO student_interests (student_id, interest_name)
          VALUES (${student.id}, ${interest})
        `;
      }
    }

    // Set student skill default if beginner
    if (skillLevel === "Beginner") {
      await sql`
        INSERT INTO student_skills (student_id, skill_name, skill_level)
        VALUES (${student.id}, 'Python', 'Beginner')
      `;
    }

    // Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, JSON.stringify(student), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return { success: true, student };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: "Database registration failure." };
  }
}

export async function loginStudent(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (!email || !password) {
    return { success: false, error: "Please enter your email and password." };
  }

  try {
    const res = await sql`
      SELECT id, name, email, password_hash FROM students WHERE email = ${email}
    `;

    if (res.length === 0) {
      return { success: false, error: "Invalid email or password." };
    }

    const dbStudent = res[0];
    const passwordHashField = dbStudent.password_hash;
    const parts = passwordHashField.split(":");
    
    // In case db password hash was seeded or structured differently
    if (parts.length !== 2) {
      // Seed fallback check
      if (passwordHashField.includes("4444:") && password === "password123") {
        // Log in seeded student
        const student = { id: dbStudent.id, name: dbStudent.name, email: dbStudent.email };
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, JSON.stringify(student), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return { success: true, student };
      }
      return { success: false, error: "Invalid credentials." };
    }

    const salt = parts[0];
    const expectedHash = parts[1];
    const calculatedHash = await hashPassword(password, salt);

    if (calculatedHash !== expectedHash) {
      return { success: false, error: "Invalid email or password." };
    }

    const student = {
      id: dbStudent.id,
      name: dbStudent.name,
      email: dbStudent.email,
    };

    // Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, JSON.stringify(student), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, student };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Authentication system failure." };
  }
}

export async function logoutStudent() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function getCurrentStudent() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session) return null;

  try {
    const student = JSON.parse(session.value);
    
    // Verify that the student actually exists in the database
    const dbStudent = await sql`
      SELECT id FROM students WHERE id = ${student.id}
    `;
    
    if (dbStudent.length === 0) {
      // Stale session (e.g. database was reset/reseeded)
      cookieStore.delete(COOKIE_NAME);
      return null;
    }

    return student as {
      id: number;
      name: string;
      email: string;
    };
  } catch {
    return null;
  }
}

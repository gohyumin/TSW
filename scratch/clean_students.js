const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

// Read .env.local
const envPath = "c:\\Users\\My Personal Computer\\Downloads\\TSW_Project\\.env.local";
if (!fs.existsSync(envPath)) {
  console.error(".env.local file not found at " + envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const dbUrlLine = envContent.split("\n").find(line => line.trim().startsWith("DATABASE_URL="));
if (!dbUrlLine) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const databaseUrl = dbUrlLine.split("=")[1].trim().replace(/['"]/g, "");

async function main() {
  console.log("Connecting to database...");
  const sql = neon(databaseUrl);

  try {
    console.log("Deleting student records for student_id >= 5...");
    
    // Delete dependent records to satisfy foreign key constraints:
    await sql`DELETE FROM student_wishlist WHERE student_id >= 5`;
    await sql`DELETE FROM student_quiz_results WHERE student_id >= 5`;
    await sql`DELETE FROM student_learning_paths WHERE student_id >= 5`;
    await sql`DELETE FROM student_learning_history WHERE student_id >= 5`;
    await sql`DELETE FROM student_skills WHERE student_id >= 5`;
    await sql`DELETE FROM student_interests WHERE student_id >= 5`;
    await sql`DELETE FROM student_profiles WHERE student_id >= 5`;
    
    // Delete reviews and review semantics for student_id >= 5
    await sql`
      DELETE FROM review_semantics 
      WHERE review_id IN (SELECT id FROM course_reviews WHERE student_id >= 5)
    `;
    await sql`DELETE FROM course_reviews WHERE student_id >= 5`;
    
    // Finally delete students
    const deleteRes = await sql`DELETE FROM students WHERE id >= 5`;
    console.log("Deleted students count:", deleteRes ? "Success" : "None");

    // Reset sequence so that the next student registered gets ID 5
    console.log("Resetting students_id_seq sequence to restart with 5...");
    await sql`ALTER SEQUENCE students_id_seq RESTART WITH 5`;
    
    console.log("SUCCESS: Database successfully cleaned up! Next registered student will have ID 5.");
  } catch (error) {
    console.error("ERROR running cleanup:", error);
  }
}

main();

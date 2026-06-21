import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
const sql = neon(databaseUrl!);

async function main() {
  try {
    const students = await sql`SELECT id, name, email FROM students`;
    for (const student of students) {
      console.log(`\n==================================================`);
      console.log(`Student: ${student.name} (id: ${student.id}, email: ${student.email})`);
      
      const profile = await sql`
        SELECT learning_goal, skill_level FROM student_profiles WHERE student_id = ${student.id}
      `;
      console.log("Profile:", profile[0]);

      const interests = await sql`
        SELECT interest_name FROM student_interests WHERE student_id = ${student.id}
      `;
      console.log("Interests:", interests.map(i => i.interest_name));

      // Fetch recommendations
      // We can run the same queries as getRecommendations
      const allSubsDb = await sql`
        SELECT s.name as sub_name, c.category_name
        FROM subcategories s
        JOIN categories c ON s.parent_category_id = c.id
      `;
      
      const interestsList = interests.map(i => i.interest_name);
      const userCategoryInterests = new Set<string>();
      const userSubcategoryInterests = new Set<string>();
      
      interestsList.forEach(interest => {
        const isSub = allSubsDb.some(s => s.sub_name === interest);
        if (isSub) {
          userSubcategoryInterests.add(interest);
        } else {
          userCategoryInterests.add(interest);
        }
      });

      const allowedSubcategories = new Set<string>();
      userSubcategoryInterests.forEach(sub => allowedSubcategories.add(sub));
      
      userCategoryInterests.forEach(catName => {
        const subcategoriesOfCat = allSubsDb.filter(s => s.category_name === catName).map(s => s.sub_name);
        const userHasSpecificSubInCat = subcategoriesOfCat.some(sub => userSubcategoryInterests.has(sub));
        if (!userHasSpecificSubInCat) {
          subcategoriesOfCat.forEach(sub => allowedSubcategories.add(sub));
        }
      });
      
      if (userSubcategoryInterests.size > 0) {
        const relatedSubsList = await sql`
          SELECT name FROM subcategories
          WHERE id IN (
            SELECT object_id FROM subcategory_relations WHERE subject_id IN (
              SELECT id FROM subcategories WHERE name = ANY(${Array.from(userSubcategoryInterests)})
            )
            UNION
            SELECT subject_id FROM subcategory_relations WHERE object_id IN (
              SELECT id FROM subcategories WHERE name = ANY(${Array.from(userSubcategoryInterests)})
            )
          )
        `;
        relatedSubsList.forEach(row => allowedSubcategories.add(row.name));
      }

      console.log("Allowed Subcategories:", Array.from(allowedSubcategories));
    }
  } catch (error) {
    console.error("Execution failed:", error);
  }
}

main();

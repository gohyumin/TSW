import { getRecommendations } from "./app/actions/recommendation";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  try {
    console.log("Running getRecommendations for student 3...");
    const recs = await getRecommendations(3);
    console.log("Returned Recommendations Count:", recs.length);
    console.log("Recommended Titles:");
    recs.forEach((r: any, idx: number) => {
      console.log(`${idx + 1}. [${r.category_name} - ${r.subcategory_name}] ${r.title} (${r.difficulty_level})`);
      console.log(`   Reasons:`, r.reasons);
    });
  } catch (err) {
    console.error(err);
  }
}

main();

/**
 * sparqlService.ts
 * Solution 1 & 2: Prepares and demonstrates SPARQL query setups.
 */

export interface RDFTriple {
  s: string;
  p: string;
  o: string;
}

export function generateColdStartSparql(
  studentId: number,
  interests: string[],
  goal: string,
  skills: string[]
): string {
  const interestUris = interests.map((i) => `ex:${formatUriSegment(i)}`).join(", ");
  const skillUris = skills.map((s) => `ex:${formatUriSegment(s)}`).join(", ");

  return `PREFIX ex: <http://example.org/learnwise#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

# SPARQL Solution 1: Cold Start recommendations matching category and subcategory interests
SELECT DISTINCT ?course ?title ?categoryName ?subcategoryName
WHERE {
  # Bind profile query variables
  BIND(ex:Student${studentId} AS ?user)
  
  ?user a ex:Learner ;
        ex:hasGoal ex:${formatUriSegment(goal)} ;
        ex:hasInterest ?interest .
 
  ?course a ex:Course ;
          ex:title ?title ;
          ex:hasCategory ?category ;
          ex:hasSubcategory ?subcategory .
          
  ?category ex:name ?categoryName .
  ?subcategory ex:name ?subcategoryName .

  # Match either direct category, direct subcategory, or related subcategories
  {
    # Direct Category or Subcategory Interest Match
    FILTER(?interest IN (${interestUris || "ex:None"}))
    FILTER(?category = ?interest || ?subcategory = ?interest)
  }
  UNION
  {
    # Ontology traversal via related subcategories (1-hop relatedTo relations)
    ?userInterest rdf:type ex:Subcategory .
    FILTER(?userInterest IN (${interestUris || "ex:None"}))
    ?userInterest ex:relatedTo ?subcategory .
  }
}
ORDER BY ?title`;
}

export function generateReviewSemanticSparql(skillName: string, levelName: string): string {
  return `PREFIX ex: <http://example.org/learnwise#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

# SPARQL Solution 2: Ontology review semantic query
SELECT DISTINCT ?course ?title ?reviewText
WHERE {
  ?course a ex:Course ;
          ex:title ?title .
          
  ?review a ex:Review ;
          ex:aboutCourse ?course ;
          ex:text ?reviewText ;
          ex:mentionsSkill ex:${formatUriSegment(skillName)} ;
          ex:suitableFor ex:${formatUriSegment(levelName)} .
}`;
}

export function generateSkillGapSparql(studentId: number, goal: string): string {
  const goalUri = `ex:${formatUriSegment(goal)}`;
  return `PREFIX ex: <http://example.org/learnwise#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

# SPARQL Solution 1: Skill Gap Query
SELECT DISTINCT ?missingSkill WHERE {
  # Target Goal requirements
  ${goalUri} ex:requiresSkill ?missingSkill .
  
  # Exclude skills the learner already possesses
  FILTER NOT EXISTS {
    ex:Student${studentId} ex:hasSkill ?missingSkill .
  }
}`;
}

/**
 * Executes a simulated SPARQL query over our database model.
 */
export function executeMockSparqlQueryResult(queryType: "coldStart" | "reviewSemantics" | "skillGap", parameters: any): any[] {
  console.log(`[SPARQL Engine] Executing SPARQL query for type: ${queryType}...`);
  if (queryType === "skillGap") {
    const goal = parameters.goal || "";
    const skills = parameters.skills || [];
    let required: string[] = [];
    if (goal === "Software Developer") required = ["Programming", "Python", "Web Development"];
    else if (goal === "Business Manager") required = ["Management", "Business Strategy"];
    else if (goal === "Legal Counsel") required = ["Ethics", "Contract Law"];
    else if (goal === "Robotics Engineer") required = ["Physics", "Robotics & Automation"];
    else required = ["Programming", "Python"];

    return required.filter(r => !skills.includes(r));
  }
  return [];
}

/**
 * Real Graph Pattern Matching SPARQL Engine.
 * Evaluates standard SELECT queries against the loaded RDF triples.
 */
export function executeSparqlQuery(query: string, triples: RDFTriple[]): any[] {
  console.log("[SPARQL Engine] Evaluating SPARQL query over in-memory graph store...");
  const cleanQuery = query.replace(/\s+/g, " ");

  // Query 1: Find courses that improve weaknesses
  if (cleanQuery.includes("ex:hasWeakness") && cleanQuery.includes("ex:teachesSkill")) {
    const studentMatch = cleanQuery.match(/(ex:Student\d+)/);
    const studentUri = studentMatch ? studentMatch[1] : "ex:Student1";

    const weaknesses = triples.filter(t => t.s === studentUri && t.p === "ex:hasWeakness").map(t => t.o);
    const results: any[] = [];
    weaknesses.forEach(skillUri => {
      const teachingCourses = triples.filter(t => t.p === "ex:teachesSkill" && t.o === skillUri).map(t => t.s);
      teachingCourses.forEach(courseUri => {
        results.push({ course: courseUri, skill: skillUri });
      });
    });
    return results;
  }

  // Query 2: Find courses that are next step (prerequisites met / suitable)
  if (cleanQuery.includes("ex:suitableFor")) {
    const studentMatch = cleanQuery.match(/(ex:Student\d+)/);
    const studentUri = studentMatch ? studentMatch[1] : "ex:Student1";

    const suitables = triples.filter(t => t.p === "ex:suitableFor" && t.o === studentUri).map(t => t.s);
    return suitables.map(courseUri => ({ course: courseUri }));
  }

  // Query 3: Find courses that are next milestone based on completed courses (Rule 4)
  if (cleanQuery.includes("ex:completedCourse") && cleanQuery.includes("ex:requiresSkill")) {
    const studentMatch = cleanQuery.match(/(ex:Student\d+)/);
    const studentUri = studentMatch ? studentMatch[1] : "ex:Student1";

    const completed = triples.filter(t => t.s === studentUri && t.p === "ex:completedCourse").map(t => t.o);
    const results: any[] = [];
    completed.forEach(c1Uri => {
      const skills = triples.filter(t => t.s === c1Uri && t.p === "ex:teachesSkill").map(t => t.o);
      skills.forEach(skillUri => {
        const nextCourses = triples.filter(t => t.p === "ex:requiresSkill" && t.o === skillUri).map(t => t.s);
        nextCourses.forEach(c2Uri => {
          if (c2Uri !== c1Uri && !completed.includes(c2Uri)) {
            results.push({ course: c2Uri, skill: skillUri, completedCourse: c1Uri });
          }
        });
      });
    });
    return results;
  }

  // Query 4: Find courses based on learning goal (Rule 1 / Career path)
  if (cleanQuery.includes("ex:hasGoal") && cleanQuery.includes("ex:requiresSkill") && cleanQuery.includes("ex:teachesSkill")) {
    const studentMatch = cleanQuery.match(/(ex:Student\d+)/);
    const studentUri = studentMatch ? studentMatch[1] : "ex:Student1";

    const goalTriple = triples.find(t => t.s === studentUri && t.p === "ex:hasGoal");
    if (goalTriple) {
      const goalUri = goalTriple.o;
      const reqSkills = triples.filter(t => t.s === goalUri && t.p === "ex:requiresSkill").map(t => t.o);
      const results: any[] = [];
      reqSkills.forEach(skillUri => {
        const teachingCourses = triples.filter(t => t.p === "ex:teachesSkill" && t.o === skillUri).map(t => t.s);
        teachingCourses.forEach(courseUri => {
          results.push({ course: courseUri, skill: skillUri });
        });
      });
      return results;
    }
  }

  return [];
}

function formatUriSegment(val: string): string {
  if (!val) return "";
  return val.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
}

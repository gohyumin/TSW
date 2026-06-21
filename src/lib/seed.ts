import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  console.log("Starting database migrations and seeding with Semantic Subcategories...");

  try {
    // 1. Drop existing tables to ensure clean state (in order of dependencies)
    console.log("Dropping existing tables if they exist...");
    await sql`DROP TABLE IF EXISTS student_wishlist CASCADE`;
    await sql`DROP TABLE IF EXISTS student_quiz_results CASCADE`;
    await sql`DROP TABLE IF EXISTS student_learning_paths CASCADE`;
    await sql`DROP TABLE IF EXISTS student_learning_history CASCADE`;
    await sql`DROP TABLE IF EXISTS review_semantics CASCADE`;
    await sql`DROP TABLE IF EXISTS course_reviews CASCADE`;
    await sql`DROP TABLE IF EXISTS course_skills CASCADE`;
    await sql`DROP TABLE IF EXISTS student_skills CASCADE`;
    await sql`DROP TABLE IF EXISTS student_interests CASCADE`;
    await sql`DROP TABLE IF EXISTS student_profiles CASCADE`;
    await sql`DROP TABLE IF EXISTS students CASCADE`;
    await sql`DROP TABLE IF EXISTS courses CASCADE`;
    await sql`DROP TABLE IF EXISTS subcategory_relations CASCADE`;
    await sql`DROP TABLE IF EXISTS subcategories CASCADE`;
    await sql`DROP TABLE IF EXISTS categories CASCADE`;

    // 2. Create tables
    console.log("Creating tables...");

    // Categories Table
    await sql`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        category_name VARCHAR(100) UNIQUE NOT NULL,
        emoji VARCHAR(10),
        gradient_class VARCHAR(255),
        color_class VARCHAR(100),
        description TEXT
      )
    `;

    // Subcategories Table (NEW)
    await sql`
      CREATE TABLE subcategories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        parent_category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        description TEXT
      )
    `;

    // Subcategory Relations Table (NEW - RDF triples subject -> predicate -> object)
    await sql`
      CREATE TABLE subcategory_relations (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
        predicate VARCHAR(100) NOT NULL, -- e.g., 'relatedTo', 'broaderThan', 'prerequisiteOf'
        object_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
        UNIQUE(subject_id, predicate, object_id)
      )
    `;

    // Courses Table (MODIFIED to reference subcategories)
    await sql`
      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor VARCHAR(100) NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
        difficulty_level VARCHAR(50) NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced'
        duration_hours NUMERIC(6,2) NOT NULL,
        learning_outcome TEXT,
        career_path VARCHAR(255),
        gradient_class VARCHAR(100),
        emoji VARCHAR(10),
        is_bestseller BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Course Skills Table
    await sql`
      CREATE TABLE course_skills (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        skill_name VARCHAR(100) NOT NULL,
        skill_level_required VARCHAR(50) NOT NULL
      )
    `;

    // Students Table
    await sql`
      CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Student Profiles Table
    await sql`
      CREATE TABLE student_profiles (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE UNIQUE,
        learning_goal VARCHAR(255),
        skill_level VARCHAR(50),
        education_background VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Student Interests Table
    await sql`
      CREATE TABLE student_interests (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        interest_name VARCHAR(100) NOT NULL,
        UNIQUE(student_id, interest_name)
      )
    `;

    // Student Skills Table
    await sql`
      CREATE TABLE student_skills (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        skill_name VARCHAR(100) NOT NULL,
        skill_level VARCHAR(50) NOT NULL,
        UNIQUE(student_id, skill_name)
      )
    `;

    // Course Reviews Table
    await sql`
      CREATE TABLE course_reviews (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      )
    `;

    // Review Semantics Table (For Solution 2 NLP/Ontology representation)
    await sql`
      CREATE TABLE review_semantics (
        id SERIAL PRIMARY KEY,
        review_id INTEGER REFERENCES course_reviews(id) ON DELETE CASCADE,
        concept VARCHAR(100) NOT NULL,
        relationship VARCHAR(100) NOT NULL -- 'mentionsSkill', 'suitableFor', 'relatedTo'
      )
    `;

    // Student Learning History Table
    await sql`
      CREATE TABLE student_learning_history (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        completion_status VARCHAR(50) NOT NULL, -- 'Started', 'In Progress', 'Completed'
        learning_hours NUMERIC(6,2) DEFAULT 0.0,
        completed_date TIMESTAMP WITH TIME ZONE
      )
    `;

    // Student Learning Paths Table
    await sql`
      CREATE TABLE student_learning_paths (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      )
    `;

    // Student Wishlist Table
    await sql`
      CREATE TABLE student_wishlist (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      )
    `;

    // Student Quiz Results Table (NEW)
    await sql`
      CREATE TABLE student_quiz_results (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        lesson_id INTEGER NOT NULL,
        score INTEGER NOT NULL, -- percentage score (0-100)
        skills_performance JSONB NOT NULL, -- e.g. {"VariableConcept": 100, "LoopConcept": 0}
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id, lesson_id)
      )
    `;

    console.log("Tables created successfully. Seeding initial categories...");

    // 3. Seed Categories
    const categoryIds: Record<string, number> = {};
    const categoriesToSeed = [
      { name: "Programming", emoji: "💻", gradient: "from-blue-500/10 to-indigo-500/10 border-blue-500/30 hover:border-blue-500", color: "text-blue-500", description: "Python & Web Development" },
      { name: "Business", emoji: "💼", gradient: "from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500", color: "text-amber-500", description: "Business Strategy & Operations" },
      { name: "Law", emoji: "⚖️", gradient: "from-purple-500/10 to-violet-500/10 border-purple-500/30 hover:border-purple-500", color: "text-purple-500", description: "Contract Law & Business Ethics" },
      { name: "Engineering", emoji: "⚙️", gradient: "from-rose-500/10 to-red-500/10 border-rose-500/30 hover:border-rose-500", color: "text-rose-500", description: "Principles of Robotics & Automation" }
    ];

    for (const cat of categoriesToSeed) {
      const res = await sql`
        INSERT INTO categories (category_name, emoji, gradient_class, color_class, description) 
        VALUES (${cat.name}, ${cat.emoji}, ${cat.gradient}, ${cat.color}, ${cat.description}) 
        ON CONFLICT (category_name) DO UPDATE SET 
          emoji = EXCLUDED.emoji, 
          gradient_class = EXCLUDED.gradient_class,
          color_class = EXCLUDED.color_class,
          description = EXCLUDED.description
        RETURNING id
      `;
      categoryIds[cat.name] = res[0].id;
    }

    console.log("Categories seeded. Seeding subcategories...");

    // 4. Seed Subcategories (5 per category)
    const subcategoryIds: Record<string, number> = {};
    const subcategoriesToSeed = [
      // Programming
      { name: "Python", category: "Programming", description: "Python programming language, scripts, and libraries." },
      { name: "Web Development", category: "Programming", description: "HTML/CSS and full-stack web architectures." },
      { name: "Mobile Development", category: "Programming", description: "Native and cross-platform mobile apps." },
      { name: "Data Science", category: "Programming", description: "Data analysis, visualization, and machine learning." },
      { name: "Cybersecurity", category: "Programming", description: "Network security, cryptography, and defense tactics." },
      
      // Business
      { name: "Business Strategy", category: "Business", description: "Corporate growth models, strategic decisions, and leadership skills." },
      { name: "Marketing", category: "Business", description: "Digital marketing, branding, and consumer behavior." },
      { name: "Finance", category: "Business", description: "Corporate finance, investments, and accounting principles." },
      { name: "Entrepreneurship", category: "Business", description: "Starting new ventures, business plans, and scaling." },
      { name: "Operations Management", category: "Business", description: "Supply chain, process optimization, and logistics." },

      // Law
      { name: "Contract Law", category: "Law", description: "Commercial agreement drafting, legal liabilities, and dispute resolutions." },
      { name: "Intellectual Property", category: "Law", description: "Patents, trademarks, copyrights, and trade secrets." },
      { name: "Corporate Law", category: "Law", description: "Business structures, governance, compliance, and mergers." },
      { name: "Criminal Law", category: "Law", description: "Criminal justice system, offenses, defenses, and trials." },
      { name: "International Law", category: "Law", description: "Treaties, global jurisdictions, and human rights law." },

      // Engineering
      { name: "Robotics & Automation", category: "Engineering", description: "PID feedback controllers, robotic arms, kinematics, and control loops." },
      { name: "Electrical Engineering", category: "Engineering", description: "Circuits, signals, power systems, and electronics." },
      { name: "Mechanical Engineering", category: "Engineering", description: "Thermodynamics, mechanics, materials, and CAD design." },
      { name: "Civil Engineering", category: "Engineering", description: "Structural design, transportation, and infrastructure projects." },
      { name: "Chemical Engineering", category: "Engineering", description: "Chemical processes, thermodynamics, and industrial chemistry." }
    ];

    for (const sub of subcategoriesToSeed) {
      const parentId = categoryIds[sub.category];
      const res = await sql`
        INSERT INTO subcategories (name, parent_category_id, description)
        VALUES (${sub.name}, ${parentId}, ${sub.description})
        ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
        RETURNING id
      `;
      subcategoryIds[sub.name] = res[0].id;
    }

    console.log("Subcategories seeded. Seeding subcategory semantic relations (RDF Triples)...");

    // 5. Seed Subcategory Relations (RDF triples subject -> predicate -> object)
    const relationsToSeed = [
      { subject: "Robotics & Automation", predicate: "relatedTo", object: "Python" },
      { subject: "Contract Law", predicate: "relatedTo", object: "Business Strategy" },
      { subject: "Web Development", predicate: "relatedTo", object: "Python" }
    ];

    for (const rel of relationsToSeed) {
      const subId = subcategoryIds[rel.subject];
      const objId = subcategoryIds[rel.object];
      if (subId && objId) {
        await sql`
          INSERT INTO subcategory_relations (subject_id, predicate, object_id)
          VALUES (${subId}, ${rel.predicate}, ${objId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    console.log("Relations seeded. Seeding courses (100 total)...");

    // 6. Dynamic Seeding of 5 courses per subcategory (100 total)
    const originalCourses = [
      {
        title: "Complete Web Development Bootcamp",
        description: "Learn HTML, CSS, JavaScript, React, and Node.js from scratch to build modern full-stack web applications.",
        instructor: "John Doe",
        price: 0.00,
        category: "Programming",
        subcategory: "Web Development",
        difficulty: "Beginner",
        duration: 45.5,
        outcome: "Ability to construct complete, responsive, full-stack websites.",
        path: "Software Developer",
        gradient: "from-blue-500 via-indigo-500 to-violet-600",
        emoji: "💻",
        bestseller: true,
        skills: [{ name: "JavaScript", level: "Beginner" }, { name: "React", level: "Beginner" }]
      },
      {
        title: "Introduction to Python Programming",
        description: "Perfect starting course for coding. Learn variables, loops, object-oriented concepts, and files.",
        instructor: "Bob Wilson",
        price: 0.00,
        category: "Programming",
        subcategory: "Python",
        difficulty: "Beginner",
        duration: 18.0,
        outcome: "Solid understanding of software logic and writing Python scripts.",
        path: "Software Developer",
        gradient: "from-teal-500 via-cyan-500 to-sky-600",
        emoji: "🐍",
        bestseller: false,
        skills: [{ name: "Logic", level: "Beginner" }, { name: "Python", level: "Beginner" }]
      },
      {
        title: "Introduction to Business Management",
        description: "Master modern business management principles, organizational layouts, and strategic decision frameworks.",
        instructor: "Sarah Jenkins",
        price: 0.00,
        category: "Business",
        subcategory: "Business Strategy",
        difficulty: "Beginner",
        duration: 22.0,
        outcome: "Competence in operational management and core business strategy planning.",
        path: "Business Manager",
        gradient: "from-amber-500 via-orange-500 to-yellow-600",
        emoji: "💼",
        bestseller: true,
        skills: [{ name: "Management", level: "Beginner" }, { name: "Strategy", level: "Beginner" }]
      },
      {
        title: "Business Law & Contract Ethics",
        description: "Understand legal liabilities, draft commercial sales contracts, and explore intellectual regulation basics.",
        instructor: "Robert Vance",
        price: 0.00,
        category: "Law",
        subcategory: "Contract Law",
        difficulty: "Intermediate",
        duration: 26.0,
        outcome: "Ability to draft standard business agreements and review contract liabilities.",
        path: "Legal Counsel",
        gradient: "from-zinc-800 to-slate-900",
        emoji: "⚖️",
        bestseller: true,
        skills: [{ name: "Contracts", level: "Beginner" }, { name: "Ethics", level: "Beginner" }]
      },
      {
        title: "Principles of Robotics & Control Systems",
        description: "Program robot kinematic paths, coordinate vector spaces, and configure PID feedback control systems.",
        instructor: "Jane Smith",
        price: 0.00,
        category: "Engineering",
        subcategory: "Robotics & Automation",
        difficulty: "Advanced",
        duration: 40.0,
        outcome: "Program robotic arms and configure controller loop feedback.",
        path: "Robotics Engineer",
        gradient: "from-indigo-500 via-purple-500 to-pink-500",
        emoji: "🤖",
        bestseller: false,
        skills: [{ name: "Robotics", level: "Intermediate" }]
      }
    ];

    const subcategoryMeta: Record<string, { path: string; gradient: string; emojis: string[]; skills: string[] }> = {
      "Python": { path: "Software Developer", gradient: "from-teal-500 via-cyan-500 to-sky-600", emojis: ["🐍", "🐼", "💻", "📊", "🤖"], skills: ["Python", "Scripting", "Automation"] },
      "Web Development": { path: "Software Developer", gradient: "from-blue-500 via-indigo-500 to-violet-600", emojis: ["💻", "🌐", "⚡", "⚛️", "🛠️"], skills: ["HTML/CSS", "JavaScript", "React", "Node.js"] },
      "Mobile Development": { path: "Software Developer", gradient: "from-sky-500 to-blue-700", emojis: ["📱", "📲", "🍎", "🤖", "🚀"], skills: ["React Native", "iOS", "Android", "Flutter"] },
      "Data Science": { path: "Software Developer", gradient: "from-cyan-500 via-blue-500 to-indigo-600", emojis: ["📊", "📈", "🧮", "🧬", "🧠"], skills: ["Data Analysis", "SQL", "Pandas", "Machine Learning"] },
      "Cybersecurity": { path: "Software Developer", gradient: "from-slate-800 to-slate-900", emojis: ["🔒", "🛡️", "🕵️", "🔑", "💻"], skills: ["Network Security", "Cryptography", "Ethical Hacking", "Linux"] },

      "Business Strategy": { path: "Business Manager", gradient: "from-amber-500 via-orange-500 to-yellow-600", emojis: ["💼", "📈", "🎯", "🧠", "🤝"], skills: ["Management", "Strategy", "Leadership"] },
      "Marketing": { path: "Business Manager", gradient: "from-orange-400 to-red-500", emojis: ["📣", "🎯", "📱", "📈", "🛍️"], skills: ["Digital Marketing", "Branding", "SEO", "Social Media"] },
      "Finance": { path: "Business Manager", gradient: "from-emerald-500 to-green-600", emojis: ["💵", "🏦", "📊", "💳", "📈"], skills: ["Accounting", "Investment", "Corporate Finance", "Excel"] },
      "Entrepreneurship": { path: "Business Manager", gradient: "from-yellow-400 via-amber-500 to-orange-600", emojis: ["💡", "🚀", "🏢", "📈", "🌱"], skills: ["Business Planning", "Pitching", "Scaling", "Startups"] },
      "Operations Management": { path: "Business Manager", gradient: "from-amber-500 to-stone-600", emojis: ["📦", "🚛", "🔄", "⚙️", "📈"], skills: ["Supply Chain", "Logistics", "Process Optimization", "Lean"] },

      "Contract Law": { path: "Legal Counsel", gradient: "from-zinc-800 to-slate-900", emojis: ["⚖️", "📜", "🖊️", "🔍", "🤝"], skills: ["Contracts", "Ethics", "Commercial Law"] },
      "Intellectual Property": { path: "Legal Counsel", gradient: "from-slate-700 to-zinc-800", emojis: ["💡", "🎨", "📝", "⚖️", "🛡️"], skills: ["Patents", "Trademarks", "Copyrights"] },
      "Corporate Law": { path: "Legal Counsel", gradient: "from-zinc-700 to-slate-800", emojis: ["🏢", "⚖️", "📜", "💼", "🤝"], skills: ["Compliance", "Corporate Governance", "Mergers"] },
      "Criminal Law": { path: "Legal Counsel", gradient: "from-red-950 via-slate-900 to-black", emojis: ["⚖️", "🚨", "🔒", "🏛️", "📋"], skills: ["Criminal Justice", "Trial Advocacy", "Defense"] },
      "International Law": { path: "Legal Counsel", gradient: "from-blue-900 to-slate-850", emojis: ["🌐", "🗺️", "⚖️", "🤝", "🏛️"], skills: ["Treaties", "Human Rights", "Global Jurisdiction"] },

      "Robotics & Automation": { path: "Robotics Engineer", gradient: "from-indigo-500 via-purple-500 to-pink-500", emojis: ["🤖", "⚙️", "🦾", "🕹️", "⚡"], skills: ["Robotics", "PID Control", "Kinematics"] },
      "Electrical Engineering": { path: "Robotics Engineer", gradient: "from-yellow-500 via-amber-500 to-rose-600", emojis: ["⚡", "🔌", "📟", "🔋", "💡"], skills: ["Circuits", "Signals", "Power Systems", "Electronics"] },
      "Mechanical Engineering": { path: "Robotics Engineer", gradient: "from-rose-500 to-pink-600", emojis: ["⚙️", "📐", "🔧", "🚗", "✈️"], skills: ["Thermodynamics", "Mechanics", "CAD", "Materials"] },
      "Civil Engineering": { path: "Robotics Engineer", gradient: "from-orange-500 via-red-500 to-amber-600", emojis: ["🏗️", "🌉", "🛣️", "📐", "🏢"], skills: ["Structural Design", "Hydraulics", "Infrastructure"] },
      "Chemical Engineering": { path: "Robotics Engineer", gradient: "from-teal-500 to-emerald-600", emojis: ["🧪", "⚗️", "🔥", "⚙️", "🧬"], skills: ["Thermodynamics", "Process Design", "Chemistry"] }
    };

    const difficulties = ["Beginner", "Intermediate", "Advanced"];
    const coursesToSeed: any[] = [];

    for (const sub of subcategoriesToSeed) {
      const parentCat = sub.category;
      const subName = sub.name;
      
      // Check if there is an original course for this subcategory
      const orig = originalCourses.find(o => o.subcategory === subName);
      let count = 5;
      
      if (orig) {
        coursesToSeed.push(orig);
        count = 4;
      }
      
      const meta = subcategoryMeta[subName];
      const path = meta?.path || "Software Developer";
      const gradient = meta?.gradient || "from-blue-500 to-indigo-600";
      const emojis = meta?.emojis || ["📚", "✏️", "🎓", "🌟", "💡"];
      const skillsPool = meta?.skills || ["Theory", "Application"];

      for (let i = 1; i <= count; i++) {
        const difficulty = difficulties[(i - 1) % difficulties.length];
        const emoji = emojis[i % emojis.length];
        const duration = Math.round((15 + i * 8.5) * 10) / 10;

        let title = "";
        let description = "";
        if (i === 1) {
          title = `Mastering ${subName}: A Comprehensive Guide`;
          description = `A complete, end-to-end guide to understanding the core fundamentals, workflows, and operations in ${subName}.`;
        } else if (i === 2) {
          title = `Practical ${subName} Essentials`;
          description = `Gain hands-on experience and real-world skills by working through practical assignments in ${subName}.`;
        } else if (i === 3) {
          title = `Advanced ${subName} Methodologies`;
          description = `Delve deep into complex theories, performance optimizations, and professional paradigms for ${subName}.`;
        } else if (i === 4) {
          title = `${subName} Masterclass`;
          description = `An intensive curriculum covering expert strategies, case studies, and advanced solutions in ${subName}.`;
        } else {
          title = `${subName} for Industry Professionals`;
          description = `Optimize your enterprise projects and technical solutions using state-of-the-art standards in ${subName}.`;
        }

        const courseSkills = skillsPool.slice(0, 2).map((s, idx) => ({
          name: s,
          level: idx === 0 ? "Beginner" : difficulty
        }));

        coursesToSeed.push({
          title,
          description,
          instructor: `Dr. ${["Emily Stone", "Marcus Vance", "Sophia Chen", "Liam O'Connor", "Aria Silva"][i % 5]}`,
          price: 0.00,
          category: parentCat,
          subcategory: subName,
          difficulty,
          duration,
          outcome: `Complete command of core ${subName} challenges and architectures.`,
          path,
          gradient,
          emoji,
          bestseller: i === 1,
          skills: courseSkills
        });
      }
    }

    const courseMap: Record<string, number> = {};

    for (const c of coursesToSeed) {
      const catId = categoryIds[c.category];
      const subId = subcategoryIds[c.subcategory];
      
      const res = await sql`
        INSERT INTO courses (
          title, description, instructor, price, category_id, subcategory_id,
          difficulty_level, duration_hours, learning_outcome, 
          career_path, gradient_class, emoji, is_bestseller
        ) VALUES (
          ${c.title}, ${c.description}, ${c.instructor}, ${c.price}, ${catId}, ${subId},
          ${c.difficulty}, ${c.duration}, ${c.outcome}, 
          ${c.path}, ${c.gradient}, ${c.emoji}, ${c.bestseller}
        ) RETURNING id
      `;
      const courseId = res[0].id;
      courseMap[c.title] = courseId;

      // Seed course skills
      for (const skill of c.skills) {
        await sql`
          INSERT INTO course_skills (course_id, skill_name, skill_level_required)
          VALUES (${courseId}, ${skill.name}, ${skill.level})
        `;
      }
    }

    console.log("Courses and course skills seeded. Seeding sample students...");

    // 7. Seed Test Students (Passwords: 'password123')
    const testPasswordHash = "4444:67346be19777af1d0703d72c3693e7dbd6d6692f79aaf44e247b2f46191d5931"; // precalculated mock hash
    
    // Student 1 John Doe
    const student1Res = await sql`
      INSERT INTO students (name, email, password_hash)
      VALUES ('John Doe', 'student@learnwise.com', ${testPasswordHash})
      RETURNING id
    `;
    const student1Id = student1Res[0].id;

    // Student 2 Alice Tester
    const student2Res = await sql`
      INSERT INTO students (name, email, password_hash)
      VALUES ('Alice Tester', 'alice@learnwise.com', ${testPasswordHash})
      RETURNING id
    `;
    const student2Id = student2Res[0].id;

    console.log("Students seeded. Seeding profile data...");

    // 8. Seed Profile details for John Doe (Student 1)
    await sql`
      INSERT INTO student_profiles (student_id, learning_goal, skill_level, education_background)
      VALUES (${student1Id}, 'Software Developer', 'Beginner', 'Bachelor of Computer Science')
    `;

    // John Doe Interests (matching new categories & subcategories)
    await sql`INSERT INTO student_interests (student_id, interest_name) VALUES (${student1Id}, 'Programming')`;
    await sql`INSERT INTO student_interests (student_id, interest_name) VALUES (${student1Id}, 'Python')`;
    await sql`INSERT INTO student_interests (student_id, interest_name) VALUES (${student1Id}, 'Web Development')`;

    // John Doe Existing Skills
    await sql`INSERT INTO student_skills (student_id, skill_name, skill_level) VALUES (${student1Id}, 'Python', 'Beginner')`;

    console.log("Profile data seeded. Seeding reviews and review semantics...");

    // 9. Seed Reviews & Review Semantics
    const introPythonId = courseMap["Introduction to Python Programming"];
    
    const reviewRes = await sql`
      INSERT INTO course_reviews (student_id, course_id, rating, review_text)
      VALUES (
        ${student2Id}, 
        ${introPythonId}, 
        5, 
        'This course is suitable for beginners who want to learn Python before entering AI.'
      )
      RETURNING id
    `;
    const reviewId = reviewRes[0].id;

    // Seed Semantic tags for the review
    await sql`
      INSERT INTO review_semantics (review_id, concept, relationship) VALUES
      (${reviewId}, 'Python', 'mentionsSkill'),
      (${reviewId}, 'Beginner', 'suitableFor'),
      (${reviewId}, 'Programming', 'relatedTo')
    `;

    // 10. Enroll John Doe (Student 1) in some courses
    console.log("Enrolling John Doe in initial courses...");
    const roboticsId = courseMap["Principles of Robotics & Control Systems"];
    await sql`
      INSERT INTO student_learning_paths (student_id, course_id)
      VALUES (${student1Id}, ${introPythonId}), (${student1Id}, ${roboticsId})
      ON CONFLICT DO NOTHING
    `;

    await sql`
      INSERT INTO student_learning_history (student_id, course_id, completion_status, learning_hours)
      VALUES 
      (${student1Id}, ${introPythonId}, 'In Progress', 4.5), 
      (${student1Id}, ${roboticsId}, 'Started', 1.0)
      ON CONFLICT DO NOTHING
    `;

    // Seed mock quiz results for John Doe (Student 1) in Python (course introPythonId)
    // Lesson 1 (Variables): 100% score (mastered)
    // Lesson 2 (Loops): 33% score (weakness)
    await sql`
      INSERT INTO student_quiz_results (student_id, course_id, lesson_id, score, skills_performance)
      VALUES
      (${student1Id}, ${introPythonId}, 1, 100, '{"VariableConcept": 100}'::jsonb),
      (${student1Id}, ${introPythonId}, 2, 33, '{"LoopConcept": 33}'::jsonb)
      ON CONFLICT (student_id, course_id, lesson_id) DO NOTHING
    `;

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Migration/Seeding failed with error:", error);
    process.exit(1);
  }
}

main();

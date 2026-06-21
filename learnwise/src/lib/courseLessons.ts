export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  concept: string; // The semantic concept tested by this question
}

export interface Lesson {
  id: number; // 1, 2, 3
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export const courseLessons: Record<number, Lesson[]> = {
  1: [ // Complete Web Development Bootcamp
    {
      id: 1,
      title: "Lesson 1: HTML Structures & Basics",
      description: "Understand basic tags, elements, and document declarations.",
      questions: [
        {
          id: 1,
          questionText: "What does HTML stand for?",
          options: ["Hyper Text Markup Language", "Hyperlink Text Management Language", "Home Tool Markup Language", "Hyper Tech Modern Language"],
          correctAnswer: "Hyper Text Markup Language",
          explanation: "HTML stands for Hyper Text Markup Language. It is the standard markup language used for creating web pages.",
          concept: "HTMLConcept"
        },
        {
          id: 2,
          questionText: "Which tag is used to create a hyperlink in HTML?",
          options: ["<link>", "<a>", "<href>", "<url>"],
          correctAnswer: "<a>",
          explanation: "The <a> (anchor) tag is used to define a hyperlink, which is used to link from one page to another.",
          concept: "HTMLConcept"
        },
        {
          id: 3,
          questionText: "Which HTML tag is used for the largest heading?",
          options: ["<heading>", "<h6>", "<h1>", "<head>"],
          correctAnswer: "<h1>",
          explanation: "<h1> defines the most important and largest heading in HTML, down to <h6> for the least important.",
          concept: "HTMLConcept"
        }
      ]
    },
    {
      id: 2,
      title: "Lesson 2: CSS Layouts & Flexbox",
      description: "Style your web pages and align elements dynamically using CSS Flexbox.",
      questions: [
        {
          id: 1,
          questionText: "Which CSS property is used to change the text color?",
          options: ["text-color", "color", "font-color", "background-color"],
          correctAnswer: "color",
          explanation: "The 'color' property specifies the color of the text in CSS.",
          concept: "CSSLayouts"
        },
        {
          id: 2,
          questionText: "In Flexbox, which property defines the main alignment axis?",
          options: ["align-items", "justify-content", "flex-direction", "wrap-content"],
          correctAnswer: "flex-direction",
          explanation: "The 'flex-direction' property specifies the direction of the flexible items (row, column, etc.), establishing the main axis.",
          concept: "CSSLayouts"
        },
        {
          id: 3,
          questionText: "How do you align items along the cross axis in a flex container?",
          options: ["justify-content", "align-items", "align-content", "justify-items"],
          correctAnswer: "align-items",
          explanation: "The 'align-items' property aligns flex items vertically (or along the cross axis) inside a flex container.",
          concept: "CSSLayouts"
        }
      ]
    },
    {
      id: 3,
      title: "Lesson 3: Introduction to React Components",
      description: "Dive into React's modular ecosystem by understanding components and state.",
      questions: [
        {
          id: 1,
          questionText: "What are React components?",
          options: ["Database tables", "Independent, reusable bits of UI code", "Browser configurations", "CSS styling files"],
          correctAnswer: "Independent, reusable bits of UI code",
          explanation: "React components are reusable UI parts that act like functions returning HTML (via JSX).",
          concept: "ReactComponents"
        },
        {
          id: 2,
          questionText: "Which hook is used to manage local state inside a functional component?",
          options: ["useEffect", "useContext", "useState", "useReducer"],
          correctAnswer: "useState",
          explanation: "useState is the built-in React hook designed to declare and update local state variables inside a functional component.",
          concept: "ReactComponents"
        },
        {
          id: 3,
          questionText: "What is the correct way to pass data from a parent to a child component?",
          options: ["Using state", "Using props", "Using database queries", "Using CSS classes"],
          correctAnswer: "Using props",
          explanation: "React uses 'props' (short for properties) to pass read-only data from parent components down to child components.",
          concept: "ReactComponents"
        }
      ]
    }
  ],
  2: [ // Introduction to Python Programming
    {
      id: 1,
      title: "Lesson 1: Python Variables & Basic Types",
      description: "Learn how to store data in variables and distinguish core data types.",
      questions: [
        {
          id: 1,
          questionText: "How do you declare a variable with a string value in Python?",
          options: ["var name = 'Alice'", "string name = 'Alice'", "name = 'Alice'", "declare name = 'Alice'"],
          correctAnswer: "name = 'Alice'",
          explanation: "Python is dynamically typed; you declare variables by directly assigning values using the '=' operator.",
          concept: "VariableConcept"
        },
        {
          id: 2,
          questionText: "Which data type is used to represent decimal values in Python?",
          options: ["int", "float", "decimal_type", "double"],
          correctAnswer: "float",
          explanation: "Python uses 'float' to represent floating-point (decimal) numbers (e.g., 3.14).",
          concept: "VariableConcept"
        },
        {
          id: 3,
          questionText: "What is the output of print(type([1, 2, 3])) in Python?",
          options: ["<class 'tuple'>", "<class 'list'>", "<class 'array'>", "<class 'dict'>"],
          correctAnswer: "<class 'list'>",
          explanation: "Square brackets denote list literals in Python, so its type evaluates to 'list'.",
          concept: "VariableConcept"
        }
      ]
    },
    {
      id: 2,
      title: "Lesson 2: Loops and Iterations",
      description: "Execute repetitive actions using 'for' and 'while' loops.",
      questions: [
        {
          id: 1,
          questionText: "Which keyword is used to exit a loop prematurely?",
          options: ["exit", "break", "continue", "stop"],
          correctAnswer: "break",
          explanation: "The 'break' statement terminates the current loop and resumes execution at the next statement outside the loop.",
          concept: "LoopConcept"
        },
        {
          id: 2,
          questionText: "What range of numbers does range(1, 5) yield in a Python loop?",
          options: ["1, 2, 3, 4, 5", "1, 2, 3, 4", "0, 1, 2, 3, 4", "1, 5"],
          correctAnswer: "1, 2, 3, 4",
          explanation: "The range(start, stop) function is end-exclusive. It starts at 1 and stops before 5.",
          concept: "LoopConcept"
        },
        {
          id: 3,
          questionText: "What is the purpose of the 'continue' keyword in a loop?",
          options: ["Terminates loop execution", "Skips the rest of the current iteration and starts the next", "Pauses execution", "Repeats the entire loop"],
          correctAnswer: "Skips the rest of the current iteration and starts the next",
          explanation: "'continue' tells Python to skip remaining code inside the loop for the current step and jump directly to the next iteration.",
          concept: "LoopConcept"
        }
      ]
    },
    {
      id: 3,
      title: "Lesson 3: Defining Python Functions",
      description: "Structure modular, reusable code blocks using functions and parameters.",
      questions: [
        {
          id: 1,
          questionText: "Which keyword is used to start a function definition in Python?",
          options: ["function", "def", "func", "define"],
          correctAnswer: "def",
          explanation: "Python functions are defined starting with the 'def' keyword, followed by the function name and parentheses.",
          concept: "FunctionConcept"
        },
        {
          id: 2,
          questionText: "How do you send a value back to the caller from inside a function?",
          options: ["send", "output", "return", "print"],
          correctAnswer: "return",
          explanation: "The 'return' statement exits a function and optionally passes an expression back to the caller.",
          concept: "FunctionConcept"
        },
        {
          id: 3,
          questionText: "What are arguments in functions?",
          options: ["Error logs", "Values passed into the function when it is called", "Variable declarations inside the function body", "The output values"],
          correctAnswer: "Values passed into the function when it is called",
          explanation: "Arguments are parameters/values passed into a function when calling it so it can process dynamic inputs.",
          concept: "FunctionConcept"
        }
      ]
    }
  ],
  3: [ // Introduction to Business Management
    {
      id: 1,
      title: "Lesson 1: Fundamentals of Business Operations",
      description: "Understand structural roles and operational alignment frameworks.",
      questions: [
        {
          id: 1,
          questionText: "What is the primary goal of operations management?",
          options: ["Maximizing efficiency and productivity", "Designing website icons", "Writing Python code", "Filing tax papers"],
          correctAnswer: "Maximizing efficiency and productivity",
          explanation: "Operations management focuses on structuring delivery pipelines to maximize efficiency and minimize resource loss.",
          concept: "BusinessOperations"
        },
        {
          id: 2,
          questionText: "Which department is responsible for talent acquisition?",
          options: ["Finance", "Human Resources", "Engineering", "Marketing"],
          correctAnswer: "Human Resources",
          explanation: "Human Resources administers employee onboarding, development plans, and general team building.",
          concept: "BusinessOperations"
        },
        {
          id: 3,
          questionText: "What is the key focus of Supply Chain Management?",
          options: ["Product distribution and flow optimization", "Writing SQL queries", "Drafting corporate law documents", "Creating user interfaces"],
          correctAnswer: "Product distribution and flow optimization",
          explanation: "Supply Chain optimizes the path materials take from sourcing down to end-user retail distribution.",
          concept: "BusinessOperations"
        }
      ]
    },
    {
      id: 2,
      title: "Lesson 2: Strategic Planning & SWOT Analysis",
      description: "Map organizational attributes using standard corporate strategic analysis matrices.",
      questions: [
        {
          id: 1,
          questionText: "What does SWOT stand for?",
          options: ["Strengths, Weaknesses, Opportunities, Threats", "Software, Web, Operations, Testing", "Sales, Wages, Outcomes, Tasks", "Strategy, Work, Objectives, Targets"],
          correctAnswer: "Strengths, Weaknesses, Opportunities, Threats",
          explanation: "SWOT analysis organizes internal and external factors to evaluate strategic positioning.",
          concept: "SWOTAnalysis"
        },
        {
          id: 2,
          questionText: "In SWOT analysis, which factors are considered external?",
          options: ["Strengths and Weaknesses", "Opportunities and Threats", "Strengths and Opportunities", "Weaknesses and Threats"],
          correctAnswer: "Opportunities and Threats",
          explanation: "Strengths/Weaknesses represent internal parameters, while Opportunities/Threats stem from market external variables.",
          concept: "SWOTAnalysis"
        },
        {
          id: 3,
          questionText: "What is a corporate mission statement?",
          options: ["A summary of a company's core values and purpose", "A list of employee passwords", "A financial ledger sheet", "A software code repository"],
          correctAnswer: "A summary of a company's core values and purpose",
          explanation: "A mission statement clarifies what a company does, whom it serves, and its core operational direction.",
          concept: "SWOTAnalysis"
        }
      ]
    },
    {
      id: 3,
      title: "Lesson 3: Financial Basics & Budgeting",
      description: "Analyze operational profitability using simple balance structures.",
      questions: [
        {
          id: 1,
          questionText: "What is a balance sheet?",
          options: ["A statement of financial position showing assets, liabilities, and equity", "A sheet to balance chemical equations", "A list of course grades", "A layout grid in UI design"],
          correctAnswer: "A statement of financial position showing assets, liabilities, and equity",
          explanation: "A balance sheet summarizes assets, liabilities, and equity at a specific point in time.",
          concept: "FinancialBudgeting"
        },
        {
          id: 2,
          questionText: "What is net profit?",
          options: ["Total revenue minus total expenses", "Total revenue before tax", "Total salary paid to employees", "The speed of money transfers"],
          correctAnswer: "Total revenue minus total expenses",
          explanation: "Net profit is the actual earnings left over after subtracting all operational costs, taxes, and interest.",
          concept: "FinancialBudgeting"
        },
        {
          id: 3,
          questionText: "What does ROI stand for?",
          options: ["Return on Investment", "Rate of Inflation", "Risk of Insolvency", "Revenue of Industry"],
          correctAnswer: "Return on Investment",
          explanation: "ROI measures the gain or loss generated on an investment relative to the amount of money invested.",
          concept: "FinancialBudgeting"
        }
      ]
    }
  ],
  4: [ // Business Law & Contract Ethics
    {
      id: 1,
      title: "Lesson 1: Basics of Commercial Contracts",
      description: "Define elements necessary for legally binding business agreements.",
      questions: [
        {
          id: 1,
          questionText: "What are the three essential elements of a contract?",
          options: ["Offer, Acceptance, and Consideration", "Name, Address, and Phone Number", "HTML, CSS, and JS", "Profit, Loss, and Tax"],
          correctAnswer: "Offer, Acceptance, and Consideration",
          explanation: "To form a binding contract, there must be a clear offer, unequivocal acceptance, and mutual exchange of consideration.",
          concept: "CommercialContracts"
        },
        {
          id: 2,
          questionText: "What constitutes 'Consideration' in contract law?",
          options: ["Something of value exchanged between parties", "Polite behavior during negotiations", "Taking time to think about the offer", "A signature at the bottom"],
          correctAnswer: "Something of value exchanged between parties",
          explanation: "Consideration requires both parties to swap something of value (e.g. money, goods, services, or promises).",
          concept: "CommercialContracts"
        },
        {
          id: 3,
          questionText: "When is an oral contract legally binding?",
          options: ["When it can be proven and meets contract criteria", "Never", "Only if recorded on video", "Only for minor transactions under $10"],
          correctAnswer: "When it can be proven and meets contract criteria",
          explanation: "Except where statutes require writing (like real estate sales), oral agreements can be fully binding if proven.",
          concept: "CommercialContracts"
        }
      ]
    },
    {
      id: 2,
      title: "Lesson 2: Legal Liability & Breach",
      description: "Identify types of breaches, liabilities, and default remedies.",
      questions: [
        {
          id: 1,
          questionText: "What is a breach of contract?",
          options: ["Failure to perform any term of a contract without a legitimate legal excuse", "Signing a contract with a fake name", "Losing the physical contract paper", "Negotiating a lower price"],
          correctAnswer: "Failure to perform any term of a contract without a legitimate legal excuse",
          explanation: "Breaching means failing to meet obligations set forth under the agreement without an excuse like impossibility.",
          concept: "ContractLiability"
        },
        {
          id: 2,
          questionText: "What are compensatory damages?",
          options: ["Money awarded to place the injured party in the position they would have been in if the contract was performed", "Punishment for bad behavior", "A discount on future services", "An apology letter"],
          correctAnswer: "Money awarded to place the injured party in the position they would have been in if the contract was performed",
          explanation: "Compensatory damages aim to make the non-breaching party whole financially by mimicking actual performance.",
          concept: "ContractLiability"
        },
        {
          id: 3,
          questionText: "What does 'Force Majeure' excuse?",
          options: ["Non-performance due to unforeseen, unavoidable events like natural disasters", "Failure to pay on time due to poor budgeting", "Changing one's mind about a purchase", "A typo in the agreement"],
          correctAnswer: "Non-performance due to unforeseen, unavoidable events like natural disasters",
          explanation: "A Force Majeure clause frees parties from liability when extraordinary, outside events occur.",
          concept: "ContractLiability"
        }
      ]
    },
    {
      id: 3,
      title: "Lesson 3: Intellectual Property & Ethics",
      description: "Distinguish patents, copyrights, trademarks, and ethical rules.",
      questions: [
        {
          id: 1,
          questionText: "What does a copyright protect?",
          options: ["Original works of authorship like books, music, and software code", "Inventions and new technologies", "Brand names, logos, and slogans", "Trade secrets"],
          correctAnswer: "Original works of authorship like books, music, and software code",
          explanation: "Copyright protects original creative works fixed in a tangible medium, including code bases.",
          concept: "IntellectualProperty"
        },
        {
          id: 2,
          questionText: "What is the main difference between a patent and a trademark?",
          options: ["Patents protect inventions; trademarks protect brand identifiers", "Patents are free; trademarks are expensive", "Patents last forever; trademarks expire in 5 years", "There is no difference"],
          correctAnswer: "Patents protect inventions; trademarks protect brand identifiers",
          explanation: "Patents grant monopoly rights over novel utility methods, whereas trademarks preserve market identifiers.",
          concept: "IntellectualProperty"
        },
        {
          id: 3,
          questionText: "Why is ethical compliance critical in corporate law?",
          options: ["To avoid legal penalties and build trust", "To increase website loading speeds", "To automate database backups", "To bypass regulations"],
          correctAnswer: "To avoid legal penalties and build trust",
          explanation: "Ethics and compliance standards prevent corporate fraud, avoid severe regulatory fines, and protect investor confidence.",
          concept: "IntellectualProperty"
        }
      ]
    }
  ],
  5: [ // Principles of Robotics & Control Systems
    {
      id: 1,
      title: "Lesson 1: Robot Kinematics & Frames",
      description: "Understand kinematic transformation math and degree of freedom spatial frames.",
      questions: [
        {
          id: 1,
          questionText: "What is forward kinematics in robotics?",
          options: ["Determining end-effector position from joint angles", "Calculating joint angles for a target position", "Measuring the weight of the robot link", "Writing control loop feedback code"],
          correctAnswer: "Determining end-effector position from joint angles",
          explanation: "Forward kinematics maps joints state (angles/displacements) directly to Cartesian position coords in space.",
          concept: "RoboticKinematics"
        },
        {
          id: 2,
          questionText: "What does a coordinate frame represent?",
          options: ["A reference system for position and orientation in space", "The physical metal frame of the robot", "A webpage layout grid", "A database index table"],
          correctAnswer: "A reference system for position and orientation in space",
          explanation: "Frames set reference vectors that allow calculating mathematical relative positions/orientations.",
          concept: "RoboticKinematics"
        },
        {
          id: 3,
          questionText: "What is the degree of freedom (DoF) of a robot?",
          options: ["The number of independent movements the robot can perform", "The cost of the robot software license", "The battery life duration", "The number of lines of code in its main loop"],
          correctAnswer: "The number of independent movements the robot can perform",
          explanation: "DoF indicates the total number of independent joints or spatial coordinates that define a manipulator's state.",
          concept: "RoboticKinematics"
        }
      ]
    },
    {
      id: 2,
      title: "Lesson 2: PID Feedback Controllers",
      description: "Tune feedback controllers using proportional, integral, and derivative parameters.",
      questions: [
        {
          id: 1,
          questionText: "What does PID stand for?",
          options: ["Proportional, Integral, Derivative", "Position, Index, Direction", "Program, Interface, Database", "Physics, Inertia, Dynamics"],
          correctAnswer: "Proportional, Integral, Derivative",
          explanation: "PID controller is the standard feedback loop used to continuously adjust actuators based on error.",
          concept: "PIDFeedbackControl"
        },
        {
          id: 2,
          questionText: "What is the role of the Proportional term in a PID controller?",
          options: ["Produces an output proportional to the current error value", "Eliminates steady-state error over time", "Predicts future error trends to prevent overshoot", "Calibrates the sensors"],
          correctAnswer: "Produces an output proportional to the current error value",
          explanation: "Proportional gain adjusts correction output linearly based on how far away from the setpoint the current value is.",
          concept: "PIDFeedbackControl"
        },
        {
          id: 3,
          questionText: "How does the Integral term improve steady-state error?",
          options: ["By accumulating past errors over time to push the system to the target", "By scaling the output proportional to joint weight", "By reducing high-frequency noise", "By stopping the controller immediately"],
          correctAnswer: "By accumulating past errors over time to push the system to the target",
          explanation: "Integral sum aggregates steady offset error, ramping up torque until the residual gap is zeroed out.",
          concept: "PIDFeedbackControl"
        }
      ]
    },
    {
      id: 3,
      title: "Lesson 3: Control Loops & Trajectories",
      description: "Configure feedback control loops and dynamic trajectory path planners.",
      questions: [
        {
          id: 1,
          questionText: "What is the difference between open-loop and closed-loop control?",
          options: ["Closed-loop uses sensor feedback; open-loop does not", "Open-loop is faster; closed-loop is slower", "Closed-loop is only for programming languages", "Open-loop does not require power"],
          correctAnswer: "Closed-loop uses sensor feedback; open-loop does not",
          explanation: "Closed-loop feeds back the measured outcome to constantly adjust output, correction, and error parameters.",
          concept: "TrajectoryPlanning"
        },
        {
          id: 2,
          questionText: "What is a trajectory planner?",
          options: ["A subsystem that generates time-varying path coordinates for the robot", "A database scheduler", "An engineering drawing tool", "A project timeline worksheet"],
          correctAnswer: "A subsystem that generates time-varying path coordinates for the robot",
          explanation: "Trajectory planning outputs time-stamped position, velocity, and acceleration targets for the controllers.",
          concept: "TrajectoryPlanning"
        },
        {
          id: 3,
          questionText: "Why is feedback delay a problem in robotics?",
          options: ["It can cause system instability and oscillations", "It takes up too much hard drive space", "It changes the robot's physical weight", "It converts code to different programming languages"],
          correctAnswer: "It can cause system instability and oscillations",
          explanation: "Delayed measurement forces correction values to act on stale data, often provoking unstable overcorrections.",
          concept: "TrajectoryPlanning"
        }
      ]
    }
  ]
};

// ----------------------------------------------------
// Core category pools (10 questions per lesson, 3 lessons each)
// ----------------------------------------------------

interface PoolQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  concept: string;
}

interface PoolLesson {
  id: number;
  title: string;
  description: string;
  questions: PoolQuestion[];
}

const categoryPools: Record<"Programming" | "Business" | "Law" | "Engineering", PoolLesson[]> = {
  Programming: [
    {
      id: 1,
      title: "Lesson 1: Syntax & Variables",
      description: "Understand basic programming variables, data types, and syntax rules.",
      questions: [
        {
          questionText: "What is the primary purpose of variables in programming?",
          options: ["To store data values in memory", "To speed up internet connection", "To style website text", "To create new database schemas"],
          correctAnswer: "To store data values in memory",
          explanation: "Variables act as labeled storage containers for data that can be manipulated and referenced during program execution.",
          concept: "VariableConcept"
        },
        {
          questionText: "Which data type is best suited for storing decimal values?",
          options: ["Float/Double", "Integer", "String", "Boolean"],
          correctAnswer: "Float/Double",
          explanation: "Floating-point numbers (floats/doubles) represent real numbers and store values containing fractional parts.",
          concept: "VariableConcept"
        },
        {
          questionText: "What does a Boolean data type represent?",
          options: ["True or False values", "Alphanumeric text strings", "Whole numbers only", "List array collections"],
          correctAnswer: "True or False values",
          explanation: "A boolean represents logical truth values: true or false.",
          concept: "VariableConcept"
        },
        {
          questionText: "Which of the following is a valid camelCase variable name?",
          options: ["userAge", "User-Age", "user_age", "USERAGE"],
          correctAnswer: "userAge",
          explanation: "camelCase starts with a lowercase letter, and capitalization indicates the beginning of subsequent words.",
          concept: "VariableConcept"
        },
        {
          questionText: "What is type coercion (or type casting)?",
          options: ["Converting a variable from one data type to another", "Deleting variables to free up memory", "Locking a variable's value to prevent changes", "Naming variables after system constants"],
          correctAnswer: "Converting a variable from one data type to another",
          explanation: "Type casting converts data from one type (like a string '5') to another (like an integer 5).",
          concept: "VariableConcept"
        },
        {
          questionText: "What is a constant variable?",
          options: ["A variable whose value cannot be changed after assignment", "A variable that always changes its value", "A variable accessible only within loops", "A variable stored in a temporary database"],
          correctAnswer: "A variable whose value cannot be changed after assignment",
          explanation: "Constants store values that remain fixed throughout the program's lifecycle.",
          concept: "VariableConcept"
        },
        {
          questionText: "What is the purpose of comments in source code?",
          options: ["To explain code logic to human readers and improve maintainability", "To instruct the compiler to optimize the run speed", "To create active variable objects", "To establish database connections"],
          correctAnswer: "To explain code logic to human readers and improve maintainability",
          explanation: "Comments are skipped by compilers/interpreters and serve to guide developers reading the codebase.",
          concept: "VariableConcept"
        },
        {
          questionText: "Which data type stores a sequence of characters?",
          options: ["String", "Integer", "Boolean", "Null"],
          correctAnswer: "String",
          explanation: "Strings are sequence of characters enclosed in quotes (e.g. 'Hello').",
          concept: "VariableConcept"
        },
        {
          questionText: "What is syntax in programming?",
          options: ["The grammar and structure rules of a programming language", "The speed at which a script compiles", "The user interface layout design", "The database storage format"],
          correctAnswer: "The grammar and structure rules of a programming language",
          explanation: "Syntax defines the set of rules that must be followed to write valid statements in a language.",
          concept: "VariableConcept"
        },
        {
          questionText: "What is a null value?",
          options: ["An intentional representation of the absence of any value", "A variable with a zero numerical value", "An undefined syntax warning", "An active data structure"],
          correctAnswer: "An intentional representation of the absence of any value",
          explanation: "Null indicates the deliberate empty or non-existent assignment of a variable.",
          concept: "VariableConcept"
        }
      ]
    },
    {
      id: 2,
      title: "Lesson 2: Logic Control Flow & Iterations",
      description: "Manage execution paths using conditionals, comparison operators, and loops.",
      questions: [
        {
          questionText: "What is the primary role of an 'if' statement?",
          options: ["To execute code conditionally based on a truth value", "To loop code execution indefinitely", "To define reusable functions", "To connect to external APIs"],
          correctAnswer: "To execute code conditionally based on a truth value",
          explanation: "If statements control execution flow, executing blocks only if the specified boolean condition evaluates to true.",
          concept: "LoopConcept"
        },
        {
          questionText: "What does the logical AND operator (&&) require to evaluate to true?",
          options: ["All operands must be true", "Only one operand must be true", "All operands must be false", "None of the above"],
          correctAnswer: "All operands must be true",
          explanation: "The AND operator evaluates to true if and only if all sub-conditions are true.",
          concept: "LoopConcept"
        },
        {
          questionText: "Which loop type is typically used when the number of iterations is known in advance?",
          options: ["For loop", "While loop", "Infinite loop", "Recursive loop"],
          correctAnswer: "For loop",
          explanation: "For loops are ideal for iterating over collections or ranges where the start, end, and steps are predefined.",
          concept: "LoopConcept"
        },
        {
          questionText: "What is an infinite loop?",
          options: ["A loop that never terminates because its condition is always true", "A loop that finishes in under a second", "A loop nested inside another loop", "A loop that executes zero times"],
          correctAnswer: "A loop that never terminates because its condition is always true",
          explanation: "Infinite loops lack a valid exit condition, causing the program to hang or crash unless stopped externally.",
          concept: "LoopConcept"
        },
        {
          questionText: "What does the 'break' statement do in a loop?",
          options: ["Terminates the loop immediately and transfers execution outside the loop", "Skips the current step and starts the next iteration", "Pauses the execution of the CPU", "Resets loop variables to zero"],
          correctAnswer: "Terminates the loop immediately and transfers execution outside the loop",
          explanation: "Break breaks out of the loop completely, skipping any remaining iterations.",
          concept: "LoopConcept"
        },
        {
          questionText: "What does the 'continue' keyword do in a loop?",
          options: ["Skips the rest of the current iteration and jumps to the next loop step", "Terminates the loop permanently", "Saves the loop state in local memory", "Restarts the entire loop from the first iteration"],
          correctAnswer: "Skips the rest of the current iteration and jumps to the next loop step",
          explanation: "Continue terminates the current iteration early, proceeding directly to the loop's update/evaluation step.",
          concept: "LoopConcept"
        },
        {
          questionText: "What is a nested loop?",
          options: ["A loop placed inside the body of another loop", "A loop that calls a database", "A loop that executes in parallel threads", "A loop with multiple exit parameters"],
          correctAnswer: "A loop placed inside the body of another loop",
          explanation: "Nested loops execute the inner loop completely for each single iteration of the outer loop.",
          concept: "LoopConcept"
        },
        {
          questionText: "What does the logical NOT operator (!) do?",
          options: ["Inverts a boolean value", "Adds two numbers together", "Checks if two variables are equal", "Terminates the program execution"],
          correctAnswer: "Inverts a boolean value",
          explanation: "NOT evaluates to true if the operand is false, and false if the operand is true.",
          concept: "LoopConcept"
        },
        {
          questionText: "Which operator checks for equality without type coercion in JavaScript (strict equality)?",
          options: ["===", "==", "=", "!="],
          correctAnswer: "===",
          explanation: "=== compares both value and type, returning true only if they are identical.",
          concept: "LoopConcept"
        },
        {
          questionText: "What is a conditional (ternary) operator?",
          options: ["A shorthand for an if-else statement using '?' and ':'", "A database index command", "A logical comparison between three variables", "A type of loop structure"],
          correctAnswer: "A shorthand for an if-else statement using '?' and ':'",
          explanation: "Ternary operator evaluates a condition and returns one value if true, another if false, in a single line.",
          concept: "LoopConcept"
        }
      ]
    },
    {
      id: 3,
      title: "Lesson 3: Functions & Reusability",
      description: "Structure reusable, modular code blocks using functions and parameters.",
      questions: [
        {
          questionText: "What is a function in programming?",
          options: ["A named block of code that performs a specific task and can be executed when called", "A styling template for web pages", "A database connection pool", "A server port configuration"],
          correctAnswer: "A named block of code that performs a specific task and can be executed when called",
          explanation: "Functions capture actions, providing modularity, testability, and code reusability.",
          concept: "FunctionConcept"
        },
        {
          questionText: "What are function parameters?",
          options: ["Variables listed in the function definition that receive input values", "Values returned by the function", "Internal variables that cannot be shared", "Global variables declared in the main script"],
          correctAnswer: "Variables listed in the function definition that receive input values",
          explanation: "Parameters act as placeholders for inputs that the function needs to perform its work.",
          concept: "FunctionConcept"
        },
        {
          questionText: "What are function arguments?",
          options: ["The actual values passed to the function when it is called", "The error logs generated by the function", "The mathematical symbols inside the body", "The return types of the function"],
          correctAnswer: "The actual values passed to the function when it is called",
          explanation: "Arguments are the real values supplied to the parameters upon function execution.",
          concept: "FunctionConcept"
        },
        {
          questionText: "What does the 'return' statement do in a function?",
          options: ["Exits the function and passes a value back to the caller", "Restarts the function from the beginning", "Prints the value to the console", "Deletes all local function variables"],
          correctAnswer: "Exits the function and passes a value back to the caller",
          explanation: "Return stops function execution and sends the specified result back to where the function was called.",
          concept: "FunctionConcept"
        },
        {
          questionText: "What is variable scope?",
          options: ["The region of a program where a variable is visible and accessible", "The speed at which a variable allocates memory", "The name length of a variable", "The total size in bytes of a variable"],
          correctAnswer: "The region of a program where a variable is visible and accessible",
          explanation: "Scope determines variable visibility (local vs. global scope rules).",
          concept: "FunctionConcept"
        },
        {
          questionText: "What is a recursive function?",
          options: ["A function that calls itself to solve a problem", "A function that has no parameters", "A function nested inside a class", "A function that runs on a timer"],
          correctAnswer: "A function that calls itself to solve a problem",
          explanation: "Recursion splits tasks into smaller instances, calling itself until reaching a base condition.",
          concept: "FunctionConcept"
        },
        {
          questionText: "What is the difference between local and global variables?",
          options: ["Local is inside a function; global is accessible anywhere", "Local is stored on disk; global is in RAM", "Local is read-only; global can be updated", "Local variables are always string objects"],
          correctAnswer: "Local is inside a function; global is accessible anywhere",
          explanation: "Local variables exist only within their block/function scope, while global variables live across the entire script lifecycle.",
          concept: "FunctionConcept"
        },
        {
          questionText: "What is a callback function?",
          options: ["A function passed as an argument to another function to be executed later", "A function that repeats a loop", "A function designed to connect to the database", "A function that returns to the previous page"],
          correctAnswer: "A function passed as an argument to another function to be executed later",
          explanation: "Callbacks allow async operations or customization of processing by calling passed functions.",
          concept: "FunctionConcept"
        },
        {
          questionText: "What is an anonymous function?",
          options: ["A function defined without a named identifier", "A function hidden from security scanners", "A function that has no return value", "A function declared in an external module"],
          correctAnswer: "A function defined without a named identifier",
          explanation: "Anonymous functions are created inline and often passed as parameters or assigned to variables.",
          concept: "FunctionConcept"
        },
        {
          questionText: "What is a module in programming?",
          options: ["A separate file containing code (functions, classes) that can be imported and reused", "A styling template for buttons", "A physical chip on the server board", "A data verification framework"],
          correctAnswer: "A separate file containing code (functions, classes) that can be imported and reused",
          explanation: "Modules organize codebase into separate functional files, facilitating cleaner namespace management.",
          concept: "FunctionConcept"
        }
      ]
    }
  ],
  Business: [
    {
      id: 1,
      title: "Lesson 1: Fundamentals of Business Operations",
      description: "Understand structural roles, corporate alignments, and operational workflows.",
      questions: [
        {
          questionText: "What is the primary objective of most commercial businesses?",
          options: ["To generate profit by providing value to customers", "To write database administration tools", "To design layouts for mobile websites", "To compile source code files"],
          correctAnswer: "To generate profit by providing value to customers",
          explanation: "Businesses offer goods or services to solve customer needs, generating profit as a result of positive operations.",
          concept: "BusinessOperations"
        },
        {
          questionText: "Which organizational department handles talent acquisition and employee relations?",
          options: ["Human Resources", "Finance", "Operations", "Marketing"],
          correctAnswer: "Human Resources",
          explanation: "HR manages staffing, training, benefits, workplace compliance, and employee disputes.",
          concept: "BusinessOperations"
        },
        {
          questionText: "What does supply chain management coordinate?",
          options: ["The movement of goods from raw materials to final customer delivery", "The database backup processes", "The styling of user interface elements", "The execution of python loops"],
          correctAnswer: "The movement of goods from raw materials to final customer delivery",
          explanation: "Supply chains optimize sourcing, warehousing, logistics, and retail distribution flows.",
          concept: "BusinessOperations"
        },
        {
          questionText: "What is a company's mission statement?",
          options: ["A statement describing the organization's core purpose and focus", "A spreadsheet of monthly expenses", "A list of employee server passwords", "A sales pitch for investors"],
          correctAnswer: "A statement describing the organization's core purpose and focus",
          explanation: "A mission statement clarifies what a company does, whom it serves, and its core values.",
          concept: "BusinessOperations"
        },
        {
          questionText: "What does CRM stand for in business operations?",
          options: ["Customer Relationship Management", "Cash Resource Management", "Corporate Risk Monitoring", "Client Response Method"],
          correctAnswer: "Customer Relationship Management",
          explanation: "CRM refers to strategies and technologies used to manage interactions with current and potential customers.",
          concept: "BusinessOperations"
        },
        {
          questionText: "What is the core focus of operations management?",
          options: ["Maximizing efficiency and productivity in production processes", "Designing brand logos and color palettes", "Filing corporate tax documents", "Reviewing employment contracts"],
          correctAnswer: "Maximizing efficiency and productivity in production processes",
          explanation: "Operations management oversees processes that convert inputs (labor, materials) into outputs (goods, services).",
          concept: "BusinessOperations"
        },
        {
          questionText: "What does B2B stand for in marketing and sales?",
          options: ["Business-to-Business", "Budget-to-Balance", "Brand-to-Buyer", "Business-to-Buyer"],
          correctAnswer: "Business-to-Business",
          explanation: "B2B transactions occur between two businesses rather than a business and an individual consumer (B2C).",
          concept: "BusinessOperations"
        },
        {
          questionText: "What is organizational culture?",
          options: ["The shared values, beliefs, and behaviors within a company", "The design guidelines of a company website", "The tax regulations governing a corporation", "The software tools used by managers"],
          correctAnswer: "The shared values, beliefs, and behaviors within a company",
          explanation: "Culture dictates how employees interact, make decisions, and align with company values.",
          concept: "BusinessOperations"
        },
        {
          questionText: "Why is quality control important in manufacturing?",
          options: ["To ensure products meet consistent standards and reduce waste", "To increase website speed", "To automate server deployments", "To reduce corporate tax liabilities"],
          correctAnswer: "To ensure products meet consistent standards and reduce waste",
          explanation: "Quality control prevents defective products from reaching customers, maintaining brand integrity and efficiency.",
          concept: "BusinessOperations"
        },
        {
          questionText: "Who is considered a stakeholder in a business?",
          options: ["Anyone affected by or interested in the company's activities", "Only the primary stock owners", "The database administrators only", "The government tax collectors only"],
          correctAnswer: "Anyone affected by or interested in the company's activities",
          explanation: "Stakeholders include employees, customers, suppliers, shareholders, communities, and regulators.",
          concept: "BusinessOperations"
        }
      ]
    },
    {
      id: 2,
      title: "Lesson 2: Strategic Planning & Market Analysis",
      description: "Learn key frameworks like SWOT and Porter's Five Forces to analyze markets.",
      questions: [
        {
          questionText: "What does SWOT stand for in strategic analysis?",
          options: ["Strengths, Weaknesses, Opportunities, Threats", "Sales, Wages, Operations, Targets", "Software, Web, Objectives, Testing", "Strategy, Work, Outcomes, Teams"],
          correctAnswer: "Strengths, Weaknesses, Opportunities, Threats",
          explanation: "SWOT analysis evaluates internal capabilities (S/W) and external market factors (O/T).",
          concept: "SWOTAnalysis"
        },
        {
          questionText: "In SWOT analysis, which components represent external factors?",
          options: ["Opportunities and Threats", "Strengths and Weaknesses", "Strengths and Opportunities", "Weaknesses and Threats"],
          correctAnswer: "Opportunities and Threats",
          explanation: "Opportunities and Threats arise from the external market environment (competitors, regulations, economy).",
          concept: "SWOTAnalysis"
        },
        {
          questionText: "What is the primary goal of Porter's Five Forces framework?",
          options: ["To assess the attractiveness and competitiveness of an industry", "To track monthly business expenses", "To evaluate internal employee performance", "To design marketing email layouts"],
          correctAnswer: "To assess the attractiveness and competitiveness of an industry",
          explanation: "Porter's framework analyzes competitive intensity to evaluate industry profitability potential.",
          concept: "SWOTAnalysis"
        },
        {
          questionText: "What is market segmentation?",
          options: ["Dividing a broad target market into smaller, defined customer groups", "Selling different shares of stock to investors", "Splitting a database into multiple servers", "Opening multiple retail store branches"],
          correctAnswer: "Dividing a broad target market into smaller, defined customer groups",
          explanation: "Segmentation groups buyers by shared traits (demographics, behaviors) to design tailored marketing.",
          concept: "SWOTAnalysis"
        },
        {
          questionText: "What is a competitive advantage?",
          options: ["A condition that allows a business to produce goods or services better or more cheaply than rivals", "Having more lines of code in a company app", "Operating in multiple countries", "Avoiding local tax requirements"],
          correctAnswer: "A condition that allows a business to produce goods or services better or more cheaply than rivals",
          explanation: "A competitive advantage allows a company to outperform its competitors and generate higher margins.",
          concept: "SWOTAnalysis"
        },
        {
          questionText: "What does target marketing involve?",
          options: ["Directing marketing campaigns to a specific, defined segment of consumers", "Sending ads to every email address in the database", "Placing billboards along major highways randomly", "Reducing the price of all products to increase sales"],
          correctAnswer: "Directing marketing campaigns to a specific, defined segment of consumers",
          explanation: "Target marketing focuses marketing resources on the audiences most likely to purchase the product.",
          concept: "SWOTAnalysis"
        },
        {
          questionText: "What is a value proposition?",
          options: ["A statement summarizing why a customer should choose a product or service", "A pricing list for enterprise services", "A financial request sent to investors", "A contract proposal template"],
          correctAnswer: "A statement summarizing why a customer should choose a product or service",
          explanation: "A value proposition clearly articulates the unique benefit and value a product delivers to buyers.",
          concept: "SWOTAnalysis"
        },
        {
          questionText: "What does KPI stand for in strategic management?",
          options: ["Key Performance Indicator", "Key Profit Incrementor", "Keep Process Integrated", "Knowledge Performance Index"],
          correctAnswer: "Key Performance Indicator",
          explanation: "KPIs are quantifiable measures used to evaluate the success of an organization in reaching performance goals.",
          concept: "SWOTAnalysis"
        },
        {
          questionText: "What is market saturation?",
          options: ["A state where a market has no new demand for a product or service", "A high volume of traffic on a website", "An excess inventory stored in warehouses", "A high tax rate applied to business sales"],
          correctAnswer: "A state where a market has no new demand for a product or service",
          explanation: "Saturation occurs when a product has been distributed to nearly all potential customers in a market.",
          concept: "SWOTAnalysis"
        },
        {
          questionText: "What is strategic planning?",
          options: ["Setting long-term organizational goals and mapping out actions to achieve them", "Scheduling daily office tasks for employees", "Filing corporate legal registrations", "Writing code scripts for automated databases"],
          correctAnswer: "Setting long-term organizational goals and mapping out actions to achieve them",
          explanation: "Strategic planning defines the company's direction, allocating resources to execute long-term objectives.",
          concept: "SWOTAnalysis"
        }
      ]
    },
    {
      id: 3,
      title: "Lesson 3: Financial Management & Budgeting",
      description: "Analyze balance sheets, profit statements, cash flows, and key financial ratios.",
      questions: [
        {
          questionText: "What does a balance sheet summarize?",
          options: ["Assets, liabilities, and shareholders' equity at a specific point in time", "Total sales revenue generated during a year", "Cash inflows and outflows from operations", "Employee payroll and bonuses paid"],
          correctAnswer: "Assets, liabilities, and shareholders' equity at a specific point in time",
          explanation: "The balance sheet equations shows: Assets = Liabilities + Equity, displaying financial position.",
          concept: "FinancialBudgeting"
        },
        {
          questionText: "How is net profit calculated?",
          options: ["Total revenue minus total expenses", "Total sales minus variable costs only", "Total assets minus total liabilities", "Gross margin plus interest income"],
          correctAnswer: "Total revenue minus total expenses",
          explanation: "Net profit is the actual bottom-line earnings left after subtracting all operational costs, taxes, and interest.",
          concept: "FinancialBudgeting"
        },
        {
          questionText: "What does ROI stand for in business finance?",
          options: ["Return on Investment", "Rate of Inflation", "Risk of Insolvency", "Revenue of Industry"],
          correctAnswer: "Return on Investment",
          explanation: "ROI measures the profitability of an investment relative to its cost.",
          concept: "FinancialBudgeting"
        },
        {
          questionText: "What is the primary difference between fixed costs and variable costs?",
          options: ["Fixed costs do not change with production volume; variable costs do", "Fixed costs are paid to banks; variable costs go to suppliers", "Fixed costs are tax-deductible; variable costs are not", "Fixed costs are estimated; variable costs are exact"],
          correctAnswer: "Fixed costs do not change with production volume; variable costs do",
          explanation: "Fixed costs (e.g. rent) remain constant regardless of output, whereas variable costs (e.g. raw materials) scale with volume.",
          concept: "FinancialBudgeting"
        },
        {
          questionText: "What is cash flow?",
          options: ["The net amount of cash and cash equivalents being transferred in and out of a business", "The speed at which bank transfers are processed", "The total valuation of corporate stock", "The credit limit approved by commercial banks"],
          correctAnswer: "The net amount of cash and cash equivalents being transferred in and out of a business",
          explanation: "Cash flow tracks the actual physical movement of cash, crucial for maintaining short-term liquidity.",
          concept: "FinancialBudgeting"
        },
        {
          questionText: "What is depreciation in financial accounting?",
          options: ["Allocating the cost of a tangible asset over its useful life", "The loss of cash due to inflation", "The reduction of company stock values", "A discount offered to bulk retail buyers"],
          correctAnswer: "Allocating the cost of a tangible asset over its useful life",
          explanation: "Depreciation spreads the expense of expensive equipment or property over the years it is used.",
          concept: "FinancialBudgeting"
        },
        {
          questionText: "What is the break-even point?",
          options: ["The sales volume where total revenue equals total costs", "The moment a company declares insolvency", "The tax threshold where rates increase", "The credit score required for corporate loans"],
          correctAnswer: "The sales volume where total revenue equals total costs",
          explanation: "At the break-even point, the business makes zero net profit but incurs zero net loss.",
          concept: "FinancialBudgeting"
        },
        {
          questionText: "What represents capital in business?",
          options: ["Financial assets or resources used to fund and grow operations", "The physical headquarters city of a business", "The primary brand name logo of a product", "The database management software used by accountants"],
          correctAnswer: "Financial assets or resources used to fund and grow operations",
          explanation: "Capital includes cash, machinery, inventory, and buildings used to produce value.",
          concept: "FinancialBudgeting"
        },
        {
          questionText: "What is a budget?",
          options: ["A plan estimating revenue and expenses over a future period", "A record of past financial transactions", "A corporate law compliance document", "A database of client contact information"],
          correctAnswer: "A plan estimating revenue and expenses over a future period",
          explanation: "Budgets serve as financial roadmaps to guide spending and operational controls.",
          concept: "FinancialBudgeting"
        },
        {
          questionText: "What does accounts receivable represent?",
          options: ["Money owed to the business by customers for sales made on credit", "Money the business owes to its suppliers", "Taxes that must be paid to the government", "Interest earned on bank savings accounts"],
          correctAnswer: "Money owed to the business by customers for sales made on credit",
          explanation: "Accounts receivable represents short-term assets consisting of outstanding client invoices.",
          concept: "FinancialBudgeting"
        }
      ]
    }
  ],
  Law: [
    {
      id: 1,
      title: "Lesson 1: Elements of Commercial Contract Law",
      description: "Define elements necessary for legally binding agreements and contract formation.",
      questions: [
        {
          questionText: "What are the three essential components of a binding contract?",
          options: ["Offer, Acceptance, and Consideration", "Name, Address, and Date", "Signature, Witness, and Seal", "Proposal, Review, and Payment"],
          correctAnswer: "Offer, Acceptance, and Consideration",
          explanation: "A valid contract requires a clear offer, unconditional acceptance, and mutual exchange of valuable consideration.",
          concept: "CommercialContracts"
        },
        {
          questionText: "What constitutes 'Consideration' in contract law?",
          options: ["Something of value exchanged between the contracting parties", "Politeness and ethical conduct during negotiations", "Taking time to think before signing", "An explanation of contract terms"],
          correctAnswer: "Something of value exchanged between the contracting parties",
          explanation: "Consideration requires both parties to swap something of value (goods, services, money, or promises).",
          concept: "CommercialContracts"
        },
        {
          questionText: "Can an oral contract be legally binding?",
          options: ["Yes, if its terms can be proven and it meets legal requirements", "No, contracts must always be in writing", "Only if recorded on video or audio", "Only for transactions under ten dollars"],
          correctAnswer: "Yes, if its terms can be proven and it meets legal requirements",
          explanation: "Many oral agreements are binding, although certain categories (like real estate sales) require writing under the Statute of Frauds.",
          concept: "CommercialContracts"
        },
        {
          questionText: "What is 'mutual assent' in contract law?",
          options: ["A clear agreement by both parties to all terms (meeting of the minds)", "A signature from a certified public notary", "An approval from a corporate board of directors", "The payment of the contract's initial fee"],
          correctAnswer: "A clear agreement by both parties to all terms (meeting of the minds)",
          explanation: "Mutual assent requires an offer and acceptance indicating agreement to be bound by the same terms.",
          concept: "CommercialContracts"
        },
        {
          questionText: "What does 'capacity' refer to in contract formation?",
          options: ["The legal ability of a party to enter into a contract", "The total page length of the contract document", "The maximum monetary value of the agreement", "The number of active participants in the contract"],
          correctAnswer: "The legal ability of a party to enter into a contract",
          explanation: "Parties must be of sound mind, legal age, and not under duress to possess the capacity to contract.",
          concept: "CommercialContracts"
        },
        {
          questionText: "What makes a contract voidable?",
          options: ["If one party entered it due to fraud, duress, or misrepresentation", "If there are typographical errors in the text", "If the contract is printed on non-standard paper", "If the payment is delayed by more than a week"],
          correctAnswer: "If one party entered it due to fraud, duress, or misrepresentation",
          explanation: "Voidable contracts are valid but can be rejected by a party who was victimized or lacked capacity.",
          concept: "CommercialContracts"
        },
        {
          questionText: "What is the purpose of the Statute of Frauds?",
          options: ["To require certain types of contracts to be in writing to be enforceable", "To criminalize fraudulent business partnerships", "To prevent companies from charging excess interest", "To regulate online sales transactions"],
          correctAnswer: "To require certain types of contracts to be in writing to be enforceable",
          explanation: "It prevents fraud by requiring written evidence for significant contracts (e.g. land sales, long-term deals).",
          concept: "CommercialContracts"
        },
        {
          questionText: "What is an express contract?",
          options: ["A contract whose terms are explicitly stated in words, either written or oral", "A contract delivered via priority mail services", "A contract that terminates automatically in 24 hours", "An unwritten agreement implied by behavior"],
          correctAnswer: "A contract whose terms are explicitly stated in words, either written or oral",
          explanation: "Express contracts clearly state the duties and terms explicitly.",
          concept: "CommercialContracts"
        },
        {
          questionText: "What is a unilateral contract?",
          options: ["A contract where one party promises to pay in exchange for the performance of an act", "A contract signed by only one person", "A contract that favors only one of the parties", "A contract regulated by international treaty"],
          correctAnswer: "A contract where one party promises to pay in exchange for the performance of an act",
          explanation: "In unilateral contracts, acceptance occurs through action (e.g. a reward for finding a lost pet).",
          concept: "CommercialContracts"
        },
        {
          questionText: "What is an implied-in-fact contract?",
          options: ["A contract formed by the conduct of the parties rather than express words", "A contract assumed to exist by a court to prevent injustice", "A contract detailing insurance liability", "A contract template downloaded online"],
          correctAnswer: "A contract formed by the conduct of the parties rather than express words",
          explanation: "Implied-in-fact agreements are inferred from actions (e.g. ordering food at a restaurant implies a promise to pay).",
          concept: "CommercialContracts"
        }
      ]
    },
    {
      id: 2,
      title: "Lesson 2: Legal Liabilities, Breach & Remedies",
      description: "Identify breach types, damages, and contractual liability frameworks.",
      questions: [
        {
          questionText: "What is a breach of contract?",
          options: ["Failure to perform contractual obligations without a valid legal excuse", "Revising contract terms during negotiations", "Losing the physical contract folder", "Asking for a clarification of contract terms"],
          correctAnswer: "Failure to perform contractual obligations without a valid legal excuse",
          explanation: "A breach occurs when a party fails to live up to promises without excuse.",
          concept: "ContractLiability"
        },
        {
          questionText: "What are compensatory damages?",
          options: ["Money awarded to place the injured party in the position they would have been in if the contract had been performed", "Fines meant to punish the breaching party for bad behavior", "A court-ordered refund of all past contract payments", "An apology letter from the breaching party"],
          correctAnswer: "Money awarded to place the injured party in the position they would have been in if the contract had been performed",
          explanation: "Compensatory damages make the non-breaching party whole by replacing actual financial losses.",
          concept: "ContractLiability"
        },
        {
          questionText: "What constitutes a material breach?",
          options: ["A significant failure that destroys the contract's core purpose", "A minor delay in performance of under a day", "A spelling error in the contract title", "Changing the banking details for payments"],
          correctAnswer: "A significant failure that destroys the contract's core purpose",
          explanation: "A material breach excuses the other party from performing and permits suing for damages.",
          concept: "ContractLiability"
        },
        {
          questionText: "What does a force majeure clause excuse?",
          options: ["Non-performance caused by extraordinary, unavoidable events like natural disasters", "Failing to pay due to poor business financial planning", "Changing one's mind about a purchase after signing", "Minor typing errors in contract documents"],
          correctAnswer: "Non-performance caused by extraordinary, unavoidable events like natural disasters",
          explanation: "Force majeure frees parties from liability when acts of God or war prevent execution.",
          concept: "ContractLiability"
        },
        {
          questionText: "What is the duty to mitigate damages?",
          options: ["The obligation of the injured party to minimize their losses after a breach", "The duty of the breaching party to pay double damages", "The requirement to resolve disputes out of court", "The rule that all contracts must carry insurance"],
          correctAnswer: "The obligation of the injured party to minimize their losses after a breach",
          explanation: "Victims of a breach cannot accumulate damages and must take reasonable steps to prevent further loss.",
          concept: "ContractLiability"
        },
        {
          questionText: "What are liquidated damages?",
          options: ["A specific amount of damages pre-agreed in the contract text if a breach occurs", "Damages paid in cash or liquid assets only", "Damages calculated by bank auditors after a trial", "Fines paid directly to state regulators"],
          correctAnswer: "A specific amount of damages pre-agreed in the contract text if a breach occurs",
          explanation: "Liquidated damages are written into contracts when actual damages are hard to estimate.",
          concept: "ContractLiability"
        },
        {
          questionText: "What is specific performance?",
          options: ["A court order requiring the breaching party to perform their exact contract duty", "A evaluation of employee performance metrics", "A marketing presentation given to contract signers", "A contract clause detailing software speed requirements"],
          correctAnswer: "A court order requiring the breaching party to perform their exact contract duty",
          explanation: "Specific performance is an equitable remedy used when money damages are inadequate (e.g. unique land sales).",
          concept: "ContractLiability"
        },
        {
          questionText: "What is tort liability?",
          options: ["Liability arising from a civil wrong that causes harm independent of a contract", "Legal liability for failing to pay business taxes", "Fines for violating corporate compliance guidelines", "International legal disputes between corporations"],
          correctAnswer: "Liability arising from a civil wrong that causes harm independent of a contract",
          explanation: "Torts involve civil duties like negligence, fraud, or defamation, not based on contract terms.",
          concept: "ContractLiability"
        },
        {
          questionText: "What is negligence in legal terms?",
          options: ["Failure to exercise the standard of care that a reasonable person would", "Intentionally committing fraud to steal money", "Breaching a written contract agreement", "Failing to document business meetings in logs"],
          correctAnswer: "Failure to exercise the standard of care that a reasonable person would",
          explanation: "Negligence requires showing a duty, breach of duty, causation, and resulting damage.",
          concept: "ContractLiability"
        },
        {
          questionText: "What is a class action lawsuit?",
          options: ["A lawsuit brought by one or more people on behalf of a larger group", "A legal suit filed by students against a school", "A corporate lawsuit involving merger disputes", "An international legal arbitration process"],
          correctAnswer: "A lawsuit brought by one or more people on behalf of a larger group",
          explanation: "Class actions consolidate numerous similar claims into a single legal case.",
          concept: "ContractLiability"
        }
      ]
    },
    {
      id: 3,
      title: "Lesson 3: Intellectual Property & Corporate Compliance",
      description: "Distinguish patents, copyrights, trademarks, and corporate ethical guidelines.",
      questions: [
        {
          questionText: "What does copyright protect?",
          options: ["Original creative works fixed in a tangible medium of expression", "Inventions, designs, and mechanical methods", "Brand names, logos, slogans, and corporate symbols", "Confidential business details and trade secrets"],
          correctAnswer: "Original creative works fixed in a tangible medium of expression",
          explanation: "Copyright protects books, music, art, and software source code from unauthorized copying.",
          concept: "IntellectualProperty"
        },
        {
          questionText: "What is the primary purpose of a trademark?",
          options: ["To identify the source of goods/services and prevent consumer confusion", "To grant exclusive rights to mechanical inventions", "To protect original artistic works like paintings", "To safeguard corporate financial ledger data"],
          correctAnswer: "To identify the source of goods/services and prevent consumer confusion",
          explanation: "Trademarks preserve brand identifiers (logos, names) in the marketplace.",
          concept: "IntellectualProperty"
        },
        {
          questionText: "What does a patent grant?",
          options: ["Exclusive rights to exclude others from making or selling a novel invention", "The right to copy creative literary works freely", "A certification of compliance with business regulations", "The legal right to use a brand identifier logo"],
          correctAnswer: "Exclusive rights to exclude others from making or selling a novel invention",
          explanation: "Patents offer utility protection for inventions for a limited duration (typically 20 years).",
          concept: "IntellectualProperty"
        },
        {
          questionText: "How long does copyright protection last for an individual author?",
          options: ["Life of the author plus 70 years", "Exactly 20 years from publication", "Forever, as long as fees are paid", "50 years after creation only"],
          correctAnswer: "Life of the author plus 70 years",
          explanation: "Copyright duration for individuals is long: life of the author plus 70 years.",
          concept: "IntellectualProperty"
        },
        {
          questionText: "What is a trade secret?",
          options: ["Confidential business information that provides a competitive edge", "A private company password shared with employees", "A patented manufacturing method registered with the state", "A secret accounting spreadsheet kept from tax offices"],
          correctAnswer: "Confidential business information that provides a competitive edge",
          explanation: "Trade secrets (like formulas, lists) rely on secrecy rather than registration for protection.",
          concept: "IntellectualProperty"
        },
        {
          questionText: "What is 'fair use' in intellectual property law?",
          options: ["A legal doctrine allowing limited use of copyrighted material without permission", "The rule that anyone can copy patented designs for free", "A contract term defining fair prices for software", "The compliance review of trademark registrations"],
          correctAnswer: "A legal doctrine allowing limited use of copyrighted material without permission",
          explanation: "Fair use permits copying for criticism, news reporting, teaching, or research.",
          concept: "IntellectualProperty"
        },
        {
          questionText: "What is corporate compliance?",
          options: ["Ensuring a company follows all relevant laws, regulations, and ethical standards", "Signing employment contracts with new hires", "Filing corporate tax documents on time", "Achieving high user ratings on product pages"],
          correctAnswer: "Ensuring a company follows all relevant laws, regulations, and ethical standards",
          explanation: "Compliance prevents legal violations, fines, and corporate fraud.",
          concept: "IntellectualProperty"
        },
        {
          questionText: "What is a fiduciary duty?",
          options: ["A legal obligation to act in the best interest of another party", "The duty to pay taxes to the federal government", "The obligation to check code for syntax errors", "The requirement to pay suppliers in cash"],
          correctAnswer: "A legal obligation to act in the best interest of another party",
          explanation: "Fiduciaries (like directors or trustees) must act with loyalty and care for those they represent.",
          concept: "IntellectualProperty"
        },
        {
          questionText: "What is insider trading?",
          options: ["Buying or selling stock based on non-public, material information", "Trading inventory assets between business departments", "Sharing software code within a closed corporate network", "Hiring employees from a competitor business"],
          correctAnswer: "Buying or selling stock based on non-public, material information",
          explanation: "Insider trading violates securities laws by exploiting confidential financial data.",
          concept: "IntellectualProperty"
        },
        {
          questionText: "Why is corporate governance important?",
          options: ["It provides rules and practices to balance stakeholder interests and manage risk", "It automates database queries and server tasks", "It designs marketing layouts and social media ads", "It drafts contract agreements between suppliers"],
          correctAnswer: "It provides rules and practices to balance stakeholder interests and manage risk",
          explanation: "Governance sets the framework of control and accountability in corporations.",
          concept: "IntellectualProperty"
        }
      ]
    }
  ],
  Engineering: [
    {
      id: 1,
      title: "Lesson 1: Engineering Design & Kinematics Principles",
      description: "Understand core physics laws, mechanical spatial transformations, and coordinate systems.",
      questions: [
        {
          questionText: "What is the primary goal of the engineering design process?",
          options: ["To develop effective solutions to practical problems within constraints", "To write clean HTML and CSS web code", "To file corporate financial budgets", "To draft legal contract documents"],
          correctAnswer: "To develop effective solutions to practical problems within constraints",
          explanation: "Engineering design applies science and math to solve human needs within cost, safety, and material constraints.",
          concept: "RoboticKinematics"
        },
        {
          questionText: "What does CAD stand for in engineering design?",
          options: ["Computer-Aided Design", "Control and Diagnostics", "Coordinate Axis Definition", "Calculated Assembly Diagram"],
          correctAnswer: "Computer-Aided Design",
          explanation: "CAD software is used to create, modify, and document 2D or 3D physical models of parts and systems.",
          concept: "RoboticKinematics"
        },
        {
          questionText: "What is the purpose of stress analysis in mechanical engineering?",
          options: ["To determine if a structure can withstand operating loads without failing", "To evaluate employee psychological burnout levels", "To measure the speed of network data transfers", "To check code scripts for runtime syntax errors"],
          correctAnswer: "To determine if a structure can withstand operating loads without failing",
          explanation: "Stress analysis computes internal forces and deformations to verify safety margins.",
          concept: "RoboticKinematics"
        },
        {
          questionText: "What does the law of conservation of energy state?",
          options: ["Energy cannot be created or destroyed, only transformed", "Energy decreases over time in closed systems", "Engineering systems must run on solar power", "Electrical circuits require ground connections"],
          correctAnswer: "Energy cannot be created or destroyed, only transformed",
          explanation: "Total energy remains constant in an isolated system, changing forms (e.g. potential to kinetic).",
          concept: "RoboticKinematics"
        },
        {
          questionText: "What is Newton's second law of motion?",
          options: ["Force equals mass times acceleration (F=ma)", "For every action there is an equal and opposite reaction", "Objects in motion stay in motion unless acted upon", "Pressure equals force divided by area"],
          correctAnswer: "Force equals mass times acceleration (F=ma)",
          explanation: "Acceleration is directly proportional to net force and inversely proportional to mass.",
          concept: "RoboticKinematics"
        },
        {
          questionText: "What is a factor of safety in engineering design?",
          options: ["The ratio of structural capacity to the actual expected load", "The count of fire extinguishers in a factory lab", "The number of lines of error-checking code in a script", "The thickness of safety glass used on server racks"],
          correctAnswer: "The ratio of structural capacity to the actual expected load",
          explanation: "Safety factors (e.g. 2.0) ensure designs withstand loads beyond normal operation.",
          concept: "RoboticKinematics"
        },
        {
          questionText: "What is the study of thermodynamics concerned with?",
          options: ["Heat, work, temperature, and their relation to energy", "The flow of liquids and gases through pipes", "The electrical currents inside microchips", "The movement of robotic joints in coordinate frames"],
          correctAnswer: "Heat, work, temperature, and their relation to energy",
          explanation: "Thermodynamics governs energy conversion and thermal behavior of systems.",
          concept: "RoboticKinematics"
        },
        {
          questionText: "What does fluid mechanics study?",
          options: ["The behavior of fluids (liquids, gases) at rest or in motion", "The stress limits of solid steel beams", "The electrical circuits in feedback loops", "The chemical reactions inside battery cells"],
          correctAnswer: "The behavior of fluids (liquids, gases) at rest or in motion",
          explanation: "Fluid mechanics analyses pressure, velocity, and flow in pipes, wings, and pumps.",
          concept: "RoboticKinematics"
        },
        {
          questionText: "What is the difference between static and dynamic analysis?",
          options: ["Static deals with forces at rest; dynamic involves moving bodies", "Static is for software; dynamic is for hardware structures", "Static uses integers; dynamic uses floating-point coordinates", "Static is cheap; dynamic is expensive to analyze"],
          correctAnswer: "Static deals with forces at rest; dynamic involves moving bodies",
          explanation: "Static assumes zero acceleration (equilibrium), while dynamic calculates time-varying accelerations.",
          concept: "RoboticKinematics"
        },
        {
          questionText: "Why is material selection crucial in mechanical design?",
          options: ["Materials dictate weight, strength, cost, and thermal properties", "Materials determine the programming language used", "Materials control the website color layout", "Materials affect the database schema constraints"],
          correctAnswer: "Materials dictate weight, strength, cost, and thermal properties",
          explanation: "Selecting wrong materials leads to structural failure, high costs, or operational issues.",
          concept: "RoboticKinematics"
        }
      ]
    },
    {
      id: 2,
      title: "Lesson 2: Control Systems & PID Controllers",
      description: "Tune control loop feedback configurations using proportional, integral, and derivative parameters.",
      questions: [
        {
          questionText: "What does PID controller stand for in automation?",
          options: ["Proportional, Integral, Derivative", "Position, Index, Direction", "Physics, Inertia, Dynamics", "Phase, Impedance, Delay"],
          correctAnswer: "Proportional, Integral, Derivative",
          explanation: "PID is a feedback loop control mechanism widely used in industrial control systems.",
          concept: "PIDFeedbackControl"
        },
        {
          questionText: "What is a closed-loop control system?",
          options: ["A system that uses feedback from sensors to adjust controller output", "A programming loop that has no exit condition", "A system enclosed in a metal shielding box", "A circuit that does not require electricity"],
          correctAnswer: "A system that uses feedback from sensors to adjust controller output",
          explanation: "Closed-loop constantly measures actual output and corrects deviation from target.",
          concept: "PIDFeedbackControl"
        },
        {
          questionText: "In a PID controller, what does the Proportional (P) term do?",
          options: ["Adjusts control output linearly based on current error magnitude", "Aggregates past errors to eliminate steady offset", "Predicts future errors to prevent overshoot", "Calibrates sensor feedback ranges"],
          correctAnswer: "Adjusts control output linearly based on current error magnitude",
          explanation: "P gain generates a correction proportional to the current error (setpoint - feedback).",
          concept: "PIDFeedbackControl"
        },
        {
          questionText: "What is feedback in a control loop?",
          options: ["Feeding sensor measurements back into the controller to calculate error", "Asking clients for reviews of the software app", "Running system diagnostics after a crash", "The noise generated by faulty electrical ground lines"],
          correctAnswer: "Feeding sensor measurements back into the controller to calculate error",
          explanation: "Feedback enables closed-loop control by informing the system of its actual state.",
          concept: "PIDFeedbackControl"
        },
        {
          questionText: "What is steady-state error?",
          options: ["The difference between target setpoint and output when system stabilizes", "A runtime error in python loops", "A database synchronization latency delay", "A calibration error of mechanical calipers"],
          correctAnswer: "The difference between target setpoint and output when system stabilizes",
          explanation: "Steady-state error is the persistent offset remaining after transients die out.",
          concept: "PIDFeedbackControl"
        },
        {
          questionText: "What is sensor calibration?",
          options: ["Aligning sensor output readings with known physical reference values", "Writing code to filter sensor noise frequencies", "Connecting sensors to analog-to-digital converters", "Determining the power usage of active sensors"],
          correctAnswer: "Aligning sensor output readings with known physical reference values",
          explanation: "Calibration ensures sensor accuracy by establishing correct mapping variables.",
          concept: "PIDFeedbackControl"
        },
        {
          questionText: "What is the function of an actuator in an automated system?",
          options: ["It converts electrical/control signals into physical motion", "It measures variables like temperature or distance", "It displays parameters on graphical screen interfaces", "It stores control code in memory buffers"],
          correctAnswer: "It converts electrical/control signals into physical motion",
          explanation: "Actuators (e.g. motors, cylinders) are the 'muscles' executing control commands.",
          concept: "PIDFeedbackControl"
        },
        {
          questionText: "What does signal processing do in engineering?",
          options: ["Analyzes and modifies signals to improve transmission, filtering, or detection", "Connects server modules using database channels", "Manages schedules of engineering teams", "Styles visual indicators on control dashboards"],
          correctAnswer: "Analyzes and modifies signals to improve transmission, filtering, or detection",
          explanation: "Processing filters noise, scales values, and extracts data from raw sensor currents.",
          concept: "PIDFeedbackControl"
        },
        {
          questionText: "What is system dynamics?",
          options: ["The study of how systems change or evolve over time", "The physical weight of dynamic robotic systems", "The compilation speed of software scripts", "The layout responsiveness of websites"],
          correctAnswer: "The study of how systems change or evolve over time",
          explanation: "Dynamics models time-varying behavior of electrical, mechanical, or thermal systems.",
          concept: "PIDFeedbackControl"
        },
        {
          questionText: "What is the purpose of tuning a controller?",
          options: ["To adjust PID gains for stable, fast response with minimal overshoot", "To clean mechanical grease from joint actuators", "To write custom commands in terminal shells", "To back up database tables of system parameters"],
          correctAnswer: "To adjust PID gains for stable, fast response with minimal overshoot",
          explanation: "Tuning optimizes P, I, and D parameters for optimal closed-loop performance.",
          concept: "PIDFeedbackControl"
        }
      ]
    },
    {
      id: 3,
      title: "Lesson 3: System Optimization & Operations",
      description: "Master process bottlenecks, finite element analysis, and structural automation workflows.",
      questions: [
        {
          questionText: "What is process optimization in engineering?",
          options: ["Improving efficiency, throughput, or cost in a manufacturing/refining process", "Compressing image assets to fit on databases", "Writing shorter variable names in code scripts", "Filing patents to protect corporate designs"],
          correctAnswer: "Improving efficiency, throughput, or cost in a manufacturing/refining process",
          explanation: "Optimization eliminates bottlenecks, reduces energy waste, and maximizes yield.",
          concept: "TrajectoryPlanning"
        },
        {
          questionText: "What is a bottleneck in production operations?",
          options: ["The slowest step in a process that limits overall capacity", "A physical container used for chemical experiments", "An electrical socket overloading a server room", "A security vulnerability in network firewalls"],
          correctAnswer: "The slowest step in a process that limits overall capacity",
          explanation: "The bottleneck determines the maximum possible output speed of the entire assembly pipeline.",
          concept: "TrajectoryPlanning"
        },
        {
          questionText: "What is Six Sigma in quality engineering?",
          options: ["A data-driven methodology to reduce defects and process variation", "A programming loop with six parameters", "A robotics design with six degrees of freedom", "A corporate law compliance regulation"],
          correctAnswer: "A data-driven methodology to reduce defects and process variation",
          explanation: "Six Sigma targets near-perfection (3.4 defects per million opportunities) using stats.",
          concept: "TrajectoryPlanning"
        },
        {
          questionText: "What is predictive maintenance?",
          options: ["Scheduling repairs based on sensor data indicating imminent failure", "Replacing parts on a fixed calendar schedule regardless of wear", "Fixing machinery only after it breaks down completely", "Running diagnostics tests in terminal shells"],
          correctAnswer: "Scheduling repairs based on sensor data indicating imminent failure",
          explanation: "Predictive maintenance utilizes vibration, thermal, or acoustic data to prevent downtime.",
          concept: "TrajectoryPlanning"
        },
        {
          questionText: "What is a prototype in engineering?",
          options: ["A preliminary physical model used to test design concepts and functions", "A layout design wireframe created in CSS templates", "A database script used to seed initial records", "A template contract reviewed by legal counsel"],
          correctAnswer: "A preliminary physical model used to test design concepts and functions",
          explanation: "Prototypes validate form, fit, and function before committing to mass manufacturing.",
          concept: "TrajectoryPlanning"
        },
        {
          questionText: "What is system integration?",
          options: ["Combining subsystems into a unified, functional engineering system", "Connecting local scripts to database backups", "Migrating styling codes to modern CSS frameworks", "Reviewing corporate compliance with local regulations"],
          correctAnswer: "Combining subsystems into a unified, functional engineering system",
          explanation: "Integration ensures that sensors, controllers, and actuators work together harmoniously.",
          concept: "TrajectoryPlanning"
        },
        {
          questionText: "What is the purpose of Finite Element Analysis (FEA)?",
          options: ["To numerically simulate physical stress, heat flow, or fluid behavior", "To count the number of elements in a database array", "To design layouts of user interface panels", "To track the cost of raw materials in manufacturing"],
          correctAnswer: "To numerically simulate physical stress, heat flow, or fluid behavior",
          explanation: "FEA uses math discretization to analyze complex physical fields in designs.",
          concept: "TrajectoryPlanning"
        },
        {
          questionText: "What is structural integrity?",
          options: ["The ability of a structure to hold its weight and service load without collapse", "The honesty of the engineering firm management", "The code quality of software logic scripts", "The backup stability of cloud storage disks"],
          correctAnswer: "The ability of a structure to hold its weight and service load without collapse",
          explanation: "Structural integrity prevents catastrophic fractures and yielding in operation.",
          concept: "TrajectoryPlanning"
        },
        {
          questionText: "What is automation in engineering operations?",
          options: ["Using control systems to operate equipment with minimal human intervention", "Running batch scripts in server terminals automatically", "Designing websites that adapt to screen sizes", "Drafting templates for standard business agreements"],
          correctAnswer: "Using control systems to operate equipment with minimal human intervention",
          explanation: "Automation increases output rate, accuracy, and safety in production lines.",
          concept: "TrajectoryPlanning"
        },
        {
          questionText: "What is thermal management in design?",
          options: ["Controlling temperatures of active components using sinks, fans, or coolant", "Adjusting office air conditioning systems", "Monitoring the weather conditions around factories", "Tuning boiler parameters in industrial facilities"],
          correctAnswer: "Controlling temperatures of active components using sinks, fans, or coolant",
          explanation: "Thermal design keeps sensitive components within safe operating temperature bounds.",
          concept: "TrajectoryPlanning"
        }
      ]
    }
  ]
};

// Helper function to dynamically construct or fetch lessons for any course, ensuring 10 related questions per lesson
export const getLessonsForCourse = (
  courseId: number,
  categoryName?: string,
  subcategoryName?: string
): Lesson[] => {
  // 1. Determine the category pool to use based on inputs or course ID ranges
  let cat = "Programming";
  if (categoryName) {
    cat = categoryName;
  } else {
    // Fallback classification based on courseId ranges seeded in the database
    if (courseId >= 1 && courseId <= 25) {
      cat = "Programming";
    } else if (courseId >= 26 && courseId <= 50) {
      cat = "Business";
    } else if (courseId >= 51 && courseId <= 75) {
      cat = "Law";
    } else if (courseId >= 76 && courseId <= 100) {
      cat = "Engineering";
    } else if (courseId > 100) {
      // Modulo-based fallback for higher IDs
      const idx = (courseId - 1) % 4;
      if (idx === 0) cat = "Programming";
      else if (idx === 1) cat = "Business";
      else if (idx === 2) cat = "Law";
      else cat = "Engineering";
    }
  }

  // Normalize category name to match categoryPools keys
  let poolKey: "Programming" | "Business" | "Law" | "Engineering" = "Programming";
  const lowerCat = cat.toLowerCase();
  if (lowerCat.includes("business")) {
    poolKey = "Business";
  } else if (lowerCat.includes("law")) {
    poolKey = "Law";
  } else if (lowerCat.includes("engineering")) {
    poolKey = "Engineering";
  }

  const pool = categoryPools[poolKey];

  // 2. Fetch or construct the lessons
  const baseLessons = courseLessons[courseId];
  if (baseLessons) {
    // Return base lessons but pad each lesson's questions to exactly 10 using the corresponding category pool
    return baseLessons.map((lesson, lessonIdx) => {
      const poolQuestions = pool[lessonIdx]?.questions || [];
      const baseQuestions = [...lesson.questions];
      const addedQuestions: QuizQuestion[] = [];

      // Add questions from pool that are not already present (checking by text)
      for (const pq of poolQuestions) {
        if (baseQuestions.length + addedQuestions.length >= 10) break;
        const isDuplicate = baseQuestions.some(
          bq => bq.questionText.toLowerCase() === pq.questionText.toLowerCase()
        );
        if (!isDuplicate) {
          // Assign a temp ID which we will override in the next step
          addedQuestions.push({
            id: 0,
            questionText: pq.questionText,
            options: pq.options,
            correctAnswer: pq.correctAnswer,
            explanation: pq.explanation,
            concept: pq.concept
          });
        }
      }

      // Combine and re-index questions from 1 to 10
      let combinedQuestions = [...baseQuestions, ...addedQuestions].map((q, qIdx) => ({
        ...q,
        id: qIdx + 1
      }));

      // In the extremely rare event we still have less than 10 questions, pad it
      while (combinedQuestions.length < 10 && poolQuestions.length > 0) {
        const fallbackQ = poolQuestions[combinedQuestions.length % poolQuestions.length];
        combinedQuestions.push({
          id: combinedQuestions.length + 1,
          questionText: fallbackQ.questionText,
          options: fallbackQ.options,
          correctAnswer: fallbackQ.correctAnswer,
          explanation: fallbackQ.explanation,
          concept: fallbackQ.concept
        });
      }

      // If we somehow have more than 10 (shouldn't happen), truncate to 10
      if (combinedQuestions.length > 10) {
        combinedQuestions = combinedQuestions.slice(0, 10);
      }

      return {
        ...lesson,
        questions: combinedQuestions
      };
    });
  }

  // 3. Fallback for courses with no hardcoded lessons (courses 6+): return the pool lessons directly
  return pool.map((lesson) => {
    // Customize lesson title and details to match subcategory context if subcategoryName is provided
    let lessonTitle = lesson.title;
    if (subcategoryName) {
      if (lesson.id === 1) {
        lessonTitle = `Lesson 1: Foundations of ${subcategoryName}`;
      } else if (lesson.id === 2) {
        lessonTitle = `Lesson 2: Core ${subcategoryName} Principles`;
      } else {
        lessonTitle = `Lesson 3: Advanced ${subcategoryName} Applications`;
      }
    } else {
      // General title containing course ID
      lessonTitle = lesson.title.replace("Syntax & Variables", `${poolKey} Basics`).replace("Fundamentals of Business Operations", `${poolKey} Principles`);
    }

    // Map questions with correct 1-indexed IDs
    const formattedQuestions = lesson.questions.map((q, qIdx) => {
      // Dynamic replacement of [Subcategory] or general text in questions to make them highly contextual
      let text = q.questionText;
      let exp = q.explanation;
      if (subcategoryName) {
        text = text.replace(/in programming/gi, `in ${subcategoryName}`)
                   .replace(/in business/gi, `in ${subcategoryName}`)
                   .replace(/in contract law/gi, `in ${subcategoryName}`)
                   .replace(/in engineering/gi, `in ${subcategoryName}`);
        exp = exp.replace(/programming/gi, subcategoryName)
                 .replace(/business/gi, subcategoryName)
                 .replace(/contract law/gi, subcategoryName)
                 .replace(/engineering/gi, subcategoryName);
      }

      return {
        id: qIdx + 1,
        questionText: text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: exp,
        concept: q.concept
      };
    });

    return {
      id: lesson.id,
      title: lessonTitle,
      description: subcategoryName ? `Learn about the core structures and real-world workflows in ${subcategoryName}.` : lesson.description,
      questions: formattedQuestions
    };
  });
};

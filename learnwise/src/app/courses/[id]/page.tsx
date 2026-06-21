"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCourseById } from "@/app/actions/courses";
import { enrollInCourse, getLearningPathItems, saveQuizResult } from "@/app/actions/learningPaths";
import { addToWishlist } from "@/app/actions/wishlist";
import { 
  ArrowLeft, Clock, BookOpen, Award, Star, CheckCircle, 
  Heart, Trophy, Lock, Play, RefreshCw, Sparkles, X, Printer,
  AlertCircle, ChevronRight, Send, MessageSquare, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getResourcesForCourse } from "@/lib/courseResources";
import { getLessonsForCourse, Lesson, QuizQuestion } from "@/lib/courseLessons";
import { submitCourseReview } from "@/app/actions/courses";
import { getCurrentStudent } from "@/app/actions/auth";
import { getRecommendations } from "@/app/actions/recommendation";
import { getStudentProfileData } from "@/app/actions/profile";

interface Lecture {
  title: string;
  content: string;
}

const getLecturesForCourse = (courseTitle: string, lessonId: number): Lecture[] => {
  const titleLower = courseTitle.toLowerCase();
  
  if (titleLower.includes("python")) {
    if (lessonId === 1) {
      return [
        {
          title: "Lecture 1: Introduction to Variables & Naming Rules",
          content: "Variables are fundamental elements in Python that act as references to objects in memory rather than direct physical storage slots. When you assign a value in Python using the assignment operator `=`, such as `user_name = 'Learner'`, Python dynamically allocates space in memory for the string object `'Learner'` and creates a reference named `user_name` pointing to that memory address. It is crucial to adhere to Python's strict variable naming conventions: variable names must start with a letter (a-z, A-Z) or an underscore (`_`), and they cannot begin with a number (e.g., `1variable` is invalid). Furthermore, variable names are case-sensitive, meaning `age`, `Age`, and `AGE` point to three entirely distinct memory locations. Lastly, you must avoid using Python's reserved language keywords (such as `def`, `class`, `import`, `if`, `else`, `return`, etc.) as variable names, as doing so will trigger syntax errors. Best practices recommend using clear, descriptive names written in snake_case (e.g., `max_retry_attempts`) to enhance code maintainability and team readability."
        },
        {
          title: "Lecture 2: Dynamic Typing & Basic Types",
          content: "Python utilizes a dynamic typing system, which means that you do not need to explicitly declare the data type of a variable when you define it. The interpreter infers the data type at runtime based on the value assigned to the variable. Consequently, reassigning an existing variable to a completely different data type is perfectly legal and valid in Python (for example, executing `x = 4` followed by `x = 'four'` will not raise any errors). The core built-in data types in Python include integers (`int`) for whole numbers, floating-point decimals (`float`) for real numbers, text sequences (`str`) for character data, and boolean states (`bool`) which represent either `True` or `False`. You can inspect the active data type of any object at runtime by passing it to the built-in `type()` function (e.g., `print(type(x))`). Explicit type conversion, or type casting, can be performed using constructor functions like `int()`, `float()`, `str()`, and `bool()` to ensure variable compatibility and prevent type-mismatch errors during calculations."
        },
        {
          title: "Lecture 3: Basic Arithmetic Operations",
          content: "Python provides a robust set of operators to execute mathematical calculations easily. These include addition (`+`), subtraction (`-`), multiplication (`*`), standard division (`/`), floor division (`//`), modulus (`%`), and exponentiation (`**`). Standard division (`/`) always returns a floating-point number (e.g., `4 / 2` evaluates to `2.0`), whereas floor division (`//`) performs the division and rounds down to the nearest integer, discarding any fractional remainder (e.g., `5 // 2` yields `2`). The modulus operator (`%`) returns the remainder of the division process, which is highly useful for checking number parity (such as identifying odd or even numbers with `number % 2 == 0`). Exponentiation utilizes double asterisks (e.g., `2 ** 3` evaluates to `8`). Python strictly follows mathematical operator precedence (commonly known as PEMDAS/BODMAS rules: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction), so it is highly recommended to use parentheses to group expressions and guarantee the intended execution order."
        }
      ];
    }
    if (lessonId === 2) {
      return [
        {
          title: "Lecture 1: Conditional Control Flow (if/elif/else)",
          content: "Conditional control flow allows a program to execute different branches of code based on whether specific boolean conditions evaluate to True or False. Unlike many other programming languages that use curly braces `{}` to define blocks, Python relies strictly on indentation (typically 4 spaces) to mark scope boundaries, enforcing a clean and readable coding style. An `if` statement evaluates a logical expression, and if it is True, executes the corresponding indented block. You can chain multiple checks sequentially using `elif` (short for 'else if') statements, concluding with an optional `else` block that acts as a catch-all fallback if all prior conditions evaluate to False. Logical operators (`and`, `or`, `not`) are used to combine or negate conditions, enabling complex decision-making logic. Python evaluates these logical operators using short-circuiting, meaning it stops evaluation as soon as the overall truth value is determined, which can optimize performance and prevent errors."
        },
        {
          title: "Lecture 2: Iteration with For Loops",
          content: "A `for` loop in Python provides a clean mechanism to iterate over iterable collections, such as lists, tuples, strings, dictionaries, and sets. Unlike index-based loops in C-style languages, Python's `for` loop unpacks elements directly from the sequence, making the syntax highly expressive (e.g., `for score in quiz_scores: print(score)`). To loop a specific number of times, Python provides the built-in `range(start, stop, step)` function, which generates an arithmetic progression of integers dynamically; this function is memory-efficient because it yields numbers on the fly rather than allocating a full list in memory. Loops can be controlled dynamically using the `break` statement, which terminates the loop prematurely and transfers control to the statement immediately following the loop, or the `continue` statement, which skips the remainder of the current iteration and jumps directly to the next cycle. Additionally, Python loops support an optional `else` block that executes only if the loop completed naturally without encountering a `break` statement."
        },
        {
          title: "Lecture 3: Iteration with While Loops",
          content: "A `while` loop repeatedly executes a target block of code as long as a specified boolean condition remains True. Unlike `for` loops which run over a fixed sequence, `while` loops are typically used when the number of iterations is not known beforehand (for example, reading user input until a exit command is entered). It is the developer's responsibility to ensure that the loop condition is eventually updated to False inside the block, either by incrementing a loop counter or modifying a flag variable; failing to do so will result in an infinite loop that consumes system resources and freezes program execution. To safety-guard against infinite execution, you can set a maximum iteration limit or use sentinel values to trigger a `break` statement if something goes wrong. Nested `while` loops are also supported, though they should be used cautiously as they increase cognitive complexity and runtime overhead."
        }
      ];
    }
    return [
      {
        title: "Lecture 1: Writing Reusable Functions",
        content: "Functions are self-contained, reusable blocks of code designed to execute a single, cohesive action, helping developers avoid code duplication and modularize their applications. In Python, functions are defined using the `def` keyword, followed by a descriptive function name, parentheses containing optional parameters, and a colon, with the function body indented below. It is standard practice to include a docstring (a triple-quoted string on the very first line of the function body) to document the function's purpose, parameters, and return values, which is then accessible via the built-in `help()` utility. If a function finishes executing all statements inside its block without encountering an explicit `return` statement, it automatically returns the special value `None` to the caller. Designing functions with single, clear responsibilities makes testing, debugging, and maintaining the codebase much easier."
      },
      {
        title: "Lecture 2: Function Parameters & Arguments",
        content: "Information is passed into functions via parameters, which act as local variables within the function's execution scope. When calling a function, the concrete values provided are called arguments, and they can be passed positionally (in the exact order they are declared) or as keyword arguments (by explicitly naming the parameters, e.g., `calculate_grade(score=85, weight=0.2)`). Python allows developers to specify default values for parameters in the function definition, which makes those parameters optional during function calls; however, default parameter values are evaluated only once when the function is defined, so using mutable objects like empty lists as defaults should be avoided to prevent unexpected persistent states. Python also supports variadic parameters: prefixing a parameter with an asterisk (e.g., `*args`) collects arbitrary positional arguments into a tuple, while a double asterisk (e.g., `**kwargs`) collects arbitrary keyword arguments into a dictionary, providing maximum calling flexibility."
      },
      {
        title: "Lecture 3: Return Statements & Variable Scope",
        content: "The `return` statement immediately terminates a function's execution and hands a value back to the caller, allowing functions to output computational results. Variable scope dictates where in the program a variable can be accessed: variables defined inside a function are bound to the function's local scope, meaning they are created when the function is called and destroyed when the function returns, making them inaccessible from the outside. Conversely, variables defined at the top level of a module are global and can be read from anywhere within that module. If you need to modify a global variable from inside a function, you must declare it using the `global` keyword within that function; however, modifying global variables is generally discouraged because it creates hidden side effects, making the program harder to reason about. Python follows the LEGB rule (Local, Enclosing, Global, Built-in) to resolve variable names, searching scopes outward from the point of reference."
      }
    ];
  }
  
  if (titleLower.includes("web") || titleLower.includes("react") || titleLower.includes("html") || titleLower.includes("development")) {
    if (lessonId === 1) {
      return [
        {
          title: "Lecture 1: Core Semantic HTML5 Tags",
          content: "Semantic HTML refers to markup that introduces structural meaning to a web page rather than just defining its appearance. Instead of nesting generic `<div>` and `<span>` tags for everything, HTML5 introduced specialized elements like `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>`. Using these semantic tags is a critical best practice because it dramatically improves web accessibility (aiding screen readers in navigating the content layout) and enhances Search Engine Optimization (SEO) by allowing search engine crawlers to easily index the page hierarchy. Developers should construct clean outlines, ensuring that headers (`<h1>` through `<h6>`) are nested correctly and that page structures are logical, clean, and self-documenting."
        },
        {
          title: "Lecture 2: HTML Document Object Model (DOM)",
          content: "The Document Object Model (DOM) is a programming interface and representation model for HTML documents, structured as a hierarchical tree of nodes where each node represents an element, attribute, or text block on the page. Web browsers construct this DOM tree when loading a webpage, and client-side scripting languages like JavaScript use the DOM API to query, add, modify, or delete elements in real time. Common DOM operations include selecting nodes (e.g., using `document.querySelector()` or `document.getElementById()`), updating text content, styling classes, and binding event listeners to respond to user actions. Directly manipulating the DOM can be computationally expensive, which is why modern frameworks often implement virtualization strategies to minimize direct page re-renders."
        },
        {
          title: "Lecture 3: Forms and User Inputs",
          content: "HTML forms are the primary mechanism for collecting user input and sending it to a server or processing it locally. Forms are wrapped in the `<form>` tag and contain interactive controls such as `<input>`, `<textarea>`, `<select>`, and `<button>`. The `type` attribute on inputs (e.g., `text`, `email`, `password`, `checkbox`, `radio`, `submit`) is critical as it instructs the browser on how to render the input and perform automatic client-side validation (like verifying email formats). To handle form submissions, developers typically intercept the form's `onSubmit` event, use JavaScript's `event.preventDefault()` to stop the default page reload behavior, and bundle the form values into an object for API transmission. Designing accessible forms requires associating labels with inputs using the `htmlFor` attribute and providing clear error messages."
        }
      ];
    }
    if (lessonId === 2) {
      return [
        {
          title: "Lecture 1: The CSS Box Model",
          content: "The CSS Box Model is the foundational layout system of the web, treating every HTML element as a rectangular box. This box consists of four distinct concentric layers, from the inside out: Content (where text and images are rendered), Padding (the transparent space immediately surrounding the content), Border (a line wrapping the padding), and Margin (the empty space separating the element from its neighbors). By default, setting `width` and `height` properties only alters the content box, meaning padding and borders are added to the total size, which often breaks layouts; setting `box-sizing: border-box` resolves this by forcing the browser to include padding and borders within the specified width and height. Understanding how margins collapse vertically between block elements is also vital for creating predictable page layouts."
        },
        {
          title: "Lecture 2: CSS Flexbox Layouts",
          content: "Flexbox, or the Flexible Box Layout, is a one-dimensional layout model designed for distributing space and aligning items along a single axis (either a row or a column). By applying `display: flex` to a container element, it becomes a flex container, and its immediate children become flex items, which can then be aligned dynamically using properties like `justify-content` (controlling alignment along the main axis) and `align-items` (controlling alignment along the cross axis). Flexbox makes it incredibly easy to build responsive grids, center elements both vertically and horizontally, and reorder elements without altering the HTML structure. Flex items can also grow (`flex-grow`), shrink (`flex-shrink`), or wrap onto multiple lines (`flex-wrap`) based on the available container space, making Flexbox a highly versatile tool for modern UI design."
        },
        {
          title: "Lecture 3: Responsive Design and Media Queries",
          content: "Responsive web design is an approach aimed at building web pages that adapt fluidly to different viewport sizes, ensuring a high-quality user experience across mobile phones, tablets, and desktop monitors. The cornerstone of responsive styling is the CSS media query (`@media`), which applies block styles conditionally depending on media features like device width, height, or orientation (e.g., `@media (max-width: 768px)` targets screens smaller than tablet size). In addition to media queries, developers should use relative length units (like `%`, `rem`, `em`, `vw`, and `vh`) rather than fixed pixel dimensions to build flexible fluid layouts. Adopting a mobile-first design strategy—where styles are written for the smallest screens first and then scaled up via media queries—is recommended to maintain clean and performant style sheets."
        }
      ];
    }
    return [
      {
        title: "Lecture 1: Introduction to React and JSX",
        content: "React is an open-source JavaScript library developed by Meta, designed specifically for building component-based, highly interactive user interfaces. React allows developers to build complex applications by composing small, isolated pieces of code called components, which manage their own rendering logic and can be reused throughout the project. React applications use JSX (JavaScript XML), an XML-like syntax extension that allows developers to write HTML structure directly inside JavaScript files. Under the hood, JSX compiles into standard JavaScript calls (specifically `React.createElement()`), producing a Virtual DOM tree which React compares against the browser's real DOM to apply minimal, high-performance updates. Mixing markup and logic within JSX components promotes cohesion and speeds up UI development."
      },
      {
        title: "Lecture 2: Component State with useState",
        content: "State represents the local, mutable data within a React component that can change over time, typically in response to user actions, network responses, or timers. React provides the `useState` hook to add state variables to functional components; it takes an initial value as an argument and returns an array containing the current state value and a setter function to update that value (e.g., `const [count, setCount] = useState(0)`). When you invoke the setter function, React is notified of the state change, schedules a component re-render, and updates the DOM to reflect the new state. It is crucial to treat state as immutable: you should never modify a state variable directly (e.g., `count = count + 1` is forbidden), as this bypasses React's lifecycle and will not trigger a UI refresh."
      },
      {
        title: "Lecture 3: Props and Component Trees",
        content: "Props (short for properties) are read-only inputs passed from a parent component down to its child components, serving as the primary mechanism for sharing data within a React application. This unidirectional, top-down data flow ensures that components remain predictable, testable, and reusable, as children cannot modify the props they receive. Props can be anything from strings and numbers to complex objects, arrays, and even JavaScript functions (which are often passed as callbacks to allow child components to communicate events back up to their parents). In large applications, passing props down through many levels of nested components—a problem known as 'prop drilling'—can become tedious, which is typically resolved using React's Context API or dedicated state management solutions like Redux."
      }
    ];
  }
  
  if (titleLower.includes("business") || titleLower.includes("management") || titleLower.includes("strategy")) {
    if (lessonId === 1) {
      return [
        {
          title: "Lecture 1: Strategic Vision and Objectives",
          content: "Strategic planning is the comprehensive process by which an organization defines its long-term direction, allocates resources, and sets priorities to achieve its goals. A company's strategic vision describes what the organization aspires to become in the future, providing inspiration and a clear destination, while its mission statement explains the company's core purpose and why it exists in the present. To turn these high-level aspirations into reality, organizations establish specific, measurable, achievable, relevant, and time-bound (SMART) strategic objectives. These objectives align departmental actions, set clear performance benchmarks, and create a unified corporate trajectory, ensuring that all employees and resources work toward the same overall strategic endpoints."
        },
        {
          title: "Lecture 2: SWOT Analysis Framework",
          content: "SWOT analysis is a widely used strategic planning tool designed to identify and evaluate an organization's internal Strengths and Weaknesses, as well as its external Opportunities and Threats. Internal factors (Strengths and Weaknesses) are within the organization's control, such as proprietary technology, skilled staff, brand reputation, or operational inefficiencies. External factors (Opportunities and Threats) arise from the broader market environment, including technological advancements, competitor moves, regulatory changes, or economic shifts. By conducting a SWOT analysis, a business can develop strategies to build upon its strengths, address or mitigate its weaknesses, capitalize on emerging market opportunities, and defend against potential external threats, creating a balanced and proactive strategic plan."
        },
        {
          title: "Lecture 3: Competitive Advantage Theories",
          content: "Michael Porter's Generic Strategies outline the three fundamental paths an organization can take to achieve a sustainable competitive advantage: Cost Leadership, Differentiation, and Focus. Cost Leadership involves becoming the lowest-cost producer in the industry, allowing the firm to either underprice competitors or generate higher profit margins at average prices. Differentiation requires developing unique products or services that customers perceive as superior, justifying a premium price. Focus strategies target a narrow, specific market segment or niche, tailoring operations to serve that group exceptionally well through either cost focus or differentiation focus. Porter warns that firms must choose one of these strategies; failing to do so leads to being 'stuck in the middle' without a clear market position or competitive advantage."
        }
      ];
    }
    if (lessonId === 2) {
      return [
        {
          title: "Lecture 1: Organizational Design and Structures",
          content: "Organizational design is the formal process of structuring roles, relationships, responsibilities, and communication flows within an enterprise. A company's structure determines how work is coordinated, how decisions are made, and how authority is delegated across different levels. Common organizational models include functional structures (grouped by specialty, such as marketing, finance, and engineering), divisional structures (organized around specific products, client segments, or geographic regions), and matrix structures (which combine reporting lines, forcing employees to report to both functional and project managers). Selecting and designing the appropriate structure is critical because it directly impacts operational efficiency, employee collaboration, and the organization's overall ability to respond quickly to market changes."
        },
        {
          title: "Lecture 2: Leadership Styles and Decision Frameworks",
          content: "Effective management requires leaders to adapt their styles to the specific needs of their teams and the situations they face, a concept known as situational leadership. Classic leadership styles range from autocratic (centralized decision-making with little input from others) to democratic (collaborative decision-making involving team consensus) and laissez-faire (highly delegated, hands-off management). To make sound choices under pressure, managers rely on formal decision-making frameworks, such as the Vroom-Yetton-Jago Decision Model, which helps leaders determine whether to make a decision unilaterally, consult with key individuals, or delegate the decision to a group. Applying the right leadership style and decision framework boosts employee morale, builds trust, and ensures strategic alignment."
        },
        {
          title: "Lecture 3: Change Management Models",
          content: "Implementing strategic shifts or new operational processes often meets resistance from employees, making formal change management models essential for successful corporate transitions. Kurt Lewin's classic three-stage Change Model provides a simple framework: Unfreezing (preparing the organization to accept change by breaking down complacency), Changing (implementing the new workflows, structures, or technologies), and Refreezing (stabilizing and reinforcing the new state so it becomes part of the culture). Another popular framework, McKinsey's 7S model, emphasizes that seven internal elements—Strategy, Structure, Systems, Shared Values, Style, Staff, and Skills—must be aligned for change to succeed. Proactive communication, stakeholder engagement, and clear training programs are vital to mitigate friction and ensure long-term adoption."
        }
      ];
    }
    return [
      {
        title: "Lecture 1: Financial Statement Basics",
        content: "To evaluate organizational performance and make sound strategic decisions, managers must understand and interpret the three core financial statements: the Balance Sheet, the Income Statement, and the Cash Flow Statement. The Balance Sheet provides a snapshot of a company's financial position at a specific point in time, showing what it owns (Assets), what it owes (Liabilities), and the owner's residual interest (Equity), following the equation Assets = Liabilities + Equity. The Income Statement summarizes revenue, expenses, and net profit over a specific period, illustrating the firm's operating profitability. The Cash Flow Statement tracks the actual inflows and outflows of cash from operating, investing, and financing activities, which is critical because a profitable company can still fail if it runs out of cash to pay its short-term obligations."
      },
      {
        title: "Lecture 2: Capital Budgeting & NPV",
        content: "Capital budgeting is the strategic process that organizations use to evaluate, rank, and select major long-term investments and expenditures, such as building a new factory, buying equipment, or launching a new product line. A primary tool in capital budgeting is Net Present Value (NPV), which calculates the current value of all expected future cash inflows generated by the project, discounted by a target cost of capital rate, and subtracts the project's initial cash outlay. If a project's NPV is positive, it means the investment is expected to generate returns exceeding the cost of capital, thereby increasing shareholder wealth, and should be approved. Other metrics like Internal Rate of Return (IRR) and payback periods are also used to assess investment feasibility."
      },
      {
        title: "Lecture 3: Performance Metrics and Balanced Scorecard",
        content: "Relying solely on historical financial metrics like net profit or ROI can lead to short-sighted management decisions, which is why Kaplan and Norton developed the Balanced Scorecard framework. The Balanced Scorecard measures organizational performance across four balanced perspectives: Financial (how do we look to shareholders?), Customer (how do customers see us?), Internal Business Processes (what must we excel at?), and Learning and Growth (how can we continue to improve and create value?). By establishing Key Performance Indicators (KPIs) for each of these four dimensions, a company can map its long-term strategic objectives directly to daily operational metrics. This ensures that short-term actions are aligned with long-term strategic success, fostering continuous improvement."
      }
    ];
  }
  
  if (titleLower.includes("law") || titleLower.includes("ethics") || titleLower.includes("contract")) {
    if (lessonId === 1) {
      return [
        {
          title: "Lecture 1: Elements of a Binding Contract",
          content: "A contract is a legally enforceable agreement between two or more parties that creates mutual obligations, and for it to be binding under common law, it must contain four essential elements. The first is an Offer, which is a clear, unambiguous statement of terms showing an intention to enter into a contract once accepted. The second is Acceptance, which must be a 'mirror image' of the offer, indicating complete agreement without any modifications or counter-offers. The third element is Consideration, which represents something of value exchanged between the parties (e.g., money, goods, services, or a promise to act or refrain from acting), demonstrating that the agreement is a bargain and not a mere gift. Finally, there must be Mutual Assent, meaning both parties have a meeting of the minds and intend to be legally bound. While some oral contracts are enforceable, certain agreements (like real estate sales) must be in writing to comply with the Statute of Frauds."
        },
        {
          title: "Lecture 2: Breach of Contract & Remedies",
          content: "A breach of contract occurs when one party fails to perform their agreed-upon obligations without a valid legal excuse, which can range from minor deviations to a material breach that defeats the entire purpose of the contract. When a breach occurs, the non-breaching party is entitled to seek legal remedies, which are typically aimed at placing them in the position they would have been in had the contract been fully performed. The most common remedy is compensatory damages, which are monetary awards covering direct financial losses resulting from the breach. In unique situations where money is insufficient (such as contracts for the sale of a rare piece of land), a court may order specific performance, forcing the breaching party to carry out their exact obligations. Other remedies include rescission, which cancels the contract and returns both parties to their pre-contractual positions, and restitution, which returns any benefits conferred."
        },
        {
          title: "Lecture 3: Contract Interpretation and Boilerplate",
          content: "When contract disputes arise, courts are tasked with interpreting the agreement's terms, and they generally apply the plain meaning rule, which dictates that words should be given their ordinary dictionary definition unless the contract explicitly defines them otherwise. If terms are ambiguous, courts may look to the parties' past dealings or industry standards to clarify intent, but the parol evidence rule generally bars the introduction of outside oral agreements that contradict a final, written contract. To minimize ambiguity, contracts conclude with boilerplate clauses, which are standard, highly important administrative provisions. These include choice of law clauses (specifying which state's laws govern disputes), severability clauses (stating that if one provision is found illegal, the rest remains in force), and force majeure clauses (excusing performance in the event of extraordinary, unforeseen events like natural disasters)."
        }
      ];
    }
    if (lessonId === 2) {
      return [
        {
          title: "Lecture 1: Tort Law Fundamentals",
          content: "Tort law deals with civil wrongs—other than breaches of contract—that cause harm, injury, or loss to individuals or their property, resulting in legal liability for which the injured party can seek monetary damages. The most common category of tort is negligence, which requires a plaintiff to prove four distinct elements to establish liability: Duty of Care (the defendant owed a legal obligation to act reasonably), Breach of Duty (the defendant failed to meet the standard of care expected of a reasonable person), Causation (the defendant's breach was both the factual and proximate cause of the injury), and actual Damages (the plaintiff suffered real physical, emotional, or financial harm). Beyond negligence, tort law also covers intentional torts—such as battery, trespass, and defamation—where the defendant acted with the intent to cause harm or violate rights."
        },
        {
          title: "Lecture 2: Product and Strict Liability",
          content: "Strict liability is a legal doctrine that imposes liability on a defendant for damages or injuries without requiring the plaintiff to prove negligence, fault, or intent to cause harm. This doctrine is typically applied to activities that are considered inherently dangerous or hazardous (such as blasting with dynamite or keeping wild animals) where the risk of harm cannot be eliminated even with extreme care. In commercial law, strict liability governs product liability, holding manufacturers, distributors, and retailers liable if a consumer is injured by a defective product. Product defects fall into three categories: manufacturing defects (flaws that occur during production), design defects (inherent hazards in the product's blueprint), and warning defects (inadequate instructions or failure to warn of non-obvious dangers). The plaintiff only needs to prove that the product was defective and unreasonably dangerous when it left the defendant's control, and that it caused the injury."
        },
        {
          title: "Lecture 3: Intellectual Property Protections",
          content: "Intellectual property (IP) law protects creations of the human mind, giving inventors, artists, and businesses exclusive rights to use and profit from their innovations for a specified period, thereby encouraging research and development. There are four primary types of IP protection: Patents (which safeguard novel, useful, and non-obvious inventions and processes for 20 years), Copyrights (which protect original creative expressions like books, music, and software code, typically lasting for the creator's lifetime plus 70 years), Trademarks (which protect distinctive brand names, logos, and symbols used in commerce to prevent consumer confusion), and Trade Secrets (which protect valuable proprietary information, like Coca-Cola's formula, as long as it remains secret and reasonable security measures are maintained). Securing and enforcing these IP rights establishes crucial legal barriers, preventing competitors from copying innovations and maintaining market value."
        }
      ];
    }
    return [
      {
        title: "Lecture 1: Corporate Governance Frameworks",
        content: "Corporate governance is the comprehensive system of rules, practices, and processes by which a company is directed, controlled, and administered, balancing the interests of a company's many stakeholders, including shareholders, management, customers, suppliers, and the community. The board of directors is the central authority in corporate governance, elected by shareholders to oversee executive management and ensure that the corporation acts in the long-term interest of its owners. Board directors owe two fundamental fiduciary duties to the corporation and its shareholders: the Duty of Care (requiring them to make informed, prudent decisions after reviewing all relevant information) and the Duty of Loyalty (requiring them to act in good faith and avoid conflicts of interest or personal enrichment). Under the business judgment rule, courts will not second-guess directors' decisions if they were made in good faith, with care, and without conflicts."
      },
      {
        title: "Lecture 2: Regulatory Compliance and Compliance Programs",
        content: "Modern corporations operate in a complex legal landscape and must comply with a vast array of federal, state, and international regulations, including environmental protection laws, antitrust regulations, fair labor standards, and strict data privacy mandates (like GDPR). To navigate these requirements, companies establish formal corporate compliance programs, which are structured systems of internal policies, employee training, and auditing procedures designed to detect and prevent illegal activity. A compliance program typically includes a code of business conduct, anonymous whistleblower hotlines, regular risk assessments, and independent oversight by a Chief Compliance Officer. Under the Federal Sentencing Guidelines, having an active and effective compliance program can significantly reduce the financial and criminal penalties imposed on a corporation if an employee commits an unauthorized violation."
      },
      {
        title: "Lecture 3: Business Ethics and Corporate Social Responsibility",
        content: "Business ethics examines the moral principles and values that guide decision-making in the commercial world, helping managers resolve dilemmas where legal guidelines might be silent or ambiguous. Ethical decision-making typically draws on major philosophical frameworks, such as Utilitarianism (seeking the greatest good for the greatest number of people), Deontology (focusing on duty and adherence to universal rules), and Virtue Ethics (focusing on character and integrity). Closely related is Corporate Social Responsibility (CSR), which asserts that businesses must balance profit-maximizing activities with efforts to support societal well-being and environmental sustainability. Stakeholder theory supports this view by arguing that corporate managers owe fiduciary-like responsibilities to all parties affected by their operations—including employees, customers, and local communities—not just to the financial shareholders."
      }
    ];
  }
  
  if (titleLower.includes("robotics") || titleLower.includes("engineering") || titleLower.includes("kinematics") || titleLower.includes("control")) {
    if (lessonId === 1) {
      return [
        {
          title: "Lecture 1: Spatial Transformations & Rotations",
          content: "Robotic systems operate and interact in three-dimensional physical space, requiring robust mathematical systems to describe the position and orientation of their linkages relative to their environment. Homogeneous transformation matrices (4x4 matrices combining a 3x3 rotation matrix and a 3x1 translation vector) are the standard mathematical tool used to convert local coordinate frames of joint linkages into the global world coordinate frame. Describing rotations in 3D is complex, and while Euler angles (roll, pitch, yaw) are intuitive, they suffer from mathematical singularities known as gimbal lock, where a degree of freedom is lost when two axes align. To prevent gimbal lock and enable smooth interpolation of robotic motions, modern control algorithms use unit quaternions, which represent rotations in a 4-dimensional hyper-sphere, ensuring stable calculations."
        },
        {
          title: "Lecture 2: Forward Kinematics (Denavit-Hartenberg)",
          content: "Forward kinematics is the process of calculating the exact position and orientation of a robot's end-effector (such as a mechanical gripper or welding tool) relative to its base frame, given the robot's joint angles and link lengths. To standardize this modeling process across robots with different joint configurations, the Denavit-Hartenberg (DH) convention is widely used, representing each joint linkage with four parameters: link length, link twist, link offset, and joint angle. By systematically establishing coordinate frames at each joint according to DH rules, developers can write homogeneous transformation matrices for each link. Multiplying these matrices in sequence from the base to the tip yields a single transformation matrix that describes the final position of the end-effector."
        },
        {
          title: "Lecture 3: Inverse Kinematics Challenges",
          content: "Unlike forward kinematics, which has a single unique solution, inverse kinematics is the process of determining the joint angles required to position the robot's end-effector at a specific target coordinate in 3D space. This is a highly challenging mathematical problem because, depending on the robot's structure, a target position may have zero solutions (if the target is out of reach), a single solution, or multiple redundant solutions (e.g., an arm with seven joints can reach the same point using infinite joint configurations). Solving inverse kinematics requires complex algebraic, geometric, or numerical optimization methods, and the algorithms must run in real time while avoiding joint limits, collisions, and kinematic singularities—points where the robot loses the ability to move in certain directions."
        }
      ];
    }
    if (lessonId === 2) {
      return [
        {
          title: "Lecture 1: PID Feedback Control Systems",
          content: "Feedback control is the process of adjusting actuator inputs dynamically to keep a system's output close to a desired target state despite external disturbances, and the Proportional-Integral-Derivative (PID) controller is the most common algorithm used. The PID controller calculates an error value as the difference between the desired setpoint and the measured process variable, applying corrections based on three terms. The Proportional term (P) produces an output proportional to the current error, providing the main driving force but leaving a small steady-state error. The Integral term (I) accumulates past errors over time, increasing correction to eliminate steady-state offset completely. The Derivative term (D) estimates the future rate of error change, dampening the control response to prevent overshoot and oscillations. Tuning these three gains is a critical engineering challenge to balance speed with stability."
        },
        {
          title: "Lecture 2: Trajectory Planning & Interpolation",
          content: "Trajectory planning is the process of defining the exact path, velocity, and acceleration profiles that a robot must follow to move from a start position to a goal position smoothly. To prevent mechanical vibration, joint wear, and actuator saturation, trajectories must have continuous first and second derivatives, ensuring smooth velocity and acceleration curves. Common methods include cubic splines and quintic polynomials to interpolate joint positions, or trapezoidal velocity profiles which combine constant acceleration, constant velocity, and constant deceleration phases. Dynamic constraints must also be factored in, ensuring that the required joint torques calculated from the robot's mass properties do not exceed the physical limits of the motors."
        },
        {
          title: "Lecture 3: Sensors and State Estimation",
          content: "Robots rely on sensors to perceive their internal state and external environment, utilizing rotary encoders to measure joint angles, Inertial Measurement Units (IMUs) to sense accelerations, and LIDAR or cameras to detect surrounding obstacles. However, all physical sensors suffer from noise, bias, and calibration errors, making raw measurements unreliable for precise control (for example, integrating accelerometer data directly causes rapid position drift). State estimation is the engineering discipline of combining multiple noisy sensor streams mathematically to compute the robot's true state, with the Kalman Filter and its variants (like the Extended Kalman Filter for non-linear systems) serving as the industry standard. These filters utilize a physical model of the robot to weigh sensor measurements dynamically, producing a highly accurate estimate."
        }
      ];
    }
    return [
      {
        title: "Lecture 1: Robot Operating System (ROS) Architecture",
        content: "The Robot Operating System (ROS) is not a traditional operating system but rather a flexible middleware framework that provides a collection of tools, libraries, and conventions to simplify the task of building complex robot software. ROS operates on a distributed graph of modular processes called Nodes, which communicate asynchronously by publishing and subscribing to named Topics, or synchronously via Services (blocking call-response) and Actions (non-blocking, long-running goals with feedback). This modular design allows developers to write independent nodes for sensor processing, path planning, and motor control, and run them on different processors or computers. ROS packages provide standardized message structures for common robotic data types (like laser scans and joint states), allowing code reuse across different hardware platforms."
      },
      {
        title: "Lecture 2: Simultaneous Localization and Mapping (SLAM)",
        content: "Simultaneous Localization and Mapping (SLAM) is a core autonomous navigation capability, enabling a robot to construct a map of an unknown environment while simultaneously tracking its own location within that map. SLAM is a complex chicken-and-egg problem: the robot needs a map to know where it is, but it needs to know where it is to build a map. Algorithms solve this by matching sensor data (like LIDAR scans or camera features) over time, identifying landmarks, and using probability models to estimate the robot's trajectory and the map structure. Graph-based SLAM models the robot's path as a network of nodes connected by relative motion constraints, optimizing the graph to minimize error when loops are closed (returning to a previously mapped area)."
      },
      {
        title: "Lecture 3: Robot Actuators and Power Systems",
        content: "Actuators are the muscles of a robot, converting electrical energy from power systems into mechanical motion to drive the robot's joints, with DC motors, brushless servo motors, and stepper motors being the most common choices. To control these actuators, microcontrollers send low-power Pulse-Width Modulation (PWM) signals to H-bridge circuits, which scale the average voltage delivered to the motors to adjust speed and direction. Power systems must be designed to handle high current spikes drawn by motors during rapid acceleration while maintaining a stable voltage supply for sensitive onboard sensors and computers. Battery Management Systems (BMS) monitor battery cell voltages and temperatures, preventing over-discharge and thermal runaway, while dynamic torque calculations ensure actuators are sized correctly to handle target payloads."
      }
    ];
  }

  // General Fallback
  return [
    {
      title: `Lecture 1: Core Foundations of ${courseTitle}`,
      content: `Welcome to the first lesson of this course. This lecture establishes the core foundations, historical development, and primary objectives of studying ${courseTitle} in today's professional landscape. We will start by defining the key vocabulary, fundamental principles, and essential models that form the backbone of this domain, ensuring you have the baseline knowledge necessary to tackle advanced topics. We will also examine case studies of how this field has evolved to resolve modern industrial and theoretical challenges, highlighting the cross-disciplinary connections to other subjects. By understanding the core scope and the overarching goals of ${courseTitle}, you will build a solid cognitive framework. This groundwork is vital to prepare you for the checkpoints and quizzes that follow.`
    },
    {
      title: "Lecture 2: Applied Workflows & Industry Practices",
      content: `This lecture focuses on the practical application of theories, looking at standard workflows, procedures, and tools used by industry experts in the field of ${courseTitle}. We will walk through step-by-step implementations, highlighting how to transition from abstract concepts to execution. Key topics include recognizing common failure modes, adhering to quality control standards, and leveraging modern software tools to optimize operational workflows. Real-world case studies will be analyzed to demonstrate how strategic decisions are executed, resources are managed, and problems are resolved under pressure. Students are strongly encouraged to connect these structural patterns directly to the coding exercises and practical scenarios provided in the classroom.`
    },
    {
      title: "Lecture 3: Advanced Analysis & Assessment Criteria",
      content: `We conclude this lesson by exploring advanced analysis techniques, diagnostic metrics, and evaluation criteria crucial to mastering ${courseTitle}. This lecture covers how to measure performance, analyze data, and run optimization algorithms to refine outcomes in complex systems. We will review how different variables, constraints, and models interact, preparing you to make informed decisions and troubleshoot issues. Additionally, we will review the critical assessment criteria that will be evaluated in the upcoming lesson quiz, highlighting key concepts you must commit to memory. Thoroughly studying these analytical details will not only help you score high on the quiz but will also give you the critical-thinking skills required to apply these principles successfully.`
    }
  ];
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params ? Number(params.id) : null;

  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Purchase/Enrollment state
  const [isPurchased, setIsPurchased] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Certificate state
  const [showCertModal, setShowCertModal] = useState(false);
  const [studentName, setStudentName] = useState("");

  // Gamified lessons progress states
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<"map" | "quiz" | "gameover" | "victory" | "materials">("map");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});
  const [expandedLectureIdx, setExpandedLectureIdx] = useState<number | null>(null);
  
  // Semantic Web reasoning states
  const [student, setStudent] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [lastQuizScore, setLastQuizScore] = useState(0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);

  // Course Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (courseId) {
        const data = await getCourseById(courseId);
        setCourse(data);

        // Load profile data
        try {
          const activeStudent = await getCurrentStudent();
          setStudent(activeStudent);
          if (activeStudent) {
            setStudentName(activeStudent.name);
            const profileData = await getStudentProfileData();
            setProfile(profileData);
          }
        } catch (e) {
          console.error("Failed to load student details:", e);
        }

        // Load progress from localStorage
        const savedProgress = localStorage.getItem(`course_${courseId}_completed`);
        if (savedProgress) {
          setCompletedLessons(JSON.parse(savedProgress));
        }
        const savedRevision = localStorage.getItem(`course_${courseId}_revision`);
        if (savedRevision) {
          setWrongAnswers(JSON.parse(savedRevision));
        }

        // Load active learning paths (enrolled items)
        const enrolled = await getLearningPathItems();
        const enrolledIds = enrolled.map((item: any) => item.id);
        setIsPurchased(enrolledIds.includes(courseId));
      }
      setLoading(false);
    }
    loadData();
  }, [courseId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEnrollDirect = async () => {
    if (!course) return;
    const res = await enrollInCourse(course.id);
    if (res.success) {
      showToast("Course added to your learning path!");
      setIsPurchased(true);
    } else {
      showToast(res.error || "Please log in first.");
    }
  };

  const handleAddToWishlist = async () => {
    if (!course) return;
    const res = await addToWishlist(course.id);
    if (res.success) {
      showToast("Course saved to wishlist!");
    } else {
      showToast(res.error || "Please log in first.");
    }
  };

  // Enroll function inside the modal
  const handleEnroll = async () => {
    if (!course) return;
    const res = await enrollInCourse(course.id);
    if (res.success) {
      setIsPurchased(true);
      setShowPurchaseModal(false);
      showToast("🎉 Enrolled successfully! Learning path active.");
    } else {
      showToast(res.error || "Please log in first.");
    }
  };

  // Game functions
  const handleLessonClick = (lesson: Lesson) => {
    // Only Lesson 1 is playable for free. Lesson 2 and 3 require enrollment in your learning path.
    if (lesson.id === 1 || isPurchased) {
      setActiveLesson(lesson);
      setQuizState("materials");
    } else {
      setShowPurchaseModal(true);
    }
  };

  const completeLessonAlternative = () => {
    if (!activeLesson) return;

    // 1. Add to completed lessons
    const newCompleted = [...completedLessons];
    if (!newCompleted.includes(activeLesson.id)) {
      newCompleted.push(activeLesson.id);
      setCompletedLessons(newCompleted);
      localStorage.setItem(`course_${courseId}_completed`, JSON.stringify(newCompleted));
    }

    // 2. Set all tested concepts to 100% mastery
    const skillsPerf: Record<string, number> = {};
    activeLesson.questions.forEach((q) => {
      const concept = q.concept || "GeneralConcept";
      skillsPerf[concept] = 100;
    });

    // 3. Save result to database with 100% score
    if (courseId) {
      saveQuizResult(courseId, activeLesson.id, 100, skillsPerf).then(res => {
        if (res.success) {
          console.log("Alternative lesson completion saved:", res);
        } else {
          console.error("Failed to save completion:", res.error);
        }
      });
    }

    // 4. Set state to victory!
    setQuizState("victory");
  };

  const startQuiz = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setQuizState("quiz");
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsAnswerCorrect(false);
    setHearts(3);
    setScore(0);
    setQuizAnswers({});
  };

  const checkAnswer = () => {
    if (!activeLesson || selectedOption === null) return;
    const currentQuestion = activeLesson.questions[currentQuestionIdx];
    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsAnswerChecked(true);
    setIsAnswerCorrect(correct);

    // Track answer for this question index
    setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: correct }));

    if (correct) {
      setScore((prev) => prev + 100);
    } else {
      setHearts((prev) => Math.max(0, prev - 1));

      // Add to revision list if not already present
      if (!wrongAnswers.some((q) => q.questionText === currentQuestion.questionText)) {
        const updatedRevision = [...wrongAnswers, currentQuestion];
        setWrongAnswers(updatedRevision);
        localStorage.setItem(`course_${courseId}_revision`, JSON.stringify(updatedRevision));
      }
    }
  };

  const nextQuestion = () => {
    if (!activeLesson) return;

    if (hearts <= 0) {
      setQuizState("gameover");
      return;
    }

    if (currentQuestionIdx + 1 >= activeLesson.questions.length) {
      // Completed last question
      const newCompleted = [...completedLessons];
      if (!newCompleted.includes(activeLesson.id)) {
        newCompleted.push(activeLesson.id);
        setCompletedLessons(newCompleted);
        localStorage.setItem(`course_${courseId}_completed`, JSON.stringify(newCompleted));
      }

      // Calculate skills performance
      const finalAnswers = { ...quizAnswers, [currentQuestionIdx]: isAnswerCorrect };
      const conceptStats: Record<string, { correct: number; total: number }> = {};
      
      activeLesson.questions.forEach((q, idx) => {
        const isCorrect = !!finalAnswers[idx];
        const concept = q.concept || "GeneralConcept";
        if (!conceptStats[concept]) {
          conceptStats[concept] = { correct: 0, total: 0 };
        }
        conceptStats[concept].total += 1;
        if (isCorrect) {
          conceptStats[concept].correct += 1;
        }
      });

      const skillsPerf: Record<string, number> = {};
      let totalCorrect = 0;
      Object.entries(conceptStats).forEach(([concept, stats]) => {
        skillsPerf[concept] = Math.round((stats.correct / stats.total) * 100);
        totalCorrect += stats.correct;
      });

      const finalScorePct = Math.round((totalCorrect / activeLesson.questions.length) * 100);
      setLastQuizScore(finalScorePct);

      const strList: string[] = [];
      const weakList: string[] = [];
      Object.entries(skillsPerf).forEach(([concept, score]) => {
        if (score >= 70) strList.push(concept);
        else weakList.push(concept);
      });
      setStrengths(strList);
      setWeaknesses(weakList);

      // Save to database
      if (courseId) {
        saveQuizResult(courseId, activeLesson.id, finalScorePct, skillsPerf).then(res => {
          if (res.success) {
            console.log("Quiz result saved to database:", res);
            const studentId = student?.id || (res as any).studentId;
            if (studentId) {
              getRecommendations(studentId).then(recs => {
                setRecommendedCourses(recs);
              });
            }
          } else {
            console.error("Failed to save quiz result:", res.error);
          }
        });
      }

      setQuizState("victory");
    } else {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setIsAnswerCorrect(false);
    }
  };

  const retryLesson = () => {
    if (activeLesson) {
      startQuiz(activeLesson);
    }
  };

  const startRevisionQuiz = () => {
    if (wrongAnswers.length === 0) return;
    const tempLesson: Lesson = {
      id: 99,
      title: "Custom Revision Session",
      description: "Practice questions you previously got wrong.",
      questions: wrongAnswers
    };
    startQuiz(tempLesson);
  };

  const clearRevisionList = () => {
    setWrongAnswers([]);
    localStorage.removeItem(`course_${courseId}_revision`);
    showToast("Revision queue cleared!");
  };

  const handleSubmitReview = async () => {
    if (!course || reviewRating === 0 || !reviewText.trim()) return;
    setReviewSubmitting(true);
    setReviewError(null);
    const res = await submitCourseReview(course.id, reviewRating, reviewText.trim());
    setReviewSubmitting(false);
    if (res.success) {
      setReviewSubmitted(true);
      showToast("✅ Review submitted! Thank you for your feedback.");
    } else {
      setReviewError(res.error || "Failed to submit review.");
    }
  };

  // Dynamic Printable Study Guide PDF Generator
  const generateStudyGuidePDF = () => {
    if (!course) return;
    const lessons = getLessonsForCourse(course.id, course.category_name, course.subcategory_name);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocked! Allow popups to generate PDF.");
      return;
    }

    const lessonsHtml = lessons.map((lesson) => {
      const questionsHtml = lesson.questions.map((q, idx) => `
        <div class="question-block">
          <p class="question-text"><strong>Q${idx + 1}: ${q.questionText}</strong></p>
          <ul class="options-list">
            ${q.options.map(opt => `
              <li class="${opt === q.correctAnswer ? 'correct-option' : ''}">
                ${opt} ${opt === q.correctAnswer ? '✓ (Correct Answer)' : ''}
              </li>
            `).join('')}
          </ul>
          <p class="explanation-box"><strong>Explanation:</strong> ${q.explanation}</p>
        </div>
      `).join('');

      return `
        <div class="lesson-section">
          <h2>${lesson.title}</h2>
          <p class="lesson-desc"><em>${lesson.description}</em></p>
          ${questionsHtml}
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Study Guide - ${course.title}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            h1 {
              color: #4f46e5;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 10px;
              font-size: 28px;
            }
            h2 {
              color: #0f172a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
              margin-top: 30px;
              font-size: 20px;
            }
            .lesson-desc {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .question-block {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .question-text {
              margin-top: 0;
              font-size: 16px;
              color: #0f172a;
            }
            .options-list {
              list-style: none;
              padding-left: 0;
            }
            .options-list li {
              padding: 8px 12px;
              border-radius: 6px;
              margin-bottom: 6px;
              font-size: 14px;
              border: 1px solid #e2e8f0;
            }
            .correct-option {
              background-color: #d1fae5;
              border-color: #10b981 !important;
              color: #065f46;
              font-weight: 600;
            }
            .explanation-box {
              background-color: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 10px 15px;
              font-size: 13px;
              color: #1e3a8a;
              margin-top: 15px;
              border-radius: 0 8px 8px 0;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .question-block { box-shadow: none; border-color: #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <h1>Study Guide & Workbook</h1>
          <p><strong>Course:</strong> ${course.title}</p>
          <p><strong>Instructor:</strong> ${course.instructor}</p>
          <hr />
          ${lessonsHtml}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Dynamic Printable Lecture Notes PDF Generator
  const handleGeneratePDF = () => {
    if (!course || !activeLesson) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocked! Allow popups to generate PDF.");
      return;
    }
    
    const lectures = getLecturesForCourse(course.title, activeLesson.id);
    const totalPages = lectures.length + 1; // lectures + cover page
    
    // Cover page HTML
    const coverPageHtml = `
      <div class="pdf-page cover-page">
        <div class="cover-accent"></div>
        <div class="cover-content">
          <div class="cover-tag">COURSE LECTURE NOTES</div>
          <h1 class="cover-title">${course.title}</h1>
          <h2 class="cover-subtitle">${activeLesson.title}</h2>
          <div class="cover-divider"></div>
          <div class="cover-meta">
            <div class="meta-item">
              <span class="meta-label">Institution</span>
              <span class="meta-val">LearnWise Academy</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Curriculum</span>
              <span class="meta-val">Semantic Web Personalized Learning Path</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Generated On</span>
              <span class="meta-val">${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <div class="pdf-footer">
          <span>LearnWise Personalized Learning Platform</span>
          <span>Page 1 of ${totalPages}</span>
        </div>
      </div>
    `;

    // Lecture pages HTML
    const lecturesHtml = lectures.map((lec, idx) => {
      // Parse inline backticks to code tags
      let htmlContent = lec.content.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
      
      // Split into sentences using a regex lookbehind so periods are kept
      const sentences = htmlContent.split(/(?<=\.)\s+/);
      
      let bodyHtml = '';
      let takeawayHtml = '';
      
      if (sentences.length > 2) {
        const lastSentence = sentences[sentences.length - 1];
        const otherSentences = sentences.slice(0, -1);
        
        // Split other sentences into two equal paragraphs if there are at least two sentences
        const mid = Math.ceil(otherSentences.length / 2);
        const p1 = otherSentences.slice(0, mid).join(' ');
        const p2 = otherSentences.slice(mid).join(' ');
        
        bodyHtml = `<p>${p1}</p><p>${p2}</p>`;
        takeawayHtml = `
          <div class="key-takeaway">
            <div class="takeaway-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></svg>
              CLASSROOM DISCUSSION & TAKEAWAY
            </div>
            <p>${lastSentence}</p>
          </div>
        `;
      } else {
        bodyHtml = `<p>${htmlContent}</p>`;
      }
      
      return `
        <div class="pdf-page">
          <div class="pdf-header">
            <span class="course-title">${course.title}</span>
            <span class="lesson-title">${activeLesson.title}</span>
          </div>
          <div class="pdf-content">
            <div class="lecture-number">LECTURE ${idx + 1}</div>
            <h1 class="lecture-title">${lec.title}</h1>
            <div class="lecture-body">
              ${bodyHtml}
              ${takeawayHtml}
            </div>
          </div>
          <div class="pdf-footer">
            <span>LearnWise Personalized Learning Platform</span>
            <span>Page ${idx + 2} of ${totalPages}</span>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${course.title} - ${activeLesson.title} Lecture Notes</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;850&family=Fira+Code:wght@400;500&display=swap');
            
            @page {
              size: A4;
              margin: 0;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .pdf-page {
              width: 210mm;
              height: 297mm;
              box-sizing: border-box;
              padding: 25mm 22mm 25mm 22mm;
              position: relative;
              background: white;
              display: flex;
              flex-direction: column;
              page-break-after: always;
              page-break-inside: avoid;
            }
            
            @media screen {
              body {
                background-color: #f1f5f9;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px 0;
              }
              .pdf-page {
                margin-bottom: 20px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                border-radius: 12px;
              }
            }
            
            /* Cover Page Styling */
            .cover-page {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: flex-start;
              padding: 45mm 25mm 30mm 25mm;
            }
            .cover-accent {
              width: 16mm;
              height: 4px;
              background-color: #4f46e5;
              margin-bottom: 8mm;
              border-radius: 2px;
            }
            .cover-tag {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.15em;
              color: #4f46e5;
              text-transform: uppercase;
              margin-bottom: 4mm;
            }
            .cover-title {
              font-size: 32px;
              font-weight: 850;
              color: #0f172a;
              margin: 0 0 4mm 0;
              line-height: 1.15;
              letter-spacing: -0.03em;
            }
            .cover-subtitle {
              font-size: 18px;
              font-weight: 600;
              color: #475569;
              margin: 0 0 12mm 0;
              line-height: 1.3;
            }
            .cover-divider {
              width: 100%;
              height: 1px;
              background-color: #e2e8f0;
              margin-bottom: 15mm;
            }
            .cover-meta {
              display: flex;
              flex-direction: column;
              gap: 6mm;
              margin-bottom: auto;
              width: 100%;
            }
            .meta-item {
              display: flex;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 3mm;
            }
            .meta-label {
              width: 45mm;
              font-size: 10px;
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .meta-val {
              font-size: 13px;
              font-weight: 600;
              color: #334155;
            }
            
            /* Header and Footer */
            .pdf-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 15mm;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
            }
            .pdf-header .course-title {
              max-width: 60%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .pdf-header .lesson-title {
              color: #94a3b8;
            }
            
            .pdf-footer {
              position: absolute;
              bottom: 20mm;
              left: 22mm;
              right: 22mm;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              font-size: 9px;
              font-weight: 500;
              color: #94a3b8;
            }
            
            /* Content Area */
            .pdf-content {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
            }
            
            .lecture-number {
              font-size: 11px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: 0.1em;
              margin-bottom: 4px;
            }
            
            .lecture-title {
              font-size: 22px;
              font-weight: 850;
              color: #0f172a;
              margin-top: 0;
              margin-bottom: 8mm;
              line-height: 1.2;
              letter-spacing: -0.02em;
            }
            
            .lecture-body p {
              margin-top: 0;
              margin-bottom: 5mm;
              font-size: 13px;
              line-height: 1.75;
              color: #334155;
              text-align: justify;
            }
            
            .inline-code {
              font-family: 'Fira Code', monospace;
              background-color: #f1f5f9;
              color: #0f172a;
              padding: 0.4mm 1.2mm;
              border-radius: 4px;
              font-size: 11.5px;
              font-weight: 500;
            }
            
            .key-takeaway {
              background-color: #f8fafc;
              border-left: 4px solid #4f46e5;
              padding: 5mm 6mm;
              margin-top: 8mm;
              border-radius: 0 8px 8px 0;
            }
            .takeaway-title {
              display: flex;
              align-items: center;
              font-size: 11px;
              font-weight: 800;
              color: #4f46e5;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 2mm;
            }
            .key-takeaway p {
              margin: 0;
              font-size: 12.5px;
              line-height: 1.65;
              color: #475569;
              font-style: italic;
              text-align: left;
            }
          </style>
        </head>
        <body>
          ${coverPageHtml}
          ${lecturesHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Printable Certificate HTML Window trigger
  const handlePrintCertificate = () => {
    if (!course) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocked! Allow popups to generate PDF certificate.");
      return;
    }
    const nameToPrint = studentName.trim() || "Distinguished Graduate";

    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate of Completion - ${course.title}</title>
          <style>
            body {
              font-family: 'Inter', 'Outfit', sans-serif;
              background-color: #f8fafc;
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .certificate-container {
              width: 800px;
              height: 550px;
              padding: 40px;
              background-color: #ffffff;
              border: 20px solid #4f46e5; /* indigo border */
              outline: 5px double #a5b4fc; /* double inline gold/blue outline */
              outline-offset: -12px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              box-sizing: border-box;
              text-align: center;
              position: relative;
              page-break-inside: avoid;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: 2px;
              margin-bottom: 25px;
            }
            h1 {
              font-size: 36px;
              color: #0f172a;
              margin: 0 0 10px 0;
              font-family: 'Georgia', serif;
              letter-spacing: 1px;
            }
            .subtitle {
              font-size: 14px;
              text-transform: uppercase;
              color: #64748b;
              letter-spacing: 3px;
              margin-bottom: 30px;
            }
            .presented-to {
              font-size: 13px;
              color: #64748b;
              font-style: italic;
              margin-bottom: 10px;
            }
            .student-name {
              font-size: 32px;
              font-weight: 700;
              color: #4f46e5;
              margin: 0 0 20px 0;
              border-bottom: 2px solid #e2e8f0;
              display: inline-block;
              padding-bottom: 5px;
              min-width: 300px;
              font-family: 'Georgia', serif;
            }
            .outcome {
              font-size: 14px;
              color: #475569;
              max-width: 550px;
              margin: 0 auto 35px auto;
              line-height: 1.6;
            }
            .footer-signatures {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              max-width: 600px;
              margin: 40px auto 0 auto;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }
            .signature-block {
              text-align: center;
              flex: 1;
            }
            .sig-name {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
            }
            .sig-title {
              font-size: 11px;
              color: #64748b;
            }
            .badge {
              width: 70px;
              height: 70px;
              background-color: #fbbf24;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              box-shadow: 0 4px 10px rgba(251,191,36,0.3);
              margin: 0 auto;
            }
            @media print {
              body { background: none; }
              .certificate-container { box-shadow: none; border-color: #4f46e5 !important; }
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="logo">LEARNWISE</div>
            <h1>Certificate of Completion</h1>
            <div class="subtitle">Official Path Certification</div>
            <div class="presented-to">This certificate is proudly presented to</div>
            <div class="student-name">${nameToPrint}</div>
            <div class="outcome">
              for successfully mastering and completing the full curriculum, interactive checkpoints, and practical assessments of the course:
              <br /><strong>${course.title}</strong>
            </div>
            
            <div class="footer-signatures">
              <div class="signature-block">
                <div class="sig-name">${course.instructor}</div>
                <div class="sig-title">Lead Course Instructor</div>
              </div>
              <div class="signature-block" style="display: flex; justify-content: center; align-items: center;">
                <div class="badge">🎓</div>
              </div>
              <div class="signature-block">
                <div class="sig-name">LearnWise Academic Board</div>
                <div class="sig-title">Platform Certification Authority</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm max-w-sm mx-auto">
          <span className="text-5xl block mb-4">⚠️</span>
          <h2 className="text-xl font-bold mb-2">Course not found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">The course you are looking for does not exist or has been removed.</p>
          <Link href="/courses">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- GAME INTERFACES ---

  // 1. Interactive Quiz Game Screen
  if (quizState === "quiz" && activeLesson) {
    const currentQuestion = activeLesson.questions[currentQuestionIdx];
    const progressPercent = Math.round(((currentQuestionIdx) / activeLesson.questions.length) * 100);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
        {/* Game Header */}
        <header className="max-w-4xl w-full mx-auto px-6 py-6 flex items-center justify-between gap-6">
          <button 
            onClick={() => setQuizState("map")}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Exit Classroom"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Progress bar */}
          <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Hearts / Lives indicator */}
          <div className="flex items-center gap-1.5 font-bold text-sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart 
                key={i} 
                className={cn(
                  "h-5 w-5 transition-all duration-300", 
                  i < hearts 
                    ? "fill-rose-500 stroke-rose-500 scale-100" 
                    : "fill-slate-200 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-700 scale-90"
                )} 
              />
            ))}
          </div>
        </header>

        {/* Game Body */}
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 flex flex-col justify-center space-y-6">
          <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Question {currentQuestionIdx + 1} of {activeLesson.questions.length}
          </div>
          
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3.5 pt-4">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrectAnswer = option === currentQuestion.correctAnswer;

              return (
                <button
                  key={option}
                  onClick={() => {
                    if (isAnswerChecked) return;
                    setSelectedOption(option);
                  }}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border-2 transition-all text-sm font-semibold block",
                    !isAnswerChecked && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                    isAnswerChecked && "cursor-default",
                    // 1. Before checking answer (Normal state)
                    !isAnswerChecked && (
                      isSelected
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 shadow-md"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    ),
                    // 2. After checking answer (Feedback colors are forced visible)
                    isAnswerChecked && (
                      isCorrectAnswer
                        ? "border-emerald-500 dark:border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-extrabold"
                        : isSelected
                          ? "border-rose-500 dark:border-rose-500 bg-rose-500/10 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-extrabold"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 opacity-60"
                    )
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isAnswerChecked && isCorrectAnswer && <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">✓</span>}
                    {isAnswerChecked && isSelected && !isCorrectAnswer && <span className="text-rose-600 dark:text-rose-400 font-extrabold">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        {/* Game Footer / Banner */}
        <footer className={cn(
          "w-full py-8 border-t transition-colors duration-300",
          !isAnswerChecked 
            ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800" 
            : isAnswerCorrect 
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-800 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-950/20 border-rose-500/20 text-rose-800 dark:text-rose-400"
        )}>
          <div className="max-w-2xl w-full mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-1">
              {isAnswerChecked && (
                <>
                  <div className="font-extrabold text-base flex items-center gap-1.5">
                    {isAnswerCorrect ? (
                      <>
                        <Sparkles className="h-5 w-5 text-emerald-500" />
                        <span>Excellent Job!</span>
                      </>
                    ) : (
                      <>
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-90">
                    {currentQuestion.explanation}
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end shrink-0">
              {!isAnswerChecked ? (
                <Button
                  disabled={selectedOption === null}
                  onClick={checkAnswer}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-8 rounded-xl shadow-lg disabled:opacity-40 text-xs cursor-pointer"
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className={cn(
                    "text-white font-bold py-5 px-8 rounded-xl shadow-lg text-xs cursor-pointer",
                    isAnswerCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  )}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 1.5. Unified Fixed Learning Materials Interface
  if (quizState === "materials" && activeLesson) {
    const resources = courseId ? getResourcesForCourse(courseId) : null;
    
    // Concrete code and strategic guidelines templates depending on course content
    const getCodeExampleForLesson = (courseTitle: string, lessonId: number): string => {
      const titleLower = courseTitle.toLowerCase();
      if (titleLower.includes("python")) {
        if (lessonId === 1) {
          return `# Lesson 1: Variables and Basic Arithmetic\nuser_name = "Learner"\nuser_age = 25\nscore_percentage = 40.0\n\n# Dynamic output formatting\nprint(f"Hello {user_name}, welcome to Python!")\nprint(f"Initial variables assigned. Tested Concept: PythonVariable")`;
        }
        if (lessonId === 2) {
          return `# Lesson 2: Conditional Branches & Loops\nscores = [85, 40, 90]\nweaknesses = []\n\nfor score in scores:\n    if score < 70:\n        weaknesses.append("PythonVariable")\n\nprint("Knowledge Gap Analysis completed. Detected weaknesses:", weaknesses)`;
        }
        return `# Lesson 3: Reusable Python Functions\ndef evaluate_gap(score):\n    return "hasWeakness" if score < 70 else "mastered"\n\nstatus = evaluate_gap(40)\nprint("Semantic triple prediction:", f"Student1 {status} PythonVariable")`;
      }
      if (titleLower.includes("web") || titleLower.includes("react") || titleLower.includes("html")) {
        if (lessonId === 1) {
          return `<!-- Lesson 1: Semantic HTML5 Structure -->\n<article id="Student1" class="learner">\n  <header>\n    <h1>Learner Profile</h1>\n    <p class="goal">Software Developer</p>\n  </header>\n</article>`;
        }
        if (lessonId === 2) {
          return `/* Lesson 2: CSS flexbox layout alignment */\n.course-container {\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  border: 1px solid var(--slate-200);\n}`;
        }
        return `// Lesson 3: Functional React Component with state\nimport React, { useState } from 'react';\n\nexport function QuizStatus() {\n  const [score, setScore] = useState(40);\n  return <span className={score < 70 ? 'text-rose-500' : 'text-emerald-500'}>\n    Score: {score}%\n  </span>;\n}`;
      }
      if (titleLower.includes("business") || titleLower.includes("management") || titleLower.includes("strategy")) {
        return `Strategic Planning Framework (SWOT):\n- Strength: High core infrastructure capability\n- Weakness: PythonVariable concept gap in robotics integration\n- Opportunity: Reinforcement course recommendations\n- Threat: Skill mismatch in carrier path matching`;
      }
      if (titleLower.includes("law") || titleLower.includes("ethics") || titleLower.includes("contract")) {
        return `Commercial Contract Liability Clause Template:\nSECTION 4.1: SKILL MASTERY REPRESENTATION\n"The Learner warrants that they possess basic Ethics and Contract Law qualifications,\nhaving achieved a passing grade of 70% or above in all assessments."`;
      }
      return `# Engineering Trajectory PID Feedback Control\n# Target coordinates vector space kinematics\nimport math\n\ndef calculate_error(target_y, current_y):\n    error = target_y - current_y\n    # Proportional error calculation\n    return error`;
    };

    const codeExample = getCodeExampleForLesson(course?.title || "", activeLesson.id);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 animate-fade-in">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setQuizState("map")}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Lesson Learning Materials
              </span>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {activeLesson.title}
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-8 pb-12">
          {/* Intro description */}
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Syllabus Study Materials
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeLesson.description}
            </p>
          {/* Study materials main layout */}
          <div className="space-y-6">
            
            {/* 1. Practice Code Examples */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-150 dark:border-slate-800">
                <Sparkles className="h-4 w-4 text-amber-500" />
                1. Practice Code Examples
              </h3>
              <div className="w-full">
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800/80 max-h-[200px] custom-scrollbar">
                  <code>{codeExample}</code>
                </pre>
              </div>
            </div>

            {/* 2. Lecture Notes Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" /> 2. Read Lecture Notes
                </span>
                <button
                  onClick={handleGeneratePDF}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-550 dark:hover:bg-indigo-600 text-white shadow-sm hover:shadow-md hover:shadow-indigo-500/15 active:scale-95 transition-all cursor-pointer border-0"
                >
                  <FileText className="h-3.5 w-3.5 text-white" /> Generate Lecture Notes PDF
                </button>
              </div>

              {/* Lecture list with accordion items */}
              <div className="space-y-3">
                {(() => {
                  const lectures = getLecturesForCourse(course?.title || "", activeLesson.id);
                  return lectures.map((lecture, idx) => {
                    const isOpen = expandedLectureIdx === idx;
                    return (
                      <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all bg-slate-50/30 dark:bg-slate-950/20">
                        <button
                          onClick={() => setExpandedLectureIdx(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-4 font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 text-left cursor-pointer transition-colors border-0 bg-transparent"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            {lecture.title}
                          </span>
                          <ChevronRight className={cn("h-4 w-4 transform transition-transform text-slate-400", isOpen ? "rotate-90" : "")} />
                        </button>
                        {isOpen && (
                          <div className="p-4 pt-0 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 transition-all">
                            {lecture.content}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>

          {/* 3. Start Quiz Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-teal-500/10 rounded-3xl border border-indigo-500/15 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Trophy className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">3. Complete Lesson Assessment Quiz</h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Test your concepts and update your dynamic semantic mastery graph.</p>
              </div>
            </div>
            <Button
              onClick={() => startQuiz(activeLesson)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg text-xs cursor-pointer w-full md:w-auto shrink-0"
            >
              Start Lesson Quiz
            </Button>
          </div>
          </div>
        </main>
      </div>
    );
  }

  // 2. Game Over Interface
  if (quizState === "gameover") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-fade-in-up">
          <span className="text-6xl block">💔</span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Out of Hearts!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Don&apos;t worry, mistakes are part of learning! Try again to lock in your knowledge.
          </p>
          <div className="flex flex-col gap-2.5 pt-4">
            <Button 
              onClick={retryLesson} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Lesson
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setQuizState("map")} 
              className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-4 rounded-xl text-xs cursor-pointer"
            >
              Back to Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Victory Interface
  if (quizState === "victory") {
    const formatUriSegment = (val: string) => {
      if (!val) return "";
      return val.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 py-12">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-8 animate-fade-in-up">
          
          {/* Header & Trophy */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-500/15">
              <Trophy className="h-10 w-10 text-white animate-float" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Lesson Assessment Completed!</h2>
              <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">
                Your performance has been evaluated by the Semantic Web Recommendation Engine.
              </p>
            </div>
          </div>

          {/* Quiz Score Box */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Assessment Score</span>
            <div className={cn(
              "text-5xl font-black mt-1",
              lastQuizScore >= 70 ? "text-emerald-500" : "text-rose-500"
            )}>
              {lastQuizScore}%
            </div>
            <div className="text-xs font-semibold mt-2 text-slate-500 dark:text-slate-400">
              {lastQuizScore >= 70 
                ? "Passing score achieved! Concept mastery confirmed." 
                : "Below 70% threshold. Knowledge gaps detected."}
            </div>
          </div>

          {/* Strengths & Weaknesses (Knowledge Gaps) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl p-5 space-y-2">
              <h3 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Concepts Mastered
              </h3>
              {strengths.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No masteries registered in this attempt.</p>
              )}
            </div>

            <div className="bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl p-5 space-y-2">
              <h3 className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Knowledge Gaps Detected
              </h3>
              {weaknesses.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {weaknesses.map(w => (
                    <span key={w} className="px-2.5 py-1 bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold animate-pulse">
                      {w}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No knowledge gaps detected.</p>
              )}
            </div>
          </div>

          {/* Semantic Reasoner Explanation Panel */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-inner space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              🧠 Semantic Reasoner Pipeline
            </h3>
            
            <div className="space-y-4 text-xs">
              {/* Profile details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider">Student Profile</span>
                  <p className="font-bold text-slate-300 mt-0.5">Goal: {profile?.learningGoal || "Software Developer"}</p>
                  <p className="text-[11px] text-slate-400">Skill Level: {profile?.skillLevel || "Beginner"}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider">RDF representation</span>
                  <p className="font-mono text-[10px] text-slate-400 bg-black/40 p-1.5 rounded border border-slate-800 mt-1 overflow-x-auto whitespace-pre-line">
                    {`ex:Student${student?.id || 1} ex:hasGoal ex:${formatUriSegment(profile?.learningGoal || "SoftwareDeveloper")} .`}
                  </p>
                </div>
              </div>

              {/* Quiz Result triples */}
              <div className="space-y-1">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider">Quiz Result RDF Triples</span>
                <pre className="font-mono text-[10px] text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 overflow-x-auto space-y-1 leading-relaxed">
                  <code>
                    {`ex:QuizResult1 rdf:type ex:QuizResult ;\n`}
                    {`   ex:score "${lastQuizScore}" ;\n`}
                    {`   ex:testsSkill ex:${weaknesses[0] || strengths[0] || "PythonVariable"} .\n`}
                  </code>
                </pre>
              </div>

              {/* Inference mapping flow */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider">OWL / SWRL Inference Logic</span>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center gap-2 text-center text-slate-300 font-mono text-[11px]">
                  <div className="px-3 py-1 bg-slate-900 border border-slate-850 rounded">
                    Score &lt; 70% ({lastQuizScore}%)
                  </div>
                  <span className="text-slate-500 text-xs">↓</span>
                  <div className="px-3 py-1 bg-indigo-950/45 border border-indigo-900/50 text-indigo-400 rounded">
                    {weaknesses.length > 0 ? `ex:hasWeakness ex:${weaknesses.join(", ex:")}` : `ex:mastered ex:${strengths.join(", ex:")}`}
                  </div>
                  <span className="text-slate-550 text-xs">↓</span>
                  <div className="px-3 py-1 bg-emerald-950/45 border border-emerald-900/50 text-emerald-400 rounded">
                    Find courses teaching {weaknesses.length > 0 ? weaknesses.join(", ") : "next competencies"} via SPARQL
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Semantic Course Recommendations
            </h3>
            {recommendedCourses.length > 0 ? (
              <div className="space-y-3.5">
                {recommendedCourses.map((rec) => (
                  <div key={rec.id} className="p-5 border border-indigo-150 dark:border-indigo-950/45 rounded-2xl bg-indigo-50/15 dark:bg-indigo-950/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        {rec.courseTitle}
                      </h4>
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full shrink-0">
                        Inferred
                      </span>
                    </div>
                    {rec.reasons.map((reason: string, idx: number) => (
                      <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-indigo-500 font-medium">
                        {reason.replace(/\*\*/g, "")}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No recommendations mapped for your profile at this time.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button 
              onClick={() => setQuizState("map")} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              Continue to Map
            </Button>
            <Button 
              variant="outline"
              onClick={retryLesson} 
              className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-4 px-6 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- NORMAL DETAILS VIEW (INCLUDING MAP) ---
  const lessons = getLessonsForCourse(course.id, course.category_name, course.subcategory_name);
  const isAllLessonsCompleted = completedLessons.includes(1) && completedLessons.includes(2) && completedLessons.includes(3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 border border-slate-800 dark:border-slate-200 animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Purchase Required Interceptor Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative space-y-6 animate-fade-in-up">
            <button 
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center mx-auto border border-indigo-100/10">
                <Lock className="h-7 w-7 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enrollment Required</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Lesson 1 is available for free trial! Add this course to your active Learning Path to unlock further checkpoints (Lesson 2 & 3), access the Revision Center, and claim your Certificate of Completion.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button 
                onClick={handleEnroll}
                className="w-full bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-705 hover:to-violet-705 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                Add to My Learning Path 🎯
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowPurchaseModal(false)}
                className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-4 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative space-y-6 animate-fade-in-up">
            <button 
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center mx-auto border border-amber-100/10">
                <Award className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Claim Your Certificate</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Enter your full name as you would like it to appear on your official completion certificate.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
              />
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button 
                onClick={handlePrintCertificate}
                disabled={!studentName.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-500/10 disabled:opacity-50 cursor-pointer"
              >
                Save Certificate as PDF 🏆
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowCertModal(false)}
                className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-4 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 dark:bg-black text-white py-16 px-4 md:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 relative z-10">
          <div className="flex-1 space-y-4">
            <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-all">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Courses
            </Link>
            
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              {course.category_name}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {course.title}
            </h1>
            
            <p className="text-lg text-slate-300 max-w-3xl font-light">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">{course.rating}</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4 stroke-amber-400",
                        i < Math.floor(course.rating) ? "fill-amber-400" : "fill-amber-400/20"
                      )}
                    />
                  ))}
                </div>
                <span className="text-slate-400">({course.reviews_count} Reviews)</span>
              </div>
              <div className="h-1 w-1 bg-slate-700 rounded-full hidden sm:block" />
              <div>By <span className="text-indigo-400 font-semibold">{course.instructor}</span></div>
            </div>
          </div>

          {/* Floating Sticky Details Card */}
          <div className="w-full md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl shadow-xl overflow-hidden self-start md:top-24 md:sticky z-20">
            <div className={cn("h-48 bg-gradient-to-br flex items-center justify-center text-white text-5xl", course.gradient_class)}>
              {course.emoji}
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                {!isPurchased ? (
                  <>
                    <Button onClick={handleEnrollDirect} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-5 rounded-xl shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs">
                      Add to My Learning Path 🎯
                    </Button>
                    <Button onClick={handleAddToWishlist} variant="outline" className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all py-5 rounded-xl font-bold cursor-pointer text-xs">
                      Add to Wishlist
                    </Button>
                  </>
                ) : (
                  <Button 
                    disabled 
                    className="w-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 font-bold py-5 rounded-xl text-xs cursor-default border border-indigo-200/30"
                  >
                    Active in Learning Path 🎯
                  </Button>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs">
                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">This course includes:</p>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span>{course.duration_hours} hours on-demand video</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  <span>Interactive gamified lessons</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Award className="h-4 w-4 text-indigo-400" />
                  <span>Study Guide PDF workbook generator</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl mt-2 animate-fade-in">
                  <Award className="h-4 w-4 shrink-0 text-amber-500 animate-pulse" />
                  <span>Includes Official Path Completion Certificate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-12">
        <div className="flex-1 md:pr-12 space-y-10">
          
          {/* Gamified Learning Pathway (Full Width) + Video below */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Gamified Learning Pathway</h2>
                <p className="text-xs text-slate-400 mt-1">Complete Lesson 1 for free, or add this course to your learning path to play Lesson 2 &amp; 3.</p>
              </div>
              
              <div className="flex flex-wrap gap-2.5 shrink-0">
                {isAllLessonsCompleted && (
                  <Button
                    onClick={() => setShowCertModal(true)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl border-0 shadow-md shadow-orange-500/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="h-4 w-4 animate-bounce" />
                    Claim Certificate 🏆
                  </Button>
                )}
                
                <Button
                  onClick={generateStudyGuidePDF}
                  className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/35 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-indigo-100/10 cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4 text-rose-500" />
                  Generate Study Guide (PDF)
                </Button>
              </div>
            </div>

            {/* Horizontal Gamified Pathway */}
            <div className="overflow-x-auto pb-4">
              <div className="flex flex-row items-end justify-start gap-0 min-w-[600px] relative px-6 py-8">
                {/* Dashed horizontal connector line behind nodes */}
                <div className="absolute top-1/2 left-10 right-10 h-0.5 border-t-2 border-dashed border-indigo-200 dark:border-indigo-900/60 z-0 -translate-y-1/2" />

                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isUnlocked = index === 0 || completedLessons.includes(lessons[index - 1].id);
                  // Stagger up/down for zig-zag
                  const translateY = index % 2 === 0 ? "" : "translate-y-8";

                  return (
                    <div key={lesson.id} className={cn("relative z-10 flex flex-col items-center gap-2 flex-1", translateY)}>
                      <button
                        onClick={() => handleLessonClick(lesson)}
                        className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all border-4 cursor-pointer hover:scale-110 active:scale-95 duration-300 relative",
                          isCompleted 
                            ? "bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300 text-white shadow-amber-400/20"
                            : isUnlocked
                              ? (lesson.id === 1 || isPurchased)
                                ? "bg-gradient-to-br from-indigo-500 to-violet-600 border-indigo-400 text-white shadow-indigo-500/25 animate-pulse"
                                : "bg-slate-100 dark:bg-slate-900 border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 shadow-sm"
                              : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed"
                        )}
                        title={isUnlocked ? `Play ${lesson.title}` : "Level Locked"}
                      >
                        {isCompleted ? (
                          <Trophy className="h-6 w-6 text-white" />
                        ) : isUnlocked ? (
                          (lesson.id === 1 || isPurchased) ? (
                            <Play className="h-6 w-6 text-white fill-white translate-x-0.5" />
                          ) : (
                            <div className="relative">
                              <Play className="h-6 w-6 text-indigo-400 opacity-30 fill-indigo-400/10 translate-x-0.5" />
                              <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400 absolute -top-2.5 -right-2.5 bg-white dark:bg-slate-900 p-0.5 rounded-full" />
                            </div>
                          )
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </button>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                          Lesson {lesson.id} {(!isPurchased && lesson.id > 1) && "🔒"}
                        </p>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 max-w-[100px] line-clamp-1">{lesson.title.replace(/Lesson \d+:\s*/, "")}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revision Center */}
            <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4 text-indigo-400" />
                  Revision Center
                </h4>
                {wrongAnswers.length > 0 && (
                  <button 
                    onClick={clearRevisionList}
                    className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                  >
                    Clear Queue
                  </button>
                )}
              </div>
              
              {wrongAnswers.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Zero mistakes registered! Play levels to queue revision exercises.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    You have <strong>{wrongAnswers.length}</strong> incorrect answers saved. Practice them to master the concepts!
                  </p>
                  <Button
                    onClick={startRevisionQuiz}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold py-3 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Revise Mistakes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* What you'll learn */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What you&apos;ll learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-start">
                <span className="text-teal-500 font-bold mr-2">✓</span> {course.learning_outcome || "Practical, production-grade domain applications."}
              </p>
              <p className="flex items-start">
                <span className="text-teal-500 font-bold mr-2">✓</span> Work with active frameworks and deployment cycles.
              </p>
            </div>
          </div>

          {/* Course Metadata Overview */}
          <div className="bg-indigo-50/30 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider text-xs">Course Overview</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs">Skills Taught:</span>
                <span>{course.skillsRequired?.map((s: any) => s.name).join(", ") || "General Skills"}</span>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs">Prerequisites:</span>
                <span>{course.skillsRequired?.map((s: any) => `${s.name} (${s.level})`).join(", ") || "No strict pre-requisites"}</span>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs">Difficulty Level:</span>
                <span>{course.difficulty_level}</span>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs">Career Path:</span>
                <span>Suitable for {course.career_path || "General Technical Track"} roles</span>
              </li>
            </ul>
          </div>

          {/* Reviews */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Reviews</h2>
            {course.reviews?.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No reviews yet for this course.</p>
            ) : (
              <div className="space-y-6">
                {course.reviews?.map((r: any) => (
                  <div key={r.id} className="border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center font-bold text-white mr-4 shadow-sm">
                        {r.userName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{r.userName}</div>
                        <div className="flex text-amber-400 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5 stroke-amber-400",
                                i < r.rating ? "fill-amber-400" : "fill-amber-400/20"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-14">
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Review Form (only after completing all lessons) */}
            {isAllLessonsCompleted && (
              <div className="border border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-6 md:p-8 bg-emerald-50/40 dark:bg-emerald-950/10 space-y-5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Leave a Review</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Course Completed ✓</span>
                </div>

                {reviewSubmitted ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-500" />
                    <p className="font-bold text-slate-900 dark:text-white">Thank you for your review!</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Your feedback helps other learners discover this course.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Star Rating Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Your Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onMouseEnter={() => setReviewHover(star)}
                            onMouseLeave={() => setReviewHover(0)}
                            onClick={() => setReviewRating(star)}
                            className="cursor-pointer transition-transform hover:scale-125"
                          >
                            <Star
                              className={cn(
                                "h-7 w-7 transition-colors",
                                (reviewHover || reviewRating) >= star
                                  ? "fill-amber-400 stroke-amber-400"
                                  : "fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700"
                              )}
                            />
                          </button>
                        ))}
                        {reviewRating > 0 && (
                          <span className="ml-2 text-xs font-bold text-amber-500 self-center">
                            {["Poor", "Fair", "Good", "Great", "Excellent!"][reviewRating - 1]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Your Review</label>
                      <textarea
                        rows={4}
                        placeholder="Share your experience with this course..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>

                    {reviewError && (
                      <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {reviewError}
                      </p>
                    )}

                    <Button
                      onClick={handleSubmitReview}
                      disabled={reviewRating === 0 || !reviewText.trim() || reviewSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-xs flex items-center gap-2 disabled:opacity-40 cursor-pointer shadow-md shadow-emerald-500/10"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
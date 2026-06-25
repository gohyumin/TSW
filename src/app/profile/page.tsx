"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { getCurrentStudent, logoutStudent } from "@/app/actions/auth";
import { getStudentProfileData, updateStudentProfileData, getStudentQuizResults } from "@/app/actions/profile";
import { getCourseById, getCourses } from "@/app/actions/courses";
import { getResourcesForCourse } from "@/lib/courseResources";
import { enrollInCourse, getLearningPathItems, removeFromLearningPath } from "@/app/actions/learningPaths";
import { addToWishlist } from "@/app/actions/wishlist";
import { getSubcategoriesByParent } from "@/app/actions/categories";
import { 
  User, 
  Settings, 
  BookOpen, 
  Moon, 
  Sun, 
  Laptop, 
  Check, 
  Code, 
  FileText, 
  X, 
  Star, 
  Clock, 
  Search, 
  Award,
  Compass,
  GraduationCap,
  Trash2,
  ArrowRight,
  Sparkles,
  Heart,
  Database,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLevelOneLessonsForStudyMode, getLevelOneSummaryForStudyMode } from "@/lib/studyMode";

// Semantic Web Technology imports
import { mapStudentToRdf } from "@/lib/semantic/rdfMapper";
import { runMockInferenceReasoning } from "@/lib/semantic/inferenceService";
import { generateColdStartSparql, generateSkillGapSparql, generateReviewSemanticSparql } from "@/lib/semantic/sparqlService";
import { ONTOLOGY } from "@/lib/semantic/ontology";

const initialCategories = [
  "Programming",
  "Business",
  "Law",
  "Engineering"
];

// Curated Career Journeys
const pathways = [
  {
    title: "Software Developer Journey",
    description: "Master Python fundamentals and modern full-stack web development to build secure web applications.",
    color: "from-blue-500/10 to-indigo-500/10 border-indigo-500/20",
    textClass: "text-indigo-600 dark:text-indigo-400",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    courses: [
      { id: 2, title: "Introduction to Python Programming", level: "Beginner", duration: "18h", role: "Step 1: Core Fundamentals" },
      { id: 1, title: "Complete Web Development Bootcamp", level: "Beginner", duration: "45.5h", role: "Step 2: Fullstack Web Dev" }
    ]
  },
  {
    title: "Business Manager Journey",
    description: "Learn management principles, organizational strategy, and business decision frameworks.",
    color: "from-amber-500/10 to-orange-500/10 border-orange-500/20",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    courses: [
      { id: 3, title: "Introduction to Business Management", level: "Beginner", duration: "22h", role: "Step 1: Management & Strategy" }
    ]
  },
  {
    title: "Legal Counsel Journey",
    description: "Understand legal liabilities, commercial contract drafting, and ethical regulation principles.",
    color: "from-purple-500/10 to-indigo-500/10 border-indigo-500/20",
    textClass: "text-purple-600 dark:text-purple-400",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    courses: [
      { id: 4, title: "Business Law & Contract Ethics", level: "Intermediate", duration: "26h", role: "Step 1: Commercial Contract Law" }
    ]
  },
  {
    title: "Robotics Engineer Journey",
    description: "Program robotic kinematic paths, coordinate vector spaces, and configure PID feedback control systems.",
    color: "from-rose-500/10 to-red-500/10 border-rose-500/20",
    textClass: "text-rose-600 dark:text-rose-400",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    courses: [
      { id: 5, title: "Principles of Robotics & Control Systems", level: "Advanced", duration: "40h", role: "Step 1: Feedback Control Loops" }
    ]
  }
];

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Navigation state
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "learning-paths" | "achievements" | "semantic-engine">("profile");
  const [subcategoriesByParent, setSubcategoriesByParent] = useState<Record<string, string[]>>({});
  const [allCourses, setAllCourses] = useState<any[]>([]);

  const [semanticInspectorTab, setSemanticInspectorTab] = useState<"overview" | "rdf" | "sparql" | "ontology">("overview");
  const [selectedSparqlQuery, setSelectedSparqlQuery] = useState<"coldStart" | "skillGap" | "reviews">("coldStart");
  const [copiedText, setCopiedText] = useState(false);

  // User state
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [learningGoal, setLearningGoal] = useState("Software Developer");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [educationBackground, setEducationBackground] = useState("Computer Science");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Enrolled courses state (My Learning Tab)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [dbQuizResults, setDbQuizResults] = useState<any[]>([]);

  // Course Details Modal state
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalCompletedLessons, setModalCompletedLessons] = useState<number[]>([]);
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle Tab updates with URL synchronization
  const handleTabChange = (tab: "profile" | "preferences" | "learning-paths" | "achievements" | "semantic-engine") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url.toString());
    }
  };

  // Handle Esc key to close details modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseCourseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenCourseModal = async (courseId: number) => {
    setSelectedCourseId(courseId);
    setIsModalOpen(true);
    setModalLoading(true);
    setExpandedLevels({
      1: true,
      2: false,
      3: false,
      4: false
    });
    const savedProgress = localStorage.getItem(`course_${courseId}_completed`);
    if (savedProgress) {
      setModalCompletedLessons(JSON.parse(savedProgress));
    } else {
      setModalCompletedLessons([]);
    }
    try {
      const details = await getCourseById(courseId);
      setSelectedCourseDetails(details);
    } catch (err) {
      console.error("Failed to load modal details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseCourseModal = () => {
    setIsModalOpen(false);
    setSelectedCourseId(null);
    setSelectedCourseDetails(null);
  };

  const handleEnroll = async (courseId: number) => {
    const res = await enrollInCourse(courseId);
    if (res.success) {
      showToast("Course added to your learning path!");
      // Reload enrolled courses list
      const items = await getLearningPathItems();
      setEnrolledCourses(items);
      updateProgressMapping(items);
    } else {
      showToast(res.error || "Please log in first.");
    }
  };

  const handleRemoveCourse = async (id: number) => {
    const res = await removeFromLearningPath(id);
    if (res.success) {
      setEnrolledCourses((prev) => prev.filter((item) => item.id !== id));
      showToast("Removed course from your learning path.");
    } else {
      showToast(res.error || "Failed to remove course.");
    }
  };

  const handleAddToWishlist = async (courseId: number) => {
    const res = await addToWishlist(courseId);
    if (res.success) {
      showToast("Course saved to favorites!");
    } else {
      showToast(res.error || "Please log in first.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateProgressMapping = (items: any[]) => {
    const map: Record<number, number> = {};
    items.forEach((item) => {
      const saved = localStorage.getItem(`course_${item.id}_completed`);
      if (saved) {
        try {
          const completedArr = JSON.parse(saved);
          const percent = Math.min(100, Math.round((completedArr.length / 3) * 100));
          map[item.id] = percent;
        } catch {
          map[item.id] = 0;
        }
      } else {
        map[item.id] = 0;
      }
    });
    setProgressMap(map);
  };

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentStudent();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Parse tab param
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        if (tabParam === "my-learning") {
          router.replace("/my-learning");
          return;
        }
        if (tabParam && ["profile", "preferences", "learning-paths", "achievements", "semantic-engine"].includes(tabParam)) {
          setActiveTab(tabParam as any);
        }
      }

      const profile = await getStudentProfileData();
      if (profile) {
        setLearningGoal(profile.learningGoal);
        setSkillLevel(profile.skillLevel);
        setSelectedCats(profile.interests);
        setEducationBackground(profile.educationBackground || "Computer Science");
      }

      const quizRes = await getStudentQuizResults();
      setDbQuizResults(quizRes);

      const enrolled = await getLearningPathItems();
      setEnrolledCourses(enrolled);
      updateProgressMapping(enrolled);

      const subs = await getSubcategoriesByParent();
      setSubcategoriesByParent(subs);

      const all = await getCourses();
      setAllCourses(all);

      setLoading(false);
    }
    loadData();
  }, [router]);

  useEffect(() => {
    if (activeTab === "semantic-engine" || activeTab === "achievements") {
      async function refreshData() {
        try {
          const quizRes = await getStudentQuizResults();
          setDbQuizResults(quizRes);
          
          const profile = await getStudentProfileData();
          if (profile) {
            setLearningGoal(profile.learningGoal);
            setSkillLevel(profile.skillLevel);
            setSelectedCats(profile.interests);
            setEducationBackground(profile.educationBackground || "Computer Science");
          }
        } catch (e) {
          console.error("Failed to refresh profile tab data:", e);
        }
      }
      refreshData();
    }
  }, [activeTab]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const toggleCategory = (cat: string) => {
    const isChecked = selectedCats.includes(cat);
    if (isChecked) {
      const subs = subcategoriesByParent[cat] || [];
      setSelectedCats((prev) => prev.filter((item) => item !== cat && !subs.includes(item)));
    } else {
      setSelectedCats((prev) => [...prev, cat]);
    }
  };

  const toggleSubcategory = (sub: string) => {
    setSelectedCats((prev) =>
      prev.includes(sub) ? prev.filter((item) => item !== sub) : [...prev, sub]
    );
  };

  const handleSavePreferences = async () => {
    setSaveStatus("Saving...");
    const res = await updateStudentProfileData({
      learningGoal,
      skillLevel,
      interests: selectedCats,
      educationBackground,
      skills: skillLevel === "Beginner" ? [{ name: "Python", level: "Beginner" }] : []
    });

    if (res.success) {
      setSaveStatus("Preferences saved successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus(res.error || "Failed to save.");
    }
  };

  const handleLogout = async () => {
    await logoutStudent();
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("course_")) {
          localStorage.removeItem(key);
        }
      });
    }
    router.push("/login");
    router.refresh();
  };

  // Generate PDF Syllabus overview printing
  const generateSyllabusPDF = (course: any) => {
    if (!course) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocked! Allow popups to generate syllabus.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Syllabus - ${course.title}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            h2 { color: #0f172a; margin-top: 35px; }
            .meta { color: #64748b; font-size: 14px; margin-bottom: 30px; }
            .module { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 15px; }
            .module-title { font-weight: bold; color: #1e1b4b; }
          </style>
        </head>
        <body>
          <h1>Syllabus & Course Map</h1>
          <p><strong>Course:</strong> ${course.title}</p>
          <div class="meta">Instructor: ${course.instructor} | Duration: ${course.duration_hours}h | Level: ${course.difficulty_level}</div>
          <h2>Learning Outcomes</h2>
          <p>${course.learning_outcome}</p>
          <h2>Modules Plan</h2>
          <div class="module">
            <div class="module-title">Module 1: Introduction</div>
            <p>Baseline parameters, setup, and key concepts.</p>
          </div>
          <div class="module">
            <div class="module-title">Module 2: Fundamentals</div>
            <p>Core variables, structuring data, and practical scripts.</p>
          </div>
          <div class="module">
            <div class="module-title">Module 3: Practical Exercise</div>
            <p>Gamified scenario debugging and workbook challenges.</p>
          </div>
          <div class="module">
            <div class="module-title">Module 4: Assessment</div>
            <p>Verification quiz and graduation test checkpoint.</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalCourses = enrolledCourses.length;
  const completedCourses = Object.values(progressMap).filter(p => p === 100).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading your profile dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500 text-white p-8 md:p-12 shadow-xl mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner text-4xl">
              👤
            </div>
            <div className="text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10">
                <span>Personalized Profile Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{user?.name}</h1>
              <p className="text-indigo-100 text-sm">{user?.email} • Student ID: User{user?.id}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-2 sticky top-24">
              <button
                onClick={() => handleTabChange("profile")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:translate-x-1 cursor-pointer",
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                <User className="h-4 w-4" />
                Profile & Settings
              </button>
              <button
                onClick={() => handleTabChange("preferences")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:translate-x-1 cursor-pointer",
                  activeTab === "preferences"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                <Settings className="h-4 w-4" />
                Learning Preferences
              </button>
              <button
                onClick={() => handleTabChange("achievements")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:translate-x-1 cursor-pointer",
                  activeTab === "achievements"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                <Award className="h-4 w-4" />
                Achievements
              </button>
              <button
                onClick={() => handleTabChange("learning-paths")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:translate-x-1 cursor-pointer",
                  activeTab === "learning-paths"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                <Compass className="h-4 w-4" />
                Suggested Roadmaps
              </button>
              <button
                onClick={() => handleTabChange("semantic-engine")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:translate-x-1 cursor-pointer",
                  activeTab === "semantic-engine"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                <Sparkles className="h-4 w-4 text-violet-500" />
                Semantic Reasoner
              </button>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start text-rose-500 border-rose-200 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/25 cursor-pointer py-5 text-sm font-semibold"
                >
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Panel */}
          <main className="flex-1 space-y-8 min-w-0">
            {/* TAB 1: PROFILE & SETTINGS */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile Settings</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account information and preferences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.name || ""}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Appearance Settings (Theme Selection) */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Appearance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Choose how LearnWise looks on your device</p>
                  
                  <div className="grid grid-cols-3 gap-4 max-w-lg">
                    {[
                      { key: "light", label: "Light", icon: Sun },
                      { key: "dark", label: "Dark", icon: Moon },
                      { key: "system", label: "System", icon: Laptop }
                    ].map((t) => {
                      const IconComponent = t.icon;
                      const isSelected = theme === t.key;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setTheme(t.key as any)}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 hover:scale-102 hover:shadow-md cursor-pointer",
                            isSelected
                              ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          <IconComponent className="h-5 w-5 mb-2" />
                          <span className="text-xs">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LEARNING PREFERENCES */}
            {activeTab === "preferences" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Learning Preferences</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Configure parameters to customize recommendation scoring</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Career Interest */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Career Interest / Goal</label>
                    <select
                      value={learningGoal}
                      onChange={(e) => setLearningGoal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                    >
                      <option value="Software Developer">Software Developer (Programming)</option>
                      <option value="Business Manager">Business Manager (Business)</option>
                      <option value="Legal Counsel">Legal Counsel (Law)</option>
                      <option value="Robotics Engineer">Robotics Engineer (Engineering)</option>
                    </select>
                  </div>

                  {/* Skill Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Skill Level</label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Academic Background */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Academic Background</label>
                    <select
                      value={educationBackground}
                      onChange={(e) => setEducationBackground(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Business">Business</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Law">Law</option>
                      <option value="Arts & Humanities">Arts & Humanities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Interested Categories</label>
                      <div className="flex flex-wrap gap-3">
                        {initialCategories.map((cat) => {
                          const isChecked = selectedCats.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCategory(cat)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 hover:scale-102 hover:shadow-sm cursor-pointer",
                                isChecked
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10"
                                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-indigo-500"
                              )}
                            >
                              {isChecked && <Check className="h-4 w-4 shrink-0" />}
                              <span>{cat}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Subcategories (Optional selection) */}
                    {initialCategories.some(cat => selectedCats.includes(cat)) && (
                      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in">
                        <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Specify subcategories to refine recommendations (optional):</span>
                        </label>
                        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
                          {initialCategories.filter(cat => selectedCats.includes(cat)).map(cat => (
                            <div key={cat} className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{cat} Subcategories</span>
                              <div className="flex flex-wrap gap-2">
                                {subcategoriesByParent[cat]?.map(sub => {
                                  const isSubChecked = selectedCats.includes(sub);
                                  return (
                                    <button
                                      key={sub}
                                      type="button"
                                      onClick={() => toggleSubcategory(sub)}
                                      className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all duration-200 cursor-pointer",
                                        isSubChecked
                                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                                          : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                      )}
                                    >
                                      {isSubChecked && <Check className="h-3.5 w-3.5" />}
                                      <span>{sub}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                  {saveStatus && (
                    <span className={cn("text-xs font-semibold transition-all", saveStatus.includes("success") ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400")}>
                      {saveStatus}
                    </span>
                  )}
                  <Button
                    onClick={handleSavePreferences}
                    className="ml-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 px-6 py-5 rounded-xl cursor-pointer"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: ACHIEVEMENTS & CERTIFICATES */}
            {activeTab === "achievements" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="h-6 w-6 text-amber-500" />
                    Achievements & Credentials
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">View your verified completion certificates and track milestones</p>
                  
                  {completedCourses === 0 ? (
                    <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center bg-slate-50/30 dark:bg-slate-950/10">
                      <span className="text-3xl block mb-2">🏆</span>
                      <p className="text-xs text-slate-550 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Complete all modules and lessons of any active path to 100% to unlock your digital graduation certificate here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {enrolledCourses.filter(item => progressMap[item.id] === 100).map(item => (
                        <div key={item.id} className="border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/20 dark:bg-emerald-950/15 p-4 rounded-2xl flex items-center gap-3">
                          <span className="text-3xl">🎓</span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-955 dark:text-white">{item.title}</h4>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">Mastery Certificate Ready</p>
                            <Link href={`/courses/${item.id}`} className="inline-block mt-2 text-[10px] text-indigo-500 hover:underline font-bold">
                              Go print in classroom →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-3xl p-6 md:p-8 shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-slate-955 dark:text-white">🚀 Study Tip</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                    Make sure to practice lessons in order. You can generate a comprehensive **PDF Study Guide** with answers and full explanations from inside the classroom at any time.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: SUGGESTED ROADMAPS */}
            {activeTab === "learning-paths" && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Compass className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      Curriculum Roadmaps
                    </h2>
                    <p className="text-xs text-slate-550 dark:text-slate-400">Step-by-step career timelines designed by subject practitioners</p>
                  </div>
                </div>

                <div className="space-y-10">
                  {pathways.map((path, index) => {
                    const isProfileMatch = path.title.toLowerCase().includes(learningGoal.toLowerCase());
                    return (
                      <div 
                        key={index} 
                        className={cn(
                          "bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden transition-all duration-300",
                          isProfileMatch 
                            ? "border-indigo-500/40 ring-2 ring-indigo-500/10 shadow-lg dark:shadow-indigo-500/5 bg-gradient-to-br from-white via-slate-50/20 to-indigo-50/10 dark:from-slate-900 dark:to-indigo-950/5" 
                            : "border-slate-200 dark:border-slate-800/80"
                        )}
                      >
                        {/* Match Indicator */}
                        {isProfileMatch && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500 to-violet-500 text-white text-[9px] font-bold px-3.5 py-1.5 rounded-bl-2xl shadow-sm tracking-wider flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                            <span>MATCHES YOUR PROFILE GOAL</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest", path.badgeColor)}>
                            <span>⚓</span>
                            <span>Curriculum Pathway</span>
                          </div>
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{path.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">{path.description}</p>
                        </div>

                        {/* Course Timeline Connected row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative pt-4">
                          {/* Desktop connecting path line */}
                          <div className="hidden md:block absolute top-[52px] left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                          
                          {path.courses.map((course, cIdx) => {
                            const isEnrolled = enrolledCourses.some((item) => item.id === course.id);
                            const progress = progressMap[course.id] || 0;
                            const isCompleted = progress === 100;

                            return (
                              <div key={course.id} className="relative group z-10 flex flex-col justify-between">
                                {/* Connector Dot */}
                                <div className="hidden md:flex absolute top-[10px] left-8 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 items-center justify-center z-20 transition-all duration-300 group-hover:scale-110 shadow-sm"
                                  style={{
                                    backgroundColor: isCompleted 
                                      ? '#10b981' // emerald-500
                                      : isEnrolled 
                                        ? '#6366f1' // indigo-500
                                        : '#cbd5e1' // slate-300
                                  }}
                                />

                                <div className={cn(
                                  "bg-white dark:bg-slate-900/50 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-305 flex flex-col justify-between h-[190px] hover:-translate-y-1 mt-4 relative",
                                  isCompleted
                                    ? "border-emerald-500/25 bg-emerald-50/5 dark:bg-emerald-950/5"
                                    : isEnrolled
                                      ? "border-indigo-500/25 bg-indigo-50/5 dark:bg-indigo-950/5"
                                      : "border-slate-200 dark:border-slate-800/80"
                                )}>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className={cn(
                                        "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide",
                                        isCompleted
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                          : isEnrolled
                                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                      )}>
                                        {isCompleted ? "Completed" : isEnrolled ? `Enrolled (${progress}%)` : course.level}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-0.5">
                                        ⏱️ {course.duration}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                                        {course.role}
                                      </div>
                                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                                        {course.title}
                                      </h4>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 items-center justify-between">
                                    <Button
                                      onClick={() => handleOpenCourseModal(course.id)}
                                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600/80 dark:hover:bg-indigo-600 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all cursor-pointer"
                                    >
                                      Explore Step
                                    </Button>
                                    <button
                                      onClick={() => handleAddToWishlist(course.id)}
                                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-rose-500 hover:border-rose-300 transition-colors cursor-pointer bg-white dark:bg-slate-900 flex items-center justify-center"
                                      title="Add to wishlist"
                                    >
                                      <Heart className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: SEMANTIC REASONER INSPECTOR */}
            {activeTab === "semantic-engine" && (() => {
              const quizResults = dbQuizResults;

              const studentSkills = skillLevel === "Beginner" ? [{ name: "Python", level: "Beginner" }] : [];
              const completedCourseIds = enrolledCourses.filter(c => progressMap[c.id] === 100).map(c => c.id);

              let inferredTriplesText = "";
              if (quizResults && quizResults.length > 0) {
                inferredTriplesText += `# Inferred Semantic Relations (SWRL Rules Engine Assertions)\n`;
                quizResults.forEach(qr => {
                  Object.keys(qr.skillsPerformance).forEach(concept => {
                    const conceptUri = `ex:${concept.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "")}`;
                    if (qr.score < 70) {
                      inferredTriplesText += `ex:Student${user?.id || 5} ex:hasWeakness ${conceptUri} .\n`;
                    } else {
                      inferredTriplesText += `ex:Student${user?.id || 5} ex:mastered ${conceptUri} .\n`;
                    }
                  });
                });
              }

              const studentRdf = mapStudentToRdf({
                id: user?.id || 1,
                learningGoal,
                skillLevel,
                interests: selectedCats,
                skills: studentSkills,
                completedCourses: completedCourseIds,
                quizResults: quizResults
              }) + "\n" + inferredTriplesText;

              // Run reasoner dynamically
              const reasoningRecs = runMockInferenceReasoning({
                id: user?.id || 1,
                learningGoal,
                skillLevel,
                interests: selectedCats,
                skills: studentSkills,
                completedCourses: completedCourseIds,
                quizResults: quizResults
              }, allCourses);

              // Generate SPARQL
              const coldStartSparql = generateColdStartSparql(
                user?.id || 1, 
                selectedCats, 
                learningGoal, 
                studentSkills.map(s => s.name)
              );
              const skillGapSparql = generateSkillGapSparql(user?.id || 1, learningGoal);
              const reviewSparql = generateReviewSemanticSparql(selectedCats[0] || "Python", skillLevel);

              // Generate OWL Ontology text
              const swrlRulesText = ONTOLOGY.swrlRules.map(
                (rule) => `Rule ID: ${rule.id}\nRule: ${rule.rule}\nComment: ${rule.comment}\n`
              ).join("\n");
              const owlOntologyText = `@prefix owl: <http://www.w3.org/2002/07/owl#> .\n` +
                `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n` +
                `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n` +
                `@prefix ex: <${ONTOLOGY.namespace}> .\n\n` +
                `# LearnWise Core OWL Ontology Classes\n` +
                ONTOLOGY.classes.map(c => `ex:${c.name} rdf:type owl:Class ;\n    rdfs:comment "${c.comment}" .`).join("\n\n") +
                `\n\n# LearnWise Object Properties\n` +
                ONTOLOGY.objectProperties.map(p => `ex:${p.name} rdf:type owl:ObjectProperty ;\n    rdfs:domain ex:${p.domain} ;\n    rdfs:range ex:${p.range} ;\n    rdfs:comment "${p.comment}" .`).join("\n\n") +
                `\n\n# SWRL Logical Inference Rules\n` +
                swrlRulesText;

              return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-violet-500 animate-pulse" />
                      Semantic Web Recommendation Inspector
                    </h2>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                      See how your profile interests and learning milestones are translated into Semantic standards (RDF/RDFS) and resolved through OWL/SWRL rules and SPARQL queries.
                    </p>
                  </div>

                  {/* Sub-tabs Selector */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    {[
                      { key: "overview", label: "Deduction Explanation", icon: HelpCircle },
                      { key: "rdf", label: "RDF Triples (Turtle)", icon: Database },
                      { key: "sparql", label: "SPARQL Query Inspector", icon: Search },
                      { key: "ontology", label: "OWL Ontology Schema", icon: BookOpen }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const active = semanticInspectorTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setSemanticInspectorTab(tab.key as any)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all",
                            active
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-150"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SUB-TAB 1: DEDUCTION OVERVIEW */}
                  {semanticInspectorTab === "overview" && (
                    <div className="space-y-6">
                      <div className="bg-indigo-50/40 dark:bg-slate-950/20 border border-indigo-100/10 p-5 rounded-2xl space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Real-time Semantic Inference Summary
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          The Semantic Web reasoner mapped your current profile data (goal: <strong>{learningGoal}</strong>, and quiz scores) into triples. It evaluated the SWRL rules and matched courses via SPARQL.
                        </p>
                      </div>

                      {/* Reasoning Tree Visualizer */}
                      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Deduction Reason Path</h4>
                        
                        <div className="relative border-l-2 border-dashed border-indigo-300 dark:border-slate-800 pl-6 ml-3 space-y-6 text-xs">
                          {/* Node 1 */}
                          <div className="relative">
                            <span className="absolute -left-[31px] top-0.5 bg-indigo-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">1</span>
                            <div className="font-bold text-slate-900 dark:text-white">Profile Extraction (Cold Start)</div>
                            <div className="text-slate-505 dark:text-slate-400 mt-1">
                              Mapped properties: <code className="text-indigo-650 dark:text-indigo-400 font-mono">ex:hasGoal ex:{learningGoal.replace(/\s+/g, "")}</code> and <code className="text-indigo-650 dark:text-indigo-400 font-mono">ex:hasSkillLevel &quot;{skillLevel}&quot;</code>.
                            </div>
                          </div>

                          {/* Node 2 */}
                          <div className="relative">
                            <span className="absolute -left-[31px] top-0.5 bg-indigo-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">2</span>
                            <div className="font-bold text-slate-900 dark:text-white">SWRL Axiom Check & Quiz Performance Analysis</div>
                            <div className="text-slate-505 dark:text-slate-400 mt-1 leading-relaxed">
                              Evaluated active quiz results:
                              <div className="mt-2 space-y-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                                {quizResults.map((qr, qIdx) => (
                                  <div key={qIdx} className="font-mono text-[10px]">
                                    ex:QuizResult score={qr.score} &rarr; {qr.score < 70 ? (
                                      <span className="text-rose-550">Asserted ex:hasWeakness for skill &quot;{Object.keys(qr.skillsPerformance)[0]}&quot;</span>
                                    ) : (
                                      <span className="text-emerald-555">Asserted ex:mastered for skill &quot;{Object.keys(qr.skillsPerformance)[0]}&quot;</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Node 3 */}
                          <div className="relative">
                            <span className="absolute -left-[31px] top-0.5 bg-indigo-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">3</span>
                            <div className="font-bold text-slate-900 dark:text-white">Active Recommendations & Explanations</div>
                            <div className="text-slate-505 dark:text-slate-400 mt-2 space-y-3">
                              {reasoningRecs.length === 0 ? (
                                <p className="text-xs text-slate-400">No active course recommendation triggers found.</p>
                              ) : (
                                <div className="grid grid-cols-1 gap-3">
                                  {reasoningRecs.map((rec, rIdx) => (
                                    <div key={rIdx} className="bg-slate-50 dark:bg-slate-950/45 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
                                      <div className="font-bold text-indigo-650 dark:text-indigo-400 mb-1">{rec.courseTitle}</div>
                                      <ul className="list-disc pl-4 space-y-1">
                                        {rec.reasons.map((rText: string, rIdx2: number) => (
                                          <li key={rIdx2} className="text-xs leading-normal" dangerouslySetInnerHTML={{ __html: rText }}></li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: RDF TURTLE */}
                  {semanticInspectorTab === "rdf" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">In-Memory Triplestore (Turtle Format)</h4>
                        <button
                          onClick={() => handleCopyCode(studentRdf)}
                          className="flex items-center gap-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copiedText ? "Copied!" : "Copy Turtle RDF"}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        This Turtle block is dynamic. Changing your learning goals, category interests, or finishing quizzes updates this triplestore in real-time.
                      </p>
                      <pre className="bg-slate-950 dark:bg-black text-indigo-400 dark:text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-[400px]">
                        {studentRdf}
                      </pre>
                    </div>
                  )}

                  {/* SUB-TAB 3: SPARQL QUERY INSPECTOR */}
                  {semanticInspectorTab === "sparql" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Select SPARQL Query Template</label>
                        <div className="flex gap-2">
                          {[
                            { key: "coldStart", label: "Cold Start Recommendation query" },
                            { key: "skillGap", label: "Skill Gap Analysis query" },
                            { key: "reviews", label: "Review Semantics query" }
                          ].map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => setSelectedSparqlQuery(opt.key as any)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer",
                                selectedSparqlQuery === opt.key
                                  ? "bg-violet-500/10 border-violet-500 text-violet-605 dark:text-violet-400 font-semibold"
                                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">SPARQL Query Syntax:</span>
                        <button
                          onClick={() => {
                            const query = selectedSparqlQuery === "coldStart" 
                              ? coldStartSparql 
                              : selectedSparqlQuery === "skillGap" 
                                ? skillGapSparql 
                                : reviewSparql;
                            handleCopyCode(query);
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copiedText ? "Copied!" : "Copy SPARQL Query"}</span>
                        </button>
                      </div>

                      <pre className="bg-slate-950 dark:bg-black text-indigo-400 dark:text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-[350px]">
                        {selectedSparqlQuery === "coldStart" && coldStartSparql}
                        {selectedSparqlQuery === "skillGap" && skillGapSparql}
                        {selectedSparqlQuery === "reviews" && reviewSparql}
                      </pre>
                    </div>
                  )}

                  {/* SUB-TAB 4: OWL ONTOLOGY SCHEMA */}
                  {semanticInspectorTab === "ontology" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">OWL Ontology Schema & SWRL Rules</h4>
                        <button
                          onClick={() => handleCopyCode(owlOntologyText)}
                          className="flex items-center gap-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copiedText ? "Copied!" : "Copy OWL Ontology"}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        This schema defines the vocabulary, concept hierarchies, properties, and SWRL rules used by the reasoner.
                      </p>
                      <pre className="bg-slate-950 dark:bg-black text-indigo-400 dark:text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-[400px]">
                        {owlOntologyText}
                      </pre>
                    </div>
                  )}

                  {/* Sub-tab rendering wraps here */}
                </div>
              );
            })()}

          </main>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 animate-fade-in border border-slate-800 dark:border-slate-200">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Course Details Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" 
          onClick={handleCloseCourseModal}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col relative animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-xl font-bold text-slate-955 dark:text-white line-clamp-1 pr-6">
                {modalLoading ? "Loading Course Details..." : selectedCourseDetails?.title || "Course Details"}
              </h2>
              <button
                onClick={handleCloseCourseModal}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {modalLoading ? (
              <div className="flex-grow flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-405">Fetching dynamic course resources...</p>
              </div>
            ) : selectedCourseDetails ? (
              (() => {
                const resources = getResourcesForCourse(selectedCourseDetails.id);
                return (
                  <div className="p-6 space-y-6 flex-grow">
                    {/* Course Banner */}
                    <div className={cn("h-48 bg-gradient-to-br rounded-2xl flex items-center justify-center text-6xl shadow-inner relative", selectedCourseDetails.gradient_class)}>
                      <span className="drop-shadow-lg">{selectedCourseDetails.emoji}</span>
                      {selectedCourseDetails.is_bestseller && (
                        <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Metadata badges */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="text-indigo-600 dark:text-indigo-400">By {selectedCourseDetails.instructor}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" />
                        {selectedCourseDetails.rating} Rating ({selectedCourseDetails.reviews_count || 0} reviews)
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        {selectedCourseDetails.duration_hours} Hours
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        👥 {(selectedCourseDetails.reviews_count || 0) * 15 + 45} Enrolled
                      </span>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {selectedCourseDetails.description}
                      </p>
                    </div>

                    {/* Gamified Learning Pathway (Horizontal Chapters) */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 flex items-center gap-1.5">
                        <span>🎮</span> Gamified Learning Pathway (Progressive Chapters)
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                        {[
                          {
                            level: 1,
                            title: "Level 1",
                            subtitle: "Introduction",
                            summary: "Lecture Notes, Video, Examples, Quiz",
                            lessons: ["Lecture Notes: Foundational Reading", "Video Presentation: Concepts Walkthrough", "Code Examples: Applied Logic Exercises", "Interactive Quiz: Lesson Assessment Check"]
                          },
                          {
                            level: 2,
                            title: "Level 2",
                            subtitle: "Basic Concepts",
                            summary: "Data Models, Relational Loops, Functions, Quiz 2",
                            lessons: ["Lesson 2.1: Structuring Data Models", "Lesson 2.2: Conditionals & Iteration Structures", "Lesson 2.3: Reusable Functional Code", "PDF Resource: Basic Concept Worksheets", "Quiz 2: Fundamentals Evaluation Check"]
                          },
                          {
                            level: 3,
                            title: "Level 3",
                            subtitle: "Advanced Topics",
                            summary: "Advanced Patterns, Parallel logic, Vector Databases",
                            lessons: []
                          },
                          {
                            level: 4,
                            title: "Level 4",
                            subtitle: "Final Test",
                            summary: "Comprehensive assessment & graduation certificate",
                            lessons: []
                          }
                        ].map((lvl, index) => {
                          const isCompleted = lvl.level === 1 
                            ? modalCompletedLessons.includes(1)
                            : lvl.level === 2
                              ? modalCompletedLessons.includes(2)
                              : lvl.level === 3
                                ? modalCompletedLessons.includes(3)
                                : modalCompletedLessons.includes(3); // Level 4 completed if Lesson 3 completed

                          const isLocked = lvl.level === 1
                            ? false
                            : lvl.level === 2
                              ? !modalCompletedLessons.includes(1)
                              : lvl.level === 3
                                ? !modalCompletedLessons.includes(2)
                                : !modalCompletedLessons.includes(3);

                          const statusText = isLocked ? "Locked" : (isCompleted ? "Completed" : "Available");
                          const iconText = isLocked ? "🔒" : (isCompleted ? "✓" : "➔");
                          const colorClasses = isLocked
                            ? "text-slate-400 bg-slate-500/10 border-slate-700 dark:border-slate-800"
                            : isCompleted
                              ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
                              : "text-indigo-500 bg-indigo-500/10 border-indigo-500/30";
                          const isExpanded = !!expandedLevels[lvl.level];

                          return (
                            <div
                              key={lvl.level}
                              onClick={() => {
                                if (isLocked) {
                                  showToast("Level is locked! Complete preceding levels first.");
                                  return;
                                }
                                setExpandedLevels((prev) => ({
                                  ...prev,
                                  [lvl.level]: !prev[lvl.level]
                                }));
                              }}
                              className={cn(
                                "border p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm relative transition-all duration-300 hover:scale-[1.02] text-left",
                                isLocked 
                                  ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 opacity-60" 
                                  : "bg-white dark:bg-slate-900 border-indigo-500/20 shadow-indigo-500/5"
                              )}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", colorClasses)}>
                                    {iconText}
                                  </span>
                                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                    {statusText}
                                  </span>
                                </div>
                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white pt-1">
                                  {lvl.title}: {lvl.subtitle}
                                </h4>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                                  {lvl.summary}
                                </p>
                                {isExpanded && lvl.lessons.length > 0 && (
                                  <div className="pt-2 space-y-1.5">
                                    {lvl.lessons.map((lesson, idx) => (
                                      <div key={idx} className="flex items-start gap-1.5 text-[9px] text-slate-600 dark:text-slate-300">
                                        <span className="text-indigo-400">â€¢</span>
                                        <span>{lesson}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {index < 3 && (
                                <div className="hidden lg:block absolute top-[28%] -right-3.5 z-20 text-slate-350 dark:text-slate-650 font-bold text-sm">
                                  ➔
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gamified Classroom Info (No Video Preview) */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Gamified Classroom Info</h4>
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100/10 flex flex-col gap-2 shadow-inner">
                            <div className="flex items-start gap-2">
                              <span className="text-2xl">🎮</span>
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">Duolingo-Style Learning Practice</div>
                                <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                                  Play checkpoints, answer multiple choice questions, protect your lives (❤️), and generate study workbooks.
                                </div>
                              </div>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550 pt-2">Syllabus Guide</h4>
                          <button
                            onClick={() => generateSyllabusPDF(selectedCourseDetails)}
                            className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 hover:underline cursor-pointer bg-indigo-50/50 dark:bg-indigo-950/20 px-3.5 py-3 rounded-xl border border-indigo-150 border-dashed w-full text-left"
                          >
                            <span>📄</span>
                            <span>Generate & Print Syllabus Overview (PDF)</span>
                          </button>
                        </div>
                        
                        {(() => {
                          const modalProgress = Math.min(100, Math.round((modalCompletedLessons.length / 3) * 100));
                          return (
                            <Link href={`/courses/${selectedCourseDetails.id}`} className="w-full block pt-2">
                              <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-500/10 cursor-pointer">
                                {modalProgress > 0 ? "Resume the Classroom 🎯" : "Start to Study 🎯"}
                              </Button>
                            </Link>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Comments & Reviews */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">Comments & Reviews</h3>
                      
                      {!selectedCourseDetails.reviews || selectedCourseDetails.reviews.length === 0 ? (
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/20">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">User A</span>
                            <span className="text-amber-500 text-xs">⭐⭐⭐⭐⭐</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-xs">&quot;Good course! Learned a lot about core concepts.&quot;</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {selectedCourseDetails.reviews.map((r: any) => (
                            <div key={r.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-100/30 dark:bg-slate-950/10">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-slate-955 dark:text-white">{r.userName}</span>
                                <span className="text-amber-500 text-[10px]">
                                  {"⭐".repeat(r.rating)}
                                </span>
                              </div>
                              <p className="text-slate-605 dark:text-slate-300 text-xs leading-relaxed">{r.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-8 text-center text-slate-400">Unable to load details.</div>
            )}

            {/* Modal Footer */}
            {!modalLoading && selectedCourseDetails && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-955/30 flex items-center justify-end sticky bottom-0 rounded-b-3xl">
                <Button
                  onClick={async () => {
                    await handleEnroll(selectedCourseDetails.id);
                    handleCloseCourseModal();
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer text-sm"
                >
                  Add to My Learning Path 🎯
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCourses, getCourseById, CourseData } from "@/app/actions/courses";
import { getCurrentStudent } from "@/app/actions/auth";
import { enrollInCourse } from "@/app/actions/learningPaths";
import { addToWishlist } from "@/app/actions/wishlist";
import { Sparkles, Star, CheckCircle, ChevronLeft, ChevronRight, BookOpen, Clock, Target, Award, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getResourcesForCourse } from "@/lib/courseResources";
import { getCategories, getSubcategoriesByParent, CategoryData } from "@/app/actions/categories";
import { getSubcategories } from "@/app/actions/subcategories";
import { getStudentProfileData } from "@/app/actions/profile";
import { getLevelOneLessonsForStudyMode } from "@/lib/studyMode";

export default function Home() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subcategoriesByParent, setSubcategoriesByParent] = useState<Record<string, string[]>>({});
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Carousel ref
  const carouselRef = useRef<HTMLDivElement>(null);
  const availableCoursesRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll states for Available Courses carousel
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Scroll progress tracker for Available Courses
  const [scrollProgress, setScrollProgress] = useState(0);

  // Hero Carousel Slide state
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Course Details Modal state
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalCompletedLessons, setModalCompletedLessons] = useState<number[]>([]);

  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({
    1: true, // Level 1 is expanded by default
    2: false,
    3: false,
    4: false
  });

  const heroSlides = [
    {
      title: "Learn Smarter. Grow Faster.",
      description: "Discover online courses that match your interests, skills, and learning goals.",
      actionText: "Explore Courses",
      actionLink: "/courses",
      bgClass: "gradient-hero",
      showcase: (
        <div className="glass-strong rounded-3xl p-8 space-y-6 w-full max-w-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl shadow-lg">📚</div>
            <div>
              <div className="text-white font-semibold">15+ Expert Courses</div>
              <div className="text-indigo-200 text-xs">Curated curriculum paths</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">🧠</div>
            <div>
              <div className="text-white font-semibold">Industry-Aligned Content</div>
              <div className="text-indigo-200 text-xs">Curriculums mapped to job markets</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Instant State Synchronization",
      description: "Tailor your catalog dashboard by setting your skill level and career goals to view relevant recommendations.",
      actionText: "Browse Catalog",
      actionLink: "/courses",
      bgClass: "bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950",
      showcase: (
        <div className="glass-strong rounded-3xl p-8 space-y-6 w-full max-w-md border border-emerald-500/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg">⚡</div>
            <div>
              <div className="text-white font-semibold">Real-time Personalization</div>
              <div className="text-teal-200 text-xs">Instantly stores learning paths, wishlists & goals</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">🔒</div>
            <div>
              <div className="text-white font-semibold">Secure Session Management</div>
              <div className="text-teal-200 text-xs">Native Web Crypto credentials</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Smart Course Recommendations",
      description: "Our recommendation engine analyzes your interests and skill levels to suggest fitting catalog entries.",
      actionText: "View Profile",
      actionLink: "/profile",
      bgClass: "bg-gradient-to-r from-indigo-950 via-purple-950 to-violet-950",
      showcase: (
        <div className="glass-strong rounded-3xl p-8 space-y-6 w-full max-w-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">🎯</div>
            <div>
              <div className="text-white font-semibold">Personalized Dashboards</div>
              <div className="text-indigo-200 text-xs">Targeted selections for your career goals</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center text-2xl shadow-lg">🌟</div>
            <div>
              <div className="text-white font-semibold">Dynamic Scoring</div>
              <div className="text-indigo-200 text-xs">Recommendations adapt dynamically</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!availableCoursesRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - availableCoursesRef.current.offsetLeft);
    setScrollLeft(availableCoursesRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !availableCoursesRef.current) return;
    e.preventDefault();
    const x = e.pageX - availableCoursesRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    availableCoursesRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScrollProgress = () => {
    if (availableCoursesRef.current) {
      const { scrollLeft: sl, scrollWidth, clientWidth } = availableCoursesRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const percent = maxScroll > 0 ? Math.round((sl / maxScroll) * 100) : 0;
      setScrollProgress(percent);
    }
  };

  useEffect(() => {
    async function loadData() {
      const activeUser = await getCurrentStudent();
      setUser(activeUser);



      const allCourses = await getCourses();
      // Fisher-Yates shuffle to randomize showcase courses on mount
      const shuffled = [...allCourses];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setCourses(shuffled);

      const cats = await getCategories();
      setCategories(cats);

      const subs = await getSubcategoriesByParent();
      setSubcategoriesByParent(subs);

      const allSubs = await getSubcategories();
      setSubcategories(allSubs);

      setLoading(false);
    }
    loadData();
  }, []);

  // Rotate Hero Slide automatically every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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

  const handleEnroll = async (courseId: number) => {
    const res = await enrollInCourse(courseId);
    if (res.success) {
      showToast("Course added to your learning path!");
    } else {
      showToast(res.error || "Please log in first.");
    }
  };

  const handleAddToWishlist = async (courseId: number) => {
    const res = await addToWishlist(courseId);
    if (res.success) {
      showToast("Course saved to wishlist!");
    } else {
      showToast(res.error || "Please log in first.");
    }
  };

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

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 340; // Card width + gap
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const availableCourses = courses;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 animate-fade-in border border-slate-800 dark:border-slate-200">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Carousel Section */}
      <section className={cn("relative py-24 px-4 md:px-8 overflow-hidden transition-all duration-700 bg-cover bg-center text-white", heroSlides[currentHeroSlide].bgClass)}>
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-float-delayed" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight animate-fade-in-up whitespace-pre-line">
              {heroSlides[currentHeroSlide].title}
            </h1>
            <p className="text-xl text-indigo-200 animate-fade-in-up-delay-1">
              {heroSlides[currentHeroSlide].description}
            </p>
            <div className="flex flex-wrap gap-4 pt-4 animate-fade-in-up-delay-2">
              <Link href={heroSlides[currentHeroSlide].actionLink}>
                <Button size="lg" className="bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-teal-500/20 font-bold transition-all rounded-xl cursor-pointer py-6 px-8 hover:scale-[1.03]">
                  {heroSlides[currentHeroSlide].actionText}
                </Button>
              </Link>
              {!user && (
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-teal-400/50 text-teal-300 hover:bg-teal-500/10 hover:border-teal-400 font-bold transition-all rounded-xl cursor-pointer py-6 px-8">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>

            {/* Slider Dots */}
            <div className="flex items-center gap-2 pt-6">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHeroSlide(idx)}
                  aria-label={`Go to hero slide ${idx + 1}`}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300 cursor-pointer",
                    currentHeroSlide === idx ? "bg-teal-400 w-8" : "bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Showcase visual card */}
          <div className="md:w-1/2 flex justify-center w-full">
            {heroSlides[currentHeroSlide].showcase}
          </div>
        </div>
      </section>

      {/* Video Showcase Section (Placed right above Available Courses) */}
      <section className="py-20 px-4 md:px-8 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-slate-900 px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>🎥 Platform Overview</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              See How LearnWise Shapes Your Learning Path
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Explore how LearnWise optimizes your study routine with science-backed learning techniques. Watch this overview to discover how to study smarter, retain knowledge 2x faster, and design your personalized career goal pathway.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-white text-[10px]">A</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-white text-[10px]">B</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-white text-[10px]">C</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Joined by 15,000+ active students worldwide</p>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 aspect-video bg-black relative">
              <video
                controls
                className="absolute inset-0 w-full h-full object-cover"
                preload="metadata"
              >
                <source src="video/learnwise.mp4" type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 px-4 md:px-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/20 px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                <span>🎯 Explore Paths</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Popular Categories</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select a category to view specialized courses in that domain.</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all duration-200 cursor-pointer">
                View All Categories →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.category_name} href={`/courses?category=${cat.id}`}>
                <div className={cn(
                  "bg-white dark:bg-slate-900 border rounded-3xl p-6 flex flex-col h-[210px] items-center text-center justify-between cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden",
                  cat.gradient_class
                )}>
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 group-hover:scale-110 transition-transform duration-300">
                      {cat.emoji}
                    </div>
                    <div className="w-full relative min-h-[56px] flex flex-col items-center">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cat.category_name}
                      </h3>
                      {/* Description Container with Slide Interaction */}
                      <div className="relative w-full h-[36px] overflow-hidden mt-1 flex items-center justify-center">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2 transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-[-100%] absolute w-full text-center">
                          {cat.description}
                        </p>
                        {/* Hover Subcategories tags */}
                        <div className="opacity-0 translate-y-[100%] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute w-full flex flex-wrap justify-center gap-1">
                          {subcategoriesByParent[cat.category_name]?.slice(0, 3).map((sub) => (
                            <span key={sub} className="text-[9px] font-bold bg-indigo-50 dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100/10">
                              {sub}
                            </span>
                          ))}
                          {subcategoriesByParent[cat.category_name]?.length > 3 && (
                            <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                              +{subcategoriesByParent[cat.category_name].length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={cn("text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform", cat.color_class)}>
                    Explore path ➔
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Subcategories Section */}
      <section className="py-20 px-4 md:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/20 px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                <span>⚡ Specialized Skills</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Popular Subcategories</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Refine your expertise by targeting specific sub-disciplines.</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all duration-200 cursor-pointer">
                View All Subcategories →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {subcategories
              .filter(sub => [
                "Python",
                "Web Development",
                "Mobile Development",
                "Data Science",
                "Business Strategy",
                "Marketing",
                "Contract Law",
                "Robotics & Automation"
              ].includes(sub.name))
              .map((sub) => {
                const parentCat = categories.find(c => c.id === sub.parent_category_id);
                const emoji = parentCat?.emoji || "📚";
                const badgeStyle = parentCat?.category_name === "Programming" 
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  : parentCat?.category_name === "Business"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : parentCat?.category_name === "Law"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

                return (
                  <Link key={sub.id} href={`/courses?category=${sub.parent_category_id}&subcategory=${sub.id}`}>
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between h-[180px] cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{emoji}</span>
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", badgeStyle)}>
                            {parentCat?.category_name}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {sub.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-normal">
                            {sub.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform mt-2">
                        Explore subcategory ➔
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* Available Courses Section (Horizontal Scrollable Draggable Carousel) */}
      <section className="py-20 px-4 md:px-8 gradient-subtle overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Available Courses</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">All courses in our learning catalog</p>
            </div>
            
            {/* Tooltip helper badge */}
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold select-none animate-pulse">
              <span>👋 Drag left/right to scroll courses</span>
            </div>
          </div>

          <div
            ref={availableCoursesRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onScroll={handleScrollProgress}
            className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none pb-6 px-1"
          >
            {availableCourses.map((course) => (
              <div
                key={course.id}
                className="w-[300px] shrink-0 snap-start bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-[460px]"
              >
                {/* Gradient Thumbnail */}
                <div className={cn("relative h-44 bg-gradient-to-br flex items-center justify-center text-5xl", course.gradient_class)}>
                  <span className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {course.emoji}
                  </span>
                  {course.is_bestseller && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      Bestseller
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow space-y-4 justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                        {course.category_name}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">By {course.instructor}</p>
                    </div>

                    {/* Metadata details on card */}
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md flex items-center gap-1 font-semibold">
                        <Clock className="h-3 w-3" />
                        {course.duration_hours}h
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-semibold">
                        {course.difficulty_level}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-semibold truncate max-w-[110px]" title={course.career_path}>
                        {course.career_path}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs gap-1 font-bold text-amber-500">
                        <span>{course.rating}</span>
                        <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          onClick={() => handleAddToWishlist(course.id)}
                          className="w-10 h-10 px-0 shrink-0 border-slate-200 dark:border-slate-800 hover:border-rose-300 hover:text-rose-500 dark:hover:border-rose-800 dark:hover:text-rose-400 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center"
                          title="Add to Wishlist"
                        >
                          ❤️
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEnroll(course.id)}
                          className="w-10 h-10 px-0 shrink-0 border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:text-indigo-505 dark:hover:border-indigo-800 dark:hover:text-indigo-400 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center"
                          title="Add to Learning Path"
                        >
                          🎯
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleOpenCourseModal(course.id)}
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-sm hover:shadow-md hover:shadow-indigo-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs rounded-xl px-4 py-2 border-0 h-10"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Progress Indicator */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="relative w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 rounded-full transition-all duration-150"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              {scrollProgress}% explored
            </span>
          </div>
        </div>
      </section>

      {/* Course Details Modal (Consolidated Layout Architecture) */}
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
              <h2 className="text-xl font-bold text-slate-950 dark:text-white line-clamp-1 pr-6">
                {modalLoading ? "Loading Course Details..." : selectedCourseDetails?.title || "Course Details"}
              </h2>
              <button
                onClick={handleCloseCourseModal}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {modalLoading ? (
              <div className="flex-grow flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Fetching dynamic course resources...</p>
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
                        <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Metadata badges */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
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
                        👥 {(selectedCourseDetails.reviews_count || 0) * 15 + 45} Students Enrolled
                      </span>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {selectedCourseDetails.description}
                      </p>
                    </div>

                    {/* Course Materials (No Video Preview) */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">Gamified Pathway</h4>
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100/10 flex flex-col gap-3 shadow-inner">
                            <div className="flex items-start gap-2.5">
                              <span className="text-2xl mt-0.5">🎮</span>
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">Duolingo-Style Practice</div>
                                <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Play checkpoints, answer multiple choice questions, protect your lives (❤️), and generate a PDF Study Guide.</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {(() => {
                          const modalProgress = Math.min(100, Math.round((modalCompletedLessons.length / 3) * 100));
                          return (
                            <Link href={`/courses/${selectedCourseDetails.id}`} className="w-full block">
                              <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-500/10">
                                {modalProgress > 0 ? "Resume the Classroom 🎯" : "Start to Study 🎯"}
                              </Button>
                            </Link>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Course Levels / Syllabus Progress Accordion */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Course Levels (Syllabus)</h3>
                      <div className="space-y-2.5">
                        {[
                          {
                            level: 1,
                            title: "Level 1: Introduction",
                            status: modalCompletedLessons.includes(1) ? "Completed" : "Available",
                            icon: modalCompletedLessons.includes(1) ? "✓" : "➔",
                            color: modalCompletedLessons.includes(1) ? "text-emerald-500 bg-emerald-500/10" : "text-indigo-500 bg-indigo-500/10",
                            isLocked: false,
                            lessons: ["Lecture Notes: Foundational Reading", "Video Presentation: Concepts Walkthrough", "Code Examples: Applied Logic Exercises", "Interactive Quiz: Lesson Assessment Check"]
                          },
                          {
                            level: 2,
                            title: "Level 2: Basic Concepts",
                            status: !modalCompletedLessons.includes(1) ? "Locked" : (modalCompletedLessons.includes(2) ? "Completed" : "Available"),
                            icon: !modalCompletedLessons.includes(1) ? "🔒" : (modalCompletedLessons.includes(2) ? "✓" : "➔"),
                            color: !modalCompletedLessons.includes(1) ? "text-slate-400 bg-slate-400/10 dark:text-slate-500 dark:bg-slate-500/10" : (modalCompletedLessons.includes(2) ? "text-emerald-500 bg-emerald-500/10" : "text-indigo-500 bg-indigo-500/10"),
                            isLocked: !modalCompletedLessons.includes(1),
                            lessons: ["Lesson 2.1: Structuring Data Models", "Lesson 2.2: Conditionals & Iteration Structures", "Lesson 2.3: Reusable Functional Code", "PDF Resource: Basic Concept Worksheets", "Quiz 2: Fundamentals Evaluation Check"]
                          },
                          {
                            level: 3,
                            title: "Level 3: Advanced Topics",
                            status: !modalCompletedLessons.includes(2) ? "Locked" : (modalCompletedLessons.includes(3) ? "Completed" : "Available"),
                            icon: !modalCompletedLessons.includes(2) ? "🔒" : (modalCompletedLessons.includes(3) ? "✓" : "➔"),
                            color: !modalCompletedLessons.includes(2) ? "text-slate-400 bg-slate-400/10 dark:text-slate-500 dark:bg-slate-500/10" : (modalCompletedLessons.includes(3) ? "text-emerald-500 bg-emerald-500/10" : "text-indigo-500 bg-indigo-500/10"),
                            isLocked: !modalCompletedLessons.includes(2),
                            lessons: []
                          },
                          {
                            level: 4,
                            title: "Level 4: Final Assessment",
                            status: !modalCompletedLessons.includes(3) ? "Locked" : "Completed",
                            icon: !modalCompletedLessons.includes(3) ? "🔒" : "✓",
                            color: !modalCompletedLessons.includes(3) ? "text-slate-400 bg-slate-400/10 dark:text-slate-500 dark:bg-slate-500/10" : "text-emerald-500 bg-emerald-500/10",
                            isLocked: !modalCompletedLessons.includes(3),
                            lessons: []
                          }
                        ].map((lvl) => {
                          const isExpanded = !!expandedLevels[lvl.level];
                          return (
                            <div key={lvl.level} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                              <button
                                onClick={() => {
                                  if (lvl.isLocked) {
                                    showToast("Level is locked! Complete preceding levels first.");
                                    return;
                                  }
                                  setExpandedLevels((prev) => ({
                                    ...prev,
                                    [lvl.level]: !prev[lvl.level]
                                  }));
                                }}
                                className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", lvl.color)}>
                                    {lvl.icon}
                                  </span>
                                  <span className="font-semibold text-sm text-slate-900 dark:text-white">{lvl.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                    {lvl.status}
                                  </span>
                                  <span className="text-slate-400 text-xs">{isExpanded ? "▼" : "▶"}</span>
                                </div>
                              </button>

                              {isExpanded && lvl.lessons.length > 0 && (
                                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                  {lvl.lessons.map((lesson, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 py-1.5 border-b border-slate-50 dark:border-slate-950 last:border-0 pl-2">
                                      <span className="text-indigo-400">•</span>
                                      <span>{lesson}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Comments & Reviews */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Comments & Reviews</h3>
                      
                      {!selectedCourseDetails.reviews || selectedCourseDetails.reviews.length === 0 ? (
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/20">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">User A</span>
                            <span className="text-amber-500 text-xs">⭐⭐⭐⭐⭐</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-xs">"Good course! Learned a lot about core concepts."</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {selectedCourseDetails.reviews.map((r: any) => (
                            <div key={r.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/30 dark:bg-slate-950/10">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-slate-950 dark:text-white">{r.userName}</span>
                                <span className="text-amber-500 text-[10px]">
                                  {"⭐".repeat(r.rating)}
                                </span>
                              </div>
                              <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed">{r.text}</p>
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

            {/* Modal Footer Add to Learning Path Button */}
            {!modalLoading && selectedCourseDetails && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 flex items-center justify-center sticky bottom-0 rounded-b-3xl">
                <Button
                  onClick={async () => {
                    await handleEnroll(selectedCourseDetails.id);
                    handleCloseCourseModal();
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
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

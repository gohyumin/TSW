"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { searchCourses, getCategories, CourseData, getCourseById } from "@/app/actions/courses";
import { enrollInCourse } from "@/app/actions/learningPaths";
import { addToWishlist } from "@/app/actions/wishlist";
import { Star, CheckCircle, Search, Filter, X, Clock, BookOpen, Sparkles, Heart, Bookmark, List, Grid, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { getResourcesForCourse } from "@/lib/courseResources";
import { getSubcategories } from "@/app/actions/subcategories";
import { getStudentProfileData } from "@/app/actions/profile";
import { getLevelOneLessonsForStudyMode } from "@/lib/studyMode";

function CoursesContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams ? searchParams.get("category") : null;
  const subParam = searchParams ? searchParams.get("subcategory") : null;

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);

  
  // New Filter & Pagination states
  const [sortBy, setSortBy] = useState<string>("none");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "card">("card");
  const coursesPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  useEffect(() => {
    async function loadInitial() {
      const cats = await getCategories();
      setCategories(cats);
      
      const subs = await getSubcategories();
      setAllSubcategories(subs);
      
      const allCourses = await searchCourses();
      setCourses(allCourses);


      
      if (catParam) {
        setSelectedCategory(Number(catParam));
      }
      if (subParam) {
        const subId = Number(subParam);
        const sub = subs.find(s => s.id === subId);
        if (sub) {
          setSelectedCategory(sub.parent_category_id);
          setSelectedSubcategory(subId);
        }
      }
      
      setLoading(false);
    }
    loadInitial();
  }, [catParam, subParam]);

  // Handle live filtering
  useEffect(() => {
    async function applyFilters() {
      const filtered = await searchCourses(
        searchQuery,
        selectedCategory || undefined,
        undefined,
        selectedSubcategory || undefined
      );
      setCourses(filtered);
    }
    
    // Only search after initial loading has completed
    if (!loading) {
      applyFilters();
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, loading]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSubcategory]);


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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Client-side Sorting
  let processedCourses = [...courses];

  // Sorting
  if (sortBy === "title-asc") {
    processedCourses.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "title-desc") {
    processedCourses.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortBy === "rating-desc") {
    processedCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Pagination calculation
  const totalCourses = processedCourses.length;
  const totalPages = Math.ceil(totalCourses / coursesPerPage) || 1;
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const displayedCourses = processedCourses.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 animate-fade-in border border-slate-800 dark:border-slate-200">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="gradient-hero text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-5 right-20 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight animate-fade-in-up">Explore Courses</h1>
          <p className="text-indigo-200 font-light animate-fade-in-up-delay-1 text-sm">Discover courses matching your career goals and technical pathway</p>
          
          {/* Dynamic Search Box */}
          <div className="relative max-w-md animate-fade-in-up-delay-2">
            <input
              type="text"
              placeholder="Search by title, instructor, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-indigo-200 outline-none backdrop-blur-md focus:bg-white/15 focus:border-white/40 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 sticky top-24 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Filter className="h-4 w-4 text-indigo-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Filters</h3>
              </div>

              {/* Sort By Option */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 10px center', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
                >
                  <option value="none">Default (Relevance)</option>
                  <option value="title-asc">Alphabetical (A-Z)</option>
                  <option value="title-desc">Alphabetical (Z-A)</option>
                  <option value="rating-desc">Rating: High to Low</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category</h4>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => {
                        setSelectedCategory(null);
                        setSelectedSubcategory(null);
                      }}
                      className="accent-indigo-600 dark:accent-indigo-400"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">All Categories</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center space-x-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.id}
                        onChange={() => {
                          setSelectedCategory(cat.id);
                          setSelectedSubcategory(null);
                        }}
                        className="accent-indigo-600 dark:accent-indigo-400"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subcategory Filter */}
              {selectedCategory !== null && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2.5 animate-fade-in">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Subcategory</span>
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <label className="flex items-center space-x-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="subcategory"
                        checked={selectedSubcategory === null}
                        onChange={() => setSelectedSubcategory(null)}
                        className="accent-indigo-600 dark:accent-indigo-400"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">All Subcategories</span>
                    </label>
                    {allSubcategories
                      .filter((sub) => sub.parent_category_id === selectedCategory)
                      .map((sub) => (
                        <label key={sub.id} className="flex items-center space-x-2.5 cursor-pointer group">
                          <input
                            type="radio"
                            name="subcategory"
                            checked={selectedSubcategory === sub.id}
                            onChange={() => setSelectedSubcategory(sub.id)}
                            className="accent-indigo-600 dark:accent-indigo-400"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sub.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main List */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loading ? "Searching..." : `Showing ${totalCourses > 0 ? startIndex + 1 : 0}-${Math.min(endIndex, totalCourses)} of ${totalCourses} ${totalCourses === 1 ? "course" : "courses"}`}
              </p>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"
                  )}
                  title="List View"
                >
                  <List className="h-3.5 w-3.5" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"
                  )}
                  title="Grid View (Dense)"
                >
                  <Grid className="h-3.5 w-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    viewMode === "card"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"
                  )}
                  title="Card View (Featured)"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Card</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs text-slate-400">Loading catalog...</p>
              </div>
            ) : totalCourses === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                <span className="text-4xl block mb-4">🔍</span>
                <p className="text-slate-500 dark:text-slate-400 font-semibold">No courses match your active filters.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className={cn(
                  viewMode === "list"
                    ? "space-y-6"
                    : viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                )}>
                  {displayedCourses.map((course) => {
                    if (viewMode === "list") {
                      return (
                        <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col sm:flex-row group animate-fade-in">
                          <div className={cn("w-full sm:w-64 h-48 bg-gradient-to-br flex items-center justify-center flex-shrink-0 relative", course.gradient_class)}>
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{course.emoji}</span>
                            {course.is_bestseller && (
                              <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                                Bestseller
                              </span>
                            )}
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">
                                {course.category_name}
                              </div>
                              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                <Link href={`/courses/${course.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                  {course.title}
                                </Link>
                              </h2>
                              <p className="text-slate-650 dark:text-slate-400 text-xs mb-3 line-clamp-2">{course.description}</p>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 font-mono">By {course.instructor}</p>
                              
                              <div className="flex items-center mt-3 gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center text-amber-500 font-bold gap-1">
                                  <span>{course.rating}</span>
                                  <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                                </div>
                                <span>•</span>
                                <span>{course.duration_hours} total hours</span>
                                <span>•</span>
                                <span>{course.difficulty_level}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full">
                              <div className="flex gap-2 items-center w-full justify-between sm:justify-end">
                                <Button
                                  onClick={() => handleOpenCourseModal(course.id)}
                                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs px-4 py-2.5 rounded-lg font-semibold"
                                >
                                  View Details
                                </Button>
                                <div className="flex gap-1.5">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleAddToWishlist(course.id)}
                                    className="w-10 h-10 px-0 shrink-0 border-slate-200 dark:border-slate-800 hover:border-rose-300 hover:text-rose-500 dark:hover:border-rose-800 dark:hover:text-rose-455 transition-colors hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center"
                                    title="Add to Wishlist"
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleEnroll(course.id)}
                                    className="w-10 h-10 px-0 shrink-0 border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:text-indigo-500 dark:hover:border-indigo-800 dark:hover:text-indigo-400 transition-colors hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center"
                                    title="Add to Learning Path"
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (viewMode === "grid") {
                      // Compact Grid View
                      return (
                        <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between group animate-fade-in h-[270px]">
                          <div className={cn("relative h-20 bg-gradient-to-br flex items-center justify-center text-3xl flex-shrink-0", course.gradient_class)}>
                            <span className="drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                              {course.emoji}
                            </span>
                          </div>
                          <div className="p-3.5 flex flex-col flex-grow justify-between">
                            <div>
                              <h2 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                <Link href={`/courses/${course.id}`}>
                                  {course.title}
                                </Link>
                              </h2>
                              <p className="text-[10px] text-slate-400 font-mono">By {course.instructor}</p>
                              
                              <div className="flex items-center mt-1.5 gap-1.5 text-[9px] text-slate-500">
                                <div className="flex items-center text-amber-500 gap-0.5 font-semibold">
                                  <span>{course.rating}</span>
                                  <Star className="h-2.5 w-2.5 fill-amber-500 stroke-amber-500" />
                                </div>
                                <span>•</span>
                                <span>{course.duration_hours}h</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-2.5 border-t border-slate-100 dark:border-slate-800 mt-2">
                              <Button
                                onClick={() => handleOpenCourseModal(course.id)}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] py-1.5 px-2 rounded-md font-bold cursor-pointer"
                              >
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleAddToWishlist(course.id)}
                                className="w-7 h-7 px-0 border-slate-200 dark:border-slate-800 hover:text-rose-500 cursor-pointer flex items-center justify-center text-slate-400 dark:text-slate-500"
                                title="Add to Wishlist"
                              >
                                <Heart className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleEnroll(course.id)}
                                className="w-7 h-7 px-0 border-slate-200 dark:border-slate-800 hover:text-indigo-500 cursor-pointer flex items-center justify-center text-slate-400 dark:text-slate-500"
                                title="Add to Learning Path"
                              >
                                <Bookmark className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Card View (Large, beautiful cards)
                      return (
                        <div key={course.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col group h-[480px] justify-between animate-fade-in">
                          <div className={cn("relative h-44 bg-gradient-to-br flex items-center justify-center text-5xl flex-shrink-0", course.gradient_class)}>
                            <span className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {course.emoji}
                            </span>
                            {course.is_bestseller && (
                              <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                                Bestseller
                              </span>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">
                                {course.category_name}
                              </div>
                              <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                <Link href={`/courses/${course.id}`}>
                                  {course.title}
                                </Link>
                              </h2>
                              <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold">By {course.instructor}</p>
                              <p className="text-slate-650 dark:text-slate-400 text-xs mt-2 line-clamp-2">{course.description}</p>
                              
                              <div className="flex flex-wrap items-center mt-3 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                <div className="flex items-center text-amber-500 font-bold gap-1">
                                  <span>{course.rating}</span>
                                  <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                                </div>
                                <span>•</span>
                                <span>{course.duration_hours}h</span>
                                <span>•</span>
                                <span>{course.difficulty_level}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex justify-between items-center w-full pt-1">
                                <div className="flex gap-1.5">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleAddToWishlist(course.id)}
                                    className="w-9 h-9 px-0 shrink-0 border-slate-200 dark:border-slate-800 hover:border-rose-300 hover:text-rose-500 dark:hover:border-rose-800 dark:hover:text-rose-400 transition-colors hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center"
                                    title="Add to Wishlist"
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleEnroll(course.id)}
                                    className="w-9 h-9 px-0 shrink-0 border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:text-indigo-500 dark:hover:border-indigo-800 dark:hover:text-indigo-400 transition-colors hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center"
                                    title="Add to Learning Path"
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button
                                  onClick={() => handleOpenCourseModal(course.id)}
                                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs px-4 py-2 rounded-xl font-semibold shrink-0"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>


                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="px-4 py-2 border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer disabled:opacity-55"
                    >
                      ◀ Previous
                    </Button>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className="px-4 py-2 border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer disabled:opacity-55"
                    >
                      Next ▶
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

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
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
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
                          <p className="text-slate-650 dark:text-slate-400 text-xs">"Good course! Learned a lot about core concepts."</p>
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
                              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{r.text}</p>
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

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}

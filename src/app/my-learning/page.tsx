"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getLearningPathItems, removeFromLearningPathWithReason, enrollInCourse } from "@/app/actions/learningPaths";
import { getCurrentStudent } from "@/app/actions/auth";
import { getRecommendations } from "@/app/actions/recommendation";
import { getStudentProfileData } from "@/app/actions/profile";
import { getCourseById, submitCourseReview } from "@/app/actions/courses";
import { getResourcesForCourse } from "@/lib/courseResources";
import { getLevelOneLessonsForStudyMode, getLevelOneSummaryForStudyMode } from "@/lib/studyMode";
import { addToWishlist } from "@/app/actions/wishlist";
import { getCategories } from "@/app/actions/categories";
import { getSubcategories } from "@/app/actions/subcategories";
import { GraduationCap, Trash2, CheckCircle, Star, Clock, X, Sparkles, Heart, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MyLearningPage() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [removeModal, setRemoveModal] = useState<{ open: boolean; courseId: number | null; courseTitle: string }>({ open: false, courseId: null, courseTitle: "" });
  const [selectedRemoveReason, setSelectedRemoveReason] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 340; // Card width + gap
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };
  
  // Track course progress from localStorage
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});

  // Recommendations state
  const [recs, setRecs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedRecCategory, setSelectedRecCategory] = useState<string | null>(null);
  const [selectedRecSubcategory, setSelectedRecSubcategory] = useState<string | null>(null);
  
  // Course Details Modal state
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalCompletedLessons, setModalCompletedLessons] = useState<number[]>([]);
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({});

  // Review submission state inside modal
  const [modalReviewRating, setModalReviewRating] = useState(0);
  const [modalReviewHover, setModalReviewHover] = useState(0);
  const [modalReviewText, setModalReviewText] = useState("");
  const [modalReviewSubmitting, setModalReviewSubmitting] = useState(false);
  const [modalReviewError, setModalReviewError] = useState<string | null>(null);
  const [modalReviewSubmitted, setModalReviewSubmitted] = useState(false);

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
      const activeUser = await getCurrentStudent();
      if (!activeUser) {
        router.push("/login");
        return;
      }
      setUser(activeUser);



      const items = await getLearningPathItems();
      setEnrolledCourses(items);
      updateProgressMapping(items);

      const recommendations = await getRecommendations(activeUser.id);
      setRecs(recommendations);

      const cats = await getCategories();
      setCategories(cats);

      const subs = await getSubcategories();
      setSubcategories(subs);

      setLoading(false);
    }
    loadData();
  }, [router]);

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
    setModalReviewRating(0);
    setModalReviewHover(0);
    setModalReviewText("");
    setModalReviewSubmitting(false);
    setModalReviewError(null);
    setModalReviewSubmitted(false);
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
      const items = await getLearningPathItems();
      setEnrolledCourses(items);
      updateProgressMapping(items);
      if (user) {
        const recommendations = await getRecommendations(user.id);
        setRecs(recommendations);
      }
    } else {
      showToast(res.error || "Please log in first.");
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

  const openRemoveModal = (id: number, title: string) => {
    setRemoveModal({ open: true, courseId: id, courseTitle: title });
    setSelectedRemoveReason(null);
  };

  const closeRemoveModal = () => {
    setRemoveModal({ open: false, courseId: null, courseTitle: "" });
    setSelectedRemoveReason(null);
    setRemoveLoading(false);
  };

  const handleConfirmRemove = async () => {
    if (!removeModal.courseId || !selectedRemoveReason) return;
    setRemoveLoading(true);
    const res = await removeFromLearningPathWithReason(removeModal.courseId, selectedRemoveReason);
    if (res.success) {
      setEnrolledCourses((prev) => prev.filter((item) => item.id !== removeModal.courseId));
      const reasonLabels: Record<string, string> = {
        "too-easy": "Marked as mastered",
        "too-difficult": "Flagged for prerequisite review",
        "not-interested": "Interest preference updated",
        "poor-quality": "Blocked from future recommendations"
      };
      showToast(`✅ Course removed. ${reasonLabels[selectedRemoveReason] || ""} — recommendations will be recalculated.`);
      if (user) {
        const recommendations = await getRecommendations(user.id);
        setRecs(recommendations);
      }
    } else {
      showToast(`❌ ${res.error || "Failed to remove course."}`);
    }
    closeRemoveModal();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  const filteredRecs = recs.filter((course) => {
    if (selectedRecCategory && course.category_name !== selectedRecCategory) {
      return false;
    }
    if (selectedRecSubcategory && course.subcategory_name !== selectedRecSubcategory) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 animate-fade-in border border-slate-800 dark:border-slate-200">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero section */}
      <section className="gradient-hero text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="max-w-4xl mx-auto relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/25">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">My Learning</h1>
            <p className="text-indigo-200 text-xs font-light">Resume and track progress on courses you have chosen to study.</p>
          </div>
        </div>
      </section>

      {/* Main Course Progress Cards */}
      <section className="py-12 px-4 max-w-4xl mx-auto space-y-12">
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-3xl p-8 shadow-sm">
            <span className="text-6xl block mb-6">📚</span>
            <h2 className="text-2xl font-bold mb-3">Your study list is empty</h2>
            <p className="text-slate-505 dark:text-slate-400 mb-8 max-w-sm mx-auto text-xs leading-relaxed">
              Browse the catalog and add courses to your learning list. Your active course progress will be tracked here.
            </p>
            <Link href="/courses">
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/10 hover:scale-102 active:scale-98 transition-all px-8 py-5 rounded-xl cursor-pointer">
                Explore Available Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-slate-500 dark:text-slate-400 font-bold text-xs">
              Selected Courses ({enrolledCourses.length})
            </div>

            <div className="space-y-4">
              {enrolledCourses.map((item) => {
                const progress = progressMap[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row gap-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-80 border-slate-200 dark:border-slate-800 p-6 rounded-3xl items-center hover:shadow-md transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className={cn("w-full md:w-32 h-24 bg-gradient-to-br rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl shadow-inner", item.gradient)}>
                      {item.emoji}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-3.5 w-full text-center md:text-left min-w-0">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">By {item.instructor}</p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                          <span>Syllabus Progress</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-center md:justify-start gap-4 pt-1 text-xs">
                        <Link href={`/courses/${item.id}`}>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            {progress > 0 ? "Resume the Classroom 🎯" : "Start to Study 🎯"}
                          </Button>
                        </Link>
                        <button
                          onClick={() => openRemoveModal(item.id, item.title)}
                          className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-650 hover:text-rose-600 font-semibold cursor-pointer py-1 bg-transparent border-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Leave Path
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Relocated Personalized Recommendations Section */}
        <div className="bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-teal-500/5 border border-indigo-100 dark:border-indigo-950 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm z-10">
            Personalized Recommendation
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Recommended For Your Path</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xl">
                These recommendations are automatically adjusted using rules mapping user interests and reviews.
              </p>
            </div>
            {filteredRecs.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scrollCarousel("left")}
                  className="h-8 w-8 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scrollCarousel("right")}
                  className="h-8 w-8 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* All Paths badge */}
          <div className="flex items-center gap-2 mb-6 pt-4 border-t border-indigo-100/10 dark:border-indigo-950/40">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white border border-indigo-600 shadow-md shadow-indigo-500/25 flex items-center gap-1.5">
              <span>🌟</span>
              <span>All Paths</span>
            </span>
          </div>

          {filteredRecs.length === 0 ? (
            <div className="py-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No recommendations match the selected filters.</p>
              {selectedRecCategory && (
                <p className="text-xs text-slate-400 dark:text-slate-550 mt-1.5">
                  Explore all courses in this category on the{" "}
                  <Link href={`/courses?category=${categories.find((c) => c.category_name === selectedRecCategory)?.id}`} className="text-indigo-600 dark:text-indigo-400 font-semibold underline">
                    Courses page
                  </Link>.
                </p>
              )}
            </div>
          ) : (
            <div 
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {filteredRecs.map((course) => (
                <div
                  key={course.id}
                  className="min-w-[300px] w-[300px] md:min-w-[340px] md:w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group snap-start"
                >
                  <div className={cn("h-36 bg-gradient-to-br flex items-center justify-center relative", course.gradient_class)}>
                    <span className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                      {course.emoji}
                    </span>
                    <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="bg-indigo-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm">
                        {course.category_name}
                      </span>
                      {course.subcategory_name && (
                        <span className="bg-teal-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm">
                          {course.subcategory_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">By {course.instructor}</p>
                      
                      <div className="space-y-1.5 pt-1">
                        {course.reasons.map((reason: string, index: number) => (
                          <div 
                            key={index} 
                            className="text-[9px] text-indigo-750 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/40 px-2.5 py-1.5 rounded-lg border border-indigo-100/30 dark:border-indigo-950 leading-normal"
                          >
                            💡 {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{course.difficulty_level} • {course.duration_hours}h</span>
                      <Button
                        size="sm"
                        onClick={() => handleOpenCourseModal(course.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 pr-6">
                {modalLoading ? "Loading Course Details..." : selectedCourseDetails?.title || "Course Details"}
              </h2>
              <button
                onClick={handleCloseCourseModal}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-550 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {modalLoading ? (
              <div className="flex-grow flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Fetching dynamic course resources...</p>
              </div>
            ) : selectedCourseDetails ? (
              (() => {
                const resources = getResourcesForCourse(selectedCourseDetails.id);
                const isEnrolled = enrolledCourses.some((item) => item.id === selectedCourseDetails.id);
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
                      <span className="text-indigo-605 dark:text-indigo-400">By {selectedCourseDetails.instructor}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" />
                        {selectedCourseDetails.rating} Rating ({selectedCourseDetails.reviews_count || 0} reviews)
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-indigo-550 dark:text-indigo-400" />
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

                    {/* Path Certification Info */}
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-1.5 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        🏆 Official Graduation Certificate
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        Complete all gamified lesson quizzes with a score of <strong>70% or above</strong> to claim your official <strong>{selectedCourseDetails.title} Certification of Completion</strong>. You can print or download your verified academic board certificate directly from your classroom.
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
                            <button
                              type="button"
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
                              className="block h-full group/card text-left"
                            >
                              <div 
                                className={cn(
                                  "border p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm relative transition-all duration-300 hover:scale-[1.02] h-full cursor-pointer",
                                  isLocked 
                                    ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 opacity-60" 
                                    : "bg-white dark:bg-slate-900 border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-550"
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
                                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white pt-1 group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">
                                    {lvl.title}: {lvl.subtitle}
                                  </h4>
                                  <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                                    {lvl.summary}
                                  </p>
                                  {isExpanded && lvl.lessons.length > 0 && (
                                    <div className="pt-2 space-y-1.5">
                                      {lvl.lessons.map((lesson, idx) => (
                                        <div key={idx} className="flex items-start gap-1.5 text-[9px] text-slate-600 dark:text-slate-350">
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
                            </button>
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
                      
                      {isEnrolled && (
                        <div className="border border-indigo-100 dark:border-indigo-950/40 rounded-2xl p-4 bg-indigo-50/10 dark:bg-indigo-950/5 space-y-3">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            ✍️ Leave Your Feedback & Comment
                          </h4>
                          {modalReviewSubmitted ? (
                            <p className="text-xs text-emerald-500 font-bold">✓ Thank you! Review submitted and dynamically fed into semantic graph reasoning.</p>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    type="button"
                                    key={star}
                                    onMouseEnter={() => setModalReviewHover(star)}
                                    onMouseLeave={() => setModalReviewHover(0)}
                                    onClick={() => setModalReviewRating(star)}
                                    className="cursor-pointer transition-transform hover:scale-110 border-0 bg-transparent p-0"
                                  >
                                    <Star
                                      className={cn(
                                        "h-5 w-5 transition-colors",
                                        (modalReviewHover || modalReviewRating) >= star
                                          ? "fill-amber-400 stroke-amber-400"
                                          : "fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700"
                                      )}
                                    />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                rows={2}
                                placeholder="Share your comments or list topics to help semantic reasoning recommendations..."
                                value={modalReviewText}
                                onChange={(e) => setModalReviewText(e.target.value)}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-slate-900 dark:text-white font-medium"
                              />
                              {modalReviewError && (
                                <p className="text-[10px] text-rose-500 font-semibold">{modalReviewError}</p>
                              )}
                              <Button
                                type="button"
                                disabled={modalReviewRating === 0 || !modalReviewText.trim() || modalReviewSubmitting}
                                onClick={async () => {
                                  setModalReviewSubmitting(true);
                                  setModalReviewError(null);
                                  const res = await submitCourseReview(selectedCourseDetails.id, modalReviewRating, modalReviewText.trim());
                                  setModalReviewSubmitting(false);
                                  if (res.success) {
                                    setModalReviewSubmitted(true);
                                    // Refresh details to show new review
                                    const updatedDetails = await getCourseById(selectedCourseDetails.id);
                                    setSelectedCourseDetails(updatedDetails);
                                    // Refresh recommendations based on new semantic review!
                                    if (user) {
                                      const newRecs = await getRecommendations(user.id);
                                      setRecs(newRecs);
                                    }
                                    showToast("✅ Review saved! Recommendations updated.");
                                  } else {
                                    setModalReviewError(res.error || "Submission failed.");
                                  }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-[10px] disabled:opacity-40 cursor-pointer border-0 shadow-sm"
                              >
                                {modalReviewSubmitting ? "Saving..." : "Submit Semantic Review"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

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
                                <span className="font-bold text-xs text-slate-900 dark:text-white">{r.userName}</span>
                                <span className="text-amber-500 text-[10px]">
                                  {"⭐".repeat(r.rating)}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed">{r.text}</p>
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
            {!modalLoading && selectedCourseDetails && !enrolledCourses.some((item) => item.id === selectedCourseDetails.id) && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-955/30 flex items-center justify-end sticky bottom-0 rounded-b-3xl w-full">
                <Button
                  onClick={async () => {
                    await handleEnroll(selectedCourseDetails.id);
                    handleCloseCourseModal();
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer text-sm justify-center"
                >
                  Add to My Learning Path 🎯
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {removeModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/30 rounded-2xl text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Are you sure you want to remove it?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You are removing <span className="font-semibold text-indigo-600 dark:text-indigo-400">{removeModal.courseTitle}</span> from your learning path.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Please tell us why:
              </label>
              <div className="grid gap-2">
                {[
                  { key: "too-easy", label: "Too Easy (I already know this)", icon: "🎓" },
                  { key: "too-difficult", label: "Too Difficult (need prerequisites)", icon: "📈" },
                  { key: "not-interested", label: "Not Interested anymore", icon: "🥱" },
                  { key: "poor-quality", label: "Poor Content Quality / Low relevance", icon: "👎" }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedRemoveReason(option.key)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer",
                      selectedRemoveReason === option.key
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                    )}
                  >
                    <span>{option.icon}</span>
                    <span className="flex-1">{option.label}</span>
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      selectedRemoveReason === option.key
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 dark:border-slate-700"
                    )}>
                      {selectedRemoveReason === option.key && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={closeRemoveModal}
                disabled={removeLoading}
                className="flex-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRemove}
                disabled={!selectedRemoveReason || removeLoading}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-md shadow-rose-500/10 cursor-pointer disabled:opacity-50"
              >
                {removeLoading ? "Removing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

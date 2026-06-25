"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginStudent, registerStudent } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Lock, User, Sparkles, ArrowRight, ArrowLeft, Check, BookOpen, UserCheck, Target, Award, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSubcategoriesByParent } from "@/app/actions/categories";

const initialCategories = [
  "Programming",
  "Business",
  "Law",
  "Engineering"
];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subcategoriesByParent, setSubcategoriesByParent] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadSubs() {
      const subs = await getSubcategoriesByParent();
      setSubcategoriesByParent(subs);
    }
    loadSubs();
  }, []);

  // Form Credentials State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration Onboarding Steps
  const [registerStep, setRegisterStep] = useState(1); // Steps 1 to 6
  const [learningGoal, setLearningGoal] = useState("Software Developer");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [interests, setInterests] = useState<string[]>(["Programming"]);
  const [educationBackground, setEducationBackground] = useState("Computer Science");
  const [preferredLearningStyle, setPreferredLearningStyle] = useState("Practical");

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleInterest = (cat: string) => {
    setInterests((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginStudent(email, password);
      if (res.success) {
        if (typeof window !== "undefined") {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith("course_")) {
              localStorage.removeItem(key);
            }
          });
        }
        showToast("✅ Welcome back! Logged in successfully.");
        router.push("/my-learning");
        router.refresh();
      } else {
        showToast("❌ Invalid email or password.");
        setError(res.error || "Login failed.");
      }
    } catch (err) {
      showToast("❌ An unexpected error occurred. Please try again.");
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await registerStudent(
        name,
        email,
        password,
        learningGoal,
        skillLevel,
        interests,
        educationBackground
      );
      if (res.success) {
        if (typeof window !== "undefined") {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith("course_")) {
              localStorage.removeItem(key);
            }
          });
        }
        showToast("🎉 Account created! Welcome to LearnWise.");
        router.push("/my-learning");
        router.refresh();
      } else {
        showToast(`❌ ${res.error || "Registration failed."}`);
        setError(res.error || "Registration failed.");
        setRegisterStep(1); // Return to credentials step on error
      }
    } catch (err) {
      showToast("❌ An unexpected error occurred. Please try again.");
      setError("An unexpected error occurred. Please try again.");
      setRegisterStep(1);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (registerStep === 1) {
      if (!name || !email || !password) {
        setError("Please fill in your account credentials.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }
    setError(null);
    setRegisterStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setRegisterStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12 transition-colors duration-300">
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 animate-fade-in border border-slate-800 dark:border-slate-200">
          <CheckCircle className="h-4 w-4" />
          {toastMessage}
        </div>
      )}
      <div className="absolute top-24 left-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-12 right-1/4 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl animate-float-delayed" />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Welcome to LearnWise</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {activeTab === "login" 
              ? "Discover courses and track your learning progress"
              : "Initializing your profile"
            }
          </p>
        </div>

        {/* Tab Controls (Hidden when inside step 2+ of registration wizard) */}
        {!(activeTab === "register" && registerStep > 1) && (
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => {
                setActiveTab("login");
                setError(null);
              }}
              className={cn(
                "flex-1 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer",
                activeTab === "login"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setError(null);
              }}
              className={cn(
                "flex-1 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer",
                activeTab === "register"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Wizard Progress Bar for Sign Up */}
        {activeTab === "register" && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
            <span>Setup Step {registerStep} of 5</span>
            <span>
              {registerStep === 1 && "Account Settings"}
              {registerStep === 2 && "Learning Goals"}
              {registerStep === 3 && "Technical Level"}
              {registerStep === 4 && "Education Background"}
              {registerStep === 5 && "Interests"}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full transition-all duration-300"
              style={{ width: `${(registerStep / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold px-4 py-3 rounded-xl mb-6 text-center animate-shake">
            {error}
          </div>
        )}

        {/* SIGN IN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pl-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pl-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-6 text-sm shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl cursor-pointer"
            >
              {loading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
        )}

        {/* REGISTER STEP-BY-STEP ONBOARDING WIZARD */}
        {activeTab === "register" && (
          <div className="space-y-6">
            
            {/* Step 1: Account Info */}
            {registerStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pl-1">Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pl-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pl-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <Button
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-6 text-sm shadow-md hover:scale-102 active:scale-98 transition-all rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Next: Career Goals
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Learning Goal */}
            {registerStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Target className="h-5 w-5" />
                    <span className="text-sm font-bold">Configure Learning Profile</span>
                  </div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    What is your target career path / learning goal?
                  </label>
                  <select
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="Software Developer">Software Developer (Programming)</option>
                    <option value="Business Manager">Business Manager (Business)</option>
                    <option value="Legal Counsel">Legal Counsel (Law)</option>
                    <option value="Robotics Engineer">Robotics Engineer (Engineering)</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-102 active:scale-98 transition-all py-6 rounded-xl font-bold cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-6 hover:scale-102 active:scale-98 transition-all rounded-xl cursor-pointer"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Skill Level */}
            {registerStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Award className="h-5 w-5" />
                    <span className="text-sm font-bold">Profile Skill Parameters</span>
                  </div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    What is your current skill level?
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-102 active:scale-98 transition-all py-6 rounded-xl font-bold cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-6 hover:scale-102 active:scale-98 transition-all rounded-xl cursor-pointer"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Education Background */}
            {registerStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm font-bold">Academic Background</span>
                  </div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    What is your primary education background?
                  </label>
                  <select
                    value={educationBackground}
                    onChange={(e) => setEducationBackground(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Business">Business</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-102 active:scale-98 transition-all py-6 rounded-xl font-bold cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-6 hover:scale-102 active:scale-98 transition-all rounded-xl cursor-pointer"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Interests */}
            {registerStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm font-bold">Select Domain Interests</span>
                  </div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Select the categories you are interested in:
                  </label>
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {initialCategories.map((cat) => {
                      const isChecked = interests.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            toggleInterest(cat);
                            // If we uncheck a category, also uncheck its subcategories
                            if (isChecked) {
                              const subs = subcategoriesByParent[cat] || [];
                              setInterests(prev => prev.filter(i => !subs.includes(i) && i !== cat));
                            }
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all duration-200 hover:scale-102 cursor-pointer",
                            isChecked
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10"
                              : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-indigo-500"
                          )}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subcategories (Optional) */}
                {interests.some(cat => initialCategories.includes(cat)) && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                    <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Optional: Specify subcategories you want to learn</span>
                    </label>
                    <div className="space-y-4 max-h-[180px] overflow-y-auto pr-1">
                      {initialCategories.filter(cat => interests.includes(cat)).map(cat => (
                        <div key={cat} className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{cat} Subcategories</span>
                          <div className="flex flex-wrap gap-1.5">
                            {subcategoriesByParent[cat]?.map(sub => {
                              const isSubChecked = interests.includes(sub);
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => toggleInterest(sub)}
                                  className={cn(
                                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all duration-200 cursor-pointer",
                                    isSubChecked
                                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                                      : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                  )}
                                >
                                  {isSubChecked && <Check className="h-3 w-3" />}
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

                <div className="flex gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-102 active:scale-98 transition-all py-6 rounded-xl font-bold cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleRegisterSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white font-bold py-6 hover:scale-102 active:scale-98 transition-all rounded-xl cursor-pointer"
                  >
                    {loading ? "Initializing..." : "Complete Setup 🚀"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold bg-slate-50 dark:bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Personalized learning for you </span>
          </div>
        </div>
      </div>
    </div>
  );
}

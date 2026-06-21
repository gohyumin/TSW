"use client";

import { Award, Compass, Heart, Shield, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { value: "500K+", label: "Active Learners", subtitle: "Learning worldwide 24/7" },
  { value: "150+", label: "Suggested Roadmaps", subtitle: "Zero to job-ready timelines" },
  { value: "1,000+", label: "Gamified Practice Levels", subtitle: "Active, bite-sized lessons" },
  { value: "98%", label: "Completion Rate", subtitle: "Highly engaged student path success" },
];

const pillars = [
  {
    icon: Compass,
    title: "Personalized Discovery",
    description: "Curated learning paths that adapt to your specific career goals and skill level dynamically.",
    color: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-55 dark:from-blue-950/20 dark:to-indigo-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    icon: Award,
    title: "Gamified Classrooms",
    description: "Duolingo-style learning checkpoints where you solve challenges, verify your knowledge, and protect your lives.",
    color: "from-teal-500 to-emerald-500",
    bgGradient: "from-teal-50 to-emerald-55 dark:from-teal-950/20 dark:to-emerald-950/20",
    borderColor: "border-teal-200 dark:border-teal-800",
  },
  {
    icon: Shield,
    title: "Barrier-Free Access",
    description: "No subscription fees or pricing filters. We focus exclusively on matching you to high-quality educational materials.",
    color: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-50 to-purple-55 dark:from-violet-950/20 dark:to-purple-950/20",
    borderColor: "border-violet-200 dark:border-violet-800",
  },
  {
    icon: Sparkles,
    title: "Intelligent Pathways",
    description: "Powered by advanced profiling and matching engines to align skill tags to user profiles accurately.",
    color: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-55 dark:from-amber-955/20 dark:to-orange-955/20",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Hero Banner */}
      <section className="gradient-hero text-white py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-5 right-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10 text-indigo-100">
            ✨ Learning Redefined
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight animate-fade-in-up">Empowering Lifelong Learners</h1>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto font-light animate-fade-in-up-delay-1 leading-relaxed">
            We build personalized roadmaps and interactive environments that help you discover your path, practice effectively, and master new skills.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 bg-white dark:bg-slate-950 transition-colors duration-300 flex-grow">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Mission & Vision Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-teal-500/5 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-955 dark:text-white flex items-center gap-2">
                🎯 Our Mission
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                To replace commercialized learning traps with clean, personalized educational pathways. We believe that discovering what to study should be based on your career interests and goals rather than advertising filters.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-teal-500/5 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-955 dark:text-white flex items-center gap-2">
                👁️ Our Vision
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                To map the entire global catalog of skills and build an adaptive knowledge graph that guides students seamlessly from zero proficiency to their target competence level through active, gamified study check-ins.
              </p>
            </div>
          </div>

             {/* Stats Section */}
      <section className="py-12 px-4 bg-slate-100/50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {stat.label}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  {stat.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


          {/* Pillars Section */}
          <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-900">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-bold text-slate-955 dark:text-white">Our Core Pillars</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                How we structure the next generation of online learning to keep you engaged.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((tech) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={tech.title}
                    className={cn(
                      "bg-gradient-to-br border rounded-3xl p-6 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1",
                      tech.bgGradient,
                      tech.borderColor
                    )}
                  >
                    <div className="space-y-4">
                      <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform", tech.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-slate-955 dark:text-white text-sm">{tech.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{tech.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
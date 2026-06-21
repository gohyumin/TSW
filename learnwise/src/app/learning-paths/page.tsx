"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LearningPathsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile?tab=learning-paths");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

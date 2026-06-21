"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getWishlistItems, removeFromWishlist } from "@/app/actions/wishlist";
import { enrollInCourse } from "@/app/actions/learningPaths";
import { getCurrentStudent } from "@/app/actions/auth";
import { Heart, Trash2, GraduationCap, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const activeUser = await getCurrentStudent();
      setUser(activeUser);

      if (activeUser) {
        const items = await getWishlistItems();
        setWishlistItems(items);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleRemoveItem = async (id: number) => {
    const res = await removeFromWishlist(id);
    if (res.success) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
      showToast("Removed from wishlist.");
    } else {
      showToast(res.error || "Failed to remove.");
    }
  };

  const handleEnroll = async (id: number) => {
    const resCart = await enrollInCourse(id);
    if (resCart.success) {
      await removeFromWishlist(id);
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
      showToast("Enrolled in learning path!");
    } else {
      showToast(resCart.error || "Failed to enroll.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 animate-fade-in border border-slate-800 dark:border-slate-200">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
            <Heart className="h-5 w-5 fill-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Wishlist</h1>
        </div>

        {!user ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm max-w-md mx-auto">
            <span className="text-5xl block mb-4">🔑</span>
            <h2 className="text-2xl font-bold mb-3">Please sign in</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Log in to view items saved to your wishlist.
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold px-6 py-4">Sign In</Button>
            </Link>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <span className="text-6xl block mb-6">❤️</span>
            <h2 className="text-2xl font-bold mb-3">Your wishlist is empty</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              Save courses you are interested in here to keep track of them.
            </p>
            <Link href="/courses">
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/10 hover:scale-102 active:scale-98 transition-all px-8 py-5 rounded-xl cursor-pointer">
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 rounded-full shadow-md text-slate-500 hover:text-rose-500 z-10 transition-colors cursor-pointer border border-transparent dark:border-slate-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Gradient Thumbnail */}
                <div className={cn("h-40 bg-gradient-to-br flex items-center justify-center relative", item.gradient)}>
                  <span className="text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {item.emoji}
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 bg-black/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-base text-slate-950 dark:text-white mb-1 line-clamp-2 flex-grow group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">By {item.instructor}</p>

                  <div className="flex items-center justify-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto w-full">
                    <Button onClick={() => handleEnroll(item.id)} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-500/10 hover:scale-102 active:scale-98 transition-all py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                      <GraduationCap className="h-4 w-4" />
                      Add to Learning Path
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
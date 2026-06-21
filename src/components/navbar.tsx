"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-border shadow-sm dark:shadow-black/30">
      <div className="flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8 mx-auto">
        <Link href="/" className="text-2xl font-black tracking-tight gradient-text">
          LearnWise
        </Link>

        <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 dark:border-border bg-slate-100 dark:bg-card p-1.5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                isActive(item.href)
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-72 rounded-full border border-slate-200 dark:border-border bg-slate-100 dark:bg-card py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-550 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-card focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          </div>

          <Link
            href="/wishlist"
            className={cn(
              "rounded-full p-2 transition-all duration-200 hover:scale-110",
              pathname.startsWith("/wishlist")
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
            )}
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/my-learning"
            className={cn(
              "rounded-full p-2 transition-all duration-200 hover:scale-110",
              pathname.startsWith("/my-learning")
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
            )}
            aria-label="My Learning"
          >
            <GraduationCap className="h-5 w-5" />
          </Link>
          <Link
            href="/profile"
            className={cn(
              "rounded-full p-2 transition-all duration-200 hover:scale-110",
              pathname.startsWith("/profile")
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
            )}
            aria-label="Profile"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
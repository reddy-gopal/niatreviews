"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useLayoutEffect } from "react";
import { clearTokens } from "@/lib/auth";
import { useUnreadCount } from "@/hooks/useNotifications";
import {
  Bell,
  User,
  ChevronDown,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "./NavbarLogo";

export function SeniorNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  useLayoutEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearTokens();
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full px-2 pt-2 sm:px-3 sm:pt-3">
      <div
        className="max-w-[88rem] mx-auto flex h-14 sm:h-16 md:h-20 items-center gap-2 sm:gap-4 px-3 sm:px-5 rounded-xl sm:rounded-2xl border border-niat-border shadow-soft"
        style={{ backgroundColor: "var(--niat-navbar)" }}
      >
        <NavbarLogo />
        <div className="flex-1 min-w-0" aria-hidden />
        <nav className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg text-niat-text-secondary hover:text-primary transition-colors",
              "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-2 text-sm font-medium",
              pathname === "/dashboard" ? "text-primary" : ""
            )}
            aria-label="Dashboard"
          >
            <LayoutDashboard className="h-5 w-5 sm:h-4 sm:w-4 md:hidden" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link
            href="/questions"
            className={cn(
              "hidden md:flex items-center justify-center gap-1.5 rounded-lg text-niat-text-secondary hover:text-primary transition-colors",
              "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-2 text-sm font-medium",
              pathname === "/questions" || pathname?.startsWith("/questions/") ? "text-primary" : ""
            )}
            aria-label="Questions"
          >
            Questions
          </Link>
          <Link
            href="/notifications"
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-lg text-niat-text-secondary hover:text-primary transition-colors",
              "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:px-2 sm:py-1.5"
            )}
            aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
            title={unreadCount > 0 ? `${unreadCount} unread` : "Notifications"}
          >
            <Bell className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden md:inline text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                aria-hidden
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className={cn(
                "flex items-center gap-1 rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 text-sm font-medium text-niat-text hover:bg-niat-border/50 transition-colors",
                "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              )}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-label="Profile menu"
            >
              <User className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden md:inline">Profile</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <div
                className="absolute right-0 top-full mt-1 w-48 rounded-xl sm:rounded-2xl border border-niat-border py-1 shadow-card z-50"
                style={{ backgroundColor: "var(--niat-section)" }}
                role="menu"
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-niat-text hover:bg-niat-border/50 rounded-t-xl sm:rounded-t-2xl"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm hover:bg-niat-border/50 rounded-b-xl sm:rounded-b-2xl text-primary"
                  role="menuitem"
                >
                  <LogIn className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

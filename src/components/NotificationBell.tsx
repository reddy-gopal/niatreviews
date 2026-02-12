"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";
import { isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const auth = isAuthenticated();

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (!auth) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-lg",
          "border border-niat-border bg-[var(--niat-section)]",
          "text-niat-text hover:bg-niat-border/30 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-80 rounded-lg border border-niat-border",
            "bg-[var(--niat-section)] shadow-lg z-50"
          )}
        >
          <div className="p-3 border-b border-niat-border">
            <h3 className="text-sm font-semibold text-niat-text">Notifications</h3>
          </div>
          <div className="p-3 text-center">
            <p className="text-sm text-niat-text-secondary mb-3">
              View all your notifications on the notifications page
            </p>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

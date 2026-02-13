"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, MessageCircle, ThumbsUp, FileText } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { LoadingBlock } from "@/components/LoadingSpinner";

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function verbLabel(verb: string): string {
  const labels: Record<string, string> = {
    comment_reply: "replied to your comment",
    post_comment: "commented on your post",
    upvote: "upvoted your post",
    mention: "mentioned you",
  };
  return labels[verb] || verb.replace(/_/g, " ");
}

export default function NotificationsPage() {
  const router = useRouter();
  const [filterUnread, setFilterUnread] = useState<boolean | undefined>(undefined);

  const { data, status, error, isFetching } = useNotifications(1, filterUnread);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  const notifications = data?.results ?? [];
  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <div
      className="py-8 rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-niat-text flex items-center gap-2">
          <Bell className="h-7 w-7" />
          Notifications
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterUnread(filterUnread === true ? undefined : true)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
              filterUnread === true
                ? "bg-primary text-primary-foreground border-primary"
                : "border-niat-border text-niat-text hover:bg-niat-border/20"
            )}
          >
            Unread only
          </button>
          {hasUnread && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="rounded-xl border border-niat-border px-4 py-2 text-sm font-medium text-niat-text hover:bg-niat-border/20 flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {status === "pending" || isFetching ? (
        <LoadingBlock className="py-8" />
      ) : status === "error" ? (
        <p className="text-primary py-8 text-center">
          Failed to load notifications. {error?.message}
        </p>
      ) : notifications.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-niat-border bg-white/50">
          <Bell className="h-12 w-12 text-niat-text-secondary mx-auto mb-3" />
          <p className="text-niat-text-secondary">
            {filterUnread ? "No unread notifications." : "No notifications yet."}
          </p>
          {filterUnread && (
            <button
              type="button"
              onClick={() => setFilterUnread(undefined)}
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              Show all
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const isComment = n.verb?.includes("comment") ?? false;
            const hasTarget = !!n.target_url;
            const clickable = isComment && hasTarget;

            const handleClick = () => {
              if (!clickable) return;
              if (!n.read_at) markRead.mutate(n.id);
              if (n.target_url) router.push(n.target_url);
            };

            return (
              <li
                key={n.id}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  n.read_at
                    ? "border-niat-border bg-white/30"
                    : "border-primary/20 bg-primary/5",
                  clickable && "cursor-pointer hover:bg-niat-border/20"
                )}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? handleClick : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleClick();
                        }
                      }
                    : undefined
                }
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-niat-border/50 text-niat-text-secondary">
                    {isComment ? (
                      <MessageCircle className="h-4 w-4" />
                    ) : n.verb?.includes("upvote") ? (
                      <ThumbsUp className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-niat-text">
                      <span className="font-medium">u/{n.actor_username}</span>{" "}
                      {verbLabel(n.verb)}
                    </p>
                    <p className="text-xs text-niat-text-secondary mt-0.5">
                      {formatTime(n.created_at)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data?.next && (
        <p className="text-sm text-niat-text-secondary mt-4 text-center">
          More notifications load with pagination (page 1 shown).
        </p>
      )}
    </div>
  );
}

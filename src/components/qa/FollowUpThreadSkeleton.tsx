"use client";

/** Skeleton for follow-up thread; matches FollowUpCard layout (border-left, same spacing as CommentItem). */
export function FollowUpThreadSkeleton() {
  return (
    <section
      aria-label="Follow-up thread loading"
      className="space-y-4 pt-6 border-t border-niat-border"
    >
      <div className="h-6 w-32 rounded bg-niat-border/50 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-l-2 border-niat-border pl-2 sm:pl-4 py-2 rounded-r-lg min-w-0"
            style={{ backgroundColor: "var(--niat-section)" }}
          >
            <div className="flex gap-2">
              <div className="h-4 w-24 rounded bg-niat-border/50 animate-pulse" />
              <div className="h-4 w-20 rounded bg-niat-border/50 animate-pulse" />
            </div>
            <div className="mt-2 space-y-2">
              <div className="h-3 w-full rounded bg-niat-border/50 animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-niat-border/50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

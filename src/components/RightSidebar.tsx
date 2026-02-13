"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function RightSidebar() {
  return (
    <aside className="hidden xl:block w-72 shrink-0 min-h-0 overflow-y-auto scrollbar-hide space-y-4">
      <section className="rounded-2xl border border-niat-border bg-niat-section p-4 shadow-soft">
        <h3 className="text-sm font-semibold text-niat-text mb-3">Featured Seniors</h3>
        <p className="text-sm text-niat-text-secondary">
          Verified NIAT seniors who help the community. Coming soon.
        </p>
      </section>
      <section className="rounded-2xl border border-niat-border bg-niat-section p-4 shadow-soft">
        <h3 className="text-sm font-semibold text-niat-text mb-3">Top Discussions</h3>
        <p className="text-sm text-niat-text-secondary">
          Most active threads. Coming soon.
        </p>
      </section>
      <section className="rounded-2xl border border-niat-border bg-niat-section p-4 shadow-soft">
        <h3 className="text-sm font-semibold text-niat-text mb-3">Guidelines</h3>
        <ul className="text-sm text-niat-text-secondary space-y-1 list-disc list-inside">
          <li>Be respectful</li>
          <li>Only verified seniors can reply</li>
          <li>No spam</li>
        </ul>
      </section>
      <section className="rounded-2xl bg-primary p-4 shadow-card">
        <p className="text-sm text-primary-foreground font-medium mb-2">
          Ask the community
        </p>
        <p className="text-xs text-primary-foreground/90 mb-3">
          Get answers from verified NIAT seniors.
        </p>
        <Link
          href="/create-post"
          className={cn(
            "inline-block rounded-xl bg-accent-1 px-3 py-2 text-sm font-medium",
            "text-niat-text hover:opacity-90 transition-opacity"
          )}
        >
          Create post
        </Link>
      </section>
    </aside>
  );
}

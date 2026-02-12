"use client";

import Link from "next/link";
import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/PostCard";

export default function HomePage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    usePosts();

  if (status === "pending") {
    return (
      <div className="py-12 text-center text-niat-text-secondary">
        Loading feed…
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="py-12 text-center text-primary">
        Failed to load posts. {error?.message}
      </div>
    );
  }

  const posts = data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section
        className="rounded-2xl overflow-hidden shadow-card"
        style={{
          background: "linear-gradient(135deg, #220000 0%, #974039 100%)",
        }}
      >
        <div className="px-6 py-10 sm:px-8 sm:py-14 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">
            NIAT Community
          </h1>
          <p className="mt-2 text-white/90 text-sm sm:text-base max-w-xl">
            Ask questions. Get answers from verified NIAT seniors. Connect with prospective students.
          </p>
          <Link
            href="/create-post"
            className="mt-4 inline-block rounded-xl bg-accent-1 px-4 py-2.5 text-sm font-semibold text-niat-text hover:opacity-90 transition-opacity"
          >
            Create post
          </Link>
        </div>
      </section>

      {/* Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div
            className="rounded-2xl border border-niat-border p-8 text-center shadow-soft"
            style={{ backgroundColor: "var(--niat-section)" }}
          >
            <p className="text-niat-text-secondary">No posts yet. Be the first to create one!</p>
            <Link
              href="/create-post"
              className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Create post
            </Link>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-xl border border-niat-border bg-niat-section px-5 py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50 transition-colors"
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

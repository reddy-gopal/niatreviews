"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/PostCard";
import { LoadingBlock, LoadingSpinner } from "@/components/LoadingSpinner";
import { isAuthenticated } from "@/lib/auth";
import { fetchProfile } from "@/lib/api";

function getGreeting() {
  const hour = typeof window !== "undefined" ? new Date().getHours() : 12;
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q");
  const auth = isAuthenticated();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: typeof window !== "undefined" && auth,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && q?.trim()) {
      router.replace(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  }, [q, router]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    usePosts();

  if (typeof window !== "undefined" && q?.trim()) {
    return <LoadingBlock />;
  }

  if (status === "pending") {
    return <LoadingBlock />;
  }
  if (status === "error") {
    return (
      <div className="py-12 text-center text-primary">
        Failed to load posts. {error?.message}
      </div>
    );
  }

  const posts = data?.pages.flatMap((p) => p.results) ?? [];
  const displayName = profile?.username ?? profile?.email?.split("@")[0] ?? null;
  const greeting = getGreeting();

  const heroContent = auth && displayName
    ? {
        heading: `${greeting}, ${displayName}!`,
        subtext: "What’s on your mind? Ask the community and get answers from verified NIAT seniors.",
        cta: "Ask a question",
        ctaHref: "/create-post",
      }
    : auth
      ? {
          heading: "Welcome to NIAT Community",
          subtext: "Ask questions, get answers from verified seniors, and connect with others.",
          cta: "Create post",
          ctaHref: "/create-post",
        }
      : {
          heading: "Real answers from real NIAT seniors",
          subtext: "Prospective students ask. Verified seniors answer. Join the community and get the inside track.",
          cta: "Join the community",
          ctaHref: "/register",
          secondaryCta: "Explore posts",
          secondaryHref: "#feed",
        };

  return (
    <div className="space-y-6">
      {/* Hero Banner — personalized */}
      <section
        className="rounded-2xl overflow-hidden shadow-card"
        style={{
          background: "linear-gradient(135deg, #220000 0%, #974039 100%)",
        }}
      >
        <div className="px-6 py-10 sm:px-8 sm:py-14 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {heroContent.heading}
          </h1>
          <p className="mt-2 text-white/90 text-sm sm:text-base max-w-xl">
            {heroContent.subtext}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={heroContent.ctaHref}
              className="inline-block rounded-xl bg-accent-1 px-4 py-2.5 text-sm font-semibold text-niat-text hover:opacity-90 transition-opacity"
            >
              {heroContent.cta}
            </Link>
            {"secondaryCta" in heroContent && (heroContent.secondaryCta && (
              <Link
                href={"secondaryHref" in heroContent ? heroContent.secondaryHref ?? "/" : "/"}
                className="inline-block rounded-xl border-2 border-white/60 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {heroContent.secondaryCta}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feed */}
      <div id="feed" className="space-y-4">
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
            {isFetchingNextPage ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Load more
              </span>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

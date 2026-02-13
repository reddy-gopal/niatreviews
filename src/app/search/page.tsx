"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Filter, X, ArrowLeft } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { PostCard } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { LoadingBlock, LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";

function SearchPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky header: back + search only — no Navbar */}
      <header
        className="sticky top-0 z-30 shrink-0 border-b border-niat-border px-3 py-3 md:px-4"
        style={{ backgroundColor: "var(--niat-navbar)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center justify-center rounded-lg p-2 text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text touch-manipulation shrink-0"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Link>
          <div className="flex-1 min-w-0">
            <SearchBar placeholder="Search posts..." className="w-full" />
          </div>
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-3 py-4 md:px-4 md:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || undefined,
    tag: searchParams.get("tag") || undefined,
    orderBy: (searchParams.get("order_by") as any) || "-rank",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    useSearch(query, filters);

  useEffect(() => {
    setFilters({
      category: searchParams.get("category") || undefined,
      tag: searchParams.get("tag") || undefined,
      orderBy: (searchParams.get("order_by") as any) || "-rank",
    });
  }, [searchParams]);

  const posts = data?.pages.flatMap((p) => p.results) ?? [];
  const totalCount = data?.pages[0]?.count ?? 0;

  if (!query) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-niat-text-secondary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-niat-text mb-2">
            Search NIAT Community
          </h1>
          <p className="text-niat-text-secondary">
            Find answers, discussions, and insights from the community
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results info & filters — hidden on mobile: just list posts directly */}
      <div className="hidden md:flex items-center justify-between flex-wrap gap-4">
        <div className="text-sm text-niat-text-secondary flex items-center gap-2">
          {status === "pending" ? (
            <LoadingSpinner size="sm" className="shrink-0" />
          ) : status === "error" ? (
            <span className="text-primary">Search failed</span>
          ) : (
            <>
              Found <span className="font-semibold text-niat-text">{totalCount}</span>{" "}
              {totalCount === 1 ? "result" : "results"} for{" "}
              <span className="font-semibold text-niat-text">&quot;{query}&quot;</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
            showFilters
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-niat-section text-niat-text border-niat-border hover:bg-niat-border/30"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {(filters.category || filters.tag || filters.orderBy !== "-rank") && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
              {[filters.category, filters.tag, filters.orderBy !== "-rank"]
                .filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

        {/* Filter Panel — desktop only */}
        {showFilters && (
          <div
            className="rounded-xl border border-niat-border p-4 space-y-4"
            style={{ backgroundColor: "var(--niat-section)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-niat-text">Filter Results</h3>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-niat-text-secondary hover:text-niat-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-niat-text mb-2">
                  Sort By
                </label>
                <select
                  value={filters.orderBy}
                  onChange={(e) =>
                    setFilters({ ...filters, orderBy: e.target.value as any })
                  }
                  className="w-full rounded-lg border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="-rank">Relevance</option>
                  <option value="-created_at">Newest First</option>
                  <option value="-upvote_count">Most Upvoted</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-niat-text mb-2">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., admissions"
                  value={filters.category || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value || undefined })
                  }
                  className="w-full rounded-lg border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-niat-text mb-2">
                  Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g., placement"
                  value={filters.tag || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, tag: e.target.value || undefined })
                  }
                  className="w-full rounded-lg border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Active Filters */}
            {(filters.category || filters.tag) && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-niat-border">
                <span className="text-sm text-niat-text-secondary">Active:</span>
                {filters.category && (
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, category: undefined })}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-niat-border/50 text-sm text-niat-text hover:bg-niat-border"
                  >
                    Category: {filters.category}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {filters.tag && (
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, tag: undefined })}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-niat-border/50 text-sm text-niat-text hover:bg-niat-border"
                  >
                    Tag: {filters.tag}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      {/* Results */}
      {status === "pending" ? (
        <LoadingBlock />
      ) : status === "error" ? (
        <div
          className="rounded-xl border border-niat-border p-8 text-center"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          <p className="text-primary mb-2">Search failed</p>
          <p className="text-sm text-niat-text-secondary">
            {error?.message || "Please try again"}
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div
          className="rounded-xl border border-niat-border p-8 text-center"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          <Search className="h-12 w-12 text-niat-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-niat-text mb-2">
            No results found
          </h3>
          <p className="text-sm text-niat-text-secondary mb-4">
            Try different keywords or remove some filters
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() =>
                setFilters({ category: undefined, tag: undefined, orderBy: "-rank" })
              }
              className="px-4 py-2 rounded-lg border border-niat-border text-sm font-medium text-niat-text hover:bg-niat-border/30"
            >
              Clear Filters
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Browse All Posts
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Load More */}
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

export default function SearchPage() {
  return (
    <SearchPageShell>
      <Suspense
        fallback={<LoadingBlock />}
      >
        <SearchContent />
      </Suspense>
    </SearchPageShell>
  );
}

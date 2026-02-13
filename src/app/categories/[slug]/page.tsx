"use client";

import { useParams } from "next/navigation";
import { usePostsByCategory } from "@/hooks/usePosts";
import { PostCard } from "@/components/PostCard";
import { LoadingBlock, LoadingSpinner } from "@/components/LoadingSpinner";

export default function CategoryFeedPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    usePostsByCategory(slug);

  if (status === "pending") {
    return <LoadingBlock />;
  }
  if (status === "error") {
    return (
      <div className="py-12 text-center text-primary">
        Failed to load. {error?.message}
      </div>
    );
  }

  const posts = data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-niat-text">Category: {slug}</h1>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-niat-text-secondary py-8 text-center">No posts in this category.</p>
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

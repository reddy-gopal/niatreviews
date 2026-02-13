"use client";

import { useComments } from "@/hooks/useComments";
import { CommentThread } from "@/components/CommentThread";
import { CommentForm } from "@/components/CommentForm";
import { isAuthenticated } from "@/lib/auth";
import { LoadingBlock, LoadingSpinner } from "@/components/LoadingSpinner";

interface CommentSectionProps {
  postId: string;
  postSlug: string;
  commentCount?: number;
}

export function CommentSection({
  postId,
  postSlug,
  commentCount = 0,
}: CommentSectionProps) {
  const commentsQuery = useComments(postSlug);
  const tree = commentsQuery.commentTree;
  const displayCount =
    commentCount > 0 ? commentCount : commentsQuery.flatComments.length;

  return (
    <section
      id="comments"
      className="rounded-2xl border border-niat-border p-4 sm:p-6 shadow-soft min-w-0"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <h2 className="text-lg font-semibold text-niat-text mb-4">
        Comments ({displayCount})
      </h2>

      {isAuthenticated() && (
        <div className="mb-4">
          <CommentForm postId={postId} postSlug={postSlug} />
        </div>
      )}

      {commentsQuery.isLoading ? (
        <LoadingBlock className="py-6" />
      ) : tree.length === 0 ? (
        <p className="text-niat-text-secondary py-6">No comments yet.</p>
      ) : (
        <CommentThread
          commentTree={tree}
          postId={postId}
          postSlug={postSlug}
          variant="embedded"
        />
      )}

      {commentsQuery.hasNextPage && (
        <button
          type="button"
          onClick={() => commentsQuery.fetchNextPage()}
          disabled={commentsQuery.isFetchingNextPage}
          className="mt-4 w-full sm:w-auto rounded-xl border border-niat-border px-4 py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50 transition-colors touch-manipulation"
        >
          {commentsQuery.isFetchingNextPage ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Load more comments
            </span>
          ) : (
            "Load more comments"
          )}
        </button>
      )}
    </section>
  );
}

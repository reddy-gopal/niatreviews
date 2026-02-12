"use client";

import { useParams } from "next/navigation";
import { usePostDetail } from "@/hooks/usePostDetail";
import { useComments } from "@/hooks/useComments";
import { CommentThread } from "@/components/CommentThread";
import { CommentForm } from "@/components/CommentForm";
import { isAuthenticated } from "@/lib/auth";

export default function PostCommentsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const postQuery = usePostDetail(slug);
  const commentsQuery = useComments(slug);
  const auth = isAuthenticated();

  if (postQuery.isLoading || postQuery.error) {
    return (
      <div className="py-12 text-center text-niat-text-secondary">
        {postQuery.error ? (
          <p className="text-primary">Failed to load post.</p>
        ) : (
          <p>Loading…</p>
        )}
      </div>
    );
  }

  const post = postQuery.data!;
  const tree = commentsQuery.commentTree;

  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-niat-border p-4 sm:p-6 shadow-soft min-w-0"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <h1 className="text-xl font-bold text-niat-text">
        Comments for: {post.title}
      </h1>

      {auth && (
        <div className="mt-4 mb-6">
          <CommentForm postId={post.id} postSlug={post.slug} />
        </div>
      )}

      {commentsQuery.isLoading ? (
        <p className="text-niat-text-secondary">Loading comments…</p>
      ) : tree.length === 0 ? (
        <p className="text-niat-text-secondary py-6">No comments yet.</p>
      ) : (
        <CommentThread
          commentTree={tree}
          postId={post.id}
          postSlug={post.slug}
          variant="full"
          postTitle={post.title}
        />
      )}

      {commentsQuery.hasNextPage && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => commentsQuery.fetchNextPage()}
            disabled={commentsQuery.isFetchingNextPage}
            className="rounded-xl border border-niat-border px-4 py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50 transition-colors"
          >
            {commentsQuery.isFetchingNextPage ? "Loading…" : "Load more comments"}
          </button>
        </div>
      )}
    </div>
  );
}

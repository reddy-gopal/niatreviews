"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePostDetail } from "@/hooks/usePostDetail";
import { useComments } from "@/hooks/useComments";
import { CommentThread } from "@/components/CommentThread";
import { CommentForm } from "@/components/CommentForm";
import { getCommentSubtree, buildCommentTree } from "@/lib/commentTree";
import { isAuthenticated } from "@/lib/auth";
import { API_BASE } from "@/lib/utils";

export default function FocusedCommentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const commentId = params.commentId as string;
  const postQuery = usePostDetail(slug);
  const commentsQuery = useComments(slug);
  const auth = isAuthenticated();
  const scrollDone = useRef(false);

  const allComments = commentsQuery.data?.pages.flatMap((p) => p.results) ?? [];
  const tree = buildCommentTree(allComments);
  const subtree = getCommentSubtree(tree, commentId);

  useEffect(() => {
    if (scrollDone.current || subtree.length === 0) return;
    const el = document.getElementById(`comment-${commentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      scrollDone.current = true;
    }
  }, [commentId, subtree.length]);

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
  const imageUrl = post.image
    ? post.image.startsWith("http")
      ? post.image
      : `${API_BASE}${post.image}`
    : null;

  if (subtree.length === 0 && !commentsQuery.isLoading) {
    return (
      <div
        className="mx-auto max-w-2xl rounded-2xl border border-niat-border p-8 shadow-soft text-center"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <h1 className="text-xl font-bold text-niat-text">Comment not found</h1>
        <p className="mt-2 text-niat-text-secondary">
          The comment may have been removed or the link is invalid.
        </p>
        <Link
          href={`/posts/${slug}`}
          className="mt-4 inline-block text-primary font-medium hover:underline"
        >
          Back to post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <article
        className="rounded-2xl border border-niat-border p-4 sm:p-6 shadow-card"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-niat-text">{post.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {post.category && (
              <Link
                href={`/categories/${post.category.slug}`}
                className="text-sm rounded-full border border-niat-border px-2.5 py-0.5 text-niat-text hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                {post.category.name}
              </Link>
            )}
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="text-sm rounded-full border border-niat-border px-2.5 py-0.5 text-niat-text hover:bg-secondary hover:text-white hover:border-secondary transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
          <p className="text-niat-text-secondary mt-2 text-sm">
            {post.author.username} ·{" "}
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString()}
            </time>
          </p>
          <div className="mt-4 prose prose-sm max-w-none text-niat-text">
            <p className="whitespace-pre-wrap">{post.description}</p>
          </div>
          {imageUrl && (
            <div className="mt-4 relative aspect-video rounded-xl overflow-hidden border border-niat-border">
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}
        </div>
      </article>

      <section
        className="rounded-2xl border border-niat-border p-4 sm:p-6 shadow-soft min-w-0"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        {auth && (
          <div className="mb-4">
            <CommentForm postId={post.id} postSlug={post.slug} />
          </div>
        )}

        {commentsQuery.isLoading ? (
          <p className="text-niat-text-secondary">Loading comments…</p>
        ) : subtree.length === 0 ? (
          <p className="text-niat-text-secondary">Loading…</p>
        ) : (
          <CommentThread
            comments={allComments}
            postId={post.id}
            postSlug={post.slug}
            variant="full"
            postTitle={post.title}
            focusCommentId={commentId}
          />
        )}

        {commentsQuery.hasNextPage && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => commentsQuery.fetchNextPage()}
              disabled={commentsQuery.isFetchingNextPage}
              className="rounded-xl border border-niat-border px-4 py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50 transition-colors w-full sm:w-auto"
            >
              {commentsQuery.isFetchingNextPage ? "Loading…" : "Load more comments"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

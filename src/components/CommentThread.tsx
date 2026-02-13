"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { Comment } from "@/types/comment";
import type { CommentWithReplies } from "@/lib/commentTree";
import { buildCommentTree, getCommentSubtree } from "@/lib/commentTree";
import { CommentItem } from "./CommentItem";
import { useToast } from "./Toast";
import { isAuthenticated } from "@/lib/auth";
import { fetchProfile } from "@/lib/api";

/** Show only this many replies inline before "more replies (x)". */
export const INLINE_REPLY_LIMIT = 2;

/** Max depth before showing "Continue thread". Mobile = 3, desktop = 6. */
export const MAX_DEPTH_MOBILE = 3;
export const MAX_DEPTH_DESKTOP = 6;

export type CommentThreadVariant = "embedded" | "full";

interface CommentThreadProps {
  /** Flat comment list (used when commentTree not provided, e.g. focused page with all comments). */
  comments?: Comment[];
  /** Pre-built sorted tree (preferred when available from useComments). */
  commentTree?: CommentWithReplies[];
  postId: string;
  postSlug?: string | null;
  variant?: CommentThreadVariant;
  postTitle?: string | null;
  /**
   * When set, show only this comment and its entire nested subtree (focused thread view).
   * Used on /posts/[slug]/comments/[commentId].
   */
  focusCommentId?: string | null;
}

export function CommentThread({
  comments,
  commentTree: commentTreeProp,
  postId,
  postSlug = null,
  variant = "embedded",
  postTitle = null,
  focusCommentId = null,
}: CommentThreadProps) {
  const treeFromFlat = comments ? buildCommentTree(comments) : [];
  const tree = commentTreeProp ?? treeFromFlat;
  const displayTree: CommentWithReplies[] = focusCommentId
    ? getCommentSubtree(tree, focusCommentId)
    : tree;
  const auth = isAuthenticated();
  const { showLoginRequired } = useToast();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const currentUserId = profile?.id ?? null;

  const replyLimit = focusCommentId ? 0 : INLINE_REPLY_LIMIT;
  const showFullReplies = !!focusCommentId;

  const threadContent = (
    <div className="space-y-3">
      {displayTree.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          postId={postId}
          postSlug={postSlug}
          depth={0}
          isAuthenticated={auth}
          currentUserId={currentUserId}
          onLoginRequired={showLoginRequired}
          replyLimit={replyLimit}
          showFullReplies={showFullReplies}
          focusCommentId={focusCommentId}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {variant === "full" && postSlug && (
        <Link
          href={`/posts/${postSlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-niat-text-secondary hover:text-primary transition-colors"
        >
          <span aria-hidden>←</span>
          {postTitle ? `Back to: ${postTitle}` : "Back to post"}
        </Link>
      )}

      {threadContent}
    </div>
  );
}

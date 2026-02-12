"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { CommentWithReplies } from "@/lib/commentTree";
import { countReplies } from "@/lib/commentTree";
import { UpvoteButton } from "./UpvoteButton";
import { useCommentUpvote } from "@/hooks/useUpvote";
import { CommentForm } from "./CommentForm";
import { cn } from "@/lib/utils";
import { MAX_DEPTH_MOBILE, MAX_DEPTH_DESKTOP } from "./CommentThread";

function useCommentMaxDepth(): number {
  const [maxDepth, setMaxDepth] = useState(MAX_DEPTH_DESKTOP);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setMaxDepth(mq.matches ? MAX_DEPTH_DESKTOP : MAX_DEPTH_MOBILE);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return maxDepth;
}

/** Absolute max depth for reply form (beyond this we don't show Reply). */
const MAX_REPLY_DEPTH = 8;

interface CommentItemProps {
  comment: CommentWithReplies;
  postId: string;
  postSlug: string | null;
  depth?: number;
  isAuthenticated: boolean;
  onLoginRequired?: () => void;
  /** Show only first N replies inline; rest behind "more replies (x)". Omit or 0 = show all. */
  replyLimit?: number;
  /** When true, always show full subtree (e.g. on focused thread page). */
  showFullReplies?: boolean;
  /** When set, this comment is the focused one (highlight). */
  focusCommentId?: string | null;
  /** Max depth for inline replies; beyond this show "Continue thread". From CommentThread. */
  maxDepth?: number;
}

export function CommentItem({
  comment,
  postId,
  postSlug = null,
  depth = 0,
  isAuthenticated,
  onLoginRequired,
  replyLimit = 0,
  showFullReplies = false,
  focusCommentId = null,
  maxDepth: maxDepthProp,
}: CommentItemProps) {
  const responsiveMaxDepth = useCommentMaxDepth();
  const maxDepth = maxDepthProp ?? responsiveMaxDepth;
  const [showReply, setShowReply] = useState(false);
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const postSlugOrEmpty = postSlug ?? "";
  const { upvote, removeUpvote, isLoading } = useCommentUpvote(comment.id, postSlugOrEmpty);
  const canReply = isAuthenticated && depth < MAX_REPLY_DEPTH;
  const replies = comment.replies ?? [];
  const atMaxDepth = depth >= maxDepth;
  const showAllRepliesHere = showFullReplies || (repliesExpanded && !atMaxDepth);
  const limit = showAllRepliesHere ? 0 : replyLimit;
  const visibleReplies = limit > 0 ? replies.slice(0, limit) : replies;
  const hiddenCount = limit > 0 ? replies.length - limit : 0;
  const totalReplyCount = countReplies(comment) - 1; // exclude self
  const isFocused = focusCommentId === comment.id;
  const hasRepliesBeyondDepth = atMaxDepth && replies.length > 0;

  return (
    <div
      id={isFocused ? `comment-${comment.id}` : undefined}
      className={cn(
        "border-l-2 border-niat-border pl-2 sm:pl-4 py-2 rounded-r-lg transition-colors",
        "bg-[var(--niat-section)] min-w-0 overflow-hidden",
        depth > 0 && "ml-2 sm:ml-4 md:ml-6",
        isFocused && "ring-2 ring-primary ring-offset-2 rounded-lg"
      )}
    >
      <div className="flex gap-2 sm:gap-3 items-start">
        <div className="flex flex-col items-center shrink-0 pt-0.5">
          <UpvoteButton
            count={comment.upvote_count}
            onUpvote={() => upvote()}
            onRemoveUpvote={() => removeUpvote()}
            onLoginRequired={onLoginRequired}
            disabled={!isAuthenticated}
            isLoading={isLoading}
            variant="comment"
          />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-xs sm:text-sm flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5">
            <span className="font-medium text-niat-text">
              {comment.author.username}
            </span>
            <span className="text-niat-text-secondary shrink-0">
              <time dateTime={comment.created_at}>
                {new Date(comment.created_at).toLocaleString()}
              </time>
            </span>
            <span className="text-niat-text-secondary text-xs shrink-0">
              {comment.upvote_count} upvote{comment.upvote_count !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-1 text-sm text-niat-text whitespace-pre-wrap break-words">
            {comment.body}
          </p>
          {canReply && (
            <button
              type="button"
              onClick={() => setShowReply((s) => !s)}
              className="mt-1 py-2 pr-2 -my-1 text-xs font-medium text-secondary hover:text-secondary-dark transition-colors touch-manipulation sm:py-0 sm:pr-0 sm:my-0"
            >
              {showReply ? "Cancel" : "Reply"}
            </button>
          )}
        </div>
      </div>

      {showReply && (
        <div className="mt-3 ml-4 sm:ml-8 md:ml-10 min-w-0">
          <CommentForm
            postId={postId}
            postSlug={postSlug}
            parentId={comment.id}
            onSuccess={() => setShowReply(false)}
            onCancel={() => setShowReply(false)}
          />
        </div>
      )}

      {!atMaxDepth && visibleReplies.length > 0 && (
        <div className="mt-2 space-y-1.5 sm:space-y-2 min-w-0">
          {(visibleReplies as CommentWithReplies[]).map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              postId={postId}
              postSlug={postSlug}
              depth={depth + 1}
              isAuthenticated={isAuthenticated}
              onLoginRequired={onLoginRequired}
              replyLimit={replyLimit}
              showFullReplies={showFullReplies}
              focusCommentId={focusCommentId}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}

      {!atMaxDepth && hiddenCount > 0 && (
        <div className="mt-2 ml-4 sm:ml-8 md:ml-10 min-w-0">
          <button
            type="button"
            onClick={() => setRepliesExpanded(true)}
            className="inline-flex items-center justify-center sm:justify-start min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 text-sm font-medium rounded-md bg-niat-section border border-niat-border text-primary hover:bg-niat-border/30 transition-colors active:scale-[0.98] touch-manipulation"
          >
            replies ({totalReplyCount})
          </button>
        </div>
      )}

      {hasRepliesBeyondDepth && postSlug && (
        <div className="mt-2 ml-4 sm:ml-8 md:ml-10 min-w-0">
          <Link
            href={`/posts/${postSlug}/comments/${comment.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline touch-manipulation min-h-[44px] sm:min-h-0 items-center"
          >
            Continue thread →
          </Link>
        </div>
      )}
    </div>
  );
}

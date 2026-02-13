"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { CommentWithReplies } from "@/lib/commentTree";
import { countReplies } from "@/lib/commentTree";
import { UpvoteButton } from "./UpvoteButton";
import { useCommentUpvote } from "@/hooks/useUpvote";
import { useUpdateComment, useDeleteComment } from "@/hooks/useComments";
import { CommentForm } from "./CommentForm";
import { cn } from "@/lib/utils";
import { MAX_DEPTH_MOBILE, MAX_DEPTH_DESKTOP } from "./CommentThread";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

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
  /** Current user id for showing Edit/Delete (author only). */
  currentUserId?: string | null;
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
  currentUserId = null,
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
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const postSlugOrEmpty = postSlug ?? "";
  const { upvote, removeUpvote, isLoading } = useCommentUpvote(comment.id, postSlugOrEmpty);
  const updateComment = useUpdateComment(postSlugOrEmpty || null);
  const deleteComment = useDeleteComment(postSlugOrEmpty || null);
  const isAuthor = !!currentUserId && !!(comment.author as { id?: string })?.id && (comment.author as { id: string }).id === currentUserId;
  const canReply = isAuthenticated && depth < MAX_REPLY_DEPTH;
  const replies = comment.replies ?? [];

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);
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
        "bg-[var(--niat-section)] min-w-0 overflow-visible",
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
        <div className="flex-1 min-w-0 overflow-visible">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs sm:text-sm flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 min-w-0">
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
            {isAuthor && !isEditing && (
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="p-1.5 rounded-lg text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors"
                  aria-label="Comment options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-niat-border py-1 shadow-card z-50"
                    style={{ backgroundColor: "var(--niat-section)" }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setIsEditing(true);
                        setEditBody(comment.body);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 text-left"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        if (typeof window !== "undefined" && window.confirm("Delete this comment?")) {
                          deleteComment.mutate(comment.id);
                        }
                      }}
                      disabled={deleteComment.isPending}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-niat-border/50 text-left disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-niat-border bg-[var(--niat-section)] px-3 py-2 text-sm text-niat-text focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateComment.mutate(
                      { id: comment.id, body: editBody },
                      { onSuccess: () => setIsEditing(false) }
                    );
                  }}
                  disabled={updateComment.isPending}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setEditBody(comment.body); }}
                  className="rounded-lg border border-niat-border px-3 py-1.5 text-xs font-medium text-niat-text hover:bg-niat-border/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-niat-text whitespace-pre-wrap break-words">
              {comment.body}
            </p>
          )}
          {canReply && (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setShowReply((s) => !s)}
                className="py-2 pr-2 -my-1 text-xs font-medium text-secondary hover:text-secondary-dark transition-colors touch-manipulation sm:py-0 sm:pr-0 sm:my-0"
              >
                {showReply ? "Cancel" : "Reply"}
              </button>
            </div>
          )}
        </div>
      </div>

      {showReply && (
        <div className="mt-3 ml-4 sm:ml-8 md:ml-10 min-w-0">
          <CommentForm
            key={`reply-${comment.id}`}
            postId={postId}
            postSlug={postSlug}
            parentId={comment.id}
            parentAuthorUsername={comment.author?.username ?? null}
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
              currentUserId={currentUserId}
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

"use client";

import { CommentForm } from "./CommentForm";

interface ReplyFormProps {
  postId: string;
  postSlug?: string | null;
  parentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Inline reply form for commenting on a specific comment.
 * Wraps CommentForm with parentId set (reply context).
 */
export function ReplyForm({
  postId,
  postSlug = null,
  parentId,
  onSuccess,
  onCancel,
  className,
}: ReplyFormProps) {
  return (
    <CommentForm
      postId={postId}
      postSlug={postSlug}
      parentId={parentId}
      onSuccess={onSuccess}
      onCancel={onCancel}
      className={className}
    />
  );
}

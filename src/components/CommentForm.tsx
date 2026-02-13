"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateComment } from "@/hooks/useComments";
import { cn } from "@/lib/utils";

const schema = z.object({
  body: z.string().min(1, "Comment is required").max(5000),
});

type FormData = z.infer<typeof schema>;

interface CommentFormProps {
  postId: string;
  postSlug?: string | null;
  parentId?: string | null;
  /** When replying, show "Replying to @username" and prefill body with @mention (Instagram-style). */
  parentAuthorUsername?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CommentForm({
  postId,
  postSlug = null,
  parentId = null,
  parentAuthorUsername = null,
  onSuccess,
  onCancel,
  className,
}: CommentFormProps) {
  const createComment = useCreateComment(postId, postSlug);
  const mentionPrefix = parentAuthorUsername ? `@${parentAuthorUsername} ` : "";
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { body: mentionPrefix },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createComment.mutateAsync({
        post: postId,
        parent: parentId,
        body: data.body,
      });
      reset();
      onSuccess?.();
    } catch {
      // Error toast or inline message can be added
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-2", className)}>
      {parentId && parentAuthorUsername && (
        <p className="text-xs text-niat-text-secondary">
          Replying to <span className="font-medium text-niat-text">@{parentAuthorUsername}</span>
        </p>
      )}
      <textarea
        {...register("body")}
        placeholder={parentId ? "Write a reply..." : "Write a comment..."}
        rows={3}
        className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />
      {errors.body && (
        <p className="text-sm text-primary">{errors.body.message}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createComment.isPending}
          className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {parentId ? "Reply" : "Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-niat-border px-3 py-2 text-sm font-medium text-niat-text hover:bg-niat-border/50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

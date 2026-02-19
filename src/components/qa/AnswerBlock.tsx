"use client";

import { useState } from "react";
import Link from "next/link";
import { User, CheckCircle, Pencil, Trash2 } from "lucide-react";
import type { Answer } from "@/types/question";
import { VoteButtons } from "./VoteButtons";
import { useAnswerVote } from "@/hooks/useAnswerVote";
import { useUpdateAnswer, useDeleteAnswer } from "@/hooks/useAnswer";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { isAuthenticated } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MarkdownBody } from "@/components/MarkdownBody";

interface AnswerBlockProps {
  answer: Answer;
  questionSlug: string;
}

export function AnswerBlock({ answer, questionSlug }: AnswerBlockProps) {
  const auth = isAuthenticated();
  const { upvote, downvote, removeUpvote, removeDownvote } = useAnswerVote(questionSlug);
  const updateMutation = useUpdateAnswer(questionSlug);
  const deleteMutation = useDeleteAnswer(questionSlug);
  const { showLoginRequired, toast } = useToast();
  const { confirm } = useConfirm();
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const isAuthor = !!profile && !!answer.author && (answer.author as { username?: string }).username === profile.username;

  const createdDate = new Date(answer.created_at).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleSaveEdit = () => {
    if (editBody.trim() === answer.body) {
      setEditing(false);
      return;
    }
    updateMutation.mutate(
      { body: editBody.trim() },
      {
        onSuccess: () => setEditing(false),
        onError: () => {},
      }
    );
  };

  const handleDelete = () => {
    confirm({
      title: "Delete this answer?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
      onConfirm: () => {
        deleteMutation.mutate(undefined, {
          onSuccess: () => toast.success("Answer deleted."),
          onError: () => toast.error("Could not delete answer."),
        });
      },
    });
  };

  return (
    <section aria-label="Answer" className="space-y-3 pt-4 border-t border-niat-border">
      <h2 className="text-lg font-semibold text-niat-text">Answer</h2>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-niat-border bg-[var(--niat-section)] px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Write your answer..."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending || editBody.trim().length === 0}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setEditBody(answer.body); }}
              className="rounded-lg border border-niat-border px-4 py-2 text-sm font-medium text-niat-text hover:bg-niat-border/50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <MarkdownBody content={answer.body} className="mt-1" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/users/${answer.author?.username ?? ""}`}
                className="inline-flex items-center gap-1.5 text-sm text-niat-text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <User className="h-4 w-4 shrink-0" />
                @{answer.author?.username ?? "unknown"}
                {answer.author?.is_verified_senior && (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ color: "var(--primary)", backgroundColor: "rgba(153, 27, 27, 0.1)" }}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified Senior
                  </span>
                )}
              </Link>
              <time dateTime={answer.created_at} className="text-sm text-niat-text-secondary">
                {createdDate}
              </time>
            </div>
            <div className="flex items-center gap-2">
              {isAuthor && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-niat-text-secondary hover:text-primary hover:bg-niat-border/50"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </>
              )}
              <VoteButtons
                upvoteCount={answer.upvote_count ?? 0}
                downvoteCount={answer.downvote_count ?? 0}
                userVote={(answer.user_vote as 1 | -1 | null) ?? null}
                onUpvote={upvote}
                onDownvote={downvote}
                onRemoveUpvote={removeUpvote}
                onRemoveDownvote={removeDownvote}
                onLoginRequired={showLoginRequired}
                disabled={!auth}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

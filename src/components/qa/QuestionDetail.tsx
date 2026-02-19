"use client";

import { useState } from "react";
import Link from "next/link";
import { User, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { Question } from "@/types/question";
import { MarkdownBody } from "@/components/MarkdownBody";
import { useUpdateQuestion, useDeleteQuestion } from "@/hooks/useQuestionDetail";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";

const TITLE_MIN = 10;
const TITLE_MAX = 300;

interface QuestionDetailProps {
  question: Question;
  slug: string;
  isAuthor?: boolean;
}

export function QuestionDetail({ question, slug, isAuthor = false }: QuestionDetailProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [editBody, setEditBody] = useState(question.body ?? "");

  const updateMutation = useUpdateQuestion(slug);
  const deleteMutation = useDeleteQuestion(slug);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const canEditDelete = isAuthor && !question.is_answered;
  const createdDate = new Date(question.created_at).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const titleError =
    editTitle.length > 0 && editTitle.length < TITLE_MIN
      ? `At least ${TITLE_MIN} characters`
      : editTitle.length > TITLE_MAX
        ? `At most ${TITLE_MAX} characters`
        : null;
  const canSave =
    editTitle.trim().length >= TITLE_MIN &&
    editTitle.trim().length <= TITLE_MAX &&
    !updateMutation.isPending;

  const handleSaveEdit = () => {
    if (!canSave) return;
    updateMutation.mutate(
      { title: editTitle.trim(), body: editBody.trim() || undefined },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleCancelEdit = () => {
    setEditTitle(question.title);
    setEditBody(question.body ?? "");
    setEditing(false);
  };

  const handleDelete = () => {
    confirm({
      title: "Delete this question?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
      onConfirm: () => {
        deleteMutation.mutate(undefined, {
          onSuccess: () => toast.success("Question deleted."),
          onError: () => toast.error("Could not delete question."),
        });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/questions"
          className="inline-flex items-center gap-1.5 text-sm text-niat-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to questions
        </Link>
        {question.category && (
          <Link
            href={`/questions?category=${encodeURIComponent(question.category)}`}
            className="inline-flex text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md transition-colors"
          >
            {question.category}
          </Link>
        )}
      </div>

      <section aria-label="Question" className="space-y-3">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-niat-text mb-1">
                Title
              </label>
              <input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                minLength={TITLE_MIN}
                maxLength={TITLE_MAX}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary",
                  titleError ? "border-red-500" : "border-niat-border"
                )}
                style={{ backgroundColor: "var(--niat-section)" }}
              />
              <p className="mt-1 text-xs text-niat-text-secondary">
                {editTitle.length}/{TITLE_MAX}
              </p>
              {titleError && <p className="mt-1 text-sm text-red-600">{titleError}</p>}
            </div>
            <div>
              <label htmlFor="edit-body" className="block text-sm font-medium text-niat-text mb-1">
                Details (optional)
              </label>
              <textarea
                id="edit-body"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-niat-border px-3 py-2 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ backgroundColor: "var(--niat-section)" }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!canSave}
                className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={updateMutation.isPending}
                className="rounded-xl border border-niat-border px-4 py-2 text-sm font-medium text-niat-text hover:bg-niat-border/30"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-niat-text min-w-0 flex-1">
                {question.title}
              </h1>
              {canEditDelete && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-niat-text-secondary hover:text-primary hover:bg-niat-border/50 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-niat-text-secondary">
              <Link
                href={`/users/${question.author?.username ?? ""}`}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
              >
                <User className="h-4 w-4 shrink-0" />
                @{question.author?.username ?? "unknown"}
              </Link>
              <span aria-hidden>·</span>
              <time dateTime={question.created_at}>{createdDate}</time>
            </div>
            {question.body?.trim() && (
              <MarkdownBody content={question.body} className="mt-1" />
            )}
          </>
        )}
      </section>
    </div>
  );
}

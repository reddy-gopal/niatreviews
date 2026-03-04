"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, CheckCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { FollowUp } from "@/lib/api";
import { MarkdownBody } from "@/components/MarkdownBody";
import { useUpdateFollowUp, useDeleteFollowUp } from "@/hooks/useFollowUps";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";

/** Follow-up displayed like main Q&A: student = question-style, senior = answer-style. */
interface FollowUpCardProps {
  followUp: FollowUp;
  questionSlug: string;
}

export function FollowUpCard({ followUp, questionSlug }: FollowUpCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(followUp.body);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const updateMutation = useUpdateFollowUp(questionSlug, followUp.id);
  const deleteMutation = useDeleteFollowUp(questionSlug, followUp.id);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const isSeniorReply = followUp.author?.is_verified_senior ?? false;
  const showActions = followUp.can_edit || followUp.can_delete;
  const createdDate = new Date(followUp.created_at).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const handleSave = () => {
    const trimmed = editBody.trim();
    if (!trimmed || trimmed === followUp.body) {
      setIsEditing(false);
      return;
    }
    updateMutation.mutate(
      { body: trimmed },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    confirm({
      title: "Delete this follow-up?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
      onConfirm: () => {
        deleteMutation.mutate(undefined, {
          onSuccess: () => toast.success("Follow-up deleted."),
          onError: () => toast.error("Could not delete follow-up."),
        });
      },
    });
  };

  const metaRow = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-niat-text-secondary">
      <Link
        href={`/users/${followUp.author?.username ?? ""}`}
        className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
      >
        <User className="h-4 w-4 shrink-0" />
        @{followUp.author?.username ?? "unknown"}
      </Link>
      {isSeniorReply && (
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
          style={{ color: "var(--primary)", backgroundColor: "rgba(153, 27, 27, 0.12)" }}
          title="Verified Senior"
          aria-label="Verified Senior"
        >
          <CheckCircle className="h-3 w-3" />
        </span>
      )}
      <span aria-hidden className="text-niat-text-secondary/70">·</span>
      <time dateTime={followUp.created_at}>{createdDate}</time>
    </div>
  );

  const actionsMenu = showActions && !isEditing && (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="p-1.5 rounded-lg text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors"
        aria-label="Follow-up options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menuOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-niat-border py-1 shadow-card z-50"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          {followUp.can_edit && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setIsEditing(true);
                setEditBody(followUp.body);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 text-left"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
          {followUp.can_delete && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 text-left disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isSeniorReply) {
    // Answer-style: like AnswerBlock — content, then meta row
    return (
      <section
        aria-label="Senior reply"
        className="pt-6 border-t border-niat-border first:border-t-0 first:pt-0"
      >
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-niat-border bg-[var(--niat-section)] px-3 py-2.5 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  updateMutation.isPending ||
                  !editBody.trim() ||
                  editBody.trim() === followUp.body
                }
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditBody(followUp.body);
                }}
                disabled={updateMutation.isPending}
                className="rounded-lg border border-niat-border px-4 py-2 text-sm font-medium text-niat-text hover:bg-niat-border/30"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative pr-8">
              <div className="text-niat-text text-[15px] leading-relaxed">
                <MarkdownBody content={followUp.body} />
              </div>
              {showActions && (
                <div className="absolute top-0 right-0">{actionsMenu}</div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              {metaRow}
            </div>
          </>
        )}
      </section>
    );
  }

  // Question-style: like QuestionDetail — label, author/date, then body
  return (
    <section
      aria-label="Follow-up question"
      className="pt-6 border-t border-niat-border first:border-t-0 first:pt-0"
    >
      <div className="space-y-3 max-w-prose">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-niat-text-secondary">
            Follow-up question
          </p>
          {actionsMenu}
        </div>
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-niat-border bg-[var(--niat-section)] px-3 py-2.5 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  updateMutation.isPending ||
                  !editBody.trim() ||
                  editBody.trim() === followUp.body
                }
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditBody(followUp.body);
                }}
                disabled={updateMutation.isPending}
                className="rounded-lg border border-niat-border px-4 py-2 text-sm font-medium text-niat-text hover:bg-niat-border/30"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {metaRow}
            <div className="text-[15px] leading-relaxed">
              <MarkdownBody content={followUp.body} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

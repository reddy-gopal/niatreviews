"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { FollowUp } from "@/lib/api";
import { MarkdownBody } from "@/components/MarkdownBody";
import { useUpdateFollowUp, useDeleteFollowUp } from "@/hooks/useFollowUps";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";

/** Follow-up item styled to align with CommentItem (border-left, dropdown menu, same edit/delete UX). */
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

  return (
    <article
      className={cn(
        "border-l-2 pl-2 sm:pl-4 py-2 rounded-r-lg transition-colors min-w-0 overflow-visible",
        isSeniorReply ? "border-primary/30" : "border-niat-border"
      )}
      style={{
        backgroundColor: isSeniorReply
          ? "rgba(153, 27, 27, 0.06)"
          : "var(--niat-section)",
      }}
    >
      <div className="flex gap-2 sm:gap-3 items-start">
        <div className="flex-1 min-w-0 overflow-visible">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs sm:text-sm flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 min-w-0">
              <Link
                href={`/users/${followUp.author?.username ?? ""}`}
                className="font-medium text-niat-text hover:text-primary transition-colors cursor-pointer"
              >
                {followUp.author?.username ?? "unknown"}
              </Link>
              {isSeniorReply && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    color: "var(--primary)",
                    backgroundColor: "rgba(153, 27, 27, 0.12)",
                  }}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified Senior
                </span>
              )}
              <span className="text-niat-text-secondary shrink-0">
                <time dateTime={followUp.created_at}>
                  {new Date(followUp.created_at).toLocaleString()}
                </time>
              </span>
            </div>
            {showActions && !isEditing && (
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
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-niat-border/50 text-left disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    )}
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
                  onClick={handleSave}
                  disabled={
                    updateMutation.isPending ||
                    !editBody.trim() ||
                    editBody.trim() === followUp.body
                  }
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
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
                  className="rounded-lg border border-niat-border px-3 py-1.5 text-xs font-medium text-niat-text hover:bg-niat-border/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <MarkdownBody content={followUp.body} className="text-sm" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

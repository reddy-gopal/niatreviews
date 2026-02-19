"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, CheckCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
  const { upvote, downvote, removeUpvote, removeDownvote } = useAnswerVote(questionSlug, answer.id);
  const updateMutation = useUpdateAnswer(questionSlug);
  const deleteMutation = useDeleteAnswer(questionSlug);
  const { showLoginRequired, toast } = useToast();
  const { confirm } = useConfirm();
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      { body: editBody.trim(), answerId: answer.id },
      {
        onSuccess: () => setEditing(false),
        onError: () => {},
      }
    );
  };

  const handleDelete = () => {
    setMenuOpen(false);
    confirm({
      title: "Delete this answer?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
      onConfirm: () => {
        deleteMutation.mutate(answer.id, {
          onSuccess: () => toast.success("Answer deleted."),
          onError: () => toast.error("Could not delete answer."),
        });
      },
    });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section
      aria-label="Answer"
      className="pt-6 first:pt-0 border-t border-niat-border first:border-t-0"
    >
      {editing ? (
        <div className="space-y-4">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-niat-border bg-[var(--niat-section)] px-3 py-2.5 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
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
          {/* Answer content with options at top-right */}
          <div className="relative pr-8">
            <div className="text-niat-text text-[15px] leading-relaxed">
              <MarkdownBody content={answer.body} />
            </div>
            {isAuthor && (
              <div className="absolute top-0 right-0" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="p-1.5 rounded-lg text-niat-text-secondary hover:text-niat-text hover:bg-niat-border/50 transition-colors"
                  aria-label="Answer options"
                  aria-expanded={menuOpen}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 py-1 min-w-[120px] rounded-lg border border-niat-border shadow-lg z-10"
                    style={{ backgroundColor: "var(--niat-section)" }}
                    role="menu"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); setEditing(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 text-left"
                    >
                      <Pencil className="h-4 w-4 shrink-0" />
                      Edit
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 text-left"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Meta row: author, date, votes — clear spacing */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-niat-text-secondary">
              <Link
                href={`/users/${answer.author?.username ?? ""}`}
                className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
              >
                <User className="h-4 w-4 shrink-0" />
                @{answer.author?.username ?? "unknown"}
                {answer.author?.is_verified_senior && (
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
                    style={{ color: "var(--primary)", backgroundColor: "rgba(153, 27, 27, 0.12)" }}
                    title="Verified Senior"
                    aria-label="Verified Senior"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </span>
                )}
              </Link>
              <time dateTime={answer.created_at} className="shrink-0">
                {createdDate}
              </time>
            </div>
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
        </>
      )}
    </section>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, CheckCircle, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { useDeleteQuestion } from "@/hooks/useQuestionDetail";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import type { Question } from "@/types/question";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
}

function formatRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week(s) ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const auth = isAuthenticated();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const isAuthor = !!profile && !!question.author && question.author.username === profile.username;
  const canEditDelete = isAuthor && !question.is_answered && !question.answer;

  const deleteMutation = useDeleteQuestion(canEditDelete ? question.slug : null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = () => {
    setMenuOpen(false);
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

  const answered = question.is_answered ?? question.has_answer;
  const answerAuthor = question.answer?.author?.username;

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-niat-border shadow-card transition-shadow",
        "hover:shadow-soft bg-[var(--niat-section)]"
      )}
    >
      <div className="p-4 sm:p-5 flex flex-col gap-3 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/questions/${question.slug}`} className="group block">
              <h2 className="font-semibold text-lg text-niat-text group-hover:text-primary transition-colors line-clamp-2">
                {question.title}
              </h2>
            </Link>
          </div>
          {canEditDelete && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1.5 rounded-lg text-niat-text-secondary hover:text-niat-text hover:bg-niat-border/50 transition-colors"
                aria-label="Question options"
                aria-expanded={menuOpen}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 min-w-[140px] rounded-xl border border-niat-border py-1 shadow-card z-10 bg-[var(--niat-section)]"
                  role="menu"
                >
                  <Link
                    href={`/questions/${question.slug}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 rounded-t-xl"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl disabled:opacity-50 text-left"
                    role="menuitem"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteMutation.isPending ? "Deleting…" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {question.category && (
          <Link
            href={`/questions?category=${encodeURIComponent(question.category)}`}
            className="inline-flex text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md transition-colors w-fit"
          >
            {question.category}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-niat-text-secondary">
          <Link
            href={`/users/${question.author?.username ?? ""}`}
            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <User className="h-4 w-4 shrink-0" />
            @{question.author?.username ?? "unknown"}
          </Link>
          <span aria-hidden>·</span>
          <time dateTime={question.created_at}>{formatRelativeTime(question.created_at)}</time>
          {answered ? (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                <CheckCircle className="h-3.5 w-3.5" />
                Answered{answerAuthor ? ` by @${answerAuthor}` : ""}
                {question.answer?.author?.is_verified_senior && " ✓"}
              </span>
            </>
          ) : (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium">
                <Clock className="h-3.5 w-3.5" />
                Awaiting senior answer
              </span>
            </>
          )}
        </div>

        {answered && question.answer?.body && (
          <div className="mt-2 pl-1 border-l-2 border-niat-border">
            <p className="text-sm text-niat-text-secondary line-clamp-3">{question.answer.body}</p>
          </div>
        )}
      </div>
    </article>
  );
}

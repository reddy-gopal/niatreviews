"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFollowUps, useCreateFollowUp } from "@/hooks/useFollowUps";
import { FollowUpCard } from "./FollowUpCard";
import { FollowUpThreadSkeleton } from "./FollowUpThreadSkeleton";
import { isAuthenticated } from "@/lib/auth";
import { fetchProfile } from "@/lib/api";

interface FollowUpThreadProps {
  questionSlug: string;
  hasAnswer: boolean;
  isQuestionAuthor: boolean;
  /** True when the current user is a senior who has answered this question (can reply to follow-ups). */
  seniorHasAnswered?: boolean;
}

export function FollowUpThread({
  questionSlug,
  hasAnswer,
  isQuestionAuthor,
  seniorHasAnswered = false,
}: FollowUpThreadProps) {
  const [body, setBody] = useState("");
  const [formRevealed, setFormRevealed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const auth = isAuthenticated();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const { data, status, isPending } = useFollowUps(questionSlug);
  const createMutation = useCreateFollowUp(questionSlug);

  const canAddFollowUp = isQuestionAuthor || seniorHasAnswered;
  const showAddForm = auth && !!profile && canAddFollowUp && hasAnswer;
  const followUps = data?.results ?? (Array.isArray(data) ? data : []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || createMutation.isPending) return;
    createMutation.mutate(trimmed, {
      onSuccess: () => setBody(""),
    });
  };

  const revealForm = () => {
    setFormRevealed(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  if (status === "pending" || isPending) {
    return <FollowUpThreadSkeleton />;
  }

  // Show section when: user can add a follow-up (question author, has answer) OR there are existing follow-ups
  const showSection = showAddForm || followUps.length > 0;
  if (!showSection) {
    return null;
  }

  const showRevealButton =
    isQuestionAuthor && !formRevealed && followUps.length === 0;
  const placeholder =
    seniorHasAnswered && !isQuestionAuthor
      ? "Reply to the follow-up…"
      : "Ask a follow-up question or add a clarification…";

  const formArea = showAddForm && (
    <div className="space-y-3">
      {showRevealButton ? (
        <button
          type="button"
          onClick={revealForm}
          className="w-full rounded-xl border border-niat-border px-4 py-3 text-left text-sm font-medium text-niat-text hover:bg-niat-section transition-colors flex items-center gap-2"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          <span className="text-primary shrink-0" aria-hidden>
            ?
          </span>
          I didn’t understand the answer well — ask a follow-up question
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full rounded-lg border border-niat-border px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:ring-2 focus:ring-primary"
            style={{ backgroundColor: "var(--niat-section)" }}
          />
          <button
            type="submit"
            disabled={createMutation.isPending || !body.trim()}
            className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {createMutation.isPending ? "Posting…" : seniorHasAnswered && !isQuestionAuthor ? "Post reply" : "Post follow-up"}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <section
      aria-label="Follow-up thread"
      className="space-y-4 pt-8 border-t border-niat-border"
    >
      <h2 className="text-sm font-medium text-niat-text-secondary uppercase tracking-wide">
        {followUps.length > 0 ? "Follow-ups" : "Need more help?"}
      </h2>

      {formArea}

      {followUps.length > 0 && (
        <div className="space-y-4">
          {followUps.map((fu) => (
            <FollowUpCard
              key={fu.id}
              followUp={fu}
              questionSlug={questionSlug}
            />
          ))}
        </div>
      )}
    </section>
  );
}

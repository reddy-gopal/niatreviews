"use client";

import { useState } from "react";
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
}

export function FollowUpThread({
  questionSlug,
  hasAnswer,
  isQuestionAuthor,
}: FollowUpThreadProps) {
  const [body, setBody] = useState("");
  const auth = isAuthenticated();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const { data, status, isPending } = useFollowUps(questionSlug);
  const createMutation = useCreateFollowUp(questionSlug);

  const showAddForm = auth && !!profile && isQuestionAuthor && hasAnswer;
  const followUps = data?.results ?? (Array.isArray(data) ? data : []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || createMutation.isPending) return;
    createMutation.mutate(trimmed, {
      onSuccess: () => setBody(""),
    });
  };

  if (status === "pending" || isPending) {
    return <FollowUpThreadSkeleton />;
  }

  // Only show follow-ups section when at least one follow-up exists (prospective has raised one)
  if (followUps.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Follow-up thread"
      className="space-y-4 pt-8 border-t border-niat-border"
    >
      <h2 className="text-sm font-medium text-niat-text-secondary uppercase tracking-wide">
        Follow-ups
      </h2>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask a follow-up question or add a clarification…"
            rows={3}
            className="w-full rounded-lg border border-niat-border px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:ring-2 focus:ring-primary"
            style={{ backgroundColor: "var(--niat-section)" }}
          />
          <button
            type="submit"
            disabled={createMutation.isPending || !body.trim()}
            className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {createMutation.isPending ? "Posting…" : "Post follow-up"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {followUps.map((fu) => (
          <FollowUpCard
            key={fu.id}
            followUp={fu}
            questionSlug={questionSlug}
          />
        ))}
      </div>
    </section>
  );
}

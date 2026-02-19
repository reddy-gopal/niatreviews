"use client";

import { useState } from "react";
import { useSubmitAnswer } from "@/hooks/useAnswer";
import { cn } from "@/lib/utils";

interface AnswerFormProps {
  questionSlug: string;
}

export function AnswerForm({ questionSlug }: AnswerFormProps) {
  const [body, setBody] = useState("");
  const submit = useSubmitAnswer(questionSlug);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    submit.mutate(body.trim(), {
      onSuccess: () => setBody(""),
      onError: () => {},
    });
  };

  return (
    <section aria-label="Write an answer" className="pt-4 border-t border-niat-border">
      <h2 className="text-lg font-semibold text-niat-text mb-3">Your answer</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          required
          minLength={10}
          className="w-full rounded-xl border border-niat-border bg-[var(--niat-section)] px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Write your answer..."
        />
        <button
          type="submit"
          disabled={submit.isPending || body.trim().length < 10}
          className={cn(
            "rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity",
            (submit.isPending || body.trim().length < 10) && "opacity-50 cursor-not-allowed"
          )}
        >
          {submit.isPending ? "Submitting…" : "Submit Answer"}
        </button>
      </form>
    </section>
  );
}

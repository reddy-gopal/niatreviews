"use client";

import { useState, useEffect } from "react";
import { useAskQuestion } from "@/hooks/useAskQuestion";
import { isAuthenticated } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { RichTextBodyEditor } from "@/components/RichTextBodyEditor";

const TITLE_MIN = 10;
const TITLE_MAX = 300;
const BODY_MAX = 5000;

export default function AskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qFromUrl = searchParams.get("q")?.trim() ?? "";
  const [title, setTitle] = useState(qFromUrl);
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  const ask = useAskQuestion();

  useEffect(() => {
    if (auth === false && typeof window !== "undefined") {
      router.replace("/login?next=/ask");
    }
  }, [auth, router]);

  const titleError =
    title.length > 0 && title.length < TITLE_MIN
      ? `At least ${TITLE_MIN} characters`
      : title.length > TITLE_MAX
        ? `At most ${TITLE_MAX} characters`
        : null;

  const canSubmit =
    auth === true &&
    title.trim().length >= TITLE_MIN &&
    title.trim().length <= TITLE_MAX &&
    !ask.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    ask.mutate(
      { title: title.trim(), body: body.trim() || undefined },
      { onError: () => {} }
    );
  };

  if (auth !== true) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <p className="text-niat-text-secondary">
          {auth === false ? "Redirecting to login…" : "Checking authentication…"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 sm:py-10">
        <div
          className="rounded-2xl border border-niat-border shadow-soft overflow-hidden"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-niat-text mb-1">
              Ask a Question
            </h1>
            <p className="text-sm text-niat-text-secondary mb-6">
              Get answers from verified NIAT seniors.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="ask-title"
                  className="block text-sm font-medium text-niat-text mb-2"
                >
                  Your question <span className="text-primary">*</span>
                </label>
                <input
                  id="ask-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. What is the fee structure?"
                  required
                  minLength={TITLE_MIN}
                  maxLength={TITLE_MAX}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow",
                    titleError ? "border-red-500 bg-red-50/30" : "border-niat-border"
                  )}
                  style={!titleError ? { backgroundColor: "var(--niat-section)" } : undefined}
                />
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs text-niat-text-secondary">
                    {title.length}/{TITLE_MAX}
                  </span>
                  {titleError && (
                    <span className="text-sm text-red-600">{titleError}</span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="ask-body"
                  className="block text-sm font-medium text-niat-text mb-2"
                >
                  More details <span className="text-niat-text-secondary font-normal">(optional)</span>
                </label>
                <RichTextBodyEditor
                  id="ask-body"
                  value={body}
                  onChange={setBody}
                  placeholder="Add context, bullet points, or links. You can use **bold**, *italic*, lists and emojis 😊"
                  minRows={5}
                  maxLength={BODY_MAX}
                />
                <p className="mt-1.5 text-xs text-niat-text-secondary">
                  Supports bold, italic, lists, links and emojis. Your text is shown as you format it.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
                  )}
                >
                  {ask.isPending ? "Submitting…" : "Submit Question"}
                </button>
                <p className="text-xs text-niat-text-secondary sm:ml-2">
                  Min {TITLE_MIN} characters for the title.
                </p>
              </div>
            </form>
          </div>

          <div
            className="border-t border-niat-border px-6 sm:px-8 py-4"
            style={{ backgroundColor: "rgba(0,0,0,0.02)" }}
          >
            <p className="text-sm font-medium text-niat-text mb-2">Tips</p>
            <ul className="text-sm text-niat-text-secondary space-y-1 list-disc list-inside">
              <li>Be specific and clear</li>
              <li>One question at a time</li>
              <li>Check if your question was already asked</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

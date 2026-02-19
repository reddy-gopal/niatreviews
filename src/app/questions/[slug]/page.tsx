"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuestionDetail } from "@/hooks/useQuestionDetail";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api";
import { QuestionDetail, AnswerBlock, AnswerForm, FollowUpThread } from "@/components/qa";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { isAuthenticated } from "@/lib/auth";

export default function QuestionDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : null;
  const { data: question, status, error } = useQuestionDetail(slug);
  const auth = isAuthenticated();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const isVerifiedSenior = profile?.is_verified_senior ?? false;
  const hasAnswer = question?.answer != null;

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-niat-text-secondary mb-4">This question link isn’t valid.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "error" || !question) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-niat-text-secondary mb-4">
          This question doesn’t exist or we couldn’t load it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor =
    !!profile && !!question.author && question.author.username === profile.username;

  return (
    <div className="flex flex-col min-h-full">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <QuestionDetail question={question} slug={slug} isAuthor={isAuthor} />

        {hasAnswer && question.answer && (
          <AnswerBlock answer={question.answer} questionSlug={slug} />
        )}

        {!hasAnswer && isVerifiedSenior && <AnswerForm questionSlug={slug} />}

        {!hasAnswer && !isVerifiedSenior && (
          <div
            className="rounded-xl border border-niat-border p-4 text-center text-niat-text-secondary text-sm"
            style={{ backgroundColor: "var(--niat-section)" }}
          >
            No answer yet. Only verified seniors can answer questions.
          </div>
        )}

        <FollowUpThread
          questionSlug={slug}
          hasAnswer={hasAnswer}
          isQuestionAuthor={isAuthor}
        />
      </div>
    </div>
  );
}

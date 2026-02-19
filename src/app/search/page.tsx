"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchQuestions } from "@/hooks/useSearchQuestions";
import { QuestionCard } from "@/components/qa";
import { HomeSearchBox } from "@/components/HomeSearchBox";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { isAuthenticated, getLoginUrl } from "@/lib/auth";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const trimmed = q.trim();

  useEffect(() => {
    if (!isAuthenticated()) {
      const returnPath = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
      router.replace(getLoginUrl(returnPath));
    }
  }, [router, q]);

  if (!isAuthenticated()) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useSearchQuestions(trimmed, "-rank");

  const questions = data?.pages.flatMap((p) => p.results) ?? [];
  const hasSearched = trimmed.length > 0;
  const isEmpty = hasSearched && status === "success" && questions.length === 0;

  return (
    <div className="flex flex-col min-h-full max-w-3xl mx-auto w-full px-4 py-8">
      <div className="mb-6">
        <HomeSearchBox initialQuery={q} />
      </div>

      {!hasSearched && (
        <p className="text-center text-niat-text-secondary py-12">
          Enter a search term above to find questions.
        </p>
      )}

      {hasSearched && status === "pending" && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {hasSearched && status === "error" && (
        <div className="rounded-2xl border border-niat-border p-8 text-center bg-[var(--niat-section)]">
          <p className="text-niat-text-secondary">
            Failed to search. {error?.message}
          </p>
        </div>
      )}

      {isEmpty && (
        <div className="rounded-2xl border border-niat-border p-8 sm:p-10 text-center bg-[var(--niat-section)]">
          <p className="text-niat-text font-medium">No matching questions found.</p>
          <p className="mt-1 text-sm text-niat-text-secondary">
            Ask the community and get an answer from verified seniors.
          </p>
          <Link
            href={trimmed ? `/ask?q=${encodeURIComponent(trimmed)}` : "/ask"}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Ask this Question
          </Link>
        </div>
      )}

      {hasSearched && status === "success" && questions.length > 0 && (
        <>
          <p className="text-sm text-niat-text-secondary mb-4">
            {questions.length} result{questions.length !== 1 ? "s" : ""} for &quot;{trimmed}&quot;
          </p>
          <ul className="space-y-4">
            {questions.map((question) => (
              <li key={question.id}>
                <QuestionCard question={question} />
              </li>
            ))}
          </ul>
          {hasNextPage && (
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-xl border border-niat-border px-5 py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50 transition-colors bg-[var(--niat-section)]"
              >
                {isFetchingNextPage ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size="sm" /> Loading...
                  </span>
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

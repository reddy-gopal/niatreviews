"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuestions, type UseQuestionsOptions } from "@/hooks/useQuestions";
import { useSearchQuestions } from "@/hooks/useSearchQuestions";
import { useQuestionCategories } from "@/hooks/useQuestionCategories";
import { QuestionCard, QuestionSearchBar } from "@/components/qa";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";

type Filter = "all" | "answered" | "unanswered";

function QuestionsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const categoryFromUrl = searchParams.get("category") ?? "";
  const answeredParamFromUrl = searchParams.get("answered");
  const urlFilter: Filter =
    answeredParamFromUrl === "true" ? "answered" : answeredParamFromUrl === "false" ? "unanswered" : "all";
  const [filter, setFilter] = useState<Filter>(urlFilter);
  const [category, setCategory] = useState<string>(categoryFromUrl);

  const { data: categories = [] } = useQuestionCategories();

  useEffect(() => {
    setFilter(urlFilter);
  }, [urlFilter]);

  useEffect(() => {
    setCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  const answeredParam: UseQuestionsOptions["answered"] =
    filter === "answered" ? "true" : filter === "unanswered" ? "false" : undefined;

  const validCategory = category && categories.includes(category) ? category : undefined;

  const listQuery = useQuestions({
    answered: answeredParam,
    category: validCategory,
  });

  const searchQuery = useSearchQuestions(q, "-rank");

  const isSearch = q.trim().length > 0;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = isSearch
    ? searchQuery
    : listQuery;

  const questions = data?.pages.flatMap((p) => p.results) ?? [];

  const handleCategoryClick = (cat: string) => {
    const next = category === cat ? "" : cat;
    setCategory(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("category", next);
    else url.searchParams.delete("category");
    window.history.replaceState({}, "", url.pathname + url.search);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-niat-text">All Questions</h1>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <QuestionSearchBar placeholder="Search questions..." initialQuery={q} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-niat-text-secondary">Status:</span>
            <div className="inline-flex rounded-lg border border-niat-border p-0.5" style={{ backgroundColor: "var(--niat-section)" }}>
              {(["all", "answered", "unanswered"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "text-niat-text-secondary hover:text-niat-text"
                  )}
                >
                  {f === "all" ? "All" : f === "answered" ? "Answered" : "Unanswered"}
                </button>
              ))}
            </div>
          </div>
        </div>
        {!isSearch && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-niat-text-secondary shrink-0">Category:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleCategoryClick("")}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                  !category
                    ? "bg-primary text-primary-foreground"
                    : "text-niat-text-secondary hover:text-niat-text border border-niat-border"
                )}
                style={category ? { backgroundColor: "var(--niat-section)" } : undefined}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-colors border border-niat-border",
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "text-niat-text-secondary hover:text-niat-text"
                  )}
                  style={category !== cat ? { backgroundColor: "var(--niat-section)" } : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {status === "pending" && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {status === "error" && (
        <div className="py-12 text-center text-primary">
          Failed to load questions. {error?.message}
        </div>
      )}

      {status === "success" && (
        <>
          {questions.length === 0 ? (
            <div
              className="rounded-2xl border border-niat-border p-8 text-center"
              style={{ backgroundColor: "var(--niat-section)" }}
            >
              <p className="text-niat-text-secondary">
                {isSearch ? "No questions match your search." : "No questions yet."}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {questions.map((question) => (
                <li key={question.id}>
                  <QuestionCard question={question} />
                </li>
              ))}
            </ul>
          )}

          {hasNextPage && (
            <div className="flex justify-center py-4">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-xl border border-niat-border px-5 py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "var(--niat-section)" }}
              >
                {isFetchingNextPage ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Load more
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
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      }
    >
      <QuestionsContent />
    </Suspense>
  );
}

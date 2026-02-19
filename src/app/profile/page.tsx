"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import { fetchProfile } from "@/lib/api";
import {
  ProfileCard,
  TabNavigation,
  EmptyState,
} from "@/components/profile";
import type { ProfileTabId, TabItem } from "@/components/profile";
import { useQuestions } from "@/hooks/useQuestions";
import { QuestionCard } from "@/components/qa";
import { LoadingBlock, LoadingSpinner } from "@/components/LoadingSpinner";

const BASE_TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "questions", label: "My Questions" },
];

const SENIOR_ANSWERS_TAB: TabItem = { id: "answers", label: "My Answers" };

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTabId>("overview");

  const { data: profile, status, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: typeof window !== "undefined" && isAuthenticated(),
  });

  const isVerifiedSenior = profile?.is_verified_senior ?? false;
  const profileTabs = isVerifiedSenior
    ? [...BASE_TABS, SENIOR_ANSWERS_TAB]
    : BASE_TABS;

  const authorId = profile?.id ?? null;
  const myQuestionsQuery = useQuestions({ author: authorId ?? undefined });
  const myAnswersQuery = useQuestions({
    answerAuthor: authorId ?? undefined,
    enabled: !!authorId && isVerifiedSenior,
  });

  const myQuestions = myQuestionsQuery.data?.pages.flatMap((p) => p.results) ?? [];
  const myAnswers = myAnswersQuery.data?.pages.flatMap((p) => p.results) ?? [];

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === "answers" && !isVerifiedSenior) {
      setActiveTab("overview");
    }
  }, [activeTab, isVerifiedSenior]);

  const handleEditProfile = () => router.push("/profile/settings");

  if (typeof window !== "undefined" && !isAuthenticated()) {
    return null;
  }

  if (status === "pending" || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-niat-border p-6 shadow-soft bg-[var(--niat-section)]">
        <h1 className="text-2xl font-bold text-niat-text">Profile</h1>
        <p className="mt-2 text-primary">
          Failed to load profile. {(error as Error)?.message ?? "Please try again."}
        </p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": {
        const hasQuestions = myQuestions.length > 0;
        const hasAnswers = myAnswers.length > 0;
        if (!hasQuestions && !hasAnswers) {
          return (
            <EmptyState
              title="You haven't asked any questions yet"
              description="Ask your first question and get answers from verified seniors."
              actionLabel="Ask a Question"
              onAction={() => router.push("/ask")}
              secondaryActionLabel="Edit profile"
              onSecondaryAction={handleEditProfile}
            />
          );
        }
        return (
          <div className="space-y-6">
            {hasQuestions && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-niat-text-secondary mb-3">
                  Recent questions
                </h3>
                <div className="space-y-3">
                  {myQuestions.slice(0, 5).map((q) => (
                    <QuestionCard key={q.id} question={q} />
                  ))}
                  {myQuestions.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("questions")}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View all questions →
                    </button>
                  )}
                </div>
              </section>
            )}
            {hasAnswers && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-niat-text-secondary mb-3">
                  Recent answers
                </h3>
                <div className="space-y-3">
                  {myAnswers.slice(0, 5).map((q) => (
                    <QuestionCard key={q.id} question={q} />
                  ))}
                  {myAnswers.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("answers")}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View all answers →
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>
        );
      }
      case "questions": {
        if (myQuestionsQuery.isLoading) {
          return <LoadingBlock className="py-8" />;
        }
        if (myQuestions.length === 0) {
          return (
            <EmptyState
              title="You haven't asked any questions yet"
              description="Ask the community and get answers from verified seniors."
              actionLabel="Ask a Question"
              onAction={() => router.push("/ask")}
            />
          );
        }
        return (
          <div className="space-y-4">
            {myQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
            {myQuestionsQuery.hasNextPage && (
              <button
                type="button"
                onClick={() => myQuestionsQuery.fetchNextPage()}
                disabled={myQuestionsQuery.isFetchingNextPage}
                className="w-full rounded-xl border border-niat-border py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50"
              >
                {myQuestionsQuery.isFetchingNextPage ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Load more
                  </span>
                ) : (
                  "Load more"
                )}
              </button>
            )}
          </div>
        );
      }
      case "answers": {
        if (myAnswersQuery.isLoading) {
          return <LoadingBlock className="py-8" />;
        }
        if (myAnswers.length === 0) {
          return (
            <EmptyState
              title="No answers yet"
              description="When you answer questions as a verified senior, they'll appear here."
              actionLabel="Browse questions"
              onAction={() => router.push("/questions")}
            />
          );
        }
        return (
          <div className="space-y-4">
            {myAnswers.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
            {myAnswersQuery.hasNextPage && (
              <button
                type="button"
                onClick={() => myAnswersQuery.fetchNextPage()}
                disabled={myAnswersQuery.isFetchingNextPage}
                className="w-full rounded-xl border border-niat-border py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50"
              >
                {myAnswersQuery.isFetchingNextPage ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Load more
                  </span>
                ) : (
                  "Load more"
                )}
              </button>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
    <div className="flex min-h-[60vh] flex-col gap-4 sm:gap-6 lg:flex-row">
      <div className="w-full shrink-0 lg:w-[300px] order-1">
        <div className="lg:sticky lg:top-24">
          <ProfileCard
            username={profile.username}
            avatarUrl={null}
            onEdit={handleEditProfile}
          />
        </div>
      </div>

      <div className="min-w-0 flex-1 order-2">
        <div className="rounded-lg border border-niat-border bg-[var(--niat-section)] shadow-soft transition-colors duration-200 overflow-hidden">
          <TabNavigation
            tabs={profileTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <div className="p-3 sm:p-4">
            <div
              id={`panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              className="min-h-[200px]"
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

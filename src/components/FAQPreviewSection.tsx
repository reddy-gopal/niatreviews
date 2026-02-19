"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFAQs } from "@/hooks/useFAQs";
import { FAQAccordion } from "@/components/qa";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { isAuthenticated, getLoginUrl } from "@/lib/auth";

const MAX_FAQ_ITEMS = 8;

interface FAQPreviewSectionProps {
  className?: string;
  maxItems?: number;
}

export function FAQPreviewSection({
  className,
  maxItems = MAX_FAQ_ITEMS,
}: FAQPreviewSectionProps) {
  const router = useRouter();
  const { data: faqs, status, error } = useFAQs();
  const list = faqs?.slice(0, maxItems) ?? [];

  const handleViewAllQuestions = (e: React.MouseEvent) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      router.push(getLoginUrl("/questions"));
    }
  };

  return (
    <section className={cn("w-full max-w-4xl mx-auto px-4 pb-12 sm:pb-16", className)}>
      <h2 className="text-lg font-semibold text-niat-text mb-4">
        Frequently Asked Questions
      </h2>

      {status === "pending" && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-niat-border p-8 text-center bg-[var(--niat-section)]">
          <p className="text-niat-text-secondary">
            Could not load FAQs. {error?.message}
          </p>
          <Link
            href="/questions"
            onClick={handleViewAllQuestions}
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Browse all questions
          </Link>
        </div>
      )}

      {status === "success" && list.length > 0 && (
        <>
          <div
            className="rounded-2xl border border-niat-border p-4 sm:p-6 shadow-soft"
            style={{ backgroundColor: "var(--niat-section)" }}
          >
            <FAQAccordion items={list} maxItems={maxItems} />
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/questions"
              onClick={handleViewAllQuestions}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all questions →
            </Link>
          </div>
        </>
      )}

      {status === "success" && list.length === 0 && (
        <div className="rounded-2xl border border-niat-border p-8 text-center bg-[var(--niat-section)]">
          <p className="text-niat-text-secondary">No FAQs yet.</p>
          <Link
            href="/questions"
            onClick={handleViewAllQuestions}
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Browse all questions
          </Link>
        </div>
      )}
    </section>
  );
}

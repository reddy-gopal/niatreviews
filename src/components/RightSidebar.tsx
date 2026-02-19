"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { HelpCircle, FileQuestion, CheckCircle, BookOpen, LayoutDashboard } from "lucide-react";

export function RightSidebar() {
  const { role } = useAuth();
  const isSenior = role === "senior";

  return (
    <aside className="hidden xl:block w-72 shrink-0 min-h-0 overflow-y-auto scrollbar-hide space-y-4">
      {isSenior ? (
        <>
          <section className="rounded-2xl border border-niat-border bg-[var(--niat-section)] p-4 shadow-soft">
            <h3 className="text-sm font-semibold text-niat-text mb-3">You&apos;re a verified senior</h3>
            <p className="text-sm text-niat-text-secondary mb-3">
              Help prospective students by answering their questions. Your experience matters.
            </p>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </section>

          <section className="rounded-2xl border border-niat-border bg-[var(--niat-section)] p-4 shadow-soft">
            <h3 className="text-sm font-semibold text-niat-text mb-3">Explore</h3>
            <ul className="text-sm text-niat-text-secondary space-y-2">
              <li>
                <Link href="/" className="inline-flex items-center gap-1.5 text-niat-text hover:text-primary transition-colors">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/questions" className="inline-flex items-center gap-1.5 text-niat-text hover:text-primary transition-colors">
                  <FileQuestion className="h-4 w-4 shrink-0" />
                  All questions
                </Link>
              </li>
              <li>
                <Link href="/questions?answered=true" className="inline-flex items-center gap-1.5 text-niat-text hover:text-primary transition-colors">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Answered
                </Link>
              </li>
              <li>
                <Link href="/questions?answered=false" className="inline-flex items-center gap-1.5 text-niat-text hover:text-primary transition-colors">
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  Awaiting answer
                </Link>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-niat-border bg-[var(--niat-section)] p-4 shadow-soft">
            <h3 className="text-sm font-semibold text-niat-text mb-3">Guidelines for seniors</h3>
            <ul className="text-sm text-niat-text-secondary space-y-1 list-disc list-inside">
              <li>Be respectful and on-topic in your answers</li>
              <li>Share your real NIAT experience; avoid speculation</li>
              <li>No spam or promotional content</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-primary p-4 shadow-card">
            <p className="text-sm text-primary-foreground font-medium mb-2">
              Questions waiting for you
            </p>
            <p className="text-xs text-primary-foreground/90 mb-3">
              Prospective students are looking for your answers.
            </p>
            <Link
              href="/questions?answered=false"
              className={cn(
                "inline-block rounded-xl bg-primary-foreground text-primary px-3 py-2 text-sm font-medium",
                "hover:opacity-90 transition-opacity"
              )}
            >
              Answer questions
            </Link>
          </section>
        </>
      ) : (
        <>
          <section className="rounded-2xl border border-niat-border bg-[var(--niat-section)] p-4 shadow-soft">
            <h3 className="text-sm font-semibold text-niat-text mb-3">Verified Seniors</h3>
            <p className="text-sm text-niat-text-secondary mb-3">
              Answers here are written by verified NIAT seniors — current students or alumni who’ve been vetted by the institute.
            </p>
            <Link
              href="/questions?answered=true"
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Browse answered questions
            </Link>
          </section>

          <section className="rounded-2xl border border-niat-border bg-[var(--niat-section)] p-4 shadow-soft">
            <h3 className="text-sm font-semibold text-niat-text mb-3">Explore</h3>
            <ul className="text-sm text-niat-text-secondary space-y-2">
              <li>
                <Link href="/" className="inline-flex items-center gap-1.5 text-niat-text hover:text-primary transition-colors">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/questions" className="inline-flex items-center gap-1.5 text-niat-text hover:text-primary transition-colors">
                  <FileQuestion className="h-4 w-4 shrink-0" />
                  All questions
                </Link>
              </li>
              <li>
                <Link href="/questions?answered=true" className="inline-flex items-center gap-1.5 text-niat-text hover:text-primary transition-colors">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Answered
                </Link>
              </li>
              <li>
                <Link href="/questions?answered=false" className="inline-flex items-center gap-1.5 text-niat-text hover:text-primary transition-colors">
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  Awaiting answer
                </Link>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-niat-border bg-[var(--niat-section)] p-4 shadow-soft">
            <h3 className="text-sm font-semibold text-niat-text mb-3">Guidelines</h3>
            <ul className="text-sm text-niat-text-secondary space-y-1 list-disc list-inside">
              <li>Be respectful and on-topic</li>
              <li>Only verified NIAT seniors can post answers</li>
              <li>No spam or promotional content</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-primary p-4 shadow-card">
            <p className="text-sm text-primary-foreground font-medium mb-2">
              Ask the community
            </p>
            <p className="text-xs text-primary-foreground/90 mb-3">
              Get answers from verified NIAT seniors.
            </p>
            <Link
              href="/ask"
              className={cn(
                "inline-block rounded-xl bg-primary-foreground text-primary px-3 py-2 text-sm font-medium",
                "hover:opacity-90 transition-opacity"
              )}
            >
              Ask a Question
            </Link>
          </section>
        </>
      )}
    </aside>
  );
}

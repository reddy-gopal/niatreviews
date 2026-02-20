"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getOnboardingStatus,
  submitOnboardingReview,
  type OnboardingReviewPayload,
} from "@/lib/api";
import {
  FACULTY_SUPPORT_OPTIONS,
  LEARNING_BALANCE_OPTIONS,
  PLACEMENT_REALITY_OPTIONS,
  EXPERIENCE_FEEL_OPTIONS,
  FINAL_RECOMMENDATION_OPTIONS,
  ONBOARDING_TEXT_MIN_LENGTH,
  isValidLinkedInProfileUrl,
} from "@/lib/onboarding-constants";
import { isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const STEPS = [
  {
    title: "Teaching & faculty support",
    ratingKey: "teaching_quality" as const,
    textKey: "faculty_support_text" as const,
    choiceKey: "faculty_support_choice" as const,
    textLabel: "In a few sentences, how supportive were your faculty?",
    textPlaceholder: "e.g. They were approachable, held regular doubt sessions, and helped with projects.",
    choiceOptions: FACULTY_SUPPORT_OPTIONS,
  },
  {
    title: "Hands-on learning & projects",
    ratingKey: "projects_quality" as const,
    textKey: "best_project_or_skill" as const,
    choiceKey: "learning_balance_choice" as const,
    textLabel: "What was the best project or skill you gained?",
    textPlaceholder: "e.g. A capstone project in ML; learned to deploy apps end-to-end.",
    choiceOptions: LEARNING_BALANCE_OPTIONS,
    linkedinKey: "linkedin_profile_url" as const,
  },
  {
    title: "Placements & career readiness",
    ratingKey: "placement_support" as const,
    textKey: "job_ready_text" as const,
    choiceKey: "placement_reality_choice" as const,
    textLabel: "How did the program prepare you for jobs or internships?",
    textPlaceholder: "e.g. Resume workshops, mock interviews, and company talks helped a lot.",
    choiceOptions: PLACEMENT_REALITY_OPTIONS,
  },
  {
    title: "Your overall experience",
    ratingKey: "overall_satisfaction" as const,
    textKey: "one_line_experience" as const,
    choiceKey: "experience_feel_choice" as const,
    textLabel: "Sum up your NIAT experience in one line.",
    textPlaceholder: "e.g. Tough but rewarding; I grew more than I expected.",
    choiceOptions: EXPERIENCE_FEEL_OPTIONS,
  },
  {
    title: "Would you recommend it?",
    ratingKey: "recommendation_score" as const,
    textKey: "who_should_join_text" as const,
    choiceKey: "final_recommendation_choice" as const,
    textLabel: "Who do you think should consider joining NIAT?",
    textPlaceholder: "e.g. Students who want a mix of theory and real-world projects.",
    choiceOptions: FINAL_RECOMMENDATION_OPTIONS,
  },
];

const initialPayload: OnboardingReviewPayload = {
  teaching_quality: 0,
  faculty_support_text: "",
  faculty_support_choice: "",
  projects_quality: 0,
  best_project_or_skill: "",
  learning_balance_choice: "",
  placement_support: 0,
  job_ready_text: "",
  placement_reality_choice: "",
  overall_satisfaction: 0,
  one_line_experience: "",
  experience_feel_choice: "",
  recommendation_score: 0,
  who_should_join_text: "",
  final_recommendation_choice: "",
  linkedin_profile_url: "",
};

export default function OnboardingReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingReviewPayload>(initialPayload);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    getOnboardingStatus()
      .then((status) => {
        if (status?.review_submitted) {
          router.replace("/");
          return;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const current = STEPS[step - 1];
  const stepHasLinkedIn = "linkedinKey" in current && current.linkedinKey;
  const isLastStep = step === STEPS.length;

  const update = <K extends keyof OnboardingReviewPayload>(key: K, value: OnboardingReviewPayload[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSubmitError(null);
  };

  const canProceed = () => {
    const r = data[current.ratingKey as keyof OnboardingReviewPayload];
    const t = data[current.textKey as keyof OnboardingReviewPayload];
    const c = data[current.choiceKey as keyof OnboardingReviewPayload];
    const base =
      typeof r === "number" && r >= 1 && r <= 5 &&
      typeof t === "string" && t.trim().length >= ONBOARDING_TEXT_MIN_LENGTH &&
      typeof c === "string" && c.length > 0;
    if (stepHasLinkedIn) {
      return base && isValidLinkedInProfileUrl(data.linkedin_profile_url);
    }
    return base;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (isLastStep) {
      setSubmitting(true);
      setSubmitError(null);
      submitOnboardingReview(data)
        .then(() => {
          setSubmitted(true);
          setTimeout(() => router.replace("/"), 2000);
        })
        .catch((err) => {
          setSubmitError(err instanceof Error ? err.message : "Submission failed");
        })
        .finally(() => setSubmitting(false));
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--niat-section)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[var(--niat-section)]">
        <div className="rounded-2xl border border-niat-border p-10 max-w-md text-center shadow-card bg-white">
          <h2 className="text-2xl font-bold text-primary mb-3">You’re all set!</h2>
          <p className="text-niat-text-secondary">Thanks for completing your review. Redirecting you to the community…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 sm:p-8 bg-[var(--niat-section)]">
      <div className="w-full max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-niat-text mb-1">Welcome to NIAT Reviews</h1>
          <p className="text-sm text-niat-text-secondary">Complete this short review to join the community</p>
        </div>

        <div className="rounded-2xl border border-niat-border p-6 sm:p-8 shadow-card bg-white">
          <div className="mb-6">
            <p className="text-sm text-niat-text-secondary mb-1">Step {step} of {STEPS.length}</p>
            <div className="h-2 rounded-full bg-niat-border overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / STEPS.length) * 100}%` }} />
            </div>
          </div>

          <h2 className="text-lg font-bold text-niat-text mb-6">{current.title}</h2>

          <>
          <div className="mb-6">
            <p className="text-sm font-medium text-niat-text mb-2">Rate from 1 to 5 stars</p>
            <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => update(current.ratingKey, n)}
                className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label={`${n} stars`}
              >
                <Star
                  className="w-8 h-8 transition-colors"
                  fill={(data[current.ratingKey] as number) >= n ? "var(--accent-1)" : "transparent"}
                  stroke={(data[current.ratingKey] as number) >= n ? "var(--accent-1)" : "var(--niat-border)"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-niat-text mb-1">
              {current.textLabel} <span className="text-niat-text-secondary font-normal">(min {ONBOARDING_TEXT_MIN_LENGTH} characters)</span>
            </label>
          <textarea
            value={(data[current.textKey] as string) || ""}
            onChange={(e) => update(current.textKey, e.target.value)}
            placeholder={current.textPlaceholder}
            rows={3}
            className="w-full rounded-xl border border-niat-border px-4 py-2.5 text-niat-text bg-white placeholder:text-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          </div>

          {stepHasLinkedIn && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-niat-text mb-1">
              LinkedIn profile URL
            </label>
            <input
              type="url"
              value={data.linkedin_profile_url}
              onChange={(e) => update("linkedin_profile_url", e.target.value.trim())}
              placeholder="https://www.linkedin.com/in/yourprofile"
              className="w-full rounded-xl border border-niat-border px-4 py-2.5 text-niat-text bg-white placeholder:text-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {data.linkedin_profile_url && !isValidLinkedInProfileUrl(data.linkedin_profile_url) && (
              <p className="text-sm text-amber-600 mt-1">Enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/yourprofile)</p>
            )}
          </div>
          )}

          <div className="mb-8">
            <p className="text-sm font-medium text-niat-text mb-2">Pick the option that fits best</p>
          <div className="space-y-2">
            {current.choiceOptions.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 transition-colors",
                  (data[current.choiceKey] as string) === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-niat-border hover:bg-white/50"
                )}
              >
                <input
                  type="radio"
                  name={current.choiceKey}
                  value={opt.value}
                  checked={(data[current.choiceKey] as string) === opt.value}
                  onChange={() => update(current.choiceKey, opt.value)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-niat-text">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
          </>

          {submitError && (
            <p className="text-sm text-red-600 mb-4" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-niat-border px-4 py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/20"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || submitting}
              className="rounded-xl bg-primary text-primary-foreground font-medium py-2.5 px-5 hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : isLastStep ? "Submit & join community" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

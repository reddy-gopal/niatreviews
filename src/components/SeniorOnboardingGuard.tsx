"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import { fetchProfile, getOnboardingStatus } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const ALLOWED_PATHS = ["/login", "/register", "/auth/magic", "/onboarding/review"];

/**
 * Redirects authenticated approved seniors who have not submitted
 * the onboarding review to /onboarding/review. Does not run for allowed paths.
 * Only requests onboarding status when user is a verified senior (no request for prospective/student).
 */
export function SeniorOnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const isAllowedPath = pathname ? ALLOWED_PATHS.some((p) => pathname.startsWith(p)) : false;
  const shouldFetchProfile = mounted && !!pathname && !isAllowedPath && isAuthenticated();

  const { data: profile, isSuccess: profileLoaded, isError: profileError } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: shouldFetchProfile,
    staleTime: 5 * 60 * 1000,
  });

  const isVerifiedSenior = profile?.is_verified_senior === true;
  const shouldCheckOnboarding = shouldFetchProfile && isVerifiedSenior;

  const { data: status, isPending, isSuccess, isError } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: getOnboardingStatus,
    enabled: shouldCheckOnboarding,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!shouldCheckOnboarding || !isSuccess) return;
    if (status === null) return;
    if (!status.review_submitted) {
      router.replace("/onboarding/review");
    }
  }, [shouldCheckOnboarding, isSuccess, status, router]);

  const ready =
    !shouldFetchProfile ||
    profileError ||
    (shouldFetchProfile && profileLoaded && !isVerifiedSenior) ||
    isError ||
    (isSuccess && (status === null || status.review_submitted));

  const loading = shouldFetchProfile && !ready;

  if (mounted && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--niat-section)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}

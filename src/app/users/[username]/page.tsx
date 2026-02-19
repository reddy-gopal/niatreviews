"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { User, CheckCircle, ArrowLeft } from "lucide-react";
import { useSeniorProfile, useFollowSenior, useUnfollowSenior } from "@/hooks/useSeniorFollow";
import { fetchProfile } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function UserProfilePage() {
  const params = useParams();
  const username = typeof params.username === "string" ? params.username : null;

  const { data: profile, status, error } = useSeniorProfile(username);
  const auth = isAuthenticated();
  const { data: me } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const followMutation = useFollowSenior(profile?.id ?? null);
  const unfollowMutation = useUnfollowSenior(profile?.id ?? null);

  const isOwnProfile = !!me && !!profile && me.username === profile.username;
  const isSenior = profile?.is_verified_senior ?? false;
  const isViewerProspectiveStudent = auth && me && !me.is_verified_senior;
  const isFollowed = profile?.is_followed_by_me ?? false;
  const followerCount = profile?.follower_count ?? 0;

  if (!username) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 text-center text-niat-text-secondary">
        Invalid profile.
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

  if (status === "error" || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 text-center">
        <p className="text-niat-text-secondary mb-4">
          {error ? (error as Error).message : "Profile not found."}
        </p>
        <Link
          href="/questions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to questions
        </Link>
      </div>
    );
  }

  const handleFollowClick = () => {
    if (isFollowed) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <Link
        href="/questions"
        className="inline-flex items-center gap-1.5 text-sm text-niat-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to questions
      </Link>

      <section
        className="rounded-2xl border border-niat-border p-6 shadow-soft"
        style={{ backgroundColor: "var(--niat-section)" }}
        aria-label="User profile"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="h-16 w-16 shrink-0 rounded-full flex items-center justify-center border-2 border-niat-border"
              style={{ backgroundColor: "var(--niat-bg)" }}
            >
              <User className="h-8 w-8 text-niat-text-secondary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-niat-text truncate">
                @{profile.username}
              </h1>
              <p className="text-sm text-niat-text-secondary capitalize">
                {profile.role}
              </p>
              {isSenior && (
                <span
                  className="inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: "var(--primary)",
                    backgroundColor: "rgba(153, 27, 27, 0.12)",
                  }}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified Senior
                </span>
              )}
              {isSenior && (
                <p className="text-sm text-niat-text-secondary mt-1">
                  {followerCount} follower{followerCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOwnProfile ? (
              <Link
                href="/profile"
                className="rounded-xl border border-niat-border px-4 py-2 text-sm font-medium text-niat-text hover:bg-niat-border/30 transition-colors"
              >
                My profile
              </Link>
            ) : !auth ? (
              <Link
                href="/login"
                className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Log in to follow
              </Link>
            ) : isSenior && isViewerProspectiveStudent ? (
              <button
                type="button"
                onClick={handleFollowClick}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors min-w-[140px] h-10 flex items-center justify-center group relative",
                  isFollowed
                    ? "border border-primary text-primary hover:bg-red-100 hover:border-red-500 hover:text-red-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {followMutation.isPending || unfollowMutation.isPending ? (
                  "…"
                ) : isFollowed ? (
                  <>
                    <span className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                      Following ✓
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>
                      Unfollow
                    </span>
                  </>
                ) : (
                  "Follow"
                )}
              </button>
            ) : isSenior && auth && me?.is_verified_senior ? (
              <p className="text-sm text-niat-text-secondary">
                Only prospective students can follow seniors.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {isSenior && (
        <p className="text-sm text-niat-text-secondary">
          Verified NIAT seniors can answer questions. Follow seniors to see their
          answers in your feed.
        </p>
      )}
    </div>
  );
}

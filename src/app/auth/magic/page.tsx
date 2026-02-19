"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { magicLogin, fetchProfile } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function AuthMagicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRoleFromProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid link. No token provided.");
      return;
    }
    magicLogin(token)
      .then(async (res) => {
        setTokens(res.access, res.refresh);
        const profile = await fetchProfile();
        setRoleFromProfile(profile);
        const redirect =
          res.redirect && res.redirect !== "/"
            ? res.redirect
            : profile.is_verified_senior
              ? "/dashboard"
              : "/";
        router.replace(redirect);
        router.refresh();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Invalid or expired link.");
      });
  }, [searchParams, router, setRoleFromProfile]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl border border-niat-border p-8 max-w-md text-center shadow-card bg-[var(--niat-section)]">
          <h1 className="text-lg font-bold text-niat-text mb-2">Link invalid or expired</h1>
          <p className="text-niat-text-secondary mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block rounded-xl bg-primary text-primary-foreground font-medium py-2.5 px-5 hover:opacity-90"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <p className="text-niat-text-secondary">Signing you in…</p>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { fetchProfile } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { HomeSearchConsole } from "@/components/HomeSearchConsole";
import { FAQPreviewSection } from "@/components/FAQPreviewSection";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const auth = isAuthenticated();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });

  const isLoggedIn = !!profile;
  const greeting = getTimeGreeting();
  const displayName = profile?.username ?? "there";

  return (
    <div className="flex flex-col min-h-full">
      {/* Centered hero: full viewport, dark background (NIAT palette) */}
      <section
        className="flex flex-col items-center justify-center min-h-[85vh] sm:min-h-[88vh] px-4 py-12 text-center"
        style={{
          background: "linear-gradient(180deg, var(--hero-from) 0%, var(--hero-to) 100%)",
        }}
      >
        {/* Top badge */}
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-medium text-white/90 border border-white/20 mb-6"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          NIAT Reviews • Verified Seniors
        </span>

        {/* Personalized heading: greeting for logged-in, engaging line for public */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-3xl flex items-center justify-center gap-2 flex-wrap leading-tight">
          {isLoggedIn ? (
            <>
              <Sparkles className="h-8 w-8 sm:h-9 sm:w-9 text-[var(--accent-1)] shrink-0" aria-hidden />
              <span>{greeting}, {displayName}</span>
            </>
          ) : (
            <>
              <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                Real NIAT experiences.
              </span>
              <br className="sm:hidden" />
              <span className="text-[var(--accent-1)]">Real answers.</span>
            </>
          )}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-white/85 max-w-xl font-medium tracking-tight">
          Ask anything — placements, hostel, fees, campus life. Answers from verified NIAT seniors who&apos;ve been there.
        </p>

        {/* Search console (Claude-like, no search icon) */}
        <div className="mt-8 w-full">
          <HomeSearchConsole />
        </div>
      </section>

      {/* FAQ section — light background, below hero */}
      <section
        className="flex-1 pt-10"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <FAQPreviewSection maxItems={8} />
      </section>
    </div>
  );
}

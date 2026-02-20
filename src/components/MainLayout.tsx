"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SeniorLeftSidebar } from "@/components/nav/SeniorLeftSidebar";
import { ProspectiveLeftSidebar } from "@/components/nav/ProspectiveLeftSidebar";
import { RightSidebar } from "./RightSidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, isRoleReady } = useAuth();
  const isProfileSection = pathname.startsWith("/profile");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isAuthSetup = pathname.startsWith("/auth/setup") || pathname.startsWith("/auth/magic");
  const isSettingsPage = pathname.startsWith("/profile/settings");
  const isMinimalLayout = isOnboarding || isAuthSetup || isSettingsPage;
  const isHomePage = pathname === "/";
  const isSearchPage = pathname === "/search";
  const isDashboard = pathname === "/dashboard";
  const isSenior = role === "senior";
  /** Sidebars only when logged in (role is set). When not logged in, isRoleReady is true but role is null. */
  const isLoggedIn = isRoleReady && role !== null;
  const showSidebars = isLoggedIn;

  if (isMinimalLayout) {
    return <main className="flex-1 min-w-0">{children}</main>;
  }

  if (isHomePage || isSearchPage) {
    return (
      <main className="flex-1 min-w-0 scrollbar-hide pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4">
        {children}
      </main>
    );
  }

  // When not logged in, no sidebars — just main content
  if (!showSidebars) {
    return (
      <main className="flex-1 min-w-0 scrollbar-hide pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4">
        {children}
      </main>
    );
  }

  // Senior dashboard: no right sidebar (guide removed), main content uses full width
  const mainMaxWidth = isProfileSection
    ? "max-w-full"
    : isDashboard
      ? "max-w-4xl"
      : "max-w-2xl";

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-6 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4 w-full min-w-0">
      {!isProfileSection && showSidebars && (isSenior ? <SeniorLeftSidebar /> : <ProspectiveLeftSidebar />)}
      <main className={`flex-1 min-w-0 scrollbar-hide ${mainMaxWidth} ml-0`}>
        {children}
      </main>
      {!isProfileSection && !isDashboard && showSidebars && <RightSidebar />}
    </div>
  );
}

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

  // Profile section: no sidebars, content constrained to navbar width (max-w-[88rem] mx-auto)
  if (isProfileSection) {
    return (
      <main className="flex-1 min-w-0 scrollbar-hide w-full px-2 pt-2 sm:px-3 sm:pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4">
        <div className="max-w-[88rem] mx-auto">
          {children}
        </div>
      </main>
    );
  }

  // Dashboard: no right sidebar, main content uses full width (normal scroll)
  if (isDashboard) {
    return (
      <div className="flex gap-6 max-w-7xl mx-auto px-6 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4 w-full min-w-0">
        {showSidebars && (isSenior ? <SeniorLeftSidebar /> : <ProspectiveLeftSidebar />)}
        <main className="flex-1 min-w-0 scrollbar-hide max-w-4xl ml-0">
          {children}
        </main>
      </div>
    );
  }

  // Questions page only: fixed left & right sidebars, only middle scrolls
  const isQuestionsPage = pathname === "/questions";
  if (isQuestionsPage) {
    const mainMaxWidth = "max-w-2xl";
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full">
        <div className="flex flex-1 min-h-0 gap-6 max-w-7xl mx-auto px-6 pt-2 pb-2 md:pt-4 md:pb-4 w-full min-w-0">
          {showSidebars && (
            <div className="hidden lg:block shrink-0 min-h-0 overflow-y-auto scrollbar-hide">
              {isSenior ? <SeniorLeftSidebar /> : <ProspectiveLeftSidebar />}
            </div>
          )}
          <main
            className={`flex-1 min-w-0 min-h-0 overflow-y-auto scrollbar-hide ${mainMaxWidth} ml-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4`}
          >
            {children}
          </main>
          {showSidebars && (
            <div className="hidden xl:block shrink-0 min-h-0 overflow-y-auto scrollbar-hide">
              <RightSidebar />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Other sidebar pages (notifications, ask, etc.): normal layout — sidebars and main scroll together, footer in AppChrome
  const mainMaxWidth = "max-w-2xl";
  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-6 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4 w-full min-w-0">
      {showSidebars && (isSenior ? <SeniorLeftSidebar /> : <ProspectiveLeftSidebar />)}
      <main className={`flex-1 min-w-0 scrollbar-hide ${mainMaxWidth} ml-0`}>
        {children}
      </main>
      {showSidebars && <RightSidebar />}
    </div>
  );
}

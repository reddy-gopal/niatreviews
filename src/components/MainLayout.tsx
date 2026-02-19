"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SeniorLeftSidebar } from "@/components/nav/SeniorLeftSidebar";
import { ProspectiveLeftSidebar } from "@/components/nav/ProspectiveLeftSidebar";
import { LeftSidebarSkeleton } from "@/components/nav/LeftSidebarSkeleton";
import { RightSidebar } from "./RightSidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, isRoleReady } = useAuth();
  const isProfileSection = pathname.startsWith("/profile");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isHomePage = pathname === "/";
  const isSearchPage = pathname === "/search";
  const isDashboard = pathname === "/dashboard";
  const isSenior = role === "senior";
  const showRealSidebar = isRoleReady;

  if (isOnboarding) {
    return <main className="flex-1 min-w-0">{children}</main>;
  }

  if (isHomePage || isSearchPage) {
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
    <div className="flex gap-6 max-w-7xl mx-auto px-4 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4 w-full min-w-0">
      {!isProfileSection && (showRealSidebar ? (isSenior ? <SeniorLeftSidebar /> : <ProspectiveLeftSidebar />) : <LeftSidebarSkeleton />)}
      <main className={`flex-1 min-w-0 scrollbar-hide ${mainMaxWidth}`}>
        {children}
      </main>
      {!isProfileSection && !isDashboard && <RightSidebar />}
    </div>
  );
}

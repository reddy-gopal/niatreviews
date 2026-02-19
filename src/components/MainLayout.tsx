"use client";

import { usePathname } from "next/navigation";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfileSection = pathname.startsWith("/profile");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isHomePage = pathname === "/";
  const isSearchPage = pathname === "/search";

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

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-4 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4 w-full min-w-0">
      {!isProfileSection && <LeftSidebar />}
      <main
        className={`flex-1 min-w-0 scrollbar-hide ${isProfileSection ? "max-w-full" : "max-w-2xl"}`}
      >
        {children}
      </main>
      {!isProfileSection && <RightSidebar />}
    </div>
  );
}

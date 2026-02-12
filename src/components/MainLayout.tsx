"use client";

import { usePathname } from "next/navigation";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfileSection = pathname.startsWith("/profile");

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-4 py-6 w-full">
      {!isProfileSection && <LeftSidebar />}
      <main className={`flex-1 min-w-0 ${isProfileSection ? "max-w-full" : "max-w-2xl"}`}>
        {children}
      </main>
      {!isProfileSection && <RightSidebar />}
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { MainLayout } from "@/components/MainLayout";
import { MobileBottomBar } from "@/components/MobileBottomBar";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";

  if (isSearchPage) {
    return (
      <div className="min-h-screen flex flex-col" data-search-page>
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col min-h-0">
      <Navbar />
      <MainLayout>{children}</MainLayout>
      <MobileBottomBar />
    </div>
  );
}

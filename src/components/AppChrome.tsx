"use client";

import { Navbar } from "@/components/Navbar";
import { MainLayout } from "@/components/MainLayout";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { Footer } from "@/components/Footer";

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col min-h-0">
      <Navbar />
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
        <MainLayout>{children}</MainLayout>
        <Footer />
      </div>
      <MobileBottomBar />
    </div>
  );
}

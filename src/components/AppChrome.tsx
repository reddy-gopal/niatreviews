"use client";

import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/MainLayout";
import { SeniorNavbar } from "@/components/nav/SeniorNavbar";
import { ProspectiveNavbar } from "@/components/nav/ProspectiveNavbar";
import { NavbarSkeleton } from "@/components/nav/NavbarSkeleton";
import { SeniorMobileBottomBar } from "@/components/nav/SeniorMobileBottomBar";
import { ProspectiveMobileBottomBar } from "@/components/nav/ProspectiveMobileBottomBar";
import { MobileBottomBarSkeleton } from "@/components/nav/MobileBottomBarSkeleton";
import { Footer } from "@/components/Footer";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const { role, isRoleReady } = useAuth();
  const isSenior = role === "senior";
  const showRealNav = isRoleReady;

  return (
    <div className="h-screen flex flex-col min-h-0">
      {showRealNav ? (isSenior ? <SeniorNavbar /> : <ProspectiveNavbar />) : <NavbarSkeleton />}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
        <MainLayout>{children}</MainLayout>
        <Footer />
      </div>
      {showRealNav ? (isSenior ? <SeniorMobileBottomBar /> : <ProspectiveMobileBottomBar />) : <MobileBottomBarSkeleton />}
    </div>
  );
}

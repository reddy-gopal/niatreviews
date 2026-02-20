"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/MainLayout";
import { SeniorNavbar } from "@/components/nav/SeniorNavbar";
import { ProspectiveNavbar } from "@/components/nav/ProspectiveNavbar";
import { MinimalNavbar } from "@/components/nav/MinimalNavbar";
import { NavbarSkeleton } from "@/components/nav/NavbarSkeleton";
import { SeniorMobileBottomBar } from "@/components/nav/SeniorMobileBottomBar";
import { ProspectiveMobileBottomBar } from "@/components/nav/ProspectiveMobileBottomBar";
import { MobileBottomBarSkeleton } from "@/components/nav/MobileBottomBarSkeleton";
import { Footer } from "@/components/Footer";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, isRoleReady } = useAuth();
  const isSenior = role === "senior";
  const showRealNav = isRoleReady;

  const isMinimalChrome =
    pathname.startsWith("/auth/setup") ||
    pathname.startsWith("/auth/magic") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/profile/settings");

  return (
    <div className="h-screen flex flex-col min-h-0">
      {isMinimalChrome ? (
        <MinimalNavbar />
      ) : showRealNav ? (
        isSenior ? <SeniorNavbar /> : <ProspectiveNavbar />
      ) : (
        <NavbarSkeleton />
      )}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
        <MainLayout>{children}</MainLayout>
        {!isMinimalChrome && <Footer />}
      </div>
      {!isMinimalChrome &&
        (showRealNav ? (
          isSenior ? <SeniorMobileBottomBar /> : <ProspectiveMobileBottomBar />
        ) : (
          <MobileBottomBarSkeleton />
        ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, TrendingUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/categories", label: "Explore", icon: Compass },
];

export function MobileBottomBar() {
  const pathname = usePathname();

  const isProfileSection = pathname.startsWith("/profile");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isSearchPage = pathname === "/search";
  const showBar = !isProfileSection && !isOnboarding && !isSearchPage;

  if (!showBar) return null;

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-[env(safe-area-inset-bottom)]"
      style={{ backgroundColor: "var(--niat-navbar)" }}
    >
      <div className="flex items-center gap-1 px-2 py-2 border-t border-niat-border shadow-soft">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 min-h-[44px] touch-manipulation transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text"
              )}
              aria-label={label}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-[10px] font-medium truncate max-w-full px-0.5">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}

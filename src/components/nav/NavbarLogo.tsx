"use client";

import Link from "next/link";
import Image from "next/image";

export function NavbarLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0"
      style={{ color: "var(--primary)" }}
    >
      <Image
        src="/logo.png"
        alt=""
        width={96}
        height={32}
        className="h-6 sm:h-7 md:h-8 w-auto object-contain"
      />
      <span className="inline text-sm sm:text-lg md:text-xl lg:text-2xl font-bold truncate">
        NIAT REVIEWS
      </span>
    </Link>
  );
}

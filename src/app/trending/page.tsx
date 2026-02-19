"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrendingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/questions");
  }, [router]);
  return null;
}

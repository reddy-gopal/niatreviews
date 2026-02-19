"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostSlugRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/questions");
  }, [router]);
  return null;
}

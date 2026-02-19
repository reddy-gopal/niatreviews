"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostEditRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/questions");
  }, [router]);
  return null;
}

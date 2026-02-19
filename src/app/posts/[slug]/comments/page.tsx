"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostCommentsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/questions");
  }, [router]);
  return null;
}

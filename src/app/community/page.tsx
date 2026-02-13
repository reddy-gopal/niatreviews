"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommunityPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center text-niat-text-secondary">
      Redirecting to community…
    </div>
  );
}

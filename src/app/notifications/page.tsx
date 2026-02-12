"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function NotificationsPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div
      className="py-8 rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <h1 className="text-2xl font-bold text-niat-text">Notifications</h1>
      <p className="text-niat-text-secondary mt-2">
        Notifications UI placeholder. Connect to notifications API when ready.
      </p>
    </div>
  );
}

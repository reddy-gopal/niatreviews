"use client";

import { useParams } from "next/navigation";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  return (
    <div
      className="mx-auto max-w-xl rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <h1 className="text-2xl font-bold text-niat-text">u/{username}</h1>
      <p className="mt-2 text-niat-text-secondary">
        User profile placeholder. Connect to user API when ready.
      </p>
    </div>
  );
}

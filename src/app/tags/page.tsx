"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Tag } from "@/types/post";
import { LoadingBlock } from "@/components/LoadingSpinner";

export default function TagsListPage() {
  const { data: tags, status, error } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await api.get<Tag[]>("/tags/");
      return data;
    },
  });

  if (status === "pending") {
    return <LoadingBlock />;
  }
  if (status === "error") {
    return (
      <div className="py-12 text-center text-primary">
        Failed to load. {error?.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-niat-text">Tags</h1>
      <div className="flex flex-wrap gap-2">
        {!tags?.length ? (
          <p className="text-niat-text-secondary">No tags yet.</p>
        ) : (
          tags.map((t) => (
            <Link
              key={t.id}
              href={`/tags/${t.slug}`}
              className="rounded-xl border border-niat-border bg-niat-section px-4 py-2.5 text-sm font-medium text-niat-text hover:bg-secondary hover:text-white hover:border-secondary transition-colors shadow-soft"
            >
              {t.name}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

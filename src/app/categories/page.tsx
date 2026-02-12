"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Category } from "@/types/post";

export default function CategoriesListPage() {
  const { data: categories, status, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/categories/");
      return data;
    },
  });

  if (status === "pending") {
    return (
      <div className="py-12 text-center text-niat-text-secondary">Loading…</div>
    );
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
      <h1 className="text-2xl font-bold text-niat-text">Categories</h1>
      <div className="flex flex-wrap gap-2">
        {!categories?.length ? (
          <p className="text-niat-text-secondary">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="rounded-xl border border-niat-border bg-niat-section px-4 py-2.5 text-sm font-medium text-niat-text hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shadow-soft"
            >
              {c.name}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

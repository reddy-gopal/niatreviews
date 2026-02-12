"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { Category, Tag } from "@/types/post";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  category: z.string().uuid().optional().or(z.literal("")),
  tags: z.array(z.string().uuid()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreatePostPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/categories/");
      return data;
    },
  });
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await api.get<Tag[]>("/tags/");
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "", tags: [] },
  });

  const selectedTags = watch("tags") ?? [];

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        category: data.category || null,
        tags: data.tags ?? [],
      };
      if (imageFile) {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("category", data.category || "");
        (data.tags ?? []).forEach((id) => formData.append("tags", id));
        formData.append("image", imageFile);
        const { data: post } = await api.post<{ id: string; slug: string }>("/posts/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        router.push(`/posts/${post.slug}`);
      } else {
        const { data: post } = await api.post<{ id: string; slug: string }>("/posts/", payload);
        router.push(`/posts/${post.slug}`);
      }
      router.refresh();
    } catch {
      setError("Failed to create post.");
    }
  };

  const toggleTag = (tagId: string) => {
    setValue(
      "tags",
      selectedTags.includes(tagId)
        ? selectedTags.filter((t) => t !== tagId)
        : [...selectedTags, tagId]
    );
  };

  return (
    <div
      className="mx-auto max-w-xl space-y-6 py-8 rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <h1 className="text-2xl font-bold text-niat-text">Create post</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <p className="text-sm text-primary bg-primary/10 border border-primary p-2 rounded-xl">{error}</p>
        )}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-niat-text mb-1">
            Title
          </label>
          <input
            id="title"
            {...register("title")}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.title && (
            <p className="text-sm text-primary mt-1">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-niat-text mb-1">
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={6}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.description && (
            <p className="text-sm text-primary mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-niat-text mb-1">Category</label>
          <select
            {...register("category")}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">None</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-niat-text mb-1">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags?.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                  selectedTags.includes(t.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-niat-border text-niat-text hover:bg-niat-border/50"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-niat-text mb-1">Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-niat-text file:rounded-xl file:border file:border-niat-border file:bg-niat-section file:px-3 file:py-1.5 file:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Publish
        </button>
      </form>
    </div>
  );
}

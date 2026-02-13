"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { usePostDetail } from "@/hooks/usePostDetail";
import api, { fetchProfile, updatePost } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { Category, Tag } from "@/types/post";
import { LoadingBlock } from "@/components/LoadingSpinner";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  category: z.string().uuid().optional().or(z.literal("")),
  tags: z.array(z.string().uuid()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const postQuery = usePostDetail(slug);
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: isAuthenticated(),
  });
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

  const post = postQuery.data;
  const isAuthor = !!profile?.id && !!post?.author && (post.author as { id: string }).id === profile.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? "",
      description: post?.description ?? "",
      category: post?.category?.id ?? "",
      tags: post?.tags?.map((t) => t.id) ?? [],
    },
  });

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        description: post.description,
        category: post.category?.id ?? "",
        tags: post.tags?.map((t) => t.id) ?? [],
      });
    }
  }, [post, reset]);

  const selectedTags = watch("tags") ?? [];

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (postQuery.isSuccess && post && !isAuthor) {
      router.replace(`/posts/${slug}`);
    }
  }, [postQuery.isSuccess, post, isAuthor, slug, router]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const tagIds = data.tags ?? [];
      await updatePost(slug, {
        title: data.title,
        description: data.description,
        category: data.category || null,
        tag_ids: tagIds,
        image: imageFile ?? undefined,
      });
      router.push(`/posts/${slug}`);
      router.refresh();
    } catch {
      setError("Failed to update post.");
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

  if (postQuery.isLoading || !post) {
    return (
      <div className="py-12 text-center">
        {postQuery.error ? (
          <p className="text-primary">Failed to load post.</p>
        ) : (
          <LoadingBlock />
        )}
      </div>
    );
  }

  if (!isAuthor) {
    return null;
  }

  return (
    <div
      className="mx-auto max-w-xl space-y-6 py-8 rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-niat-text">Edit post</h1>
        <Link
          href={`/posts/${slug}`}
          className="text-sm font-medium text-niat-text-secondary hover:text-primary"
        >
          Cancel
        </Link>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <p className="text-sm text-primary bg-primary/10 border border-primary p-2 rounded-xl">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-niat-text mb-1">
            Title
          </label>
          <input
            id="title"
            {...register("title")}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.title && <p className="text-sm text-primary mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-niat-text mb-1">
            Description
          </label>
          <p className="text-xs text-niat-text-secondary mb-1">
            You can add #hashtags in the text; they will be used as tags.
          </p>
          <textarea
            id="description"
            {...register("description")}
            rows={6}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.description && (
            <p className="text-sm text-primary mt-1">{errors.description.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-niat-text mb-1">Category</label>
          <select
            {...register("category")}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary"
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
          <label className="block text-sm font-medium text-niat-text mb-1">
            Image (optional, leave empty to keep current)
          </label>
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
          Save changes
        </button>
      </form>
    </div>
  );
}

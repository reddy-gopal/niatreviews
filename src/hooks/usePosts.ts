import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Post, PaginatedPosts } from "@/types/post";

export interface UsePostsOptions {
  category?: string;
  tag?: string;
  /** Filter by author user id (e.g. for profile "My posts") */
  author?: string | null;
  /** When "me", returns only posts the current user has upvoted. Requires auth. */
  upvotedBy?: "me" | null;
}

function getPostsKey(opts: UsePostsOptions) {
  return [
    "posts",
    opts.category ?? "",
    opts.tag ?? "",
    opts.author ?? "",
    opts.upvotedBy ?? "",
  ] as const;
}

async function fetchPosts(
  cursor?: string | null,
  opts?: { category?: string; tag?: string; author?: string; upvotedBy?: string }
) {
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  if (opts?.category) params.category = opts.category;
  if (opts?.tag) params.tag = opts.tag;
  if (opts?.author) params.author = opts.author;
  if (opts?.upvotedBy) params.upvoted_by = opts.upvotedBy;
  const { data } = await api.get<PaginatedPosts>("/posts/", { params });
  return data;
}

function parseCursorFromNext(next: string | null): string | undefined {
  if (!next) return undefined;
  try {
    const u = new URL(next);
    return u.searchParams.get("cursor") ?? undefined;
  } catch {
    return undefined;
  }
}

export function usePosts(opts: UsePostsOptions = {}) {
  return useInfiniteQuery({
    queryKey: getPostsKey(opts),
    queryFn: ({ pageParam }) =>
      fetchPosts(pageParam, {
        category: opts.category,
        tag: opts.tag,
        author: opts.author ?? undefined,
        upvotedBy: opts.upvotedBy ?? undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => parseCursorFromNext(last.next),
  });
}

export function usePostsByCategory(slug: string) {
  return usePosts({ category: slug });
}

export function usePostsByTag(slug: string) {
  return usePosts({ tag: slug });
}

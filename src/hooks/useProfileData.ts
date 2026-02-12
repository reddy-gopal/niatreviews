import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Comment, PaginatedComments } from "@/types/comment";

export interface UseCommentsListOptions {
  /** Filter by author user id (e.g. for profile "My comments") */
  author?: string | null;
  /** When "me", returns only comments the current user has upvoted. Requires auth. */
  upvotedBy?: "me" | null;
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

async function fetchCommentsList(
  cursor: string | null,
  opts: { author?: string; upvotedBy?: string }
) {
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  if (opts.author) params.author = opts.author;
  if (opts.upvotedBy) params.upvoted_by = opts.upvotedBy;
  const { data } = await api.get<PaginatedComments>("/comments/", { params });
  return data;
}

export function useCommentsList(opts: UseCommentsListOptions = {}) {
  return useInfiniteQuery({
    queryKey: ["comments-list", opts.author ?? "", opts.upvotedBy ?? ""],
    queryFn: ({ pageParam }) =>
      fetchCommentsList(pageParam, {
        author: opts.author ?? undefined,
        upvotedBy: opts.upvotedBy ?? undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => parseCursorFromNext(last.next),
    enabled: !!(opts.author || opts.upvotedBy),
  });
}

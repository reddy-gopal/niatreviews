import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { updateComment as updateCommentApi, deleteComment as deleteCommentApi } from "@/lib/api";
import type { Comment, PaginatedComments } from "@/types/comment";
import type { CommentWithReplies } from "@/lib/commentTree";
import { buildCommentTree, recursiveSort } from "@/lib/commentTree";

async function fetchComments(postSlug: string, cursor?: string | null) {
  const params = cursor ? { cursor } : {};
  const { data } = await api.get<PaginatedComments>(`/posts/${postSlug}/comments/`, {
    params,
  });
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

export function useComments(postSlug: string | null) {
  const query = useInfiniteQuery({
    queryKey: ["comments", postSlug],
    queryFn: ({ pageParam }) => fetchComments(postSlug!, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => parseCursorFromNext(last.next),
    enabled: !!postSlug,
  });

  const flatComments: Comment[] =
    query.data?.pages.flatMap((p) => p.results) ?? [];
  const tree = buildCommentTree(flatComments);
  const commentTree = recursiveSort(
    JSON.parse(JSON.stringify(tree)),
    "best"
  ) as CommentWithReplies[];

  return {
    ...query,
    flatComments,
    commentTree,
  };
}

interface CreateCommentInput {
  post: string;
  parent?: string | null;
  body: string;
}

/** Minimal author for optimistic comment (no profile fetch). */
const OPTIMISTIC_AUTHOR = { username: "You" };

export function useCreateComment(postId: string, postSlug?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      const { data } = await api.post<Comment>("/comments/", input);
      return data;
    },
    onMutate: async (input) => {
      if (!postSlug) return {};
      await queryClient.cancelQueries({ queryKey: ["comments", postSlug] });
      const prev = queryClient.getQueriesData({ queryKey: ["comments", postSlug] });
      const tempId = `temp-${Date.now()}`;
      const optimisticComment: Comment = {
        id: tempId,
        post: postId,
        author: OPTIMISTIC_AUTHOR as Comment["author"],
        parent: input.parent
          ? { id: input.parent, body: "", author: OPTIMISTIC_AUTHOR as Comment["author"], created_at: new Date().toISOString() }
          : null,
        body: input.body,
        upvote_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueriesData<{ pages: { results: Comment[]; next: string | null; previous: string | null }[] }>(
        { queryKey: ["comments", postSlug] },
        (old) => {
          if (!old?.pages?.length) return old;
          const [first, ...rest] = old.pages;
          return {
            ...old,
            pages: [{ ...first, results: [optimisticComment, ...first.results] }, ...rest],
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      return { prev, tempId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
    },
    onSettled: () => {
      if (postSlug) {
        queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
        queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      }
    },
  });
}

export function useUpdateComment(postSlug: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      updateCommentApi(id, { body }),
    onSuccess: () => {
      if (postSlug) {
        queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
        queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      }
    },
  });
}

export function useDeleteComment(postSlug: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCommentApi(id),
    onSuccess: () => {
      if (postSlug) {
        queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
        queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      }
    },
  });
}

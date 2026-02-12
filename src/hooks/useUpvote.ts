import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Post, UserVote } from "@/types/post";

interface VoteResponse {
  upvote_count: number;
  downvote_count: number;
  user_vote: UserVote;
  upvoted?: boolean;
  downvoted?: boolean;
}

/** Set a single post's vote data in cache (detail + list caches). */
function setPostVote(
  queryClient: ReturnType<typeof useQueryClient>,
  postSlug: string,
  data: { upvote_count: number; downvote_count: number; user_vote: UserVote }
) {
  queryClient.setQueryData<Post>(["post", postSlug], (old) =>
    old ? { ...old, ...data } : old
  );
  queryClient.setQueriesData<{ pages: { results: Post[] }[] }>(
    { queryKey: ["posts"] },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          results: page.results.map((p) =>
            p.slug === postSlug ? { ...p, ...data } : p
          ),
        })),
      };
    }
  );
}

export function usePostUpvote(postSlug: string) {
  const queryClient = useQueryClient();

  const mutateUp = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<VoteResponse>(`/posts/${postSlug}/upvote/`);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postSlug] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const prevPost = queryClient.getQueryData<Post>(["post", postSlug]);
      const prevUp = prevPost?.upvote_count ?? 0;
      const prevDown = prevPost?.downvote_count ?? 0;
      const wasDown = prevPost?.user_vote === -1;
      const wasUp = prevPost?.user_vote === 1;
      setPostVote(queryClient, postSlug, {
        upvote_count: wasUp ? prevUp : prevUp + 1,
        downvote_count: Math.max(0, wasDown ? prevDown - 1 : prevDown),
        user_vote: 1,
      });
      return { prevPost };
    },
    onSuccess: (data) => {
      setPostVote(queryClient, postSlug, {
        upvote_count: data.upvote_count,
        downvote_count: data.downvote_count,
        user_vote: data.user_vote ?? null,
      });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevPost) queryClient.setQueryData(["post", postSlug], ctx.prevPost);
      queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const mutateDown = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<VoteResponse>(`/posts/${postSlug}/downvote/`);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postSlug] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const prevPost = queryClient.getQueryData<Post>(["post", postSlug]);
      const prevUp = prevPost?.upvote_count ?? 0;
      const prevDown = prevPost?.downvote_count ?? 0;
      const wasUp = prevPost?.user_vote === 1;
      const wasDown = prevPost?.user_vote === -1;
      setPostVote(queryClient, postSlug, {
        upvote_count: Math.max(0, wasUp ? prevUp - 1 : prevUp),
        downvote_count: wasDown ? prevDown : prevDown + 1,
        user_vote: -1,
      });
      return { prevPost };
    },
    onSuccess: (data) => {
      setPostVote(queryClient, postSlug, {
        upvote_count: data.upvote_count,
        downvote_count: data.downvote_count,
        user_vote: data.user_vote ?? null,
      });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevPost) queryClient.setQueryData(["post", postSlug], ctx.prevPost);
      queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const mutateRemove = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<VoteResponse>(`/posts/${postSlug}/upvote/`);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postSlug] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const prevPost = queryClient.getQueryData<Post>(["post", postSlug]);
      const hadUp = prevPost?.user_vote === 1 ? 1 : 0;
      const hadDown = prevPost?.user_vote === -1 ? 1 : 0;
      setPostVote(queryClient, postSlug, {
        upvote_count: Math.max(0, (prevPost?.upvote_count ?? 0) - hadUp),
        downvote_count: Math.max(0, (prevPost?.downvote_count ?? 0) - hadDown),
        user_vote: null,
      });
      return { prevPost };
    },
    onSuccess: (data) => {
      setPostVote(queryClient, postSlug, {
        upvote_count: data.upvote_count,
        downvote_count: data.downvote_count,
        user_vote: data.user_vote ?? null,
      });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevPost) queryClient.setQueryData(["post", postSlug], ctx.prevPost);
      queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postSlug] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    upvote: mutateUp.mutateAsync,
    downvote: mutateDown.mutateAsync,
    removeVote: mutateRemove.mutateAsync,
    isLoading: mutateUp.isPending || mutateDown.isPending || mutateRemove.isPending,
  };
}

/** Update one comment's upvote_count in all comments caches for this post (by slug). */
function updateCommentInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postSlug: string,
  commentId: string,
  updater: (count: number) => number
) {
  queryClient.setQueriesData<{ pages: { results: { id: string; upvote_count: number }[] }[] }>(
    { queryKey: ["comments", postSlug] },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          results: page.results.map((c) =>
            c.id === commentId ? { ...c, upvote_count: updater(c.upvote_count) } : c
          ),
        })),
      };
    }
  );
}

interface CommentUpvoteResponse {
  upvoted: boolean;
  upvote_count: number;
}

export function useCommentUpvote(commentId: string, postSlug: string) {
  const queryClient = useQueryClient();
  const mutateUp = useMutation({
    mutationFn: () => api.post<CommentUpvoteResponse>(`/comments/${commentId}/upvote/`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["comments", postSlug] });
      const prev = queryClient.getQueriesData({ queryKey: ["comments", postSlug] });
      updateCommentInCache(queryClient, postSlug, commentId, (c) => c + 1);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
    },
  });
  const mutateDown = useMutation({
    mutationFn: () => api.delete<CommentUpvoteResponse>(`/comments/${commentId}/upvote/`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["comments", postSlug] });
      const prev = queryClient.getQueriesData({ queryKey: ["comments", postSlug] });
      updateCommentInCache(queryClient, postSlug, commentId, (c) => Math.max(0, c - 1));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
    },
  });
  return {
    upvote: mutateUp.mutateAsync,
    removeUpvote: mutateDown.mutateAsync,
    isLoading: mutateUp.isPending || mutateDown.isPending,
  };
}

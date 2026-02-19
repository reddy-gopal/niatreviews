import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  upvoteQuestion,
  downvoteQuestion,
  removeQuestionUpvote,
  removeQuestionDownvote,
} from "@/lib/api";
import { useInvalidateQuestion } from "./useQuestionDetail";

export function useQuestionVote(slug: string | null) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateQuestion();

  const mutate = (fn: () => Promise<unknown>) => {
    if (!slug) return Promise.reject(new Error("No slug"));
    return fn().then(() => {
      invalidate(slug);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    });
  };

  const upvote = () => mutate(() => upvoteQuestion(slug!));
  const downvote = () => mutate(() => downvoteQuestion(slug!));
  const removeUpvote = () => mutate(() => removeQuestionUpvote(slug!));
  const removeDownvote = () => mutate(() => removeQuestionDownvote(slug!));

  return { upvote, downvote, removeUpvote, removeDownvote };
}

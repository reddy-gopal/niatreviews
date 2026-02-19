import { useQueryClient } from "@tanstack/react-query";
import {
  upvoteAnswer,
  downvoteAnswer,
  removeAnswerUpvote,
  removeAnswerDownvote,
} from "@/lib/api";
import { useInvalidateQuestion } from "./useQuestionDetail";

export function useAnswerVote(slug: string | null) {
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

  const upvote = () => mutate(() => upvoteAnswer(slug!));
  const downvote = () => mutate(() => downvoteAnswer(slug!));
  const removeUpvote = () => mutate(() => removeAnswerUpvote(slug!));
  const removeDownvote = () => mutate(() => removeAnswerDownvote(slug!));

  return { upvote, downvote, removeUpvote, removeDownvote };
}

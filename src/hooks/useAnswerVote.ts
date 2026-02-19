import { useQueryClient } from "@tanstack/react-query";
import {
  upvoteAnswer,
  downvoteAnswer,
  removeAnswerUpvote,
  removeAnswerDownvote,
} from "@/lib/api";
import { useInvalidateQuestion } from "./useQuestionDetail";

export function useAnswerVote(slug: string | null, answerId: string | null) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateQuestion();

  const mutate = (fn: () => Promise<unknown>) => {
    if (!slug || !answerId) return Promise.reject(new Error("No slug or answerId"));
    return fn().then(() => {
      invalidate(slug);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    });
  };

  const upvote = () => mutate(() => upvoteAnswer(slug!, answerId!));
  const downvote = () => mutate(() => downvoteAnswer(slug!, answerId!));
  const removeUpvote = () => mutate(() => removeAnswerUpvote(slug!, answerId!));
  const removeDownvote = () => mutate(() => removeAnswerDownvote(slug!, answerId!));

  return { upvote, downvote, removeUpvote, removeDownvote };
}

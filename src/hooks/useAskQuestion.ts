import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createQuestion } from "@/lib/api";
import { useInvalidateQuestion } from "./useQuestionDetail";

export interface AskQuestionPayload {
  title: string;
  body?: string;
}

export function useAskQuestion() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateQuestion();

  return useMutation({
    mutationFn: (payload: AskQuestionPayload) => createQuestion(payload),
    onSuccess: (data) => {
      invalidate();
      if (data?.slug) {
        router.push(`/questions/${data.slug}`);
      } else {
        router.push("/questions");
      }
    },
  });
}

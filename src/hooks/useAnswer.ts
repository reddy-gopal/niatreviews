import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAnswer, updateAnswer, deleteAnswer } from "@/lib/api";
import { useInvalidateQuestion } from "./useQuestionDetail";

export function useSubmitAnswer(slug: string | null) {
  const invalidate = useInvalidateQuestion();

  return useMutation({
    mutationFn: (body: string) => submitAnswer(slug!, body),
    onSuccess: () => invalidate(slug ?? undefined),
    meta: { slug },
  });
}

export function useUpdateAnswer(slug: string | null) {
  const invalidate = useInvalidateQuestion();

  return useMutation({
    mutationFn: ({ body, answerId }: { body: string; answerId: string }) =>
      updateAnswer(slug!, answerId, body),
    onSuccess: () => invalidate(slug ?? undefined),
    meta: { slug },
  });
}

export function useDeleteAnswer(slug: string | null) {
  const invalidate = useInvalidateQuestion();

  return useMutation({
    mutationFn: (answerId: string) => deleteAnswer(slug!, answerId),
    onSuccess: () => invalidate(slug ?? undefined),
    meta: { slug },
  });
}

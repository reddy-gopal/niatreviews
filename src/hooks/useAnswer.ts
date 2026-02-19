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
    mutationFn: ({ body }: { body: string }) => updateAnswer(slug!, body),
    onSuccess: () => invalidate(slug ?? undefined),
    meta: { slug },
  });
}

export function useDeleteAnswer(slug: string | null) {
  const invalidate = useInvalidateQuestion();

  return useMutation({
    mutationFn: () => deleteAnswer(slug!),
    onSuccess: () => invalidate(slug ?? undefined),
    meta: { slug },
  });
}

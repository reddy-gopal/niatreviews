import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from "@/lib/api";
import { useInvalidateQuestion } from "./useQuestionDetail";

const followUpsKey = (slug: string) => ["followups", slug] as const;

export function useFollowUps(slug: string | null, cursor?: string) {
  return useQuery({
    queryKey: [...followUpsKey(slug ?? ""), cursor],
    queryFn: () => getFollowUps(slug!, cursor),
    enabled: !!slug,
  });
}

export function useCreateFollowUp(slug: string | null) {
  const queryClient = useQueryClient();
  const invalidateQuestion = useInvalidateQuestion();

  return useMutation({
    mutationFn: (body: string) => createFollowUp(slug!, body),
    onSuccess: () => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: followUpsKey(slug) });
        invalidateQuestion(slug);
      }
    },
  });
}

export function useUpdateFollowUp(slug: string | null, id: string | null) {
  const queryClient = useQueryClient();
  const invalidateQuestion = useInvalidateQuestion();

  return useMutation({
    mutationFn: ({ body }: { body: string }) =>
      updateFollowUp(slug!, id!, body),
    onSuccess: () => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: followUpsKey(slug) });
        invalidateQuestion(slug);
      }
    },
  });
}

export function useDeleteFollowUp(slug: string | null, id: string | null) {
  const queryClient = useQueryClient();
  const invalidateQuestion = useInvalidateQuestion();

  return useMutation({
    mutationFn: () => deleteFollowUp(slug!, id!),
    onSuccess: () => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: followUpsKey(slug) });
        invalidateQuestion(slug);
      }
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from "@/lib/api";
import { useInvalidateQuestion } from "./useQuestionDetail";

const followUpsKey = (slug: string, answerId?: string) =>
  ["followups", slug, answerId ?? ""] as const;

export function useFollowUps(
  slug: string | null,
  opts?: { answer_id?: string; cursor?: string }
) {
  return useQuery({
    queryKey: [...followUpsKey(slug ?? "", opts?.answer_id), opts?.cursor],
    queryFn: () => getFollowUps(slug!, opts),
    enabled: !!slug,
  });
}

export function useCreateFollowUp(slug: string | null) {
  const queryClient = useQueryClient();
  const invalidateQuestion = useInvalidateQuestion();

  return useMutation({
    mutationFn: (params: {
      body: string;
      answerId: string;
      parentId?: string | null;
    }) =>
      createFollowUp(slug!, params.body, params.answerId, params.parentId),
    onSuccess: (_, { answerId }) => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: followUpsKey(slug) });
        queryClient.invalidateQueries({ queryKey: followUpsKey(slug, answerId) });
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

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getQuestionDetail, updateQuestion, deleteQuestion } from "@/lib/api";

export function useQuestionDetail(slug: string | null) {
  return useQuery({
    queryKey: ["question", slug],
    queryFn: () => getQuestionDetail(slug!),
    enabled: !!slug,
  });
}

export function useInvalidateQuestion() {
  const queryClient = useQueryClient();
  return (slug?: string) => {
    if (slug) queryClient.invalidateQueries({ queryKey: ["question", slug] });
    queryClient.invalidateQueries({ queryKey: ["questions"] });
    queryClient.invalidateQueries({ queryKey: ["faqs"] });
  };
}

export function useUpdateQuestion(slug: string | null) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateQuestion();
  return useMutation({
    mutationFn: (payload: { title?: string; body?: string }) =>
      updateQuestion(slug!, payload),
    onSuccess: () => {
      invalidate(slug ?? undefined);
    },
  });
}

export function useDeleteQuestion(slug: string | null) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateQuestion();
  return useMutation({
    mutationFn: () => deleteQuestion(slug!),
    onSuccess: () => {
      invalidate(slug ?? undefined);
      router.push("/questions");
    },
  });
}

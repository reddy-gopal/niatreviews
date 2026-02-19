import { useQuery } from "@tanstack/react-query";
import { getQuestionCategories } from "@/lib/api";

/** Fetch question categories from backend (single source of truth). */
export function useQuestionCategories() {
  return useQuery({
    queryKey: ["question-categories"],
    queryFn: getQuestionCategories,
  });
}

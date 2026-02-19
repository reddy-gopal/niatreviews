import { useQuery } from "@tanstack/react-query";
import { getFAQs } from "@/lib/api";

export function useFAQs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: getFAQs,
  });
}

import { useQuery } from "@tanstack/react-query";
import { getSeniorDashboard } from "@/lib/api";

export function useSeniorDashboard() {
  return useQuery({
    queryKey: ["seniorDashboard"],
    queryFn: getSeniorDashboard,
  });
}

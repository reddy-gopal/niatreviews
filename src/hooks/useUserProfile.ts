import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile, type Profile } from "@/lib/api";

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ["user", username],
    queryFn: () => fetchUserProfile(username),
    enabled: !!username,
  });
}

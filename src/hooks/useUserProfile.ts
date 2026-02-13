import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile, type PublicProfile } from "@/lib/api";

export function useUserProfile(username: string) {
  return useQuery<PublicProfile>({
    queryKey: ["user", username],
    queryFn: () => fetchUserProfile(username),
    enabled: !!username,
  });
}

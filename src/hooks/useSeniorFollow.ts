import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserProfile, followSenior, unfollowSenior } from "@/lib/api";

const seniorProfileKey = (username: string) => ["seniorProfile", username] as const;

/** Fetch public senior profile by username (includes follower_count, is_followed_by_me). */
export function useSeniorProfile(username: string | null) {
  return useQuery({
    queryKey: seniorProfileKey(username ?? ""),
    queryFn: () => fetchUserProfile(username!),
    enabled: !!username,
  });
}

export function useFollowSenior(seniorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => followSenior(seniorId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seniorProfile"] });
      queryClient.invalidateQueries({ queryKey: ["seniors"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUnfollowSenior(seniorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unfollowSenior(seniorId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seniorProfile"] });
      queryClient.invalidateQueries({ queryKey: ["seniors"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

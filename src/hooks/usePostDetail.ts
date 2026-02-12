import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Post } from "@/types/post";

export function usePostDetail(slug: string | null) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data } = await api.get<Post>(`/posts/${slug}/`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useInvalidatePost() {
  const queryClient = useQueryClient();
  return (slug: string) => {
    queryClient.invalidateQueries({ queryKey: ["post", slug] });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };
}

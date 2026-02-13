import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Post, PaginatedPosts } from "@/types/post";

export interface SearchFilters {
  category?: string;
  tag?: string;
  dateFrom?: string;
  dateTo?: string;
  orderBy?: "-rank" | "-created_at" | "-upvote_count";
}

export interface SearchSuggestion {
  tags: Array<{ name: string; slug: string }>;
  categories: Array<{ name: string; slug: string }>;
  posts: Array<{ id: string; title: string; slug: string }>;
}

export interface TrendingItem {
  name: string;
  slug: string;
  post_count: number;
}

async function searchPosts(
  query: string,
  cursor?: string | null,
  filters?: SearchFilters
) {
  const params: Record<string, string> = { q: query };
  if (cursor) params.cursor = cursor;
  if (filters?.category) params.category = filters.category;
  if (filters?.tag) params.tag = filters.tag;
  if (filters?.dateFrom) params.date_from = filters.dateFrom;
  if (filters?.dateTo) params.date_to = filters.dateTo;
  if (filters?.orderBy) params.order_by = filters.orderBy;
  
  const { data } = await api.get<PaginatedPosts>("/search/", { params });
  return data;
}

function parseCursorFromNext(next: string | null): string | undefined {
  if (!next) return undefined;
  try {
    const u = new URL(next);
    return u.searchParams.get("cursor") ?? undefined;
  } catch {
    return undefined;
  }
}

export function useSearch(query: string, filters?: SearchFilters) {
  return useInfiniteQuery({
    queryKey: ["search", query, filters],
    queryFn: ({ pageParam }) => searchPosts(query, pageParam, filters),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => parseCursorFromNext(last.next),
    enabled: query.trim().length > 0,
  });
}

/** Max suggestions to fetch from API (desktop). Display count is capped by SearchBar per device. */
const SUGGESTIONS_FETCH_LIMIT = 7;

export function useSearchSuggestions(query: string, enabled = true) {
  return useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: async () => {
      const { data } = await api.get<SearchSuggestion>("/search/suggestions/", {
        params: { q: query, limit: SUGGESTIONS_FETCH_LIMIT },
      });
      return data;
    },
    enabled: enabled && query.trim().length >= 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrendingSearches() {
  return useQuery({
    queryKey: ["trending-searches"],
    queryFn: async () => {
      const { data } = await api.get<{ trending: TrendingItem[] }>(
        "/search/trending/",
        { params: { limit: 10 } }
      );
      return data.trending;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

import { useInfiniteQuery } from "@tanstack/react-query";
import { getQuestions } from "@/lib/api";
import type { PaginatedQuestions } from "@/types/question";

export interface UseQuestionsOptions {
  answered?: "true" | "false";
  author?: string | null;
  /** Filter questions answered by this user id (for "My Answers" profile tab) */
  answerAuthor?: string | null;
  /** Filter by category (e.g. "Scholarships & Fee", "Placements & Career") */
  category?: string | null;
  /** When false, the query is not run (e.g. for "My Answers" when user is not a verified senior) */
  enabled?: boolean;
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

async function fetchPage(
  cursor: string | null,
  opts: UseQuestionsOptions
): Promise<PaginatedQuestions> {
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  if (opts.answered) params.answered = opts.answered;
  if (opts.author) params.author = opts.author;
  if (opts.answerAuthor) params.answer_author = opts.answerAuthor;
  if (opts.category) params.category = opts.category;
  return getQuestions(params);
}

export function useQuestions(opts: UseQuestionsOptions = {}) {
  const { enabled = true, ...rest } = opts;
  return useInfiniteQuery({
    queryKey: ["questions", rest.answered ?? "", rest.author ?? "", rest.answerAuthor ?? "", rest.category ?? ""],
    queryFn: ({ pageParam }) => fetchPage(pageParam, rest),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => parseCursorFromNext(last.next),
    enabled,
  });
}

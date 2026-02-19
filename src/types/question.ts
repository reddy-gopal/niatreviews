export interface Answer {
  id: string;
  body: string;
  author: {
    username: string;
    is_verified_senior: boolean;
  };
  upvote_count: number;
  downvote_count: number;
  created_at: string;
  updated_at: string;
  user_vote?: 1 | -1 | null;
}

export interface Question {
  id: string;
  slug: string;
  title: string;
  body?: string;
  /** Auto-classified category (e.g. "Scholarships & Fee", "Placements & Career"). */
  category?: string;
  author: { username: string; id: string };
  is_answered: boolean;
  upvote_count: number;
  downvote_count: number;
  view_count: number;
  is_faq?: boolean;
  faq_order?: number;
  created_at: string;
  updated_at?: string;
  /** List of answers (detail view). */
  answers?: Answer[];
  /** First answer for list/card preview. */
  answer?: Answer | null;
  /** Number of answers (list view). */
  answer_count?: number;
  user_vote?: 1 | -1 | null;
  has_answer?: boolean;
}

export interface FAQ extends Question {
  /** FAQs expose answers array; use first for display. */
  answers: Answer[];
  answer?: Answer | null;
  faq_order: number;
}

export interface PaginatedQuestions {
  next: string | null;
  previous: string | null;
  results: Question[];
}

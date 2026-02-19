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
  answer?: Answer | null;
  user_vote?: 1 | -1 | null;
  has_answer?: boolean;
}

export interface FAQ extends Question {
  answer: Answer;
  faq_order: number;
}

export interface PaginatedQuestions {
  next: string | null;
  previous: string | null;
  results: Question[];
}

import axios, { type AxiosError } from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";
import { API_BASE } from "./utils";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as typeof err.config & { _retry?: boolean };
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const { data } = await axios.post<{ access: string }>(`${API_BASE}/api/token/refresh/`, {
            refresh,
          });
          setTokens(data.access, refresh);
          if (original.headers) original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          clearTokens();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:login_required"));
            window.location.href = "/login";
          }
        }
      } else if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:login_required"));
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth API (token endpoints live at origin, not under /api)
export const authApi = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export async function login(username: string, password: string) {
  const { data } = await authApi.post<{ access: string; refresh: string }>("/api/token/", {
    username,
    password,
  });
  return data;
}

export async function register(payload: { username: string; email: string; password: string }) {
  const { data } = await api.post<{ id: string; username: string; email: string }>(
    "/auth/register/",
    payload
  );
  return data;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  role: string;
  is_verified_senior: boolean;
  phone_number: string | null;
  phone_verified: boolean;
  needs_password_set?: boolean;
}

/** Public profile (by username) – no email/phone. For seniors includes follower_count, is_followed_by_me. */
export interface PublicProfile {
  id: string;
  username: string;
  role: string;
  is_verified_senior: boolean;
  follower_count?: number;
  is_followed_by_me?: boolean | null;
}

export async function fetchProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>("/auth/me/");
  return data;
}

/** Public user profile by username (for /users/[username]). */
export async function fetchUserProfile(username: string): Promise<PublicProfile> {
  const { data } = await api.get<PublicProfile>(`/users/${encodeURIComponent(username)}/`);
  return data;
}

export async function updateProfile(payload: { email?: string; phone_number?: string | null }): Promise<Profile> {
  const { data } = await api.patch<Profile>("/auth/me/", payload);
  return data;
}

/** First-time setup for approved seniors (set username and password after magic link). */
export async function seniorsSetup(payload: { username?: string; password: string }): Promise<Profile> {
  const { data } = await api.patch<Profile>("/auth/me/", payload);
  return data;
}

// --- Magic login (seniors) ---

export interface MagicLoginResponse {
  access: string;
  refresh: string;
  redirect: string;
  needs_password_set?: boolean;
}

export async function magicLogin(token: string): Promise<MagicLoginResponse> {
  const { data } = await authApi.get<MagicLoginResponse>("/api/auth/magic-login/", {
    params: { token },
  });
  return data;
}

// --- Senior onboarding (main app) ---

export interface OnboardingStatusResponse {
  review_submitted: boolean;
  onboarding_completed: boolean;
}

export async function getOnboardingStatus(): Promise<OnboardingStatusResponse | null> {
  try {
    const { data } = await api.get<OnboardingStatusResponse>("/senior/onboarding/status/");
    return data;
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const ax = (err as { response?: { status?: number } }).response;
      if (ax?.status === 403 || ax?.status === 401) return null;
    }
    throw err;
  }
}

export interface OnboardingReviewPayload {
  teaching_quality: number;
  faculty_support_text: string;
  faculty_support_choice: string;
  projects_quality: number;
  best_project_or_skill: string;
  learning_balance_choice: string;
  placement_support: number;
  job_ready_text: string;
  placement_reality_choice: string;
  overall_satisfaction: number;
  one_line_experience: string;
  experience_feel_choice: string;
  recommendation_score: number;
  who_should_join_text: string;
  final_recommendation_choice: string;
}

export async function submitOnboardingReview(payload: OnboardingReviewPayload): Promise<{ status: string }> {
  const { data } = await api.post<{ status: string }>("/senior/onboarding/review/", payload);
  return data;
}

// --- Q&A: Questions ---

import type { Question, Answer, PaginatedQuestions } from "@/types/question";

export type { Question };

export interface QuestionVoteResponse {
  upvote_count: number;
  downvote_count: number;
  user_vote: number | null;
}

export async function getQuestions(params: {
  cursor?: string;
  answered?: "true" | "false";
  author?: string;
  answer_author?: string;
  category?: string;
}): Promise<PaginatedQuestions> {
  const { data } = await api.get<PaginatedQuestions>("/questions/", { params });
  return data;
}

export async function getQuestionDetail(slug: string): Promise<Question> {
  const { data } = await api.get<Question>(`/questions/${encodeURIComponent(slug)}/`);
  return data;
}

export async function createQuestion(payload: { title: string; body?: string }): Promise<Question> {
  const { data } = await api.post<Question>("/questions/", payload);
  return data;
}

export async function updateQuestion(slug: string, payload: { title?: string; body?: string }): Promise<Question> {
  const { data } = await api.patch<Question>(`/questions/${encodeURIComponent(slug)}/`, payload);
  return data;
}

export async function deleteQuestion(slug: string): Promise<void> {
  await api.delete(`/questions/${encodeURIComponent(slug)}/`);
}

export async function upvoteQuestion(slug: string): Promise<QuestionVoteResponse> {
  const { data } = await api.post<QuestionVoteResponse>(`/questions/${encodeURIComponent(slug)}/upvote/`);
  return data;
}

export async function downvoteQuestion(slug: string): Promise<QuestionVoteResponse> {
  const { data } = await api.post<QuestionVoteResponse>(`/questions/${encodeURIComponent(slug)}/downvote/`);
  return data;
}

export async function removeQuestionUpvote(slug: string): Promise<QuestionVoteResponse> {
  const { data } = await api.delete<QuestionVoteResponse>(`/questions/${encodeURIComponent(slug)}/upvote/`);
  return data;
}

export async function removeQuestionDownvote(slug: string): Promise<QuestionVoteResponse> {
  const { data } = await api.delete<QuestionVoteResponse>(`/questions/${encodeURIComponent(slug)}/downvote/`);
  return data;
}

// --- Q&A: Answers (multiple per question) ---

export async function submitAnswer(slug: string, body: string): Promise<Answer> {
  const { data } = await api.post<Answer>(`/questions/${encodeURIComponent(slug)}/answers/`, { body });
  return data;
}

export async function updateAnswer(slug: string, answerId: string, body: string): Promise<Answer> {
  const { data } = await api.patch<Answer>(
    `/questions/${encodeURIComponent(slug)}/answers/${encodeURIComponent(answerId)}/`,
    { body }
  );
  return data;
}

export async function deleteAnswer(slug: string, answerId: string): Promise<void> {
  await api.delete(
    `/questions/${encodeURIComponent(slug)}/answers/${encodeURIComponent(answerId)}/`
  );
}

export async function upvoteAnswer(slug: string, answerId: string): Promise<Answer & { user_vote?: number | null }> {
  const { data } = await api.post<Answer>(
    `/questions/${encodeURIComponent(slug)}/answers/${encodeURIComponent(answerId)}/upvote/`
  );
  return data;
}

export async function downvoteAnswer(slug: string, answerId: string): Promise<Answer & { user_vote?: number | null }> {
  const { data } = await api.post<Answer>(
    `/questions/${encodeURIComponent(slug)}/answers/${encodeURIComponent(answerId)}/downvote/`
  );
  return data;
}

export async function removeAnswerUpvote(slug: string, answerId: string): Promise<Answer & { user_vote?: number | null }> {
  const { data } = await api.delete<Answer>(
    `/questions/${encodeURIComponent(slug)}/answers/${encodeURIComponent(answerId)}/upvote/`
  );
  return data;
}

export async function removeAnswerDownvote(slug: string, answerId: string): Promise<Answer & { user_vote?: number | null }> {
  const { data } = await api.delete<Answer>(
    `/questions/${encodeURIComponent(slug)}/answers/${encodeURIComponent(answerId)}/downvote/`
  );
  return data;
}

// --- FAQs ---

export async function getFAQs(): Promise<Question[]> {
  const { data } = await api.get<Question[]>("/faqs/");
  return data;
}

// --- Question categories (from backend classifier) ---

/** List of question categories for filters; comes from backend only. */
export async function getQuestionCategories(): Promise<string[]> {
  const { data } = await api.get<{ categories: string[] }>("/questions/categories/");
  return data.categories ?? [];
}

// --- Question search (GET /api/questions/search/ and /suggestions/) ---

/** Search questions by full-text query. Uses backend FTS (SQLite FTS5 / PostgreSQL). */
export async function searchQuestions(params: {
  q: string;
  cursor?: string;
  order_by?: "-rank" | "-created_at" | "-upvote_count";
}): Promise<PaginatedQuestions> {
  const { data } = await api.get<PaginatedQuestions>("/questions/search/", { params });
  return data;
}

/** Get search suggestions for typeahead. Same backend search API, limited results. */
export async function getSearchSuggestions(q: string): Promise<Question[]> {
  if (!q.trim()) return [];
  const { data } = await api.get<Question[]>("/questions/search/suggestions/", {
    params: { q: q.trim() },
  });
  return data;
}

// --- Notifications ---

export interface NotificationItem {
  id: string;
  recipient: string;
  actor: string;
  actor_username: string;
  verb: string;
  notification_type: string | null;
  content_type: number | null;
  object_id: string | null;
  target_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationItem[];
}

export interface UnreadCountResponse {
  count: number;
}

export async function fetchNotifications(
  page = 1,
  unreadOnly?: boolean
): Promise<PaginatedNotifications> {
  const params: Record<string, string | number> = { page };
  if (unreadOnly) params.unread_only = "true";
  const { data } = await api.get<PaginatedNotifications>("/notifications/", { params });
  return data;
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await api.get<UnreadCountResponse>("/notifications/unread_count/");
  return data;
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  const { data } = await api.post<NotificationItem>(`/notifications/${id}/read/`);
  return data;
}

export async function markAllNotificationsRead(): Promise<{ marked: number }> {
  const { data } = await api.post<{ marked: number }>("/notifications/mark_all_read/");
  return data;
}

// --- Follow-ups (question thread) ---

export interface FollowUpAuthor {
  id: string;
  username: string;
  is_verified_senior: boolean;
}

export interface FollowUp {
  id: string;
  author: FollowUpAuthor;
  body: string;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
  can_delete: boolean;
}

export interface PaginatedFollowUps {
  next: string | null;
  previous: string | null;
  results: FollowUp[];
}

export async function getFollowUps(slug: string, cursor?: string): Promise<PaginatedFollowUps> {
  const params = cursor ? { cursor } : {};
  const { data } = await api.get<PaginatedFollowUps>(
    `/questions/${encodeURIComponent(slug)}/followups/`,
    { params }
  );
  return data;
}

export async function createFollowUp(slug: string, body: string): Promise<FollowUp> {
  const { data } = await api.post<FollowUp>(
    `/questions/${encodeURIComponent(slug)}/followups/`,
    { body }
  );
  return data;
}

export async function updateFollowUp(
  slug: string,
  id: string,
  body: string
): Promise<FollowUp> {
  const { data } = await api.patch<FollowUp>(
    `/questions/${encodeURIComponent(slug)}/followups/${encodeURIComponent(id)}/`,
    { body }
  );
  return data;
}

export async function deleteFollowUp(slug: string, id: string): Promise<void> {
  await api.delete(
    `/questions/${encodeURIComponent(slug)}/followups/${encodeURIComponent(id)}/`
  );
}

// --- Senior follow / unfollow ---

export interface FollowResponse {
  followed: boolean;
  follower_count: number;
}

export async function followSenior(seniorId: string): Promise<FollowResponse> {
  const { data } = await api.post<FollowResponse>(`/seniors/${encodeURIComponent(seniorId)}/follow/`);
  return data;
}

export async function unfollowSenior(seniorId: string): Promise<FollowResponse> {
  const { data } = await api.delete<FollowResponse>(`/seniors/${encodeURIComponent(seniorId)}/follow/`);
  return data;
}

export async function getSeniorsList(search?: string): Promise<PublicProfile[]> {
  const params = search?.trim() ? { search: search.trim() } : {};
  const { data } = await api.get<PublicProfile[]>("/seniors/", { params });
  return data;
}

// --- Senior dashboard ---

export interface SeniorDashboardStats {
  my_answers: { total: number };
  pending_questions: Question[];
  follower_count: number;
  recent_followups: (FollowUp & { question_slug?: string; question_title?: string })[];
  answer_upvotes_total: number;
}

export async function getSeniorDashboard(): Promise<SeniorDashboardStats> {
  const { data } = await api.get<SeniorDashboardStats>("/dashboard/senior/");
  return data;
}

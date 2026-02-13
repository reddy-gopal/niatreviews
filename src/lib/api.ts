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
}

/** Public profile (by username) – no email/phone. */
export interface PublicProfile {
  id: string;
  username: string;
  role: string;
  is_verified_senior: boolean;
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

// --- Magic login (seniors) ---

export interface MagicLoginResponse {
  access: string;
  refresh: string;
  redirect: string;
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

// --- Posts (author update/delete) ---

export async function updatePost(
  slug: string,
  payload: { title?: string; description?: string; category?: string | null; tag_ids?: string[]; image?: File | null }
): Promise<unknown> {
  const isMultipart = payload.image != null;
  if (isMultipart) {
    const formData = new FormData();
    if (payload.title != null) formData.append("title", payload.title);
    if (payload.description != null) formData.append("description", payload.description);
    if (payload.category != null) formData.append("category", payload.category);
    if (payload.tag_ids?.length) payload.tag_ids.forEach((id) => formData.append("tag_ids", id));
    if (payload.image) formData.append("image", payload.image);
    const { data } = await api.patch(`/posts/${encodeURIComponent(slug)}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
  const { data } = await api.patch(`/posts/${encodeURIComponent(slug)}/`, payload);
  return data;
}

export async function deletePost(slug: string): Promise<void> {
  await api.delete(`/posts/${encodeURIComponent(slug)}/`);
}

// --- Comments (author update/delete) ---

export async function updateComment(id: string, payload: { body: string }): Promise<unknown> {
  const { data } = await api.patch(`/comments/${id}/`, payload);
  return data;
}

export async function deleteComment(id: string): Promise<void> {
  await api.delete(`/comments/${id}/`);
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

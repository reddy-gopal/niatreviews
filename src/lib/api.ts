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

export async function fetchProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>("/auth/me/");
  return data;
}

export async function updateProfile(payload: { email?: string; phone_number?: string | null }): Promise<Profile> {
  const { data } = await api.patch<Profile>("/auth/me/", payload);
  return data;
}

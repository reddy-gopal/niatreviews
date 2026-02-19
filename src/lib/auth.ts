const ACCESS_KEY = "niat_access";
const REFRESH_KEY = "niat_refresh";
const ROLE_KEY = "niat_role";
const USERNAME_KEY = "niat_username";

export type UserRole = "senior" | "prospective";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  clearStoredRole();
}

/** Role is set only at login (or app init when restoring session). */
export function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(ROLE_KEY);
  if (v === "senior" || v === "prospective") return v;
  return null;
}

export function setStoredRole(role: UserRole): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ROLE_KEY, role);
}

export function clearStoredRole(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
}

export function getStoredUsername(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(USERNAME_KEY);
}

export function setStoredUsername(username: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(USERNAME_KEY, username);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/** Return URL to login with a return path so after login user is sent to that path. */
export function getLoginUrl(returnPath: string): string {
  const path = returnPath.startsWith("/") ? returnPath : `/${returnPath}`;
  return `/login?next=${encodeURIComponent(path)}`;
}

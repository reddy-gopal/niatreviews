"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getStoredRole,
  setStoredRole,
  setStoredUsername,
  isAuthenticated,
  type UserRole,
} from "@/lib/auth";
import { fetchProfile } from "@/lib/api";
import type { Profile } from "@/lib/api";

type AuthState = {
  role: UserRole | null;
  /** True once we know role (or know user is not authenticated). */
  isRoleReady: boolean;
};

type AuthContextValue = AuthState & {
  setRoleFromProfile: (profile: Profile) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRoleReady, setIsRoleReady] = useState(false);

  const setRoleFromProfile = useCallback((profile: Profile) => {
    const r: UserRole = profile.is_verified_senior ? "senior" : "prospective";
    setRole(r);
    setStoredRole(r);
    setStoredUsername(profile.username ?? "");
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      setRole(null);
      setIsRoleReady(true);
      return;
    }
    const stored = getStoredRole();
    if (stored) {
      setRole(stored);
      setIsRoleReady(true);
      return;
    }
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (cancelled) return;
        const r: UserRole = profile.is_verified_senior ? "senior" : "prospective";
        setRole(r);
        setStoredRole(r);
        setStoredUsername(profile.username ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        setRole(null);
      })
      .finally(() => {
        if (!cancelled) setIsRoleReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ role, isRoleReady, setRoleFromProfile }),
    [role, isRoleReady, setRoleFromProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

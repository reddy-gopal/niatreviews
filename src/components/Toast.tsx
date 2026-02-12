"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";

const LOGIN_REQUIRED_MESSAGE =
  "No cap — log in first to upvote, comment & do the thing 💀";

type ToastContextValue = {
  showLoginRequired: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showLoginRequired: () => {} };
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const showLoginRequired = useCallback(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = () => showLoginRequired();
    window.addEventListener("auth:login_required", handler);
    return () => window.removeEventListener("auth:login_required", handler);
  }, [showLoginRequired]);

  return (
    <ToastContext.Provider value={{ showLoginRequired }}>
      {children}
      {visible && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-2xl border border-niat-border px-4 py-3 shadow-card"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          <p className="text-sm font-medium text-niat-text">{LOGIN_REQUIRED_MESSAGE}</p>
          <Link
            href="/login"
            className="shrink-0 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Log in
          </Link>
        </div>
      )}
    </ToastContext.Provider>
  );
}

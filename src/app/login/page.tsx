"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { login, fetchProfile } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

function getAuthErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data && typeof err.response.data === "object") {
    const d = err.response.data as Record<string, unknown>;
    if (Array.isArray(d.non_field_errors) && d.non_field_errors[0]) return String(d.non_field_errors[0]);
    if (typeof d.detail === "string") return d.detail;
  }
  return "Invalid username or password.";
}

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";
  const { setRoleFromProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showForgotCreate, setShowForgotCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setShowForgotCreate(false);
    setIsSubmitting(true);
    try {
      const { access, refresh } = await login(data.username, data.password);
      setTokens(access, refresh);
      const profile = await fetchProfile();
      setRoleFromProfile(profile);
      const target = nextUrl.startsWith("/") ? nextUrl : "/";
      const redirect = target === "/" && profile.is_verified_senior ? "/dashboard" : target;
      router.push(redirect);
      router.refresh();
    } catch (e) {
      setError(getAuthErrorMessage(e));
      setShowForgotCreate(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="mx-auto max-w-sm space-y-6 py-12 rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <h1 className="text-2xl font-bold text-niat-text">Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-niat-text mb-1">
            Username
          </label>
          <input
            id="username"
            {...register("username")}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            autoComplete="username"
          />
          {errors.username && (
            <p className="text-sm text-primary mt-1">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-niat-text mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-sm text-primary mt-1">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing in…" : "Log in"}
        </button>
        {error && (
          <div className="space-y-2">
            <p className="text-sm text-primary bg-primary/10 border border-primary p-2 rounded-xl">{error}</p>
            {showForgotCreate && (
              <p className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </p>
            )}
          </div>
        )}
      </form>
      <p className="text-center text-sm text-niat-text-secondary">
        Don’t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

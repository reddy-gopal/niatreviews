"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { fetchProfile, seniorsSetup } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data && typeof err.response.data === "object") {
    const d = err.response.data as Record<string, unknown>;
    if (typeof d.detail === "string") return d.detail;
    for (const v of Object.values(d)) {
      if (Array.isArray(v) && v[0]) return String(v[0]);
    }
  }
  return "Something went wrong. Please try again.";
}

const schema = z
  .object({
    username: z.union([z.string().min(1, "At least 1 character"), z.literal("")]).optional(),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export default function AuthSetupPage() {
  const router = useRouter();
  const { setRoleFromProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialUsername, setInitialUsername] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login?next=/auth/setup");
      return;
    }
    fetchProfile()
      .then((profile) => {
        if (!profile.needs_password_set) {
          router.replace("/");
          return;
        }
        setInitialUsername(profile.username);
        setValue("username", profile.username);
      })
      .catch(() => router.replace("/login?next=/auth/setup"))
      .finally(() => setLoading(false));
  }, [router, setValue]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const username = (data.username || "").trim();
      const profile = await seniorsSetup({
        username: username || undefined,
        password: data.password,
      });
      setRoleFromProfile(profile);
      router.replace("/onboarding/review");
      router.refresh();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-niat-text-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="mx-auto max-w-sm w-full space-y-6 py-8 rounded-2xl border border-niat-border p-6 shadow-soft"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <h1 className="text-2xl font-bold text-niat-text">Set up your account</h1>
        <p className="text-sm text-niat-text-secondary">
          Choose a username and password so you can log in next time. You can change your username here if you like.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <p className="text-sm text-primary bg-primary/10 border border-primary p-2 rounded-xl">{error}</p>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-niat-text mb-1">
              Username
            </label>
            <input
              id="username"
              defaultValue={initialUsername}
              {...register("username")}
              className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              autoComplete="username"
              placeholder="Choose a username"
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
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            {errors.password && (
              <p className="text-sm text-primary mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-niat-text mb-1">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              {...register("confirm")}
              className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              autoComplete="new-password"
            />
            {errors.confirm && (
              <p className="text-sm text-primary mt-1">{errors.confirm.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving…" : "Continue"}
          </button>
        </form>
        <p className="text-center text-sm text-niat-text-secondary">
          Next you’ll answer a few questions about your NIAT experience.
        </p>
      </div>
    </div>
  );
}

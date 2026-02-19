"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { register as apiRegister, login, fetchProfile } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

function getRegisterErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data && typeof err.response.data === "object") {
    const d = err.response.data as Record<string, unknown>;
    if (Array.isArray(d.non_field_errors) && d.non_field_errors[0]) return String(d.non_field_errors[0]);
    if (typeof d.detail === "string") return d.detail;
    for (const v of Object.values(d)) {
      if (Array.isArray(v) && v[0]) return String(v[0]);
    }
  }
  return "Registration failed.";
}

const schema = z
  .object({
    username: z.string().min(2, "At least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don’t match",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";
  const { setRoleFromProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRegister({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      const { access, refresh } = await login(data.username, data.password);
      setTokens(access, refresh);
      const profile = await fetchProfile();
      setRoleFromProfile(profile);
      const target = nextUrl.startsWith("/") ? nextUrl : "/";
      const redirect = target === "/" && profile.is_verified_senior ? "/dashboard" : target;
      router.push(redirect);
      router.refresh();
    } catch (e) {
      setError(getRegisterErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="mx-auto max-w-sm space-y-6 py-12 rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <h1 className="text-2xl font-bold text-niat-text">Register</h1>
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
            {...register("username")}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            autoComplete="username"
          />
          {errors.username && (
            <p className="text-sm text-primary mt-1">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-niat-text mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-sm text-primary mt-1">{errors.email.message}</p>
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
          {isSubmitting ? "Creating account…" : "Register"}
        </button>
      </form>
      <p className="text-center text-sm text-niat-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

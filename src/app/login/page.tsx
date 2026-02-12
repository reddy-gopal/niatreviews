"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/lib/api";
import { setTokens } from "@/lib/auth";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const { access, refresh } = await login(data.username, data.password);
      setTokens(access, refresh);
      router.push("/");
      router.refresh();
    } catch {
      setError("Invalid username or password.");
    }
  };

  return (
    <div
      className="mx-auto max-w-sm space-y-6 py-12 rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <h1 className="text-2xl font-bold text-niat-text">Log in</h1>
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
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Log in
        </button>
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { fetchProfile, updateProfile, type Profile } from "@/lib/api";
import { ChevronLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  phone_number: z.string().max(20).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: profile, status, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: typeof window !== "undefined" && isAuthenticated(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: FormData) =>
      updateProfile({
        email: payload.email,
        phone_number: payload.phone_number?.trim() || null,
      }),
    onSuccess: (updated: Profile) => {
      queryClient.setQueryData(["profile"], updated);
      setSuccessMessage("Profile updated.");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: profile
      ? { email: profile.email ?? "", phone_number: profile.phone_number ?? "" }
      : undefined,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (profile)
      reset({ email: profile.email ?? "", phone_number: profile.phone_number ?? "" });
  }, [profile, reset]);

  const onSubmit = (data: FormData) => updateMutation.mutate(data);

  if (typeof window !== "undefined" && !isAuthenticated()) return null;

  if (status === "pending" || !profile) {
    return (
      <div
        className="rounded-2xl border border-niat-border p-8 shadow-soft"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <p className="text-niat-text-secondary">Loading…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="rounded-2xl border border-niat-border p-6 shadow-soft"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <p className="text-primary">Failed to load profile.</p>
        <Link href="/profile" className="mt-2 inline-block text-primary hover:underline">
          Back to profile
        </Link>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-xl rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <Link
        href="/profile"
        className="mb-4 flex items-center gap-1 text-sm font-medium text-niat-text-secondary hover:text-primary transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to profile
      </Link>
      <h1 className="text-2xl font-bold text-niat-text">Profile settings</h1>
      <p className="mt-1 text-sm text-niat-text-secondary">
        Email, phone, preferences
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {successMessage && (
          <p className="text-sm font-medium text-primary">{successMessage}</p>
        )}
        {updateMutation.isError && (
          <p className="text-sm text-primary">
            {(updateMutation.error as Error)?.message ?? "Update failed."}
          </p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-niat-text mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-xl border border-niat-border bg-[var(--niat-section)] px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-primary">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-niat-text mb-1">
            Phone number
          </label>
          <input
            id="phone_number"
            type="tel"
            {...register("phone_number")}
            placeholder="Optional"
            className="w-full rounded-xl border border-niat-border bg-[var(--niat-section)] px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.phone_number && (
            <p className="mt-1 text-sm text-primary">{errors.phone_number.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {updateMutation.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

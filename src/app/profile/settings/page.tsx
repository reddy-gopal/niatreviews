"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAuthenticated, clearTokens } from "@/lib/auth";
import {
  fetchProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  type Profile,
} from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import { LoadingBlock } from "@/components/LoadingSpinner";

const profileSchema = z.object({
  email: z.string().email("Invalid email"),
  phone_number: z.string().max(20).optional().or(z.literal("")),
});

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

const deleteAccountSchema = z
  .object({
    password: z.string().min(1, "Password is required to confirm"),
    confirmPhrase: z.string(),
  })
  .refine((data) => data.confirmPhrase === "DELETE", {
    message: "Type DELETE to confirm",
    path: ["confirmPhrase"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

const inputClass =
  "w-full rounded-xl border border-niat-border bg-[var(--niat-section)] px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary";
const labelClass = "block text-sm font-medium text-niat-text mb-1";
const errorClass = "mt-1 text-sm text-primary";

function getApiFieldError(error: unknown): Record<string, string> {
  if (error && typeof error === "object" && "response" in error) {
    const res = (error as { response?: { data?: Record<string, string | string[]> } }).response;
    const data = res?.data;
    if (data && typeof data === "object") {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === "string") out[k] = v;
        else if (Array.isArray(v) && v[0]) out[k] = String(v[0]);
      }
      return out;
    }
  }
  return {};
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: profile, status, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: typeof window !== "undefined" && isAuthenticated(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ProfileFormData) =>
      updateProfile({
        email: payload.email,
        phone_number: payload.phone_number?.trim() || null,
      }),
    onSuccess: (updated: Profile) => {
      queryClient.setQueryData(["profile"], updated);
      setProfileSuccess("Profile updated.");
      setTimeout(() => setProfileSuccess(null), 3000);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { current_password: string; new_password: string }) =>
      changePassword({ current_password: payload.current_password, new_password: payload.new_password }),
    onSuccess: () => {
      setPasswordSuccess("Password updated.");
      setTimeout(() => setPasswordSuccess(null), 3000);
      passwordForm.reset({ current_password: "", new_password: "", confirm_password: "" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (payload: { password: string }) => deleteAccount(payload),
    onSuccess: () => {
      clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:login_required"));
        router.replace("/");
      }
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? { email: profile.email ?? "", phone_number: profile.phone_number ?? "" }
      : undefined,
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  const deleteForm = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: "", confirmPhrase: "" },
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (profile) profileForm.reset({ email: profile.email ?? "", phone_number: profile.phone_number ?? "" });
  }, [profile, profileForm]);

  const onProfileSubmit = (data: ProfileFormData) => updateMutation.mutate(data);
  const onPasswordSubmit = (data: ChangePasswordFormData) =>
    changePasswordMutation.mutate({ current_password: data.current_password, new_password: data.new_password });
  const onDeleteSubmit = (data: DeleteAccountFormData) => deleteAccountMutation.mutate({ password: data.password });

  const apiPasswordErrors = getApiFieldError(changePasswordMutation.error);
  const apiDeleteErrors = getApiFieldError(deleteAccountMutation.error);

  if (typeof window !== "undefined" && !isAuthenticated()) return null;

  if (status === "pending" || !profile) {
    return (
      <div
        className="flex min-h-[200px] items-center justify-center rounded-2xl border border-niat-border p-8 shadow-soft"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <LoadingBlock />
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
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link
        href="/profile"
        className="mb-6 flex items-center gap-1 text-sm font-medium text-niat-text-secondary transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to profile
      </Link>

      <h1 className="text-2xl font-bold text-niat-text">Settings</h1>
      <p className="mt-1 text-sm text-niat-text-secondary">
        Manage your account and security
      </p>

      {/* Profile (email, phone) */}
      <section
        className="mt-8 rounded-2xl border border-niat-border p-6 shadow-soft"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <h2 className="text-lg font-semibold text-niat-text">Profile</h2>
        <p className="mt-1 text-sm text-niat-text-secondary">Email and phone</p>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-4 space-y-4">
          {profileSuccess && <p className="text-sm font-medium text-primary">{profileSuccess}</p>}
          {updateMutation.isError && (
            <p className="text-sm text-primary">
              {(updateMutation.error as Error)?.message ?? "Update failed."}
            </p>
          )}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              {...profileForm.register("email")}
              className={inputClass}
            />
            {profileForm.formState.errors.email && (
              <p className={errorClass}>{profileForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone_number" className={labelClass}>
              Phone number
            </label>
            <input
              id="phone_number"
              type="tel"
              {...profileForm.register("phone_number")}
              placeholder="Optional"
              className={inputClass}
            />
            {profileForm.formState.errors.phone_number && (
              <p className={errorClass}>{profileForm.formState.errors.phone_number.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section
        className="mt-6 rounded-2xl border border-niat-border p-6 shadow-soft"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <h2 className="text-lg font-semibold text-niat-text">Change password</h2>
        <p className="mt-1 text-sm text-niat-text-secondary">
          Update your password. Use at least 8 characters.
        </p>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-4 space-y-4">
          {passwordSuccess && <p className="text-sm font-medium text-primary">{passwordSuccess}</p>}
          {(apiPasswordErrors.current_password || apiPasswordErrors.new_password) && (
            <p className="text-sm text-primary">
              {apiPasswordErrors.current_password ?? apiPasswordErrors.new_password}
            </p>
          )}
          <div>
            <label htmlFor="current_password" className={labelClass}>
              Current password
            </label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              {...passwordForm.register("current_password")}
              className={inputClass}
            />
            {passwordForm.formState.errors.current_password && (
              <p className={errorClass}>{passwordForm.formState.errors.current_password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="new_password" className={labelClass}>
              New password
            </label>
            <input
              id="new_password"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("new_password")}
              className={inputClass}
            />
            {passwordForm.formState.errors.new_password && (
              <p className={errorClass}>{passwordForm.formState.errors.new_password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirm_password" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("confirm_password")}
              className={inputClass}
            />
            {passwordForm.formState.errors.confirm_password && (
              <p className={errorClass}>{passwordForm.formState.errors.confirm_password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {changePasswordMutation.isPending ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      {/* Delete account */}
      <section
        className="mt-6 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 shadow-soft"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <h2 className="text-lg font-semibold text-niat-text">Delete account</h2>
        <p className="mt-1 text-sm text-niat-text-secondary">
          Permanently deactivate your account. You will not be able to sign in again.
        </p>
        {!deleteConfirmOpen ? (
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="mt-4 rounded-xl border border-red-500/70 bg-transparent px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/10"
          >
            Delete my account
          </button>
        ) : (
          <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="mt-4 space-y-4">
            {apiDeleteErrors.password && (
              <p className="text-sm text-primary">{apiDeleteErrors.password}</p>
            )}
            <div>
              <label htmlFor="delete_password" className={labelClass}>
                Your password
              </label>
              <input
                id="delete_password"
                type="password"
                autoComplete="current-password"
                {...deleteForm.register("password")}
                className={inputClass}
                placeholder="Enter your password to confirm"
              />
              {deleteForm.formState.errors.password && (
                <p className={errorClass}>{deleteForm.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirm_phrase" className={labelClass}>
                Type <span className="font-mono font-semibold">DELETE</span> to confirm
              </label>
              <input
                id="confirm_phrase"
                type="text"
                {...deleteForm.register("confirmPhrase")}
                className={inputClass}
                placeholder="DELETE"
                autoComplete="off"
              />
              {deleteForm.formState.errors.confirmPhrase && (
                <p className={errorClass}>{deleteForm.formState.errors.confirmPhrase.message}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  deleteForm.reset();
                }}
                className="rounded-xl border border-niat-border px-4 py-2.5 text-sm font-medium text-niat-text transition-colors hover:bg-niat-border/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleteAccountMutation.isPending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-red-700 disabled:opacity-50"
              >
                {deleteAccountMutation.isPending ? "Deactivating…" : "Deactivate account"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

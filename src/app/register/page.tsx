"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { register as apiRegister, login, fetchProfile, requestOtpByPhone, verifyOtpByPhone } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

/** Extract user-facing message(s) from register API 400 response. */
function getRegisterErrorMessage(err: unknown): string {
  if (!(err instanceof AxiosError) || !err.response?.data || typeof err.response.data !== "object") {
    return "Registration failed.";
  }
  const d = err.response.data as Record<string, unknown>;
  const messages: string[] = [];
  if (typeof d.detail === "string" && d.detail.trim()) messages.push(d.detail.trim());
  if (Array.isArray(d.non_field_errors) && d.non_field_errors.length) {
    const msg = d.non_field_errors[0];
    if (typeof msg === "string" && msg.trim()) messages.push(msg.trim());
  }
  for (const key of ["username", "email", "password", "phone"]) {
    const v = d[key];
    if (typeof v === "string" && v.trim()) messages.push(v.trim());
    if (Array.isArray(v) && v.length && typeof v[0] === "string" && (v[0] as string).trim()) {
      messages.push((v[0] as string).trim());
    }
  }
  if (messages.length) return messages.join(" ");
  return "Registration failed.";
}

/** Extract message from OTP API error (same shape as register). */
function getOtpErrorMessage(err: unknown): string {
  if (!(err instanceof AxiosError) || !err.response?.data || typeof err.response.data !== "object") {
    return "Something went wrong.";
  }
  const d = err.response.data as Record<string, unknown>;
  if (typeof d.detail === "string" && d.detail.trim()) return d.detail.trim();
  for (const v of Object.values(d)) {
    if (typeof v === "string" && (v as string).trim()) return (v as string).trim();
    if (Array.isArray(v) && v[0] && typeof v[0] === "string") return String(v[0]).trim();
  }
  return "Something went wrong.";
}

const schema = z
  .object({
    username: z.string().min(2, "At least 2 characters"),
    phone: z.string().min(10, "Enter a valid mobile number"),
    email: z.string().optional(),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => !d.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email), {
    message: "Invalid email",
    path: ["email"],
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
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const phoneValue = watch("phone");

  const handleSendOtp = async () => {
    const phone = (phoneValue || "").trim();
    if (!phone || errors.phone) return;
    setOtpError(null);
    setOtpSending(true);
    try {
      await requestOtpByPhone(phone);
      setOtpSent(true);
    } catch (e) {
      setOtpError(getOtpErrorMessage(e));
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const phone = (phoneValue || "").trim();
    const code = otpCode.trim();
    if (!phone || !code || code.length !== 6) {
      setOtpError("Enter the 6-digit code.");
      return;
    }
    setOtpError(null);
    setOtpVerifying(true);
    try {
      const res = await verifyOtpByPhone(phone, code);
      if (res.verified) {
        setPhoneVerified(true);
        setOtpError(null);
      } else {
        setOtpError("Invalid or expired code.");
      }
    } catch (e) {
      setOtpError(getOtpErrorMessage(e));
    } finally {
      setOtpVerifying(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRegister({
        username: data.username,
        phone: data.phone,
        email: data.email?.trim() || undefined,
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
          <label htmlFor="phone" className="block text-sm font-medium text-niat-text mb-1">
            Mobile number
          </label>
          <div className="flex gap-2">
            <input
              id="phone"
              type="tel"
              {...register("phone")}
            className="flex-1 rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            autoComplete="tel"
              readOnly={phoneVerified}
            />
            {!phoneVerified ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!!errors.phone || !phoneValue?.trim() || otpSending}
                className="shrink-0 rounded-xl border border-primary bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpSending ? "Sending…" : "Send OTP"}
              </button>
            ) : (
              <span className="flex items-center shrink-0 rounded-xl border border-green-600 bg-green-600/10 px-3 py-2 text-sm font-medium text-green-700" aria-label="Phone verified">
                Verified
              </span>
            )}
          </div>
          {errors.phone && (
            <p className="text-sm text-primary mt-1">{errors.phone.message}</p>
          )}
          {!phoneVerified && otpSent && (
            <div className="mt-3 space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-niat-text">
                Verification code (6 digits)
              </label>
              <div className="flex gap-2">
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpError(null);
                  }}
                  placeholder="123456"
                  className="w-28 rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder:text-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpCode.length !== 6 || otpVerifying}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpVerifying ? "Verifying…" : "Verify OTP"}
                </button>
              </div>
              {otpError && <p className="text-sm text-primary">{otpError}</p>}
              <p className="text-xs text-niat-text-secondary">
                For demo use code: <strong>123456</strong>
              </p>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-niat-text mb-1">
            Email <span className="text-niat-text-secondary font-normal">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-xl border border-niat-border bg-niat-section px-3 py-2 text-sm text-niat-text placeholder:text-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            autoComplete="email"
            placeholder="you@example.com"
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
          disabled={isSubmitting || !phoneVerified}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating account…" : phoneVerified ? "Register" : "Verify phone to continue"}
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

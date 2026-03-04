"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { loginByPhoneOtp, requestOtpByPhone, fetchProfile } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

function getAuthErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data && typeof err.response.data === "object") {
    const d = err.response.data as Record<string, unknown>;
    if (Array.isArray(d.non_field_errors) && d.non_field_errors[0]) return String(d.non_field_errors[0]);
    if (typeof d.detail === "string" && d.detail.trim()) return d.detail.trim();
  }
  return "Something went wrong. Please try again.";
}

const schema = z.object({
  phone: z.string().min(10, "Enter a valid mobile number"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";
  const { setRoleFromProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const phoneValue = watch("phone");

  const handleSendOtp = async () => {
    const phone = (phoneValue || "").trim();
    if (!phone || errors.phone) return;
    setError(null);
    setOtpSending(true);
    try {
      await requestOtpByPhone(phone, { for: "login" });
      setOtpSent(true);
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setOtpSending(false);
    }
  };

  const handleLogin = async () => {
    const phone = (phoneValue || "").trim();
    const code = otpCode.trim();
    if (!phone || !code || code.length !== 4) {
      setError("Enter the 4-digit code.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const { access, refresh } = await loginByPhoneOtp(phone, code);
      setTokens(access, refresh);
      const profile = await fetchProfile();
      setRoleFromProfile(profile);
      const target = nextUrl.startsWith("/") ? nextUrl : "/";
      const redirect = target === "/" && profile.is_verified_senior ? "/dashboard" : target;
      router.push(redirect);
      router.refresh();
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="mx-auto max-w-sm rounded-2xl border border-niat-border p-8 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-niat-text">Welcome back</h1>
        <p className="mt-1.5 text-sm text-niat-text-secondary">
          We’re glad to see you again. Enter your mobile number and we’ll send you a one-time code to sign in.
        </p>
      </header>

      <div className="space-y-5">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-niat-text mb-1.5">
            Mobile number
          </label>
          <div className="flex gap-2">
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className="flex-1 rounded-xl border border-niat-border bg-white px-3 py-2.5 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
              autoComplete="tel"
              readOnly={otpSent}
              placeholder="e.g. 9876543210"
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!!errors.phone || !phoneValue?.trim() || otpSending}
              className="shrink-0 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {otpSending ? "Sending…" : "Send OTP"}
            </button>
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-sm text-primary">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-niat-text mb-1.5">
            Verification code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={otpCode}
            onChange={(e) => {
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 4));
              setError(null);
            }}
            disabled={!otpSent}
            placeholder="Enter the 4-digit code"
            className="w-full rounded-xl border border-niat-border bg-white px-3 py-2.5 text-center text-lg font-medium tracking-[0.4em] text-niat-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed transition-shadow"
          />
          {otpSent && (
            <p className="mt-1.5 text-xs text-niat-text-secondary">
              Enter the 4-digit code sent to your number.
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-primary bg-primary/10 border border-primary/30 px-3 py-2.5 rounded-xl" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleLogin}
            disabled={!otpSent || otpCode.length !== 4 || isSubmitting}
            className="min-w-[140px] rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isSubmitting ? "Signing in…" : "Log in"}
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-niat-text-secondary">
        Don’t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { requestOtpByPhone, forgotPasswordReset } from "@/lib/api";

function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data && typeof err.response.data === "object") {
    const d = err.response.data as Record<string, unknown>;
    if (typeof d.detail === "string" && d.detail.trim()) return d.detail.trim();
    for (const v of Object.values(d)) {
      if (typeof v === "string" && (v as string).trim()) return (v as string).trim();
    }
  }
  return "Something went wrong. Please try again.";
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSendOtp = async () => {
    const p = phone.trim();
    if (!p) {
      setError("Enter the mobile number you used when registering.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await requestOtpByPhone(p);
      setOtpSent(true);
      setStep("otp");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const handleReset = async () => {
    const p = phone.trim();
    const c = code.trim();
    if (!p || !c || c.length !== 6) {
      setError("Enter the 6-digit code sent to your phone.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setResetting(true);
    try {
      await forgotPasswordReset(p, c, newPassword);
      setStep("done");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setResetting(false);
    }
  };

  if (step === "done") {
    return (
      <div
        className="mx-auto max-w-sm space-y-6 py-12 rounded-2xl border border-niat-border p-6 shadow-soft"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        <h1 className="text-2xl font-bold text-niat-text">Password reset</h1>
        <p className="text-niat-text-secondary">
          Your password has been reset. You can now log in with your username and new password.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-sm space-y-6 py-12 rounded-2xl border border-niat-border p-6 shadow-soft"
      style={{ backgroundColor: "var(--niat-section)" }}
    >
      <h1 className="text-2xl font-bold text-niat-text">Forgot password</h1>
      <p className="text-sm text-niat-text-secondary">
        Enter the mobile number you used when registering. We’ll send you a code to reset your password.
      </p>
      {error && (
        <p className="text-sm text-primary bg-primary/10 border border-primary p-2 rounded-xl">{error}</p>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-niat-text mb-1">
            Mobile number
          </label>
          <div className="flex gap-2">
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\s/g, ""));
                setError(null);
              }}
              placeholder="e.g. 9876543210"
              className="flex-1 rounded-xl border border-niat-border bg-white px-3 py-2 text-sm text-niat-text placeholder:text-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              readOnly={otpSent}
            />
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!phone.trim() || sending}
                className="shrink-0 rounded-xl border border-primary bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send OTP"}
              </button>
            ) : null}
          </div>
        </div>
        {step === "otp" && (
          <>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-niat-text mb-1">
                Verification code (6 digits)
              </label>
              <div className="flex gap-2">
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError(null);
                  }}
                  placeholder="123456"
                  readOnly={otpVerified}
                  className="flex-1 rounded-xl border border-niat-border bg-white px-3 py-2 text-sm text-niat-text placeholder:text-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {otpVerified ? (
                  <span className="flex items-center shrink-0 rounded-xl border border-green-600 bg-green-600/10 px-3 py-2 text-sm font-medium text-green-700" aria-label="OTP verified">
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => code.length === 6 && setOtpVerified(true)}
                    disabled={code.length !== 6}
                    className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify OTP
                  </button>
                )}
              </div>
              <p className="text-xs text-niat-text-secondary mt-1">Demo code: 123456</p>
            </div>
            {otpVerified && (
              <>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-niat-text mb-1">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-niat-border bg-white px-3 py-2 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary"
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-niat-text mb-1">
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-niat-border bg-white px-3 py-2 text-sm text-niat-text focus:outline-none focus:ring-2 focus:ring-primary"
                    autoComplete="new-password"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={newPassword.length < 8 || newPassword !== confirmPassword || resetting}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetting ? "Resetting…" : "Reset password"}
                </button>
              </>
            )}
          </>
        )}
      </div>
      <p className="text-center text-sm text-niat-text-secondary">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

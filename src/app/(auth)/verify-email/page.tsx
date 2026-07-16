"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  useGetSessionQuery,
  useResendOtpMutation,
  useVerifyEmailMutation,
} from "@/lib/redux/endpoints/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiErrorBody {
  error?: string;
}

const RESEND_COOLDOWN_SECONDS = 45;

export default function VerifyEmailPage() {
  const { data } = useGetSessionQuery();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await verifyEmail({ code }).unwrap();
    } catch (err) {
      const body = (err as { data?: ApiErrorBody } | undefined)?.data;
      setError(body?.error ?? "Invalid or expired code. Please try again.");
    }
  }

  async function handleResend() {
    setError(null);
    setResendMessage(null);

    try {
      await resendOtp().unwrap();
      setResendMessage("A new code is on its way.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const body = (err as { data?: ApiErrorBody } | undefined)?.data;
      setError(body?.error ?? "Couldn't send a new code. Please try again shortly.");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            C
          </div>
          <h1 className="text-lg font-semibold text-foreground">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code we sent to{" "}
            <span className="font-medium text-foreground">{data?.user?.email ?? "your email"}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="text-center text-lg tracking-[0.5em]"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {resendMessage && !error ? (
            <p className="text-sm text-muted-foreground">{resendMessage}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isVerifying || code.length !== 6}>
            {isVerifying ? "Verifying…" : "Verify email"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? "Sending…" : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

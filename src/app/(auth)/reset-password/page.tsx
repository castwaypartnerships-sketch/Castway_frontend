"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { useResetPasswordMutation } from "@/lib/redux/endpoints/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiErrorBody {
  error?: string;
  errors?: Record<string, string[]>;
}

// `useSearchParams()` opts the page out of static prerendering unless it's
// wrapped in Suspense — without this, `next build` fails outright rather
// than just warning (see the reset-password build error this fixes).
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-muted/30" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      await resetPassword({ email, code, newPassword }).unwrap();
      toast.success("Password updated — sign in with your new password.");
      router.push("/login");
    } catch (err) {
      const body = (err as { data?: ApiErrorBody } | undefined)?.data;
      const fieldError = body?.errors?.newPassword?.[0] ?? body?.errors?.code?.[0];
      setFormError(fieldError ?? body?.error ?? "Invalid or expired code. Please try again.");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            C
          </div>
          <h1 className="text-lg font-semibold text-foreground">Enter your reset code</h1>
          <p className="text-sm text-muted-foreground">
            Check your inbox for the 6-digit code we sent you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code">Reset code</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
            {isLoading ? "Resetting…" : "Reset password"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

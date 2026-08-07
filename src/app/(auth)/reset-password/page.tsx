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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-muted/30 px-4">
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[380px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[15%] bottom-0 -z-10 h-[200px] w-[300px] rounded-full bg-[#e8c9d4]/20 blur-[100px] dark:bg-[#e8c9d4]/10" />

      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-1 text-center">
          <Link
            href="/"
            className="mx-auto flex size-10 items-center justify-center overflow-hidden rounded-xl transition-transform hover:scale-105"
          >
            <img src="/logo.png" alt="Castway" className="size-full object-cover" />
          </Link>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">Enter your reset code</h1>
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

          <Button
            type="submit"
            className="w-full rounded-full bg-black text-white shadow-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? "Resetting…" : "Reset password"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

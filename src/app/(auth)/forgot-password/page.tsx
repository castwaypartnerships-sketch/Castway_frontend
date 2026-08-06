"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useForgotPasswordMutation } from "@/lib/redux/endpoints/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Always succeeds outwardly (the backend never reveals whether the email
    // is registered), so there's nothing to catch here.
    await forgotPassword({ email }).unwrap();
    setSubmitted(true);
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
            <img src="/logo.jpg" alt="Castway" className="size-full object-cover" />
          </Link>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your account email and we&apos;ll send you a reset code.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>, a
              reset code is on its way.
            </p>
            <Button
              className="w-full rounded-full bg-black text-white shadow-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
            >
              I have a code
            </Button>
          </div>
        ) : (
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

            <Button
              type="submit"
              className="w-full rounded-full bg-black text-white shadow-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              disabled={isLoading}
            >
              {isLoading ? "Sending…" : "Send reset code"}
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

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
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            C
          </div>
          <h1 className="text-lg font-semibold text-foreground">Reset your password</h1>
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
            <Button className="w-full" onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending…" : "Send reset code"}
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useLoginMutation } from "@/lib/redux/endpoints/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/google-button";

interface LoginErrorBody {
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      await login({ email, password }).unwrap();
      router.push("/home");
      router.refresh();
    } catch (err) {
      const body = (err as { data?: LoginErrorBody } | undefined)?.data;
      setFormError(body?.error ?? "Something went wrong. Please try again.");
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
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">Sign in to Castway</h1>
          <p className="text-sm text-muted-foreground">Your creator workspace, one login away.</p>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <Button
            type="submit"
            className="w-full rounded-full bg-black text-white shadow-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton />

        {process.env.NODE_ENV !== "production" ? (
          <p className="text-center text-xs text-muted-foreground">
            Demo login: <span className="font-medium">demo@castway.dev</span> /{" "}
            <span className="font-medium">Password123!</span>
          </p>
        ) : null}
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300">
            Forgot password?
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

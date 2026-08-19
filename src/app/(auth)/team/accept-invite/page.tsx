"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useAcceptTeamInviteMutation, useGetTeamInviteByTokenQuery } from "@/lib/redux/endpoints/team-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AcceptTeamInvitePage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-background" />}>
      <AcceptTeamInviteForm />
    </Suspense>
  );
}

function AcceptTeamInviteForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const { data: invite, isLoading, isError } = useGetTeamInviteByTokenQuery(token, { skip: !token });
  const [acceptInvite, { isLoading: isAccepting }] = useAcceptTeamInviteMutation();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    try {
      await acceptInvite({ token, name, username, password }).unwrap();
      router.push("/login?invited=1");
    } catch (err) {
      const body = (err as { data?: { error?: string; errors?: Record<string, string[]> } } | undefined)?.data;
      const fieldError = body?.errors && Object.values(body.errors)[0]?.[0];
      setFormError(fieldError ?? body?.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-1 text-center">
          <Link
            href="/"
            className="mx-auto flex size-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white transition-transform hover:scale-105 dark:bg-white dark:text-black"
          >
            C
          </Link>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">Join the team</h1>
        </div>

        {!token || isError ? (
          <p className="text-center text-sm text-destructive">
            This invite link is invalid or has expired. Ask the agency to send a new one.
          </p>
        ) : isLoading || !invite ? (
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        ) : invite.status !== "PENDING" ? (
          <p className="text-center text-sm text-destructive">
            {invite.status === "ACCEPTED"
              ? "This invite has already been accepted."
              : "This invite is no longer valid. Ask the agency to send a new one."}
          </p>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground">
              You&apos;ve been invited as <span className="font-medium text-foreground">{invite.roleLabel}</span> —
              set up your account to accept.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="invite-accept-email">Email</Label>
                <Input id="invite-accept-email" type="email" value={invite.email} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-accept-name">Full name</Label>
                <Input
                  id="invite-accept-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Lee"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-accept-username">Username</Label>
                <Input
                  id="invite-accept-username"
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="jordanlee"
                />
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and underscores only.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-accept-password">Password</Label>
                <Input
                  id="invite-accept-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

              <Button
                type="submit"
                className="w-full rounded-full bg-black text-white shadow-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                disabled={isAccepting}
              >
                {isAccepting ? "Setting up…" : "Accept invite & create account"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { toast } from "sonner";

function signupUrl(): string {
  return `${window.location.origin}/signup`;
}

export function GrowNetworkCard() {
  async function handleInvite() {
    await navigator.clipboard.writeText(signupUrl());
    toast.success("Invite link copied");
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="absolute -top-5 -left-5 size-24 rounded-full bg-[#e6f4ea] opacity-50 dark:bg-[#1a261d]" />
      <div className="absolute -top-2.5 -left-2.5 size-12 rounded-full bg-[#a7d9b5] opacity-20" />
      <div className="relative space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Grow Your Network</h3>
        <p className="text-xs text-muted-foreground">
          Invite collaborators to join Castway and connect with your work.
        </p>
        <button
          type="button"
          onClick={() => void handleInvite()}
          className="mt-2 w-full rounded-lg bg-[#1c3322] py-2 text-xs font-bold text-white hover:bg-[#25422d]"
        >
          Copy Invite Link
        </button>
      </div>
    </section>
  );
}

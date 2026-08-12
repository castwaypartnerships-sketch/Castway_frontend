"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // No newsletter backend yet — this just acknowledges the signup locally.
    setSubmitted(true);
    setEmail("");
  }

  if (submitted) {
    return (
      <p className="text-xs sm:text-sm text-muted-foreground">
        Thanks — we&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        className="h-9"
      />
      <button
        type="submit"
        className="shrink-0 whitespace-nowrap rounded-lg bg-black px-3.5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        Subscribe
      </button>
    </form>
  );
}

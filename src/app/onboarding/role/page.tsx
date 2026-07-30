"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAssignRoleMutation, type Role } from "@/lib/redux/endpoints/onboarding-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLES: { value: Role; label: string; description: string; icon: LucideIcon }[] = [
  {
    value: "CREATOR",
    label: "Creator",
    description: "Publish a portfolio and get discovered for paid work.",
    icon: Sparkles,
  },
  {
    value: "FREELANCER",
    label: "Freelancer",
    description: "List your services and rates, then take on gigs.",
    icon: Briefcase,
  },
  {
    value: "BRAND",
    label: "Brand",
    description: "Post opportunities and find creators to work with.",
    icon: Building2,
  },
  {
    value: "AGENCY",
    label: "Agency",
    description: "Manage a roster of talent and match them to briefs.",
    icon: Users,
  },
];

export default function OnboardingRolePage() {
  const router = useRouter();
  const [assignRole, { isLoading }] = useAssignRoleMutation();
  const [selected, setSelected] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!selected) return;
    setError(null);
    try {
      await assignRole(selected).unwrap();
      router.push("/onboarding/profile");
    } catch {
      setError("Couldn't set your role. Please try again.");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f9fafb] px-4 py-12 dark:bg-background">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <p className="font-heading text-lg font-bold tracking-tight text-[#476948] dark:text-[#a7d9b5]">
            Castway
          </p>
          <h1 className="mt-4 text-lg font-semibold text-foreground">How will you use Castway?</h1>
          <p className="text-sm text-muted-foreground">
            You can&apos;t change this later, so pick the one that fits best.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelected(role.value)}
              className={cn(
                "rounded-2xl border p-5 text-left shadow-sm transition-colors",
                selected === role.value
                  ? "border-[#476948] bg-[#e6f4ea] dark:border-[#25422d] dark:bg-[#1a261d]"
                  : "border-border bg-card hover:bg-accent",
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#e6f4ea] text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]">
                <role.icon className="size-4.5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">{role.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{role.description}</p>
            </button>
          ))}
        </div>

        {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}

        <Button
          type="button"
          disabled={!selected || isLoading}
          onClick={handleContinue}
          className="w-full bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
        >
          {isLoading ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

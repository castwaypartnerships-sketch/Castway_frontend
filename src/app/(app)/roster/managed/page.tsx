"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Globe } from "lucide-react";
import { FaInstagram, FaYoutube, FaTwitch, FaXTwitter } from "react-icons/fa6";
import {
  useCreateManagedTalentMutation,
  useGetManagedTalentQuery,
  useReleaseManagedTalentMutation,
  type ManagedTalentProfile,
} from "@/lib/redux/endpoints/managed-talent-api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHelp } from "@/components/shared/section-help";
import { TalentSectionTabs } from "@/components/roster/talent-section-tabs";
import { cn } from "@/lib/utils";

/** Managed-talent sub-accounts — a second, deliberately separate ownership
 * model from Roster's invite/accept flow (`/roster/team`, `/roster`): the
 * Agency directly creates and controls these accounts, so (like a talent
 * manager seat) the temp password is shown exactly once here. */
export default function ManagedTalentPage() {
  const { data, isLoading } = useGetManagedTalentQuery();
  const [createTalent, { isLoading: isCreating }] = useCreateManagedTalentMutation();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"CREATOR" | "FREELANCER">("CREATOR");
  const [justCreated, setJustCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await createTalent({ email, username, name, role }).unwrap();
      setJustCreated({ email, tempPassword: result.tempPassword });
      setEmail("");
      setUsername("");
      setName("");
      setShowForm(false);
    } catch {
      toast.error("Couldn't create that talent account. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <TalentSectionTabs />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Managed Talent</h1>
            <SectionHelp
              title="Managed Talent"
              description="Sub-accounts your agency creates and fully controls directly — not independently-owned accounts that opted in via Roster."
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Talent profiles you create and control directly — distinct from{" "}
            <Link href="/roster" className="underline">
              Represented
            </Link>{" "}
            talent, who own their accounts independently.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          New talent
        </Button>
      </div>

      {justCreated ? (
        <div className="rounded-2xl border border-primary bg-card p-4">
          <p className="text-sm font-medium text-foreground">Account created for {justCreated.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Share this temporary password now — it won&apos;t be shown again.
          </p>
          <code className="mt-2 block rounded-lg bg-muted p-2 text-sm">{justCreated.tempPassword}</code>
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => setJustCreated(null)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {showForm ? (
        <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label htmlFor="talent-email">Email</Label>
            <Input id="talent-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="talent-username">Username</Label>
            <Input id="talent-username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="talent-name">Name</Label>
            <Input id="talent-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="talent-role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole((value as "CREATOR" | "FREELANCER") ?? "CREATOR")}>
              <SelectTrigger id="talent-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREATOR">Creator</SelectItem>
                <SelectItem value="FREELANCER">Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create talent account"}
          </Button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No managed talent yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((profile) => (
            <ManagedTalentCard key={profile.userId} profile={profile} />
          ))}
        </ul>
      )}
    </div>
  );
}

function getPlatformIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p === "instagram") return <FaInstagram className="size-3.5 text-pink-500 shrink-0" />;
  if (p === "youtube") return <FaYoutube className="size-3.5 text-red-500 shrink-0" />;
  if (p === "twitch") return <FaTwitch className="size-3.5 text-purple-500 shrink-0" />;
  if (p === "twitter" || p === "x") return <FaXTwitter className="size-3.5 text-sky-400 shrink-0" />;
  return <Globe className="size-3.5 text-muted-foreground shrink-0" />;
}

function ManagedTalentCard({ profile }: { profile: ManagedTalentProfile }) {
  const [release, { isLoading: isReleasing }] = useReleaseManagedTalentMutation();

  async function handleRelease() {
    if (!confirm(`Release ${profile.name}? They'll keep their account, independently, from now on.`)) return;
    try {
      await release(profile.userId).unwrap();
      toast.success(`Released ${profile.name}`);
    } catch {
      toast.error("Couldn't release that account. Please try again.");
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link href={`/roster/talent/${profile.userId}`} className="min-w-0">
            <p className="text-sm font-semibold text-foreground hover:underline">{profile.name}</p>
          </Link>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
        
        {/* Managed Talent Metrics Row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-muted-foreground">
          {profile.primaryPlatform && (
            <span className="flex items-center gap-1 shrink-0 font-medium">
              {getPlatformIcon(profile.primaryPlatform)}
              <span className="capitalize">{profile.primaryPlatform}</span>
            </span>
          )}
          
          {profile.followers && (
            <span className="shrink-0 font-medium text-foreground">{profile.followers} followers</span>
          )}

          <span className="shrink-0 text-[11px] text-muted-foreground/80 pl-2 border-l border-border/80 italic">
            Managed by: Agency Owner
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/roster/talent/${profile.userId}`}
          className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
        >
          View Detail
        </Link>
        <Button size="sm" variant="outline" className="text-destructive" disabled={isReleasing} onClick={handleRelease}>
          Release
        </Button>
      </div>
    </li>
  );
}

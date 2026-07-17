"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Trash2, UserPlus } from "lucide-react";

import {
  useAddToShortlistMutation,
  useGetCampaignAnalyticsQuery,
  useGetCampaignQuery,
  useGetCampaignShortlistQuery,
  useRemoveFromShortlistMutation,
  useUpdateCampaignMutation,
} from "@/lib/redux/endpoints/campaigns-api";
import { useLazyGetPublicProfileQuery } from "@/lib/redux/endpoints/search-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialsFromName } from "@/lib/format";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: campaign, isLoading } = useGetCampaignQuery(id);
  const [updateCampaign, { isLoading: isSaving }] = useUpdateCampaignMutation();

  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");
  const [budget, setBudget] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    setName(campaign.name);
    setGoals(campaign.goals ?? "");
    setBudget(campaign.budget ?? "");
    setDeliverables(campaign.deliverables.join(", "));
  }, [campaign]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateCampaign({
      id,
      patch: {
        name,
        goals: goals || undefined,
        budget: budget || undefined,
        deliverables: deliverables
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
      },
    }).unwrap();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-muted" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-6">
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Campaign not found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <Link
        href="/campaigns"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Campaigns
      </Link>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">Brief</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Campaign name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goals">Goals</Label>
          <Textarea id="goals" rows={3} value={goals} onChange={(e) => setGoals(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget</Label>
            <Input id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="$10,000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deliverables">Deliverables (comma-separated)</Label>
            <Input
              id="deliverables"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="1 reel, 2 stories"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save brief"}
          </Button>
          {saved ? <span className="text-sm text-success">Saved</span> : null}
        </div>
      </form>

      <ShortlistSection campaignId={id} />
      <AnalyticsSection campaignId={id} />
    </div>
  );
}

function ShortlistSection({ campaignId }: { campaignId: string }) {
  const { data, isLoading } = useGetCampaignShortlistQuery(campaignId);
  const [addToShortlist, { isLoading: isAdding }] = useAddToShortlistMutation();
  const [removeFromShortlist] = useRemoveFromShortlistMutation();
  const [lookupProfile] = useLazyGetPublicProfileQuery();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [contractFor, setContractFor] = useState<string | null>(null);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const profile = await lookupProfile(username.trim()).unwrap();
      await addToShortlist({ campaignId, creatorUserId: profile.profile.userId }).unwrap();
      setUsername("");
    } catch {
      setError("Couldn't find that username.");
    }
  }

  async function handleDownloadContract(creatorUserId: string) {
    setContractFor(creatorUserId);
    const res = await fetch(`/api/campaigns/${campaignId}/contract?creatorUserId=${creatorUserId}`, {
      credentials: "include",
    });
    const text = await res.text();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contract-draft.txt";
    a.click();
    URL.revokeObjectURL(url);
    setContractFor(null);
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Shortlist</h2>

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Add creator by username"
          required
        />
        <Button type="submit" size="sm" className="shrink-0 gap-1.5" disabled={isAdding}>
          <UserPlus className="size-4" />
          Add
        </Button>
      </form>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No creators shortlisted yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.items.map((entry) => (
            <li
              key={entry.creatorUserId}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <Avatar>
                <AvatarImage src={entry.profile?.avatarUrl ?? undefined} />
                <AvatarFallback>{initialsFromName(entry.profile?.name ?? "?")}</AvatarFallback>
              </Avatar>
              <Link href={`/profile/${entry.profile?.username}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{entry.profile?.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{entry.profile?.username}</p>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                disabled={contractFor === entry.creatorUserId}
                onClick={() => handleDownloadContract(entry.creatorUserId)}
              >
                <FileText className="size-3.5" />
                {contractFor === entry.creatorUserId ? "Generating…" : "Generate contract"}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove from shortlist"
                onClick={() => removeFromShortlist({ campaignId, creatorUserId: entry.creatorUserId })}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AnalyticsSection({ campaignId }: { campaignId: string }) {
  const { data, isLoading } = useGetCampaignAnalyticsQuery(campaignId);

  if (isLoading || !data) {
    return <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Performance</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile value={data.shortlistCount} label="Shortlisted" />
        <StatTile value={data.applicantCount} label="Applicants" />
        {Object.entries(data.applicantsByStatus).map(([status, count]) => (
          <StatTile key={status} value={count} label={status} />
        ))}
      </div>
    </section>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <p className="text-xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

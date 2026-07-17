"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { useCreateCampaignMutation, useGetCampaignsQuery } from "@/lib/redux/endpoints/campaigns-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CampaignsPage() {
  const { data, isLoading } = useGetCampaignsQuery();
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createCampaign({ name }).unwrap();
    setName("");
    setShowForm(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Brief creators, shortlist candidates, and generate contracts.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          New campaign
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="campaign-name">Campaign name</Label>
            <Input id="campaign-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" className="mt-6 shrink-0" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create"}
          </Button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No campaigns yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((campaign) => (
            <li key={campaign.id}>
              <Link
                href={`/campaigns/${campaign.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{campaign.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {campaign.budget ? campaign.budget : "No budget set"}
                  </p>
                </div>
                <Badge variant={campaign.status === "ACTIVE" ? "default" : "outline"}>{campaign.status}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  useAcceptAgencyInviteMutation,
  useDeclineAgencyInviteMutation,
  useGetClientBrandsQuery,
  useGetPendingAgencyInvitesQuery,
} from "@/lib/redux/endpoints/brand-agency-api";
import {
  useCreateCampaignOnBehalfMutation,
  useGetClientCampaignsQuery,
} from "@/lib/redux/endpoints/campaigns-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialsFromName } from "@/lib/format";

/** Co-Management for Brand Clients — the Agency side: accept a brand's
 * invite, then browse/create that client's campaigns. Reuses the existing
 * `/campaigns/[id]` detail page for everything past the list, since it
 * already reads generically off `campaignId` with no brand-specific
 * branching (the backend's `requireOwned` already allows a co-managing
 * agency there — see `campaign.service.ts`). */
export default function AgencyClientsPage() {
  const { data: pending } = useGetPendingAgencyInvitesQuery();
  const [accept] = useAcceptAgencyInviteMutation();
  const [decline] = useDeclineAgencyInviteMutation();
  const { data: clients, isLoading } = useGetClientBrandsQuery();
  const [selectedBrandUserId, setSelectedBrandUserId] = useState<string | undefined>(undefined);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Client Campaigns
        </h1>
        <p className="text-sm text-muted-foreground">
          Brands you co-manage — view and create campaign briefs on their behalf.
        </p>
      </div>

      {pending && pending.items.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">Pending co-management invites</p>
          {pending.items.map((link) => (
            <div key={link.id} className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarImage src={link.brand?.avatarUrl ?? undefined} />
                <AvatarFallback>{initialsFromName(link.brand?.name ?? "?")}</AvatarFallback>
              </Avatar>
              <p className="flex-1 truncate text-sm text-foreground">{link.brand?.name}</p>
              <Button size="sm" onClick={() => accept(link.id)}>
                Accept
              </Button>
              <Button size="sm" variant="ghost" onClick={() => decline(link.id)}>
                Decline
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !clients || clients.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No brand clients yet — accept an invite above, or ask a brand to invite you.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {clients.items.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => setSelectedBrandUserId(link.brand?.userId)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedBrandUserId === link.brand?.userId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {link.brand?.name}
            </button>
          ))}
        </div>
      )}

      {selectedBrandUserId ? <ClientCampaigns brandUserId={selectedBrandUserId} /> : null}
    </div>
  );
}

function ClientCampaigns({ brandUserId }: { brandUserId: string }) {
  const { data, isLoading } = useGetClientCampaignsQuery(brandUserId);
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignOnBehalfMutation();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createCampaign({ brandUserId, input: { name } }).unwrap();
      setName("");
      setShowForm(false);
    } catch {
      toast.error("Couldn't create that campaign. Please try again.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Campaigns</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          New campaign brief
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Campaign name"
            required
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create"}
          </Button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No campaigns for this client yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.items.map((campaign) => (
            <li key={campaign.id}>
              <Link
                href={`/campaigns/${campaign.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/50"
              >
                <span className="truncate text-sm font-medium text-foreground">{campaign.name}</span>
                <Badge variant="outline">{campaign.status}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


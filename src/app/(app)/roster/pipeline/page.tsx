"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetMyRosterQuery } from "@/lib/redux/endpoints/roster-api";
import {
  useAddRosterDealNoteMutation,
  useCreateRosterDealMutation,
  useGetRosterDealsQuery,
  useRemoveRosterDealMutation,
  useUpdateRosterDealStageMutation,
} from "@/lib/redux/endpoints/roster-deals-api";
import {
  useApproveRevenueSplitMutation,
  useGetRevenueSplitsForDealQuery,
  useProposeRevenueSplitMutation,
} from "@/lib/redux/endpoints/revenue-splits-api";
import type { RosterDealDto, RosterDealStage } from "@/lib/types/roster-deal";
import type { RevenueSplitParty } from "@/lib/types/revenue-split";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRelativeTime, initialsFromName } from "@/lib/format";

const STAGES: { key: RosterDealStage; label: string }[] = [
  { key: "NEW_LEAD", label: "New Lead" },
  { key: "NEGOTIATING", label: "Negotiating" },
  { key: "DEAL_CLOSED", label: "Deal Closed" },
  { key: "BOOKED", label: "Booked" },
  { key: "LOST", label: "Lost" },
];

/** Deal Pipeline / Kanban (agency-side) — a `Select` per card to move stages
 * rather than drag-and-drop, matching the interaction budget already used
 * for the Creator-only CRM's `DealStage` picker (`app/(app)/crm/page.tsx`);
 * no new drag-and-drop dependency needed for a first pass. */
export default function RosterPipelinePage() {
  const { data: deals, isLoading } = useGetRosterDealsQuery();
  const { data: roster } = useGetMyRosterQuery();
  const [createDeal, { isLoading: isCreating }] = useCreateRosterDealMutation();
  const [showForm, setShowForm] = useState(false);
  const [memberUserId, setMemberUserId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");

  const acceptedMembers = (roster?.items ?? []).filter((entry) => entry.status === "ACCEPTED" && entry.member);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!memberUserId) return;
    try {
      await createDeal({ memberUserId, title }).unwrap();
      setTitle("");
      setMemberUserId(undefined);
      setShowForm(false);
    } catch {
      toast.error("Couldn't create that deal. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Deal Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">Track deals for each roster member, stage by stage.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          New deal
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-4">
          <Select value={memberUserId} onValueChange={(v) => setMemberUserId(v ?? undefined)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Roster member" />
            </SelectTrigger>
            <SelectContent>
              {acceptedMembers.map((entry) => (
                <SelectItem key={entry.id} value={entry.member!.userId}>
                  {entry.member!.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Deal title, e.g. Q3 brand partnership"
            required
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isCreating || !memberUserId}>
            {isCreating ? "Creating…" : "Create"}
          </Button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage) => (
            <div key={stage.key} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {stage.label} ({(deals?.items ?? []).filter((d) => d.stage === stage.key).length})
              </p>
              <div className="space-y-2">
                {(deals?.items ?? [])
                  .filter((deal) => deal.stage === stage.key)
                  .map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Split-approval revenue-split workflow — anchored to a `RosterDeal`.
 * Party rows are plain userId text inputs rather than a picker (no
 * connections-search UI built for this yet); the agency's own id and the
 * roster member's id are pre-filled since those are the two parties on
 * almost every split. */
function RevenueSplitSection({ deal }: { deal: RosterDealDto }) {
  const { data: session } = useGetSessionQuery();
  const { data: splits } = useGetRevenueSplitsForDealQuery(deal.id);
  const [proposeSplit, { isLoading: isProposing }] = useProposeRevenueSplitMutation();
  const [approveSplit] = useApproveRevenueSplitMutation();
  const [showForm, setShowForm] = useState(false);
  const [parties, setParties] = useState<RevenueSplitParty[]>([]);

  const isAgency = session?.user?.role === "AGENCY";

  function openForm() {
    setParties([
      { userId: session?.user?.id ?? "", percent: 20 },
      { userId: deal.member?.userId ?? "", percent: 80 },
    ]);
    setShowForm(true);
  }

  function updateParty(index: number, patch: Partial<RevenueSplitParty>) {
    setParties((prev) => prev.map((party, i) => (i === index ? { ...party, ...patch } : party)));
  }

  const total = parties.reduce((sum, party) => sum + (party.percent || 0), 0);

  async function handleSubmit() {
    if (total !== 100) {
      toast.error("Percentages must sum to 100.");
      return;
    }
    try {
      await proposeSplit({ rosterDealId: deal.id, parties }).unwrap();
      setShowForm(false);
    } catch {
      toast.error("Couldn't propose that split. Please try again.");
    }
  }

  return (
    <div className="space-y-2 border-t border-border pt-2">
      <p className="text-xs font-medium text-muted-foreground">Revenue split</p>

      {(splits?.items ?? []).map((split) => {
        const alreadyApproved = session?.user?.id ? split.approvedByUserIds.includes(session.user.id) : false;
        const isParty = session?.user?.id ? split.parties.some((p) => p.userId === session.user!.id) : false;
        return (
          <div key={split.id} className="rounded-lg bg-muted p-2 text-xs">
            <div className="flex items-center justify-between">
              <Badge variant={split.status === "APPROVED" ? "default" : "outline"} className="text-[10px]">
                {split.status === "APPROVED" ? "Approved" : "Pending approval"}
              </Badge>
              {isParty && !alreadyApproved ? (
                <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => approveSplit(split.id)}>
                  Approve
                </Button>
              ) : null}
            </div>
            <ul className="mt-1 space-y-0.5">
              {split.parties.map((party) => (
                <li key={party.userId} className="flex items-center justify-between text-foreground">
                  <span className="truncate">{party.userId}</span>
                  <span>{party.percent}%</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {isAgency ? (
        showForm ? (
          <div className="space-y-1.5 rounded-lg border border-border p-2">
            {parties.map((party, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <Input
                  value={party.userId}
                  onChange={(e) => updateParty(index, { userId: e.target.value })}
                  placeholder="User ID"
                  className="h-7 flex-1 text-xs"
                />
                <Input
                  type="number"
                  value={party.percent}
                  onChange={(e) => updateParty(index, { percent: Number(e.target.value) })}
                  className="h-7 w-16 text-xs"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-[10px] text-muted-foreground hover:underline"
                onClick={() => setParties((prev) => [...prev, { userId: "", percent: 0 }])}
              >
                + Add party
              </button>
              <span className={total === 100 ? "text-[10px] text-success" : "text-[10px] text-destructive"}>
                Total: {total}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" className="h-7 text-xs" disabled={isProposing} onClick={handleSubmit}>
                Propose
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openForm}>
            Propose split
          </Button>
        )
      ) : null}
    </div>
  );
}

function DealCard({ deal }: { deal: RosterDealDto }) {
  const [updateStage] = useUpdateRosterDealStageMutation();
  const [addNote, { isLoading: isAddingNote }] = useAddRosterDealNoteMutation();
  const [removeDeal] = useRemoveRosterDealMutation();
  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteText.trim()) return;
    await addNote({ id: deal.id, text: noteText.trim() }).unwrap();
    setNoteText("");
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarImage src={deal.member?.avatarUrl ?? undefined} />
          <AvatarFallback>{initialsFromName(deal.member?.name ?? "?")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{deal.title}</p>
          <p className="truncate text-xs text-muted-foreground">{deal.member?.name}</p>
        </div>
      </div>

      <Select value={deal.stage} onValueChange={(value) => updateStage({ id: deal.id, stage: value as RosterDealStage })}>
        <SelectTrigger className="mt-2 h-8 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STAGES.map((stage) => (
            <SelectItem key={stage.key} value={stage.key}>
              {stage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
      >
        {deal.notes.length > 0 ? `${deal.notes.length} note(s)` : "Add a note"}
      </button>

      {expanded ? (
        <div className="mt-2 space-y-2">
          {deal.notes.map((note) => (
            <div key={note.id} className="rounded-lg bg-muted p-2 text-xs text-foreground">
              <p>{note.text}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{formatRelativeTime(note.createdAt)}</p>
            </div>
          ))}
          <form onSubmit={handleAddNote} className="flex items-center gap-1.5">
            <Input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Note…"
              className="h-7 text-xs"
            />
            <Button type="submit" size="sm" disabled={isAddingNote || !noteText.trim()}>
              Add
            </Button>
          </form>
          <RevenueSplitSection deal={deal} />
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeDeal(deal.id)}>
            Remove deal
          </Button>
        </div>
      ) : null}
    </div>
  );
}

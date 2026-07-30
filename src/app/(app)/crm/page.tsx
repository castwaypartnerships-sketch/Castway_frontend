"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";

import {
  useAddBrandRelationshipMutation,
  useAddRelationshipNoteMutation,
  useGetBrandRelationshipsQuery,
  useRemoveBrandRelationshipMutation,
  useUpdateDealStageMutation,
  useUpdateDealValueMutation,
} from "@/lib/redux/endpoints/crm-api";
import type { BrandRelationshipDto, DealStage } from "@/lib/types/crm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountRoleBadge } from "@/components/shared/account-role-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { cn } from "@/lib/utils";

const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  NEW_CONTACT: "New Contact",
  NEGOTIATING: "Negotiating",
  DEAL_CLOSED: "Deal Closed",
  PAST_COLLAB: "Past Collab",
  LOST: "Lost",
};

const DEAL_STAGES = Object.keys(DEAL_STAGE_LABELS) as DealStage[];

const STAGE_BADGE_CLASS: Record<DealStage, string> = {
  NEW_CONTACT: "bg-[#f3f4f6] text-[#6b7280] dark:bg-white/10 dark:text-white/70",
  NEGOTIATING: "bg-[#fffbeb] text-[#b45309] dark:bg-[#3a2f10] dark:text-[#fbbf24]",
  DEAL_CLOSED: "bg-[#e6f4ea] text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]",
  PAST_COLLAB: "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#0f1f33] dark:text-[#93c5fd]",
  LOST: "bg-destructive/10 text-destructive",
};

const ACTIVE_STAGES: DealStage[] = ["NEW_CONTACT", "NEGOTIATING", "DEAL_CLOSED"];

const FILTER_TABS = [
  { value: "all", label: "All Deals" },
  { value: "active", label: "Active Deals" },
  { value: "negotiating", label: "Negotiating" },
] as const;

function currency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export default function CrmPage() {
  const { data, isLoading } = useGetBrandRelationshipsQuery();
  const [addRelationship, { isLoading: isAdding, error: addError }] = useAddBrandRelationshipMutation();
  const [username, setUsername] = useState("");
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<(typeof FILTER_TABS)[number]["value"]>("all");

  const items = useMemo(() => data?.items ?? [], [data]);
  const filtered = useMemo(() => {
    if (tab === "active") return items.filter((r) => ACTIVE_STAGES.includes(r.stage));
    if (tab === "negotiating") return items.filter((r) => r.stage === "NEGOTIATING");
    return items;
  }, [items, tab]);

  const activeCount = items.filter((r) => ACTIVE_STAGES.includes(r.stage)).length;
  const negotiatingCount = items.filter((r) => r.stage === "NEGOTIATING").length;

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdded(false);
    try {
      await addRelationship(username.trim()).unwrap();
      setUsername("");
      setAdded(true);
    } catch {
      // surfaced via addError below
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Brand Relationships</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the Brand and Agency accounts you&apos;ve dealt with — deal stage and private notes, just for
          you.
        </p>

        <form
          onSubmit={handleAdd}
          className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Track a brand by username, e.g. acme-co"
            required
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            className="shrink-0 gap-1.5 bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
            disabled={isAdding}
          >
            <UserPlus className="size-4" />
            {isAdding ? "Adding…" : "Add Brand"}
          </Button>
        </form>
        {added ? <p className="mt-2 text-sm text-success">Added to your CRM.</p> : null}
        {addError ? (
          <p className="mt-2 text-sm text-destructive">
            {(addError as { data?: { error?: string } })?.data?.error ?? "Couldn't add that brand."}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTER_TABS.map((filterTab) => (
            <button
              key={filterTab.value}
              type="button"
              onClick={() => setTab(filterTab.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                tab === filterTab.value
                  ? "border-transparent bg-[#1c3322] text-white dark:bg-[#25422d]"
                  : "border-border bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              {filterTab.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              {items.length === 0 ? "No brand relationships tracked yet." : "No relationships match this filter."}
            </p>
          ) : (
            <ul className="space-y-4">
              {filtered.map((relationship) => (
                <RelationshipCard key={relationship.id} relationship={relationship} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="pointer-events-none absolute -top-4 -right-4 size-20 rounded-full bg-[#e6f4ea] opacity-50 dark:bg-[#1a261d]" />
          <h3 className="text-sm font-semibold text-foreground">CRM Tips</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Add private notes after every call to track your leverage in future negotiations. These notes are
            visible only to you.
          </p>
          <Link
            href="/crm/guide"
            className={cn(
              "mt-4 block w-full rounded-lg bg-[#476948] px-3 py-2.5 text-center text-xs font-bold text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]",
            )}
          >
            Read CRM Guide
          </Link>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Pipeline Overview</h3>
          <div className="mt-4 space-y-3">
            <PipelineBar label="Active Deals" count={activeCount} total={items.length || 1} color="#476948" />
            <PipelineBar label="Negotiating" count={negotiatingCount} total={items.length || 1} color="#fbbf24" />
          </div>
          <Link
            href="/crm/analytics"
            className="mt-3 inline-block text-xs font-bold text-[#476948] hover:underline dark:text-[#a7d9b5]"
          >
            View full analytics →
          </Link>
        </section>
      </aside>
    </div>
  );
}

function PipelineBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percent = Math.round((count / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{count}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function RelationshipCard({ relationship }: { relationship: BrandRelationshipDto }) {
  const [updateStage] = useUpdateDealStageMutation();
  const [updateDealValue, { isLoading: isSavingValue }] = useUpdateDealValueMutation();
  const [addNote, { isLoading: isAddingNote }] = useAddRelationshipNoteMutation();
  const [removeRelationship] = useRemoveBrandRelationshipMutation();
  const [noteText, setNoteText] = useState("");
  const [editingValue, setEditingValue] = useState(false);
  const [valueInput, setValueInput] = useState(relationship.dealValue?.toString() ?? "");

  const latestNote = relationship.notes[relationship.notes.length - 1];

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteText.trim()) return;
    await addNote({ id: relationship.id, text: noteText.trim() }).unwrap();
    setNoteText("");
  }

  async function handleSaveValue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = valueInput.trim() === "" ? null : Number(valueInput);
    await updateDealValue({ id: relationship.id, dealValue: Number.isNaN(parsed) ? null : parsed }).unwrap();
    setEditingValue(false);
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={relationship.brand?.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(relationship.brand?.name ?? "?")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {relationship.brand ? (
                <Link
                  href={`/profile/${relationship.brand.username}`}
                  className="truncate font-semibold text-foreground hover:underline"
                >
                  {relationship.brand.name}
                </Link>
              ) : (
                <p className="truncate font-semibold text-foreground">Unknown account</p>
              )}
              {relationship.brand ? <AccountRoleBadge role={relationship.brand.accountRole} /> : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Added {formatRelativeTime(relationship.createdAt)}
              {relationship.dealValue != null ? ` · ${currency(relationship.dealValue)}` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Select
            value={relationship.stage}
            onValueChange={(value) => updateStage({ id: relationship.id, stage: value as DealStage })}
          >
            <SelectTrigger className={cn("w-40 border-transparent font-bold", STAGE_BADGE_CLASS[relationship.stage])}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEAL_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {DEAL_STAGE_LABELS[stage]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Remove"
            onClick={() => removeRelationship(relationship.id)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        {latestNote ? (
          <p className="text-sm text-muted-foreground italic">&ldquo;{latestNote.text}&rdquo;</p>
        ) : null}

        <form onSubmit={handleAddNote} className="flex items-center gap-2">
          <Input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a private note about this relationship…"
            className="h-8 text-xs"
          />
          <Button type="submit" size="sm" disabled={isAddingNote || !noteText.trim()}>
            Save
          </Button>
        </form>

        {editingValue ? (
          <form onSubmit={handleSaveValue} className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              placeholder="Deal value ($)"
              className="h-8 w-40 text-xs"
            />
            <Button type="submit" size="sm" disabled={isSavingValue}>
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingValue(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <button
            type="button"
            className="text-xs font-bold text-[#476948] hover:underline dark:text-[#a7d9b5]"
            onClick={() => setEditingValue(true)}
          >
            {relationship.dealValue != null ? "Edit deal value" : "Add deal value"}
          </button>
        )}
      </div>
    </li>
  );
}

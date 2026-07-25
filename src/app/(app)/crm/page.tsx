"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";

import {
  useAddBrandRelationshipMutation,
  useAddRelationshipNoteMutation,
  useGetBrandRelationshipsQuery,
  useRemoveBrandRelationshipMutation,
  useUpdateDealStageMutation,
} from "@/lib/redux/endpoints/crm-api";
import type { BrandRelationshipDto, DealStage } from "@/lib/types/crm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRelativeTime, initialsFromName } from "@/lib/format";

const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  NEW_CONTACT: "New Contact",
  NEGOTIATING: "Negotiating",
  DEAL_CLOSED: "Deal Closed",
  PAST_COLLAB: "Past Collab",
  LOST: "Lost",
};

const DEAL_STAGES = Object.keys(DEAL_STAGE_LABELS) as DealStage[];

export default function CrmPage() {
  const { data, isLoading } = useGetBrandRelationshipsQuery();
  const [addRelationship, { isLoading: isAdding, error: addError }] = useAddBrandRelationshipMutation();
  const [username, setUsername] = useState("");
  const [added, setAdded] = useState(false);

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
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Brand Relationships
        </h1>
        <p className="text-sm text-muted-foreground">
          Track the Brand and Agency accounts you&apos;ve dealt with — deal stage and private notes,
          just for you.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Track a brand by username, e.g. acme-co"
          required
        />
        <Button type="submit" size="sm" className="shrink-0 gap-1.5" disabled={isAdding}>
          <UserPlus className="size-4" />
          {isAdding ? "Adding…" : "Add"}
        </Button>
      </form>
      {added ? <p className="text-sm text-success">Added to your CRM.</p> : null}
      {addError ? (
        <p className="text-sm text-destructive">
          {(addError as { data?: { error?: string } })?.data?.error ?? "Couldn't add that brand."}
        </p>
      ) : null}

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No brand relationships tracked yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((relationship) => (
            <RelationshipCard key={relationship.id} relationship={relationship} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RelationshipCard({ relationship }: { relationship: BrandRelationshipDto }) {
  const [updateStage] = useUpdateDealStageMutation();
  const [addNote, { isLoading: isAddingNote }] = useAddRelationshipNoteMutation();
  const [removeRelationship] = useRemoveBrandRelationshipMutation();
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteText.trim()) return;
    await addNote({ id: relationship.id, text: noteText.trim() }).unwrap();
    setNoteText("");
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="sm">
            <AvatarImage src={relationship.brand?.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(relationship.brand?.name ?? "?")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            {relationship.brand ? (
              <Link
                href={`/profile/${relationship.brand.username}`}
                className="truncate text-sm font-medium text-foreground hover:underline"
              >
                {relationship.brand.name}
              </Link>
            ) : (
              <p className="truncate text-sm font-medium text-foreground">Unknown account</p>
            )}
            <p className="text-xs text-muted-foreground">
              Added {formatRelativeTime(relationship.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Select
            value={relationship.stage}
            onValueChange={(value) => updateStage({ id: relationship.id, stage: value as DealStage })}
          >
            <SelectTrigger className="w-40">
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

      <div className="mt-3">
        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => setShowNotes((v) => !v)}>
          {relationship.notes.length > 0
            ? `${relationship.notes.length} note${relationship.notes.length === 1 ? "" : "s"}`
            : "Add a note"}
        </Button>

        {showNotes ? (
          <div className="mt-2 space-y-2">
            {relationship.notes.length > 0 ? (
              <ul className="space-y-1.5">
                {relationship.notes.map((note) => (
                  <li key={note.id} className="rounded-lg bg-muted p-2 text-xs text-foreground">
                    <p>{note.text}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatRelativeTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
            <form onSubmit={handleAddNote} className="flex items-center gap-2">
              <Input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a note…"
                className="h-8 text-xs"
              />
              <Button type="submit" size="sm" disabled={isAddingNote || !noteText.trim()}>
                Add
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </li>
  );
}

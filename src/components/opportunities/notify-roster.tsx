"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetMyRosterQuery } from "@/lib/redux/endpoints/roster-api";
import { useNotifyRosterMutation } from "@/lib/redux/endpoints/opportunities-api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/** Bulk-post-to-roster — only shown to the Agency that posted this specific
 * opportunity, letting them flag it to a chosen subset of their roster
 * (notify-only, or notify-and-auto-apply via the same act-on-behalf-of
 * primitive `ApplyOnBehalf` uses). */
export function NotifyRoster({ opportunityId, posterUserId }: { opportunityId: string; posterUserId: string }) {
  const { data: session } = useGetSessionQuery();
  const isOwner = session?.user?.role === "AGENCY" && session.user.id === posterUserId;
  const { data: roster } = useGetMyRosterQuery(undefined, { skip: !isOwner });
  const [notifyRoster, { isLoading }] = useNotifyRosterMutation();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [autoApply, setAutoApply] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!isOwner) return null;
  const acceptedMembers = (roster?.items ?? []).filter((entry) => entry.status === "ACCEPTED" && entry.member);
  if (acceptedMembers.length === 0) return null;

  function toggle(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    try {
      const response = await notifyRoster({
        opportunityId,
        memberUserIds: [...selected],
        autoApply,
      }).unwrap();
      setResult(
        autoApply
          ? `Notified ${response.notified.length}, applied for ${response.applied.length}.`
          : `Notified ${response.notified.length} roster member(s).`,
      );
      setSelected(new Set());
      setShowForm(false);
    } catch {
      toast.error("Couldn't notify your roster. Please try again.");
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-dashed border-border p-4">
      {showForm ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Post this to roster members</p>
          <ul className="space-y-1.5">
            {acceptedMembers.map((entry) => (
              <li key={entry.id} className="flex items-center gap-2">
                <Checkbox
                  id={`notify-${entry.id}`}
                  checked={selected.has(entry.member!.userId)}
                  onCheckedChange={() => toggle(entry.member!.userId)}
                />
                <Label htmlFor={`notify-${entry.id}`} className="text-sm font-normal">
                  {entry.member!.name}
                </Label>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Checkbox id="notify-auto-apply" checked={autoApply} onCheckedChange={(v) => setAutoApply(v === true)} />
            <Label htmlFor="notify-auto-apply" className="text-sm font-normal">
              Also apply on their behalf
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={isLoading || selected.size === 0}>
              {isLoading ? "Sending…" : "Send"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          Post to roster
        </Button>
      )}
      {result ? <p className="mt-2 text-sm text-success">{result}</p> : null}
    </div>
  );
}

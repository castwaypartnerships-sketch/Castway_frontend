"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useActableRosterEntries } from "@/lib/hooks/use-actable-roster";
import { useApplyOnBehalfOfRosterMemberMutation } from "@/lib/redux/endpoints/opportunities-api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Act-on-behalf-of ("apply" from the AGENCIES spec) — a standalone block
 * rather than reusing `ApplyComposer`/`useApplyFlow`, since those are shared
 * by `OpportunityCard`/`PostCard` for a self-application and threading a
 * second identity through that hook would risk the existing flow. Rendered
 * for both AGENCY accounts (full roster) and AGENCY_MANAGER sub-accounts
 * (their assigned subset only) — see `useActableRosterEntries`. */
export function ApplyOnBehalf({ opportunityId }: { opportunityId: string }) {
  const { entries: acceptedMembers, canAct } = useActableRosterEntries();
  const [applyOnBehalf, { isLoading }] = useApplyOnBehalfOfRosterMemberMutation();
  const [memberUserId, setMemberUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);

  if (!canAct || acceptedMembers.filter((entry) => entry.member).length === 0) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!memberUserId) return;
    try {
      await applyOnBehalf({ opportunityId, memberUserId, message: message || undefined }).unwrap();
      setSent(true);
      setMessage("");
      setShowForm(false);
    } catch {
      toast.error("Couldn't submit that application. Please try again.");
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-dashed border-border p-4">
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Select value={memberUserId} onValueChange={(value) => setMemberUserId(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Apply on behalf of…" />
            </SelectTrigger>
            <SelectContent>
              {acceptedMembers.map((entry) => (
                <SelectItem key={entry.id} value={entry.member!.userId}>
                  {entry.member!.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a pitch on their behalf…"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" type="submit" disabled={isLoading || !memberUserId}>
              {isLoading ? "Applying…" : "Send application"}
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          Apply on behalf of a roster member
        </Button>
      )}
      {sent ? <p className="mt-2 text-sm text-success">Application sent.</p> : null}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";

import { useGetOwnVerificationQuery, useSubmitVerificationMutation } from "@/lib/redux/endpoints/verification-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Mirrors the inline (not modal) form pattern already used for
 * `LeaveReviewAction` on the Connections page — one lightweight action next
 * to the trust badge doesn't need a Dialog. */
export function VerificationStatusAction({ isVerified }: { isVerified: boolean }) {
  const { data: request, isLoading } = useGetOwnVerificationQuery();
  const [submit, { isLoading: isSubmitting }] = useSubmitVerificationMutation();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  if (isVerified || isLoading) return null;

  if (request?.status === "SUBMITTED" || request?.status === "PENDING_REVIEW") {
    return <Badge variant="secondary">Verification pending review</Badge>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit({ note: note.trim() || undefined }).unwrap();
    setOpen(false);
    setNote("");
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        {request?.status === "REJECTED" ? (
          <Badge variant="outline" className="text-destructive">
            Verification rejected
          </Badge>
        ) : null}
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          {request?.status === "REJECTED" ? "Resubmit for verification" : "Request verification"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-72 space-y-2 rounded-xl border border-border p-3">
      <Textarea
        rows={2}
        placeholder="Optional note for the reviewer"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

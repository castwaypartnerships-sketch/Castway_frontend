"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import type { OpportunityType } from "@/lib/types/opportunity";
import {
  useCreateBulkOpportunitiesMutation,
  useCreateOpportunityMutation,
} from "@/lib/redux/endpoints/opportunities-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleGuard } from "@/components/auth/role-guard";
import { OPPORTUNITY_POSTER_ROLES } from "@/lib/rbac";
import { OPPORTUNITY_TYPE_OPTIONS as TYPE_OPTIONS, OpportunityForm } from "@/components/opportunities/opportunity-form";

export default function NewOpportunityPage() {
  const { data: session } = useGetSessionQuery();
  const isAgency = session?.user?.role === "AGENCY";
  const [bulkMode, setBulkMode] = useState(false);

  return (
    <RoleGuard allowed={OPPORTUNITY_POSTER_ROLES} redirectTo="/opportunities">
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/opportunities"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="size-4" />
            Back to Opportunities
          </Link>
          {isAgency ? (
            <Button variant="outline" size="sm" onClick={() => setBulkMode((v) => !v)}>
              {bulkMode ? "Single post" : "Bulk add"}
            </Button>
          ) : null}
        </div>

        {bulkMode ? <BulkOpportunityForm /> : <SingleOpportunityForm />}
      </div>
    </RoleGuard>
  );
}

function SingleOpportunityForm() {
  const router = useRouter();
  const [createOpportunity, { isLoading }] = useCreateOpportunityMutation();

  return (
    <>
      <div>
        <h1 className="font-heading text-foreground text-lg font-semibold tracking-tight">Post an opportunity</h1>
        <p className="text-muted-foreground text-sm">
          Visible to every creator browsing the Opportunities board.
        </p>
      </div>

      <OpportunityForm
        submitLabel="Post opportunity"
        pendingLabel="Posting…"
        isSubmitting={isLoading}
        onSubmit={async (input) => {
          await createOpportunity(input).unwrap();
          router.push("/opportunities");
        }}
      />
    </>
  );
}

interface BulkRow {
  title: string;
  description: string;
  type: OpportunityType;
}

function emptyRow(): BulkRow {
  return { title: "", description: "", type: "HIRING" };
}

function BulkOpportunityForm() {
  const router = useRouter();
  const [createBulk, { isLoading }] = useCreateBulkOpportunitiesMutation();
  const [rows, setRows] = useState<BulkRow[]>([emptyRow(), emptyRow()]);
  const [result, setResult] = useState<{ createdCount: number; errors: { index: number; error: string }[] } | null>(
    null,
  );

  function updateRow(index: number, patch: Partial<BulkRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    const { created, errors } = await createBulk(rows).unwrap();
    setResult({ createdCount: created.length, errors });
    if (errors.length === 0) router.push("/opportunities");
  }

  return (
    <>
      <div>
        <h1 className="font-heading text-foreground text-lg font-semibold tracking-tight">Bulk add opportunities</h1>
        <p className="text-muted-foreground text-sm">
          Post several opportunities at once. A row with an error won&apos;t block the rest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {rows.map((row, index) => {
          const rowError = result?.errors.find((e) => e.index === index);
          return (
            <div key={index} className="border-border bg-card space-y-3 rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">Row {index + 1}</p>
                {rows.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove row"
                    onClick={() => removeRow(index)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
                <Input
                  required
                  placeholder="Title"
                  value={row.title}
                  onChange={(e) => updateRow(index, { title: e.target.value })}
                />
                <Select
                  value={row.type}
                  onValueChange={(value) => updateRow(index, { type: value as OpportunityType })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {() => TYPE_OPTIONS.find((o) => o.value === row.type)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                required
                rows={2}
                placeholder="Description"
                value={row.description}
                onChange={(e) => updateRow(index, { description: e.target.value })}
              />
              {rowError ? <p className="text-destructive text-xs">{rowError.error}</p> : null}
            </div>
          );
        })}

        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
          <Plus className="size-4" />
          Add row
        </Button>

        {result ? (
          <p className="text-sm">
            {result.createdCount} posted
            {result.errors.length > 0 ? `, ${result.errors.length} failed — fix the highlighted rows.` : "."}
          </p>
        ) : null}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Posting…" : `Post ${rows.length} opportunities`}
        </Button>
      </form>
    </>
  );
}

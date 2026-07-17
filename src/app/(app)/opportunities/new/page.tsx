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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleGuard } from "@/components/auth/role-guard";
import { HIRING_ROLES } from "@/lib/rbac";

const TYPE_OPTIONS: { value: OpportunityType; label: string }[] = [
  { value: "HIRING", label: "Hiring" },
  { value: "COLLABORATION", label: "Collaboration" },
  { value: "BRAND_DEAL", label: "Brand Deal" },
  { value: "FREELANCE_GIG", label: "Freelance Gig" },
];

export default function NewOpportunityPage() {
  const { data: session } = useGetSessionQuery();
  const isAgency = session?.user?.role === "AGENCY";
  const [bulkMode, setBulkMode] = useState(false);

  return (
    <RoleGuard allowed={HIRING_ROLES} redirectTo="/opportunities">
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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<OpportunityType>("HIRING");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [budget, setBudget] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await createOpportunity({
        title,
        description,
        type,
        category: category || undefined,
        skillsRequired: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        location: location || undefined,
        isRemote,
        budget: budget || undefined,
      }).unwrap();
      router.push("/opportunities");
    } catch {
      setError("Couldn't post this opportunity. Check the fields and try again.");
    }
  }

  return (
    <>
      <div>
        <h1 className="font-heading text-foreground text-lg font-semibold tracking-tight">Post an opportunity</h1>
        <p className="text-muted-foreground text-sm">
          Visible to every creator browsing the Opportunities board.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-border bg-card space-y-5 rounded-2xl border p-6"
      >
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as OpportunityType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
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
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills required (comma-separated)</Label>
            <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                placeholder="$5,000 / Project"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Switch id="isRemote" checked={isRemote} onCheckedChange={setIsRemote} />
            <Label htmlFor="isRemote">Remote-friendly</Label>
          </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Posting…" : "Post opportunity"}
        </Button>
      </form>
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

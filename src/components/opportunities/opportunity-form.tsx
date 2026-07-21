"use client";

import { useState, type FormEvent } from "react";

import type { Opportunity, OpportunityType, OpportunityWriteInput } from "@/lib/types/opportunity";
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

export const OPPORTUNITY_TYPE_OPTIONS: { value: OpportunityType; label: string }[] = [
  { value: "HIRING", label: "Hiring" },
  { value: "COLLABORATION", label: "Collaboration" },
  { value: "BRAND_DEAL", label: "Brand Deal" },
  { value: "FREELANCE_GIG", label: "Freelance Gig" },
];

export function OpportunityForm({
  initial,
  submitLabel,
  pendingLabel,
  isSubmitting,
  onSubmit,
}: {
  initial?: Opportunity;
  submitLabel: string;
  pendingLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: OpportunityWriteInput) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<OpportunityType>(initial?.type ?? "HIRING");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [skills, setSkills] = useState(initial?.skillsRequired.join(", ") ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [isRemote, setIsRemote] = useState(initial?.isRemote ?? false);
  const [budget, setBudget] = useState(initial?.budget ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit({
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
      });
    } catch {
      setError("Couldn't save this opportunity. Check the fields and try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
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
              {OPPORTUNITY_TYPE_OPTIONS.map((option) => (
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}

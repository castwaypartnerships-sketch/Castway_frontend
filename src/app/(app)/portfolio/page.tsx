"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  useAddPortfolioItemMutation,
  useAddUnavailableRangeMutation,
  useGetOwnProfileQuery,
  useRemovePortfolioItemMutation,
  useRemoveUnavailableRangeMutation,
  useUpdateProfileMutation,
} from "@/lib/redux/endpoints/profile-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Availability, DateRange, PortfolioItem } from "@/lib/types/profile";
import { initialsFromName } from "@/lib/format";
import { isHiringRole } from "@/lib/rbac";
import { TrustBadge } from "@/components/profile/trust-badge";

export default function PortfolioPage() {
  const { data, isLoading } = useGetOwnProfileQuery();
  const { data: session } = useGetSessionQuery();
  const hiring = isHiringRole(session?.user?.role);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-6">
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Complete onboarding to set up your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="space-y-3">
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          {hiring ? "Company Profile" : "My Portfolio"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {hiring
            ? "This is what creators see when you post an opportunity or reach out."
            : "This is what other creators and brands see on your public profile."}
        </p>
        <TrustBadge
          isVerified={data.isVerified}
          trustScore={data.trustScore}
          reviewSummary={data.reviewSummary}
        />
      </div>

      <ProfileForm profile={data.profile} hiring={hiring} />
      {hiring ? null : (
        <>
          <AvailabilitySection ranges={data.profile.unavailableRanges} availability={data.availability} />
          <PortfolioItems items={data.profile.portfolioItems} />
        </>
      )}
    </div>
  );
}

function ProfileForm({
  profile,
  hiring,
}: {
  profile: {
    name: string;
    bio: string | null;
    avatarUrl: string | null;
    creatorCategory: string | null;
    location: string | null;
    skills: string[];
    services: string[];
    businessEmail: string | null;
  };
  hiring: boolean;
}) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [category, setCategory] = useState(profile.creatorCategory ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [services, setServices] = useState(profile.services.join(", "));
  const [businessEmail, setBusinessEmail] = useState(profile.businessEmail ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timeout);
  }, [saved]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateProfile({
      name,
      bio,
      creatorCategory: category,
      location,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      services: services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      ...(hiring ? { businessEmail: businessEmail || undefined } : {}),
    }).unwrap();
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src={profile.avatarUrl ?? undefined} />
          <AvatarFallback>{initialsFromName(profile.name)}</AvatarFallback>
        </Avatar>
        <p className="text-xs text-muted-foreground">
          Avatar uploads aren&apos;t wired up yet — set an image URL from Workspace Settings later.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">{hiring ? "About the company" : "Bio / role"}</Label>
        <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      {hiring ? (
        <div className="space-y-1.5">
          <Label htmlFor="businessEmail">Business email</Label>
          <Input
            id="businessEmail"
            type="email"
            required
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">{hiring ? "Industry" : "Category"}</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      {hiring ? null : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="services">Services (comma-separated)</Label>
            <Input id="services" value={services} onChange={(e) => setServices(e.target.value)} />
          </div>
        </>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save profile"}
        </Button>
        {saved ? <span className="text-sm text-success">Saved</span> : null}
      </div>
    </form>
  );
}

function PortfolioItems({ items }: { items: PortfolioItem[] }) {
  const [addItem, { isLoading: isAdding }] = useAddPortfolioItemMutation();
  const [removeItem] = useRemovePortfolioItemMutation();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const metrics = metricLabel.trim() && metricValue.trim() ? [{ label: metricLabel, value: metricValue }] : undefined;
    await addItem({ title, imageUrl, description: description || undefined, metrics }).unwrap();
    setTitle("");
    setImageUrl("");
    setDescription("");
    setMetricLabel("");
    setMetricValue("");
    setShowForm(false);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Portfolio items</h2>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          Add item
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-xl border border-border p-4">
          <div className="space-y-1.5">
            <Label htmlFor="item-title">Title</Label>
            <Input id="item-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-image">Image URL</Label>
            <Input
              id="item-image"
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Result metric (optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Value, e.g. 40%"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
              />
              <Input
                placeholder="Label, e.g. CTR lift"
                value={metricLabel}
                onChange={(e) => setMetricLabel(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={isAdding}>
            {isAdding ? "Adding…" : "Add"}
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No portfolio items yet.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl border border-border">
              <div className="aspect-video bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  {item.description ? (
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  ) : null}
                  {item.metrics && item.metrics.length > 0 ? (
                    <p className="mt-1 text-xs font-medium text-primary">
                      {item.metrics.map((m) => `${m.value} ${m.label}`).join(" · ")}
                    </p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AvailabilitySection({
  ranges,
  availability,
}: {
  ranges: DateRange[];
  availability: Availability;
}) {
  const [addRange, { isLoading: isAdding }] = useAddUnavailableRangeMutation();
  const [removeRange] = useRemoveUnavailableRangeMutation();
  const [showForm, setShowForm] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await addRange({ start, end, note: note || undefined }).unwrap();
    setStart("");
    setEnd("");
    setNote("");
    setShowForm(false);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Availability</h2>
          <Badge variant={availability.isAvailableNow ? "default" : "outline"} className="mt-2">
            {availability.isAvailableNow
              ? "Available now"
              : availability.nextAvailableDate
                ? `Booked until ${new Date(availability.nextAvailableDate).toLocaleDateString()}`
                : "Available now"}
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          Block dates
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-xl border border-border p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="range-start">From</Label>
              <Input id="range-start" type="date" required value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="range-end">To</Label>
              <Input id="range-end" type="date" required value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="range-note">Note (optional)</Label>
            <Input id="range-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Booked with another brand" />
          </div>
          <Button type="submit" size="sm" disabled={isAdding}>
            {isAdding ? "Saving…" : "Save"}
          </Button>
        </form>
      ) : null}

      {ranges.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No booked date ranges — you&apos;re open-ended.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {ranges.map((range) => (
            <li
              key={range.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-foreground">
                  {new Date(range.start).toLocaleDateString()} – {new Date(range.end).toLocaleDateString()}
                </p>
                {range.note ? <p className="truncate text-xs text-muted-foreground">{range.note}</p> : null}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove"
                onClick={() => removeRange(range.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

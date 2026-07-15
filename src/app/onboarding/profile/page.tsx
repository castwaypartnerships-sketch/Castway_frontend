"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useCompleteOnboardingMutation } from "@/lib/redux/endpoints/onboarding-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApiErrorBody {
  error?: string;
}

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [completeOnboarding, { isLoading }] = useCompleteOnboardingMutation();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await completeOnboarding({
        username,
        name,
        bio: bio || undefined,
        creatorCategory: category || undefined,
        location: location || undefined,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        services: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        openForCollaboration: true,
        availableForWork: true,
      }).unwrap();
      router.push("/feed");
      router.refresh();
    } catch (err) {
      const body = (err as { data?: ApiErrorBody } | undefined)?.data;
      setError(body?.error ?? "Couldn't save your profile. Check the fields and try again.");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">Set up your profile</h1>
          <p className="text-sm text-muted-foreground">This is what other creators will see.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              required
              pattern="[a-z0-9_]+"
              title="Lowercase letters, numbers, and underscores only"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="jane_doe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio / role</Label>
            <Textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Senior Product Designer at..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving…" : "Finish setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}

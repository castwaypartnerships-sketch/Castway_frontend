"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useCompleteOnboardingMutation } from "@/lib/redux/endpoints/onboarding-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarUpload } from "@/components/upload/avatar-upload";
import { CoverUpload } from "@/components/upload/cover-upload";
import { PROFILE_CATEGORY_OPTIONS } from "@/lib/categories";

interface ApiErrorBody {
  error?: string;
}

// Mirrors `ROLE_REQUIRED_FIELDS` in `backend/src/modules/onboarding/completeness.ts` —
// Brand/Agency accounts aren't marked onboarded until a business email is on file.
const BUSINESS_EMAIL_ROLES = new Set(["BRAND", "AGENCY"]);

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { data: session } = useGetSessionQuery();
  const [completeOnboarding, { isLoading }] = useCompleteOnboardingMutation();
  const requiresBusinessEmail = session?.user?.role
    ? BUSINESS_EMAIL_ROLES.has(session.user.role)
    : false;

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const socialLinks = {
      website: companyDomain.trim() || undefined,
      instagram: instagram.trim() || undefined,
      youtube: youtube.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
    };
    const hasSocialLinks = Object.values(socialLinks).some(Boolean);

    try {
      await completeOnboarding({
        username,
        name,
        avatarUrl: avatarUrl || undefined,
        coverImageUrl: coverImageUrl || undefined,
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
        languages: languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        contactNumber: contactNumber.trim() || undefined,
        businessEmail: businessEmail || undefined,
        socialLinks: hasSocialLinks ? socialLinks : undefined,
        openForCollaboration: true,
        availableForWork: true,
        // Brand/Agency accounts exist to hire — without this they're invisible
        // to the "Looking to hire" search filter until their first Settings edit.
        lookingToHire: requiresBusinessEmail,
      }).unwrap();
      router.push("/home");
      router.refresh();
    } catch (err) {
      const body = (err as { data?: ApiErrorBody } | undefined)?.data;
      setError(body?.error ?? "Couldn't save your profile. Check the fields and try again.");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f9fafb] px-4 py-12 dark:bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="font-heading text-lg font-bold tracking-tight text-[#476948] dark:text-[#a7d9b5]">
            Castway
          </p>
          <h1 className="mt-4 text-lg font-semibold text-foreground">Set up your profile</h1>
          <p className="text-sm text-muted-foreground">This is what other creators will see.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <CoverUpload coverImageUrl={coverImageUrl} onUploaded={setCoverImageUrl} />
          <div className="flex flex-col items-center gap-2">
            <AvatarUpload avatarUrl={avatarUrl} name={name} onUploaded={setAvatarUrl} size="lg" />
            <p className="text-xs text-muted-foreground">Add a profile photo (optional)</p>
          </div>

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
              <Select value={category || undefined} onValueChange={(value) => setCategory(value ?? "")}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="languages">Languages (comma-separated)</Label>
              <Input
                id="languages"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="English, Hindi"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactNumber">Contact number</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Social links (optional)</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                aria-label="Instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram URL"
              />
              <Input
                aria-label="YouTube"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="YouTube URL"
              />
              <Input
                aria-label="LinkedIn"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="LinkedIn URL"
              />
            </div>
          </div>
          {requiresBusinessEmail ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="businessEmail">Business email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  required
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="team@yourcompany.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companyDomain">Company website</Label>
                <Input
                  id="companyDomain"
                  type="url"
                  value={companyDomain}
                  onChange={(e) => setCompanyDomain(e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className="w-full bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
            disabled={isLoading}
          >
            {isLoading ? "Saving…" : "Finish setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}

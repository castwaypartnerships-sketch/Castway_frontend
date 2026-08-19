"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState, type FormEvent } from "react";
import { FileText, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  useAddCaseStudyMutation,
  useAddEducationMutation,
  useAddExperienceMutation,
  useAddPortfolioItemMutation,
  useAddRateCardItemMutation,
  useAddUnavailableRangeMutation,
  useGetOwnProfileQuery,
  useRemoveCaseStudyMutation,
  useRemoveEducationMutation,
  useRemoveExperienceMutation,
  useRemovePortfolioItemMutation,
  useRemoveRateCardItemMutation,
  useRemoveUnavailableRangeMutation,
  useSetRateCardVisibilityMutation,
  useUpdateExperienceMutation,
  useUpdateProfileMutation,
  useUpdateSocialLinksMutation,
  useUpdateSubSpecializationsMutation,
} from "@/lib/redux/endpoints/profile-api";
import { useGetAcceptedBrandsQuery } from "@/lib/redux/endpoints/search-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  AgencySize,
  Availability,
  CaseStudy,
  DateRange,
  Education,
  Experience,
  PortfolioItem,
  RateCardItem,
  SocialLinks,
} from "@/lib/types/profile";
import { isHiringRole } from "@/lib/rbac";
import { TrustBadge } from "@/components/profile/trust-badge";
import { ResponseTimeBadge } from "@/components/profile/response-time-badge";
import { VerificationStatusAction } from "@/components/profile/verification-status-action";
import { AvatarUpload } from "@/components/upload/avatar-upload";
import { CoverUpload } from "@/components/upload/cover-upload";
import { InlineImageUpload } from "@/components/upload/inline-image-upload";
import { isImageUrl } from "@/lib/upload-image";


const SERVICES_OFFERED_OPTIONS = [
  "Influencer Marketing", "Talent Management", "UGC Campaigns", 
  "Brand Partnerships", "Social Media Management", "Video Production", 
  "Photography", "PR", "Performance Marketing", "Creative Strategy", 
  "Event Management", "Casting", "Brand Consulting"
];

const CREATOR_CATEGORIES_OPTIONS = [
  "Fashion", "Beauty", "Lifestyle", "Tech", "Gaming", 
  "Finance", "Education", "Fitness", "Food", "Travel", 
  "Comedy", "Parenting", "Automobile", "Luxury", "Music"
];

const PLATFORMS_MANAGED_OPTIONS = [
  "Instagram", "YouTube", "TikTok", "LinkedIn", "X", 
  "Snapchat", "Facebook", "Twitch"
];

export default function PortfolioPage() {
  const { data, isLoading } = useGetOwnProfileQuery();
  const { data: session } = useGetSessionQuery();
  const hiring = isHiringRole(session?.user?.role);
  // Rate Card Transparency is CREATOR-only — deliberately narrower than the
  // `!hiring` split below, which also covers FREELANCER.
  const isCreator = session?.user?.role === "CREATOR";
  // Case-Study Portfolio / Sub-Specialization Tagging are FREELANCER-only,
  // same narrowing rationale as `isCreator` above.
  const isFreelancer = session?.user?.role === "FREELANCER";
  // Agency team-size bucket is AGENCY-only — narrower than `hiring`, which
  // also covers BRAND.
  const isAgency = session?.user?.role === "AGENCY";

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
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          {hiring
            ? "This is what creators see when you post an opportunity or reach out."
            : "This is what other creators and brands see on your public profile."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <TrustBadge
            isVerified={data.isVerified}
            trustScore={data.trustScore}
            reviewSummary={data.reviewSummary}
          />
          <ResponseTimeBadge responseTime={data.responseTime} />
        </div>
        <VerificationStatusAction isVerified={data.isVerified} />
      </div>

      <ProfileForm profile={data.profile} hiring={hiring} isAgency={isAgency} />
      <SocialLinksSection socialLinks={data.profile.socialLinks} />
      {hiring ? null : (
        <>
          <AvailabilitySection ranges={data.profile.unavailableRanges} availability={data.availability} />
          <PortfolioItems items={data.profile.portfolioItems} />
          {isCreator ? (
            <RateCardSection
              items={data.profile.rateCardItems}
              visible={data.profile.rateCardVisible}
              minRate={data.profile.minRate}
              maxRate={data.profile.maxRate}
            />
          ) : null}
          {isFreelancer ? (
            <>
              <CaseStudySection items={data.profile.caseStudies} />
              <SubSpecializationsSection tags={data.profile.subSpecializations} />
            </>
          ) : null}
          <ExperienceSection entries={data.profile.experience} />
          <EducationSection entries={data.profile.education} />
        </>
      )}
    </div>
  );
}

const AGENCY_SIZE_LABEL: Record<AgencySize, string> = {
  SOLO: "Just me",
  SMALL: "2-10 people",
  MEDIUM: "11-50 people",
  LARGE: "51+ people",
};

function ProfileForm({
  profile,
  hiring,
  isAgency,
}: {
  profile: {
    name: string;
    headline: string | null;
    bio: string | null;
    avatarUrl: string | null;
    coverImageUrl: string | null;
    creatorCategory: string | null;
    location: string | null;
    languages: string[];
    skills: string[];
    services: string[];
    businessEmail: string | null;
    contactNumber: string | null;
    agencySize: AgencySize | null;
    yearFounded?: number | null;
    industry?: string | null;
    servicesOffered?: string[];
    creatorCategories?: string[];
    platformsManaged?: string[];
  };
  hiring: boolean;
  isAgency: boolean;
}) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [updatePhoto] = useUpdateProfileMutation();
  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [category, setCategory] = useState(profile.creatorCategory ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [languages, setLanguages] = useState(profile.languages.join(", "));
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [services, setServices] = useState(profile.services.join(", "));
  const [businessEmail, setBusinessEmail] = useState(profile.businessEmail ?? "");
  const [contactNumber, setContactNumber] = useState(profile.contactNumber ?? "");
  const [agencySize, setAgencySize] = useState<AgencySize | "">(profile.agencySize ?? "");
  const [yearFounded, setYearFounded] = useState(profile.yearFounded ? String(profile.yearFounded) : "");
  const [industry, setIndustry] = useState(profile.industry ?? "");
  const [servicesOffered, setServicesOffered] = useState<string[]>(profile.servicesOffered ?? []);
  const [creatorCategories, setCreatorCategories] = useState<string[]>(profile.creatorCategories ?? []);
  const [platformsManaged, setPlatformsManaged] = useState<string[]>(profile.platformsManaged ?? []);
  const [saved, setSaved] = useState(false);

  const toggleService = (val: string) => {
    setServicesOffered(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };
  const toggleCategory = (val: string) => {
    setCreatorCategories(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };
  const togglePlatform = (val: string) => {
    setPlatformsManaged(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timeout);
  }, [saved]);

  async function handleAvatarUploaded(avatarUrl: string | null) {
    try {
      await updatePhoto({ avatarUrl }).unwrap();
      toast.success(avatarUrl ? "Profile photo updated" : "Profile photo removed");
    } catch {
      toast.error("Couldn't save your profile photo. Please try again.");
    }
  }

  async function handleCoverUploaded(coverImageUrl: string | null) {
    try {
      await updatePhoto({ coverImageUrl }).unwrap();
      toast.success(coverImageUrl ? "Cover photo updated" : "Cover photo removed");
    } catch {
      toast.error("Couldn't save your new cover photo. Please try again.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateProfile({
      name,
      headline,
      bio,
      creatorCategory: category,
      location,
      contactNumber,
      languages: languages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      services: services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      ...(hiring ? { businessEmail: businessEmail || undefined } : {}),
      ...(isAgency ? {
        agencySize: agencySize || undefined,
        yearFounded: yearFounded ? Number(yearFounded) : null,
        industry: industry || null,
        servicesOffered,
        creatorCategories,
        platformsManaged,
      } : {}),
    }).unwrap();
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <CoverUpload coverImageUrl={profile.coverImageUrl} onUploaded={handleCoverUploaded} />

      <div id="avatar-section" className="flex items-center gap-3 scroll-mt-6">
        <AvatarUpload avatarUrl={profile.avatarUrl} name={profile.name} onUploaded={handleAvatarUploaded} />
        <p className="text-xs text-muted-foreground">Click your photo or the cover banner to change it.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder={hiring ? "e.g. Award-winning creative agency" : "e.g. Senior Product Designer"}
        />
      </div>

      <div className="space-y-1.5 scroll-mt-6">
        <Label htmlFor="bio">{hiring ? "About the company" : "Bio / role"}</Label>
        <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="scroll-mt-6" />
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

      {isAgency && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="yearFounded">Year founded</Label>
            <Input
              id="yearFounded"
              type="number"
              min={1800}
              max={2100}
              value={yearFounded}
              onChange={(e) => setYearFounded(e.target.value)}
              placeholder="e.g. 2020"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Talent Management"
            />
          </div>
        </div>
      )}

      {isAgency ? (
        <div className="space-y-1.5">
          <Label htmlFor="agencySize">Team size</Label>
          <Select
            items={AGENCY_SIZE_LABEL}
            value={agencySize || undefined}
            onValueChange={(value) => setAgencySize((value as AgencySize | null) ?? "")}
          >
            <SelectTrigger id="agencySize" className="w-full">
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(AGENCY_SIZE_LABEL) as AgencySize[]).map((size) => (
                <SelectItem key={size} value={size}>
                  {AGENCY_SIZE_LABEL[size]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">{hiring ? "Industry" : "Category"}</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="space-y-1.5 scroll-mt-6">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="scroll-mt-6"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactNumber">Contact number</Label>
          <Input
            id="contactNumber"
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
        </div>
      </div>

      {hiring ? null : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} className="scroll-mt-6" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="services">Services (comma-separated)</Label>
            <Input id="services" value={services} onChange={(e) => setServices(e.target.value)} className="scroll-mt-6" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="languages">Languages (comma-separated)</Label>
            <Input
              id="languages"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="e.g. English, Hindi"
            />
          </div>
        </>
      )}


      {isAgency && (
        <>
          <div className="space-y-2">
            <Label>Services Offered</Label>
            <div className="flex flex-wrap gap-2">
              {SERVICES_OFFERED_OPTIONS.map((option) => {
                const isSelected = servicesOffered.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleService(option)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                      isSelected
                        ? "border-[#1F5F3F] bg-[#1F5F3F]/10 text-[#1F5F3F] dark:border-[#25422d] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Creator Categories</Label>
            <div className="flex flex-wrap gap-2">
              {CREATOR_CATEGORIES_OPTIONS.map((option) => {
                const isSelected = creatorCategories.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleCategory(option)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                      isSelected
                        ? "border-[#1F5F3F] bg-[#1F5F3F]/10 text-[#1F5F3F] dark:border-[#25422d] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Platforms Managed</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS_MANAGED_OPTIONS.map((option) => {
                const isSelected = platformsManaged.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => togglePlatform(option)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                      isSelected
                        ? "border-[#1F5F3F] bg-[#1F5F3F]/10 text-[#1F5F3F] dark:border-[#25422d] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
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

function SocialLinksSection({ socialLinks }: { socialLinks: SocialLinks | null }) {
  const [updateSocialLinks, { isLoading }] = useUpdateSocialLinksMutation();
  const [instagram, setInstagram] = useState(socialLinks?.instagram ?? "");
  const [youtube, setYoutube] = useState(socialLinks?.youtube ?? "");
  const [linkedin, setLinkedin] = useState(socialLinks?.linkedin ?? "");
  const [website, setWebsite] = useState(socialLinks?.website ?? "");
  const [twitter, setTwitter] = useState(socialLinks?.twitter ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timeout);
  }, [saved]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateSocialLinks({
      instagram: instagram || undefined,
      youtube: youtube || undefined,
      linkedin: linkedin || undefined,
      website: website || undefined,
      twitter: twitter || undefined,
    }).unwrap();
    setSaved(true);
  }

  return (
    <form
      id="social-links-section"
      onSubmit={handleSubmit}
      className="scroll-mt-6 space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <h2 className="text-sm font-semibold text-foreground">Social links</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="social-instagram">Instagram</Label>
          <Input id="social-instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="social-youtube">YouTube</Label>
          <Input id="social-youtube" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="social-linkedin">LinkedIn</Label>
          <Input id="social-linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="social-twitter">X (Twitter)</Label>
          <Input
            id="social-twitter"
            type="url"
            placeholder="https://x.com/�"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="social-website">Website</Label>
          <Input
            id="social-website"
            type="url"
            placeholder="https://…"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save links"}
        </Button>
        {saved ? <span className="text-sm text-success">Saved</span> : null}
      </div>
    </form>
  );
}

function ExperienceSection({ entries }: { entries: Experience[] }) {
  const [addEntry, { isLoading: isAdding }] = useAddExperienceMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateExperienceMutation();
  const [removeEntry] = useRemoveExperienceMutation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [description, setDescription] = useState("");

  function resetForm() {
    setTitle("");
    setCompany("");
    setStartDate("");
    setEndDate("");
    setCurrent(false);
    setDescription("");
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(entry: Experience) {
    setEditingId(entry.id);
    setTitle(entry.title);
    setCompany(entry.company);
    setStartDate(entry.startDate.slice(0, 10));
    setEndDate(entry.endDate ? entry.endDate.slice(0, 10) : "");
    setCurrent(entry.current);
    setDescription(entry.description ?? "");
    setShowForm(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      title,
      company,
      startDate,
      endDate: current ? undefined : endDate || undefined,
      current,
      description: description || undefined,
    };
    if (editingId) {
      await updateEntry({ entryId: editingId, patch: payload }).unwrap();
      toast.success("Experience updated");
    } else {
      await addEntry(payload).unwrap();
      toast.success("Experience added");
    }
    resetForm();
  }

  const isFormOpen = showForm || editingId !== null;

  return (
    <section id="experience-section" className="scroll-mt-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Experience</h2>
        {!isFormOpen && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="size-4" />
            Add
          </Button>
        )}
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {editingId ? "Edit Experience" : "Add Experience"}
            </p>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Cancel" onClick={resetForm}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="exp-title">Title</Label>
              <Input id="exp-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-company">Company</Label>
              <Input id="exp-company" required value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="exp-start">Start date</Label>
              <Input
                id="exp-start"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-end">End date</Label>
              <Input
                id="exp-end"
                type="date"
                disabled={current}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Switch id="exp-current" checked={current} onCheckedChange={setCurrent} />
            <Label htmlFor="exp-current">I currently work here</Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-description">Description (optional)</Label>
            <Textarea id="exp-description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isAdding || isUpdating}>
              {editingId ? (isUpdating ? "Saving…" : "Save Changes") : (isAdding ? "Adding…" : "Add")}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No experience added yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {entry.title} · {entry.company}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  {" – "}
                  {entry.current
                    ? "Present"
                    : entry.endDate
                      ? new Date(entry.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                      : "Present"}
                </p>
                {entry.description ? (
                  <p className="mt-1 truncate text-xs text-muted-foreground">{entry.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => startEdit(entry)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Remove" onClick={() => removeEntry(entry.id)}>
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

function EducationSection({ entries }: { entries: Education[] }) {
  const [addEntry, { isLoading: isAdding }] = useAddEducationMutation();
  const [removeEntry] = useRemoveEducationMutation();
  const [showForm, setShowForm] = useState(false);
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await addEntry({
      school,
      degree: degree || undefined,
      fieldOfStudy: fieldOfStudy || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }).unwrap();
    setSchool("");
    setDegree("");
    setFieldOfStudy("");
    setStartDate("");
    setEndDate("");
    setShowForm(false);
  }

  return (
    <section id="education-section" className="scroll-mt-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Education</h2>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-xl border border-border p-4">
          <div className="space-y-1.5">
            <Label htmlFor="edu-school">School</Label>
            <Input id="edu-school" required value={school} onChange={(e) => setSchool(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edu-degree">Degree (optional)</Label>
              <Input id="edu-degree" value={degree} onChange={(e) => setDegree(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edu-field">Field of study (optional)</Label>
              <Input id="edu-field" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edu-start">Start date (optional)</Label>
              <Input id="edu-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edu-end">End date (optional)</Label>
              <Input id="edu-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={isAdding}>
            {isAdding ? "Adding…" : "Add"}
          </Button>
        </form>
      ) : null}

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No education added yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{entry.school}</p>
                {entry.degree || entry.fieldOfStudy ? (
                  <p className="text-xs text-muted-foreground">
                    {[entry.degree, entry.fieldOfStudy].filter(Boolean).join(", ")}
                  </p>
                ) : null}
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Remove" onClick={() => removeEntry(entry.id)}>
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PortfolioItems({ items }: { items: PortfolioItem[] }) {
  const [addItem, { isLoading: isAdding }] = useAddPortfolioItemMutation();
  const [removeItem] = useRemovePortfolioItemMutation();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [brandUserId, setBrandUserId] = useState<string | null>(null);
  const [manualBrandName, setManualBrandName] = useState<string | null>(null);
  const [manualBrandLogoUrl, setManualBrandLogoUrl] = useState<string | null>(null);
  const [isManualBrand, setIsManualBrand] = useState(false);

  const { data: acceptedBrands } = useGetAcceptedBrandsQuery();

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const metrics = metricLabel.trim() && metricValue.trim() ? [{ label: metricLabel, value: metricValue }] : undefined;
    await addItem({
      title,
      imageUrl,
      link: link.trim() || undefined,
      description: description || undefined,
      metrics,
      brandUserId: isManualBrand ? null : (brandUserId || undefined),
      manualBrandName: isManualBrand ? (manualBrandName?.trim() || undefined) : null,
      manualBrandLogoUrl: isManualBrand ? (manualBrandLogoUrl || undefined) : null,
    }).unwrap();
    setTitle("");
    setImageUrl("");
    setLink("");
    setDescription("");
    setMetricLabel("");
    setMetricValue("");
    setBrandUserId(null);
    setManualBrandName(null);
    setManualBrandLogoUrl(null);
    setIsManualBrand(false);
    setShowForm(false);
  }

  return (
    <section id="portfolio-section" className="scroll-mt-6 rounded-2xl border border-border bg-card p-6">
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
            <Label>Cover file</Label>
            <p className="text-xs text-muted-foreground">Upload an image, PDF, or video to showcase this work.</p>
            <InlineImageUpload kind="portfolio" imageUrl={imageUrl} onUploaded={setImageUrl} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-link">Link (optional)</Label>
            <Input
              id="item-link"
              type="url"
              placeholder="https://…"
              value={link}
              onChange={(e) => setLink(e.target.value)}
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

          <div className="space-y-2 border-t border-border/40 pt-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tag Brand (Optional)</Label>
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Button
                type="button"
                variant={isManualBrand ? "outline" : "default"}
                size="xs"
                className="flex-1 text-[11px]"
                onClick={() => {
                  setIsManualBrand(false);
                  setManualBrandName(null);
                  setManualBrandLogoUrl(null);
                }}
              >
                On Castway
              </Button>
              <Button
                type="button"
                variant={isManualBrand ? "default" : "outline"}
                size="xs"
                className="flex-1 text-[11px]"
                onClick={() => {
                  setIsManualBrand(true);
                  setBrandUserId(null);
                }}
              >
                Brand not on Castway
              </Button>
            </div>

            {isManualBrand ? (
              <div className="space-y-2 pl-1.5 border-l-2 border-border/60">
                <div className="space-y-1">
                  <Label htmlFor="manual-brand-tag-name" className="text-xs">Brand Name</Label>
                  <Input
                    id="manual-brand-tag-name"
                    placeholder="e.g. Pepsi"
                    value={manualBrandName || ""}
                    onChange={(e) => setManualBrandName(e.target.value || null)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Brand Logo</Label>
                  <InlineImageUpload
                    kind="portfolio"
                    imageUrl={manualBrandLogoUrl || ""}
                    onUploaded={setManualBrandLogoUrl}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1 pl-1.5 border-l-2 border-border/60">
                <Label htmlFor="platform-brand-tag-select" className="text-xs">Select Connected Brand</Label>
                <select
                  id="platform-brand-tag-select"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm h-8"
                  value={brandUserId || ""}
                  onChange={(e) => setBrandUserId(e.target.value || null)}
                >
                  <option value="">Choose a brand...</option>
                  {(acceptedBrands?.items || []).map((b) => (
                    <option key={b.brandUserId} value={b.brandUserId}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Result metric (optional)</Label>
            <p className="text-xs text-muted-foreground">
              A number worth highlighting, e.g. a 40% CTR lift from a campaign.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="item-metric-value" className="text-xs font-normal text-muted-foreground">
                  Result
                </Label>
                <Input
                  id="item-metric-value"
                  placeholder="e.g. 40%"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item-metric-label" className="text-xs font-normal text-muted-foreground">
                  What it measures
                </Label>
                <Input
                  id="item-metric-label"
                  placeholder="e.g. CTR lift"
                  value={metricLabel}
                  onChange={(e) => setMetricLabel(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Button type="submit" size="sm" disabled={isAdding || !imageUrl}>
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
              {isImageUrl(item.imageUrl) ? (
                <div className="aspect-video bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
              ) : (
                <a
                  href={item.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex aspect-video items-center justify-center gap-1.5 bg-muted text-xs text-muted-foreground hover:underline"
                >
                  <FileText className="size-4" />
                  View file
                </a>
              )}
              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  {item.description ? (
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  ) : null}
                  {item.brandUserId || item.manualBrandName ? (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-0.5">
                      Brand: {item.manualBrandName || (acceptedBrands?.items || []).find(b => b.brandUserId === item.brandUserId)?.name || "Linked Brand"}
                    </p>
                  ) : null}
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-xs text-primary hover:underline"
                    >
                      {item.link}
                    </a>
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

function RateCardSection({
  items,
  visible,
  minRate,
  maxRate,
}: {
  items: RateCardItem[];
  visible: boolean;
  minRate: number | null;
  maxRate: number | null;
}) {
  const [addItem, { isLoading: isAdding }] = useAddRateCardItemMutation();
  const [removeItem] = useRemoveRateCardItemMutation();
  const [setVisibility, { isLoading: isTogglingVisibility }] = useSetRateCardVisibilityMutation();
  const [updateProfile, { isLoading: isSavingRange }] = useUpdateProfileMutation();
  const [showForm, setShowForm] = useState(false);
  const [deliverableType, setDeliverableType] = useState("");
  const [price, setPrice] = useState("");
  const [rangeMin, setRangeMin] = useState(minRate?.toString() ?? "");
  const [rangeMax, setRangeMax] = useState(maxRate?.toString() ?? "");

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await addItem({ deliverableType, price }).unwrap();
    setDeliverableType("");
    setPrice("");
    setShowForm(false);
  }

  async function handleSaveRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateProfile({
      minRate: rangeMin.trim() ? Number(rangeMin) : undefined,
      maxRate: rangeMax.trim() ? Number(rangeMax) : undefined,
    }).unwrap();
    toast.success("Rate range saved");
  }

  return (
    <section id="rate-card-section" className="scroll-mt-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Rate card</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Indicative pricing by deliverable, shown on your public profile when public.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          Add rate
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <Switch
          id="rate-card-visible"
          checked={visible}
          disabled={isTogglingVisibility}
          onCheckedChange={(checked) => setVisibility(checked)}
        />
        <Label htmlFor="rate-card-visible">
          {visible ? "Public — visible on your profile" : "Private — only visible to you"}
        </Label>
      </div>

      <form onSubmit={handleSaveRange} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="rate-range-min">Typical rate — from</Label>
          <Input
            id="rate-range-min"
            type="number"
            min={0}
            inputMode="numeric"
            value={rangeMin}
            onChange={(e) => setRangeMin(e.target.value)}
            placeholder="e.g. 500"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rate-range-max">To</Label>
          <Input
            id="rate-range-max"
            type="number"
            min={0}
            inputMode="numeric"
            value={rangeMax}
            onChange={(e) => setRangeMax(e.target.value)}
            placeholder="e.g. 2000"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" disabled={isSavingRange}>
          {isSavingRange ? "Saving…" : "Save range"}
        </Button>
      </form>

      {showForm ? (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-xl border border-border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rate-deliverable">Deliverable</Label>
              <Input
                id="rate-deliverable"
                required
                placeholder="e.g. Instagram Reel"
                value={deliverableType}
                onChange={(e) => setDeliverableType(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-price">Price</Label>
              <Input
                id="rate-price"
                required
                placeholder="e.g. $500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={isAdding}>
            {isAdding ? "Adding…" : "Add"}
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No rates added yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.deliverableType}</p>
                <p className="text-xs text-muted-foreground">{item.price}</p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Remove" onClick={() => removeItem(item.id)}>
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CaseStudySection({ items }: { items: CaseStudy[] }) {
  const [addItem, { isLoading: isAdding }] = useAddCaseStudyMutation();
  const [removeItem] = useRemoveCaseStudyMutation();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const metrics = metricLabel.trim() && metricValue.trim() ? [{ label: metricLabel, value: metricValue }] : undefined;
    await addItem({ title, brief, action, result, metrics }).unwrap();
    setTitle("");
    setBrief("");
    setAction("");
    setResult("");
    setMetricLabel("");
    setMetricValue("");
    setShowForm(false);
  }

  return (
    <section id="case-studies-section" className="scroll-mt-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Case studies</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Structured brief / action / result write-ups, shown on your public profile.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          Add case study
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-xl border border-border p-4">
          <div className="space-y-1.5">
            <Label htmlFor="case-title">Title</Label>
            <Input id="case-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="case-brief">Brief</Label>
            <Textarea
              id="case-brief"
              required
              rows={2}
              placeholder="The situation or problem"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="case-action">Action</Label>
            <Textarea
              id="case-action"
              required
              rows={2}
              placeholder="What you did"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="case-result">Result</Label>
            <Textarea
              id="case-result"
              required
              rows={2}
              placeholder="The outcome"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Result metric (optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="case-metric-value" className="text-xs font-normal text-muted-foreground">
                  Result
                </Label>
                <Input
                  id="case-metric-value"
                  placeholder="e.g. 3x"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="case-metric-label" className="text-xs font-normal text-muted-foreground">
                  What it measures
                </Label>
                <Input
                  id="case-metric-label"
                  placeholder="e.g. Signup lift"
                  value={metricLabel}
                  onChange={(e) => setMetricLabel(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Button type="submit" size="sm" disabled={isAdding}>
            {isAdding ? "Adding…" : "Add"}
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No case studies added yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <Button variant="ghost" size="icon-sm" aria-label="Remove" onClick={() => removeItem(item.id)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {item.metrics.length > 0 ? (
                <p className="mt-1 text-xs font-medium text-primary">
                  {item.metrics.map((m) => `${m.value} ${m.label}`).join(" · ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SubSpecializationsSection({ tags }: { tags: string[] }) {
  const [updateTags, { isLoading }] = useUpdateSubSpecializationsMutation();
  const [value, setValue] = useState(tags.join(", "));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timeout);
  }, [saved]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateTags(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ).unwrap();
    setSaved(true);
  }

  return (
    <form
      id="sub-specializations-section"
      onSubmit={handleSubmit}
      className="scroll-mt-6 space-y-3 rounded-2xl border border-border bg-card p-6"
    >
      <div>
        <h2 className="text-sm font-semibold text-foreground">Sub-specializations</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Granular niche tags beyond your broad category — searchable and filterable.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sub-specializations">Tags (comma-separated)</Label>
        <Input
          id="sub-specializations"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. B2B SaaS onboarding, Fintech dashboards"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save tags"}
        </Button>
        {saved ? <span className="text-sm text-success">Saved</span> : null}
      </div>
    </form>
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
    <section id="availability-section" className="scroll-mt-6 rounded-2xl border border-border bg-card p-6">
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

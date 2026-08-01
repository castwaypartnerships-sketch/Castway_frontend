"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Lock,
  Monitor,
  Moon,
  Plus,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Sun,
  Trash2,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  useChangePasswordMutation,
  useConfirmEmailChangeMutation,
  useDeleteAccountMutation,
  useGetNotificationPreferencesQuery,
  useGetPrivacySettingsQuery,
  useLogoutEverywhereMutation,
  useRequestEmailChangeMutation,
  useUpdateNotificationPreferencesMutation,
  useUpdatePrivacySettingsMutation,
  type NotificationPreferences,
  type PrivacySettings,
  type Visibility,
} from "@/lib/redux/endpoints/account-api";
import { useGetSessionQuery, useLogoutMutation } from "@/lib/redux/endpoints/auth-api";
import {
  useGetOwnProfileQuery,
  useUpdateProfileMutation,
  useUpdateSocialLinksMutation,
  useUpdateSubSpecializationsMutation,
} from "@/lib/redux/endpoints/profile-api";
import {
  useGetBlockedConnectionsQuery,
  useUnblockUserMutation,
} from "@/lib/redux/endpoints/connections-api";
import {
  useCreateProposalTemplateMutation,
  useGetProposalTemplatesQuery,
  useRemoveProposalTemplateMutation,
} from "@/lib/redux/endpoints/proposal-templates-api";
import {
  useAcceptRosterInviteMutation,
  useDeclineRosterInviteMutation,
  useGetPendingRosterInvitesQuery,
} from "@/lib/redux/endpoints/roster-api";
import { InlineImageUpload } from "@/components/upload/inline-image-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isTalentRole } from "@/lib/rbac";
import { initialsFromName } from "@/lib/format";
import { cn } from "@/lib/utils";

// Scoped to this page — the shared `Switch` component defaults its checked
// state to the site-wide purple `--primary`, but every other accent on
// Settings has been re-themed to the Figma/homepage green.
const GREEN_SWITCH = "data-checked:bg-[#476948] dark:data-checked:bg-[#1c3322]";

const SETTINGS_SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Visibility", icon: Lock },
  { id: "security", label: "Security", icon: Shield },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
] as const;

type SectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("account");
  const { data: session } = useGetSessionQuery();
  const isFreelancer = session?.user?.role === "FREELANCER";
  const isTalent = isTalentRole(session?.user?.role);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <nav className="mt-6 space-y-0.5">
          {SETTINGS_SECTIONS.map((section) => {
            const isActive = section.id === activeSection;
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#e6f4ea] text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        {activeSection === "account" ? (
          <>
            <AccountPanel email={session?.user?.email} />
            {isTalent ? <RosterInvitesCard /> : null}
            {isFreelancer ? <ProposalTemplatesCard /> : null}
          </>
        ) : null}
        {activeSection === "profile" ? <ProfilePanel /> : null}
        {activeSection === "notifications" ? <NotificationsPanel /> : null}
        {activeSection === "privacy" ? <PrivacyPanel /> : null}
        {activeSection === "security" ? (
          <>
            <ChangePasswordCard />
            <SecurityCard />
          </>
        ) : null}
        {activeSection === "preferences" ? <PreferencesPanel /> : null}
      </div>
    </div>
  );
}

function AccountPanel({ email }: { email: string | undefined }) {
  const router = useRouter();
  const { data: profileData } = useGetOwnProfileQuery();
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [requestEmailChange, { isLoading: isRequesting }] = useRequestEmailChangeMutation();
  const [confirmEmailChange, { isLoading: isConfirming }] = useConfirmEmailChangeMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [logout] = useLogoutMutation();

  const [name, setName] = useState(profileData?.profile?.name ?? "");
  const [username, setUsername] = useState(profileData?.profile?.username ?? "");
  const [contactNumber, setContactNumber] = useState(profileData?.profile?.contactNumber ?? "");
  const [initialized, setInitialized] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  if (!initialized && profileData?.profile) {
    setInitialized(true);
    setName(profileData.profile.name);
    setUsername(profileData.profile.username);
    setContactNumber(profileData.profile.contactNumber ?? "");
  }

  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [pendingChange, setPendingChange] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSaveAccount() {
    setAccountError(null);
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        contactNumber: contactNumber.trim() || undefined,
      }).unwrap();
      toast.success("Account details saved.");
    } catch {
      setAccountError("Couldn't save — that username may already be taken.");
    }
  }

  async function handleRequestChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError(null);
    try {
      await requestEmailChange({ newEmail }).unwrap();
      setPendingChange(true);
      toast.success("Check your new email for a confirmation code.");
    } catch {
      setEmailError("Couldn't start that email change. Please try again.");
    }
  }

  async function handleConfirmChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError(null);
    try {
      await confirmEmailChange({ code }).unwrap();
      toast.success("Email address updated.");
      setPendingChange(false);
      setNewEmail("");
      setCode("");
    } catch {
      setEmailError("Invalid or expired code. Please try again.");
    }
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Delete your account? This permanently removes your profile, posts, applications, and connections. This can't be undone.",
      )
    ) {
      return;
    }
    try {
      await deleteAccount().unwrap();
      await logout();
      router.push("/login");
    } catch {
      toast.error("Couldn't delete your account. Please try again.");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Account Settings</h2>
      <p className="text-xs text-muted-foreground">Manage your basic account information.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full-name">Full Name</Label>
          <Input id="full-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
          />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      {accountError ? <p className="mt-2 text-sm text-destructive">{accountError}</p> : null}

      <Button
        size="sm"
        className="mt-4 bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
        disabled={isSavingProfile}
        onClick={() => void handleSaveAccount()}
      >
        {isSavingProfile ? "Saving…" : "Save Changes"}
      </Button>

      <div className="mt-6 border-t border-border pt-4">
        <Label>Email address</Label>
        <p className="text-sm text-foreground">{email}</p>

        {!pendingChange ? (
          <form onSubmit={handleRequestChange} className="mt-3 flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="new-email">Change email</Label>
              <Input
                id="new-email"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
              />
            </div>
            <Button type="submit" variant="outline" disabled={isRequesting}>
              {isRequesting ? "Sending…" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleConfirmChange} className="mt-3 flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="email-change-code">Confirmation code</Label>
              <Input
                id="email-change-code"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
              />
            </div>
            <Button type="submit" disabled={isConfirming || code.length !== 6}>
              {isConfirming ? "Confirming…" : "Confirm"}
            </Button>
          </form>
        )}
        {emailError ? <p className="mt-2 text-sm text-destructive">{emailError}</p> : null}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <p className="text-xs font-bold tracking-wide text-destructive uppercase">Danger zone</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Permanently delete your account and all associated data.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-3"
          disabled={isDeleting}
          onClick={() => void handleDeleteAccount()}
        >
          {isDeleting ? "Deleting…" : "Delete account"}
        </Button>
      </div>
    </section>
  );
}

function ProfilePanel() {
  const { data, isLoading } = useGetOwnProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const [updateSubSpecializations] = useUpdateSubSpecializationsMutation();
  const [updateSocialLinks, { isLoading: isSavingSocial }] = useUpdateSocialLinksMutation();

  const [bio, setBio] = useState("");
  const [nicheInput, setNicheInput] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (!initialized && data?.profile) {
    setInitialized(true);
    setBio(data.profile.bio ?? "");
    setInstagram(data.profile.socialLinks?.instagram ?? "");
    setYoutube(data.profile.socialLinks?.youtube ?? "");
    setLinkedin(data.profile.socialLinks?.linkedin ?? "");
    setWebsite(data.profile.socialLinks?.website ?? "");
  }

  if (isLoading || !data?.profile) {
    return <div className="h-64 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  const profile = data.profile;
  const niches = profile.subSpecializations;

  async function handleAddNiche() {
    const tag = nicheInput.trim();
    if (!tag || niches.includes(tag)) {
      setNicheInput("");
      return;
    }
    await updateSubSpecializations([...niches, tag]);
    setNicheInput("");
  }

  async function handleRemoveNiche(tag: string) {
    await updateSubSpecializations(niches.filter((n) => n !== tag));
  }

  async function handleSaveBio() {
    try {
      await updateProfile({ bio: bio.trim() || undefined }).unwrap();
      toast.success("Bio saved.");
    } catch {
      toast.error("Couldn't save your bio. Please try again.");
    }
  }

  async function handleSaveSocialLinks() {
    try {
      await updateSocialLinks({
        instagram: instagram.trim() || null,
        youtube: youtube.trim() || null,
        linkedin: linkedin.trim() || null,
        website: website.trim() || null,
      }).unwrap();
      toast.success("Social links saved.");
    } catch {
      toast.error("Couldn't save your social links. Please try again.");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Profile Settings</h2>
      <p className="text-xs text-muted-foreground">How you appear to others on Castway.</p>

      <div className="mt-4 flex items-center gap-4">
        <Avatar size="lg" className="size-16">
          <AvatarImage src={profile.avatarUrl ?? undefined} />
          <AvatarFallback>{initialsFromName(profile.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <div className="mt-1 flex items-center gap-2">
            <InlineImageUpload
              kind="avatars"
              imageUrl={profile.avatarUrl ?? ""}
              onUploaded={(url) => updateProfile({ avatarUrl: url })}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-1.5">
        <Label>Cover Banner</Label>
        <InlineImageUpload
          kind="covers"
          imageUrl={profile.coverImageUrl ?? ""}
          onUploaded={(url) => updateProfile({ coverImageUrl: url })}
          onRemove={() => updateProfile({ coverImageUrl: undefined })}
        />
      </div>

      <div className="mt-6 space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">Bio</Label>
          <span className="text-xs text-muted-foreground">{bio.length}/1000</span>
        </div>
        <Textarea
          id="bio"
          rows={3}
          maxLength={1000}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onBlur={() => void handleSaveBio()}
        />
      </div>

      <div className="mt-6 space-y-1.5">
        <Label>Content Niche</Label>
        <div className="flex flex-wrap items-center gap-2">
          {niches.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-semibold text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]"
            >
              {tag}
              <button type="button" onClick={() => void handleRemoveNiche(tag)} aria-label={`Remove ${tag}`}>
                <X className="size-3" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1.5">
            <Input
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddNiche();
                }
              }}
              placeholder="Add niche"
              className="h-7 w-32"
            />
            <Button type="button" variant="outline" size="icon-sm" onClick={() => void handleAddNiche()}>
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-muted p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Open to Work</p>
          <p className="text-xs text-muted-foreground">Show recruiters and agencies you are available.</p>
        </div>
        <Switch
          className={GREEN_SWITCH}
          checked={profile.availableForWork}
          onCheckedChange={(checked) => updateProfile({ availableForWork: checked })}
        />
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Social Connections</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="instagram.com/username"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="Channel URL"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Portfolio URL</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="yoursite.com"
            />
          </div>
        </div>
        <Button
          size="sm"
          className="mt-4 bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
          disabled={isSavingSocial}
          onClick={() => void handleSaveSocialLinks()}
        >
          {isSavingSocial ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span>Changes will be visible to everyone on Castway</span>
        <Link
          href={`/profile/${profile.username}`}
          className="font-semibold text-[#476948] hover:underline dark:text-[#a7d9b5]"
        >
          Preview Public Profile
        </Link>
      </div>
    </section>
  );
}

function RosterInvitesCard() {
  const { data, isLoading } = useGetPendingRosterInvitesQuery();
  const [accept] = useAcceptRosterInviteMutation();
  const [decline] = useDeclineRosterInviteMutation();

  if (!isLoading && (!data || data.items.length === 0)) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Roster invites</h2>
      <p className="text-xs text-muted-foreground">Agencies that want to represent you.</p>
      {isLoading ? (
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-muted" />
      ) : (
        <ul className="mt-4 space-y-2">
          {data!.items.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <Avatar>
                <AvatarImage src={entry.agency?.avatarUrl ?? undefined} />
                <AvatarFallback>{initialsFromName(entry.agency?.name ?? "?")}</AvatarFallback>
              </Avatar>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {entry.agency?.name}
              </p>
              <Button size="sm" onClick={() => accept(entry.id)}>
                Accept
              </Button>
              <Button size="sm" variant="ghost" onClick={() => decline(entry.id)}>
                Decline
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProposalTemplatesCard() {
  const { data, isLoading } = useGetProposalTemplatesQuery();
  const [createTemplate, { isLoading: isCreating }] = useCreateProposalTemplateMutation();
  const [removeTemplate] = useRemoveProposalTemplateMutation();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createTemplate({ title, body }).unwrap();
    setTitle("");
    setBody("");
    setShowForm(false);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Proposal templates</h2>
          <p className="text-xs text-muted-foreground">
            Reusable pitches you can drop into an application in one click.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          New template
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-xl border border-border p-4">
          <div className="space-y-1.5">
            <Label htmlFor="template-title">Title</Label>
            <Input
              id="template-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Standard editing pitch"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="template-body">Body</Label>
            <Textarea
              id="template-body"
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" disabled={isCreating}>
            {isCreating ? "Saving…" : "Save template"}
          </Button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No templates yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.items.map((template) => (
            <li
              key={template.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{template.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{template.body}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete template"
                onClick={() => removeTemplate(template.id)}
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

function ChangePasswordCard() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    try {
      await changePassword({ currentPassword: currentPassword || undefined, newPassword }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Change password</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Leave blank if you signed up with Google"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {status === "error" ? (
          <p className="text-sm text-destructive">Couldn&apos;t update your password. Check your current password.</p>
        ) : null}
        {status === "saved" ? <p className="text-sm text-success">Password updated.</p> : null}

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
        >
          {isLoading ? "Saving…" : "Update password"}
        </Button>
      </form>
    </section>
  );
}

function SecurityCard() {
  const [logoutEverywhere, { isLoading }] = useLogoutEverywhereMutation();

  async function handleLogoutEverywhere() {
    if (
      !confirm(
        "Log out of every other device? This device stays signed in; all others will need to sign in again.",
      )
    ) {
      return;
    }
    try {
      await logoutEverywhere().unwrap();
      toast.success("Logged out everywhere else.");
    } catch {
      toast.error("Couldn't log out other sessions. Please try again.");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Security</h2>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Log out everywhere</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign out of Castway on every other device and browser. This device stays signed in.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={isLoading}
          onClick={() => void handleLogoutEverywhere()}
        >
          <ShieldAlert className="size-4" />
          {isLoading ? "Logging out…" : "Log out everywhere"}
        </Button>
      </div>
    </section>
  );
}

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: "PUBLIC", label: "Everyone" },
  { value: "CONNECTIONS_ONLY", label: "Connections only" },
];

function PrivacyPanel() {
  const { data, isLoading } = useGetPrivacySettingsQuery();
  const [updatePrivacySettings] = useUpdatePrivacySettingsMutation();
  const [override, setOverride] = useState<PrivacySettings | null>(null);
  const settings = override ?? data ?? null;

  const { data: blocked, isLoading: isLoadingBlocked } = useGetBlockedConnectionsQuery();
  const [unblock] = useUnblockUserMutation();

  async function handleChange(next: PrivacySettings) {
    setOverride(next);
    try {
      await updatePrivacySettings(next).unwrap();
    } catch {
      toast.error("Couldn't save that privacy setting. Please try again.");
      setOverride(data ?? null);
    }
  }

  async function handleUnblock(connectionId: string, name: string) {
    try {
      await unblock(connectionId).unwrap();
      toast.success(`Unblocked ${name}`);
    } catch {
      toast.error("Couldn't unblock that user. Please try again.");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Privacy & Visibility</h2>
      <p className="text-xs text-muted-foreground">Control how your profile and activity are seen by others.</p>

      {isLoading || !settings ? (
        <div className="mt-4 h-32 animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="profile-visibility">Who can view your profile</Label>
              <p className="text-xs text-muted-foreground">
                Connections-only hides your profile page from everyone else.
              </p>
            </div>
            <Select
              value={settings.profileVisibility}
              onValueChange={(value) => handleChange({ ...settings, profileVisibility: value as Visibility })}
            >
              <SelectTrigger id="profile-visibility" className="w-44 shrink-0">
                <SelectValue>
                  {(value: Visibility) => VISIBILITY_OPTIONS.find((o) => o.value === value)?.label ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="message-permission">Who can message you</Label>
              <p className="text-xs text-muted-foreground">
                Connections-only blocks a first message from anyone you&apos;re not connected with.
              </p>
            </div>
            <Select
              value={settings.messagePermission}
              onValueChange={(value) => handleChange({ ...settings, messagePermission: value as Visibility })}
            >
              <SelectTrigger id="message-permission" className="w-44 shrink-0">
                <SelectValue>
                  {(value: Visibility) => VISIBILITY_OPTIONS.find((o) => o.value === value)?.label ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="accepting-connection-requests">Accepting connection requests</Label>
              <p className="text-xs text-muted-foreground">
                Turn off to stop new connection requests from reaching you.
              </p>
            </div>
            <Switch
              id="accepting-connection-requests"
              className={GREEN_SWITCH}
              checked={settings.acceptingConnectionRequests}
              onCheckedChange={(checked) => handleChange({ ...settings, acceptingConnectionRequests: checked })}
            />
          </div>

          <div className="border-t border-border pt-4">
            <Label>Blocked Accounts</Label>
            {isLoadingBlocked ? (
              <div className="mt-2 h-12 animate-pulse rounded-xl bg-muted" />
            ) : !blocked || blocked.items.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No blocked users.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {blocked.items.map((connection) => (
                  <li
                    key={connection.id}
                    className="flex items-center gap-3 rounded-xl bg-muted p-3"
                  >
                    <Avatar size="sm">
                      <AvatarImage src={connection.counterpart.avatarUrl ?? undefined} />
                      <AvatarFallback>{initialsFromName(connection.counterpart.name)}</AvatarFallback>
                    </Avatar>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {connection.counterpart.name}
                    </p>
                    <button
                      type="button"
                      className="text-sm font-medium text-destructive hover:underline"
                      onClick={() => void handleUnblock(connection.id, connection.counterpart.name)}
                    >
                      Unblock
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function PreferencesPanel() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Preferences</h2>
      <p className="text-xs text-muted-foreground">Personalize your interface.</p>
      <div className="mt-4 space-y-1.5">
        <Label>Theme</Label>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5",
                theme === option.value &&
                  "border-transparent bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]",
              )}
              onClick={() => setTheme(option.value)}
            >
              <option.icon className="size-4" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Language, timezone, and currency preferences aren&apos;t available yet — Castway doesn&apos;t have
        localization or multi-currency support built.
      </p>
    </section>
  );
}

type BooleanPreferenceKey = {
  [K in keyof NotificationPreferences]: NotificationPreferences[K] extends boolean ? K : never;
}[keyof NotificationPreferences];

const CATEGORY_ROWS: { key: BooleanPreferenceKey; emailKey: BooleanPreferenceKey; label: string; description: string }[] = [
  {
    key: "connectionRequests",
    emailKey: "connectionRequestsEmail",
    label: "Connection requests",
    description: "Alerts for new people wanting to join your network.",
  },
  {
    key: "messages",
    emailKey: "messagesEmail",
    label: "New messages",
    description: "When someone sends you a direct message.",
  },
  {
    key: "applicationUpdates",
    emailKey: "applicationUpdatesEmail",
    label: "Application status updates",
    description: "Real-time updates on your job or project applications.",
  },
  {
    key: "postActivity",
    emailKey: "postActivityEmail",
    label: "Likes and comments",
    description: "Activity on the posts you've shared.",
  },
  {
    key: "reviewsAndEndorsements",
    emailKey: "reviewsAndEndorsementsEmail",
    label: "Reviews and skill endorsements",
    description: "When someone reviews or endorses you.",
  },
];

function NotificationsPanel() {
  const { data, isLoading } = useGetNotificationPreferencesQuery();
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();
  const [override, setOverride] = useState<NotificationPreferences | null>(null);
  const preferences = override ?? data ?? null;

  function handleUpdate(next: NotificationPreferences) {
    setOverride(next);
    updatePreferences(next);
  }

  function handleToggle(key: BooleanPreferenceKey, value: boolean) {
    if (!preferences) return;
    handleUpdate({ ...preferences, [key]: value });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Notification Preferences</h2>
      <p className="text-xs text-muted-foreground">Choose how and when you want to be notified.</p>

      {isLoading || !preferences ? (
        <div className="mt-4 h-64 animate-pulse rounded-xl bg-muted" />
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                  <th className="py-2 font-bold">Activity Type</th>
                  <th className="w-20 py-2 text-center font-bold">In-App</th>
                  <th className="w-20 py-2 text-center font-bold">Email</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORY_ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-border last:border-0">
                    <td className="py-3">
                      <p className="font-medium text-foreground">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{row.description}</p>
                    </td>
                    <td className="py-3 text-center">
                      <Switch
                        className={cn(GREEN_SWITCH, "align-middle")}
                        size="sm"
                        checked={preferences[row.key]}
                        onCheckedChange={(checked) => handleToggle(row.key, checked)}
                      />
                    </td>
                    <td className="py-3 text-center">
                      <Switch
                        className={cn(GREEN_SWITCH, "align-middle")}
                        size="sm"
                        checked={preferences[row.emailKey]}
                        onCheckedChange={(checked) => handleToggle(row.emailKey, checked)}
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3">
                    <p className="font-medium text-foreground">Weekly digest</p>
                    <p className="text-xs text-muted-foreground">
                      A weekly email summarizing your connections, messages, and applications.
                    </p>
                  </td>
                  <td className="py-3 text-center text-muted-foreground">—</td>
                  <td className="py-3 text-center">
                    <Switch
                      className={cn(GREEN_SWITCH, "align-middle")}
                      size="sm"
                      checked={preferences.weeklyDigestOptIn}
                      onCheckedChange={(checked) => handleToggle("weeklyDigestOptIn", checked)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-xl bg-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quietHoursEnabled">Do Not Disturb</Label>
                <p className="text-xs text-muted-foreground">Pause new notifications during a daily window.</p>
              </div>
              <Switch
                id="quietHoursEnabled"
                className={GREEN_SWITCH}
                checked={preferences.quietHoursEnabled}
                onCheckedChange={(checked) => handleToggle("quietHoursEnabled", checked)}
              />
            </div>
            {preferences.quietHoursEnabled ? (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="quietHoursStart">From</Label>
                  <Input
                    id="quietHoursStart"
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) => handleUpdate({ ...preferences, quietHoursStart: e.target.value })}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="quietHoursEnd">To</Label>
                  <Input
                    id="quietHoursEnd"
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => handleUpdate({ ...preferences, quietHoursEnd: e.target.value })}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            There&apos;s no Push channel — Castway has no push-notification infrastructure yet, so only In-App and
            Email are real delivery paths.
          </p>
        </>
      )}
    </section>
  );
}

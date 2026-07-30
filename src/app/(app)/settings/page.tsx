"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronRight, Moon, Monitor, Plus, ShieldAlert, Sun, Trash2 } from "lucide-react";
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
import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isTalentRole } from "@/lib/rbac";
import { initialsFromName } from "@/lib/format";

export default function SettingsPage() {
  const { data: session } = useGetSessionQuery();
  const isFreelancer = session?.user?.role === "FREELANCER";
  const isTalent = isTalentRole(session?.user?.role);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, privacy, and notifications.</p>
      </div>

      <ProfileSettingsCard />
      <AccountCard email={session?.user?.email} />
      <ChangePasswordCard />
      <SecurityCard />
      <PrivacyCard />
      <AppearanceCard />
      <NotificationPreferencesCard />
      {isTalent ? <RosterInvitesCard /> : null}
      {isFreelancer ? <ProposalTemplatesCard /> : null}
    </div>
  );
}

function ProfileSettingsCard() {
  const { data, isLoading } = useGetOwnProfileQuery();

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Profile Settings</h2>
      <p className="text-xs text-muted-foreground">How you appear to others on Castway.</p>

      {isLoading ? (
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-muted" />
      ) : (
        <Link
          href="/portfolio"
          className="mt-4 flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted"
        >
          <Avatar size="lg">
            <AvatarImage src={data?.profile?.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(data?.profile?.name ?? "?")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{data?.profile?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {data?.profile?.bio || "Add a bio, photo, and social links"}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      )}
    </section>
  );
}

function AccountCard({ email }: { email: string | undefined }) {
  const router = useRouter();
  const [requestEmailChange, { isLoading: isRequesting }] = useRequestEmailChangeMutation();
  const [confirmEmailChange, { isLoading: isConfirming }] = useConfirmEmailChangeMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [logout] = useLogoutMutation();
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [pendingChange, setPendingChange] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await requestEmailChange({ newEmail }).unwrap();
      setPendingChange(true);
      toast.success("Check your new email for a confirmation code.");
    } catch {
      setError("Couldn't start that email change. Please try again.");
    }
  }

  async function handleConfirmChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await confirmEmailChange({ code }).unwrap();
      toast.success("Email address updated.");
      setPendingChange(false);
      setNewEmail("");
      setCode("");
    } catch {
      setError("Invalid or expired code. Please try again.");
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
      <h2 className="text-sm font-semibold text-foreground">Account</h2>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="current-email">Email address</Label>
        <p id="current-email" className="text-sm text-foreground">
          {email}
        </p>
      </div>

      {!pendingChange ? (
        <form onSubmit={handleRequestChange} className="mt-4 flex items-end gap-2">
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
        <form onSubmit={handleConfirmChange} className="mt-4 flex items-end gap-2">
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

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      <div className="mt-6 border-t border-border pt-4">
        <p className="text-sm font-medium text-destructive">Danger zone</p>
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

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
      <p className="text-xs text-muted-foreground">Choose how Castway looks on this device.</p>
      <div className="mt-4 flex gap-2">
        {THEME_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={theme === option.value ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setTheme(option.value)}
          >
            <option.icon className="size-4" />
            {option.label}
          </Button>
        ))}
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

        <Button type="submit" disabled={isLoading}>
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

function PrivacyCard() {
  const { data, isLoading } = useGetPrivacySettingsQuery();
  const [updatePrivacySettings] = useUpdatePrivacySettingsMutation();
  const [override, setOverride] = useState<PrivacySettings | null>(null);
  const settings = override ?? data ?? null;

  async function handleChange(next: PrivacySettings) {
    setOverride(next);
    try {
      await updatePrivacySettings(next).unwrap();
    } catch {
      toast.error("Couldn't save that privacy setting. Please try again.");
      setOverride(data ?? null);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Privacy</h2>

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
                <SelectValue />
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
                <SelectValue />
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
              checked={settings.acceptingConnectionRequests}
              onCheckedChange={(checked) => handleChange({ ...settings, acceptingConnectionRequests: checked })}
            />
          </div>

          <div className="border-t border-border pt-4">
            <Link
              href="/connections?tab=blocked"
              className="text-sm font-medium text-[#476948] hover:underline dark:text-[#a7d9b5]"
            >
              Manage blocked users →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

const PREFERENCE_LABELS: { key: keyof NotificationPreferences; label: string }[] = [
  { key: "connectionRequests", label: "Connection requests" },
  { key: "messages", label: "New messages" },
  { key: "applicationUpdates", label: "Application status updates" },
  { key: "postActivity", label: "Likes and comments on your posts" },
  { key: "reviewsAndEndorsements", label: "Reviews and skill endorsements" },
];

function NotificationPreferencesCard() {
  const { data, isLoading } = useGetNotificationPreferencesQuery();
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();
  const [override, setOverride] = useState<NotificationPreferences | null>(null);
  const preferences = override ?? data ?? null;

  function handleUpdate(next: NotificationPreferences) {
    setOverride(next);
    updatePreferences(next);
  }

  function handleToggle(key: keyof NotificationPreferences, value: boolean) {
    if (!preferences) return;
    handleUpdate({ ...preferences, [key]: value });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
      {isLoading || !preferences ? (
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-muted" />
      ) : (
        <>
          <ul className="mt-4 space-y-4">
            {PREFERENCE_LABELS.map((pref) => (
              <li key={pref.key} className="flex items-center justify-between">
                <Label htmlFor={pref.key}>{pref.label}</Label>
                <Switch
                  id={pref.key}
                  checked={preferences[pref.key]}
                  onCheckedChange={(checked) => handleToggle(pref.key, checked)}
                />
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <Label htmlFor="weeklyDigestOptIn">Weekly digest</Label>
                <p className="text-xs text-muted-foreground">
                  A weekly email summarizing your connections, messages, and applications.
                </p>
              </div>
              <Switch
                id="weeklyDigestOptIn"
                checked={preferences.weeklyDigestOptIn}
                onCheckedChange={(checked) => handleToggle("weeklyDigestOptIn", checked)}
              />
            </li>
          </ul>

          <div className="mt-6 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quietHoursEnabled">Do Not Disturb</Label>
                <p className="text-xs text-muted-foreground">Pause new notifications during a daily window.</p>
              </div>
              <Switch
                id="quietHoursEnabled"
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
        </>
      )}
    </section>
  );
}

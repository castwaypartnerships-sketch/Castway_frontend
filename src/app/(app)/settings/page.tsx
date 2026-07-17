"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  useChangePasswordMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  type NotificationPreferences,
} from "@/lib/redux/endpoints/account-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isTalentRole } from "@/lib/rbac";
import { initialsFromName } from "@/lib/format";

export default function SettingsPage() {
  const { data: session } = useGetSessionQuery();
  const isFreelancer = session?.user?.role === "FREELANCER";
  const isTalent = isTalentRole(session?.user?.role);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account security and notifications.</p>
      </div>

      <ChangePasswordCard />
      <NotificationPreferencesCard />
      {isTalent ? <RosterInvitesCard /> : null}
      {isFreelancer ? <ProposalTemplatesCard /> : null}
    </div>
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

const PREFERENCE_LABELS: { key: keyof NotificationPreferences; label: string }[] = [
  { key: "connectionRequests", label: "Connection requests" },
  { key: "messages", label: "New messages" },
  { key: "applicationUpdates", label: "Application status updates" },
];

function NotificationPreferencesCard() {
  const { data, isLoading } = useGetNotificationPreferencesQuery();
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();
  const [override, setOverride] = useState<NotificationPreferences | null>(null);
  const preferences = override ?? data ?? null;

  function handleToggle(key: keyof NotificationPreferences, value: boolean) {
    if (!preferences) return;
    const next = { ...preferences, [key]: value };
    setOverride(next);
    updatePreferences(next);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
      {isLoading || !preferences ? (
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-muted" />
      ) : (
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
        </ul>
      )}
    </section>
  );
}

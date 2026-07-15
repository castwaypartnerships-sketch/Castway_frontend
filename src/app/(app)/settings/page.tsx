"use client";

import { useState, type FormEvent } from "react";

import {
  useChangePasswordMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  type NotificationPreferences,
} from "@/lib/redux/endpoints/account-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account security and notifications.</p>
      </div>

      <ChangePasswordCard />
      <NotificationPreferencesCard />
    </div>
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

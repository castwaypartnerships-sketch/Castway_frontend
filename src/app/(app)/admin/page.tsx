"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetAdminUsersQuery, useSetUserVerifiedMutation } from "@/lib/redux/endpoints/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isLoading: isSessionLoading } = useGetSessionQuery();
  const isAdmin = session?.user?.isAdmin ?? false;

  useEffect(() => {
    if (!isSessionLoading && !isAdmin) router.replace("/dashboard");
  }, [isSessionLoading, isAdmin, router]);

  if (isSessionLoading || !isAdmin) {
    return <div className="flex min-h-[50vh] items-center justify-center" />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <h1 className="text-lg font-semibold text-foreground">Admin</h1>
      <p className="text-sm text-muted-foreground">Grant or revoke the verified badge.</p>

      <UsersTable />
    </div>
  );
}

function UsersTable() {
  const { data, isLoading } = useGetAdminUsersQuery();
  const [setVerified, { isLoading: isUpdating }] = useSetUserVerifiedMutation();

  if (isLoading) {
    return <div className="mt-6 h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  if (!data || data.items.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No users found.
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {data.items.map((user) => (
        <li
          key={user.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
              {user.email}
              {user.isVerified ? <BadgeCheck className="size-3.5 shrink-0 text-primary" /> : null}
            </p>
            <p className="text-xs text-muted-foreground">
              {user.role ?? "No role"}
              {user.suspendedAt ? " · Suspended" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user.isAdmin ? <Badge variant="secondary">Admin</Badge> : null}
            <Button
              variant={user.isVerified ? "outline" : "default"}
              size="sm"
              disabled={isUpdating}
              onClick={() => setVerified({ userId: user.id, verified: !user.isVerified })}
            >
              {user.isVerified ? "Unverify" : "Verify"}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

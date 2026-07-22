"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetAdminUsersQuery, useSetUserVerifiedMutation } from "@/lib/redux/endpoints/admin-api";
import {
  useApproveVerificationMutation,
  useClaimVerificationMutation,
  useGetPendingVerificationsQuery,
  useRejectVerificationMutation,
} from "@/lib/redux/endpoints/verification-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isLoading: isSessionLoading } = useGetSessionQuery();
  const isAdmin = session?.user?.isAdmin ?? false;

  useEffect(() => {
    if (!isSessionLoading && !isAdmin) router.replace("/home");
  }, [isSessionLoading, isAdmin, router]);

  if (isSessionLoading || !isAdmin) {
    return <div className="flex min-h-[50vh] items-center justify-center" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-6">
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Admin</h1>
        <p className="text-sm text-muted-foreground">Grant or revoke the verified badge.</p>
        <UsersTable />
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Verification Requests
        </h2>
        <p className="text-sm text-muted-foreground">Review pending profile verification submissions.</p>
        <VerificationRequestsTable />
      </div>
    </div>
  );
}

function VerificationRequestsTable() {
  const { data, isLoading } = useGetPendingVerificationsQuery();
  const { data: users } = useGetAdminUsersQuery();
  const [claim, { isLoading: isClaiming }] = useClaimVerificationMutation();
  const [approve, { isLoading: isApproving }] = useApproveVerificationMutation();
  const [reject, { isLoading: isRejecting }] = useRejectVerificationMutation();

  async function handleClaim(userLabel: string, id: string) {
    try {
      await claim(id).unwrap();
      toast.success(`Claimed ${userLabel}'s request — now in review`);
    } catch {
      toast.error("Couldn't claim that request. Please try again.");
    }
  }

  async function handleApprove(userLabel: string, id: string) {
    try {
      await approve(id).unwrap();
      toast.success(`Approved ${userLabel}`);
    } catch {
      toast.error("Couldn't approve that request. Please try again.");
    }
  }

  async function handleReject(userLabel: string, id: string) {
    try {
      await reject(id).unwrap();
      toast.success(`Rejected ${userLabel}`);
    } catch {
      toast.error("Couldn't reject that request. Please try again.");
    }
  }

  if (isLoading) {
    return <div className="mt-6 h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  if (!data || data.items.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No pending verification requests.
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {data.items.map((request) => {
        const submitter = users?.items.find((u) => u.id === request.userId);
        const userLabel = submitter?.email ?? request.userId;
        return (
          <li
            key={request.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {userLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted {formatRelativeTime(request.createdAt)}
                {request.note ? ` · "${request.note}"` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="secondary">{request.status === "PENDING_REVIEW" ? "In review" : "New"}</Badge>
              {request.status === "SUBMITTED" ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isClaiming}
                  onClick={() => handleClaim(userLabel, request.id)}
                >
                  Claim
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                disabled={isApproving || isRejecting}
                onClick={() => handleReject(userLabel, request.id)}
              >
                Reject
              </Button>
              <Button
                size="sm"
                disabled={isApproving || isRejecting}
                onClick={() => handleApprove(userLabel, request.id)}
              >
                Approve
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
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

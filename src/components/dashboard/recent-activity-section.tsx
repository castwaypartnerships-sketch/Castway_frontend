import Link from "next/link";
import { Bell, Briefcase, MessageSquare } from "lucide-react";

import { useGetNotificationsQuery } from "@/lib/redux/endpoints/notifications-api";
import { useGetConversationsQuery } from "@/lib/redux/endpoints/messages-api";
import { useGetMyOpportunitiesQuery, useGetOpportunitiesQuery } from "@/lib/redux/endpoints/opportunities-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { canPostOpportunity } from "@/lib/rbac";
import { cn } from "@/lib/utils";

const PREVIEW_COUNT = 3;

function ActivityCard({
  icon: Icon,
  title,
  viewAllHref,
  isEmpty,
  emptyLabel,
  children,
}: {
  icon: typeof Bell;
  title: string;
  viewAllHref: string;
  isEmpty: boolean;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <Link href={viewAllHref} className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      {isEmpty ? (
        <p className="mt-4 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-1">{children}</ul>
      )}
    </section>
  );
}

function NotificationsPreview() {
  const { data } = useGetNotificationsQuery();
  const items = data?.items.slice(0, PREVIEW_COUNT) ?? [];

  return (
    <ActivityCard
      icon={Bell}
      title="Notifications"
      viewAllHref="/feed"
      isEmpty={items.length === 0}
      emptyLabel="You're all caught up."
    >
      {items.map((notification) => (
        <li key={notification.id}>
          <Link
            href={notification.link ?? "/feed"}
            className="block rounded-lg px-1.5 py-1.5 transition-colors hover:bg-muted"
          >
            <p
              className={cn(
                "truncate text-sm",
                !notification.readAt && "font-medium text-foreground",
              )}
            >
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
          </Link>
        </li>
      ))}
    </ActivityCard>
  );
}

function MessagesPreview() {
  const { data } = useGetConversationsQuery();
  const items =
    [...(data?.items ?? [])]
      .sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt))
      .slice(0, PREVIEW_COUNT) ?? [];

  return (
    <ActivityCard
      icon={MessageSquare}
      title="Messages"
      viewAllHref="/messages"
      isEmpty={items.length === 0}
      emptyLabel="No conversations yet."
    >
      {items.map((conversation) => (
        <li key={conversation.id}>
          <Link
            href={`/messages?conversationId=${conversation.id}`}
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-muted"
          >
            <Avatar size="sm">
              <AvatarImage src={conversation.otherParticipant.avatarUrl ?? undefined} />
              <AvatarFallback>{initialsFromName(conversation.otherParticipant.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {conversation.otherParticipant.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {conversation.lastMessageAt ? formatRelativeTime(conversation.lastMessageAt) : "No messages yet"}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ActivityCard>
  );
}

function OpportunitiesPreview({ role }: { role: string | null | undefined }) {
  const posting = canPostOpportunity(role);
  const mine = useGetMyOpportunitiesQuery(undefined, { skip: !posting });
  const browse = useGetOpportunitiesQuery(undefined, { skip: posting });
  const items = (posting ? mine.data?.items : browse.data?.items)?.slice(0, PREVIEW_COUNT) ?? [];

  return (
    <ActivityCard
      icon={Briefcase}
      title={posting ? "Your opportunities" : "Opportunities"}
      viewAllHref="/opportunities"
      isEmpty={items.length === 0}
      emptyLabel={posting ? "You haven't posted anything yet." : "No open opportunities right now."}
    >
      {items.map((opportunity) => (
        <li key={opportunity.id}>
          <Link
            href="/opportunities"
            className="block truncate rounded-lg px-1.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            {opportunity.title}
          </Link>
        </li>
      ))}
    </ActivityCard>
  );
}

export function RecentActivitySection({ role }: { role: string | null | undefined }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <NotificationsPreview />
      <MessagesPreview />
      <OpportunitiesPreview role={role} />
    </div>
  );
}

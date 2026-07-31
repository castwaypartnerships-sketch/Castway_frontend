// TODO: placeholder until team permissions/billing/activities backend is built

export interface TeamActivity {
  id: string;
  memberName: string;
  action: string;
  timestamp: string;
}

export interface PendingInvite {
  id: string;
  name: string;
  username: string;
  role: "Admin" | "Manager" | "Member";
  sentDaysAgo: number;
  email: string;
}

export interface TeamCapacity {
  usagePercent: number;
  slotsRemaining: number;
}

export const MOCK_ACTIVITIES: TeamActivity[] = [
  {
    id: "act-1",
    memberName: "Marcus Chen",
    action: "shortlisted 3 creators for Summer Glow 2024",
    timestamp: "Today at 11:45 AM",
  },
  {
    id: "act-2",
    memberName: "Elena Rodriguez",
    action: "updated Company Profile details",
    timestamp: "Yesterday at 4:30 PM",
  },
  {
    id: "act-3",
    memberName: "You",
    action: "invited Marco Diaz to join as Member",
    timestamp: "3 days ago",
  },
];

export const MOCK_PENDING_INVITES: PendingInvite[] = [
  {
    id: "invite-1",
    name: "Marco Diaz",
    username: "marco",
    role: "Member",
    sentDaysAgo: 3,
    email: "marco@example.com",
  },
];

export const MOCK_CAPACITY: TeamCapacity = {
  usagePercent: 80,
  slotsRemaining: 2,
};

// Dynamic visual roles assignment map for display styling
// Allows mapping real backend managers to specific roles/permissions for display parity
export const DISPLAY_ROLE_MAP: Record<string, { role: "Admin" | "Manager" | "Member"; description: string; lastActive: string }> = {
  "Sarah Jenkins": {
    role: "Admin",
    description: "Full access to billing, team, and campaigns",
    lastActive: "Active now",
  },
  "Marcus Chen": {
    role: "Manager",
    description: "Can manage roster and campaigns",
    lastActive: "Last active 2h ago",
  },
  "Elena Rodriguez": {
    role: "Member",
    description: "View-only access to assigned campaigns",
    lastActive: "Last active 1d ago",
  },
};

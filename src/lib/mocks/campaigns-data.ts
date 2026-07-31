// TODO: placeholder until client campaigns metrics/deadlines/timelines/pipeline backend is built

export interface CampaignStat {
  label: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
}

export interface ClientOverviewItem {
  id: string;
  name: string;
  category: string;
  activeCount: number;
  logoText: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  client: string;
  day: string;
  urgency: "Tomorrow" | "Friday" | string;
}

export interface TopPerformingCampaign {
  id: string;
  title: string;
  client: string;
  metric: string;
}

export interface PipelineStage {
  label: string;
  count: number;
  colorClass: string;
}

export interface TimelineStep {
  id: string;
  title: string;
  dateRange: string;
  status: "done" | "in-progress" | "upcoming";
}

// --------------------------------------------------------------------------
// Screen 1: Campaigns List Mock Data
// --------------------------------------------------------------------------

export const MOCK_CAMPAIGN_STATS: CampaignStat[] = [
  { label: "Active Campaigns", value: 6 },
  { label: "Total Applicants", value: 84, trend: "+12%", isPositive: true },
  { label: "Talent Assigned", value: 18 },
  { label: "Avg. Time to Fill", value: "4 days" },
];

export const MOCK_CLIENT_OVERVIEW: ClientOverviewItem[] = [
  { id: "client-1", name: "Nike", category: "Sports & Apparel", activeCount: 3, logoText: "N" },
  { id: "client-2", name: "YouTube Music", category: "Entertainment", activeCount: 1, logoText: "Y" },
];

export const MOCK_DEADLINES: DeadlineItem[] = [
  {
    id: "dl-1",
    title: "Lead Video Editor — Summer Launch",
    client: "Nike",
    day: "Tomorrow",
    urgency: "Tomorrow",
  },
  {
    id: "dl-2",
    title: "3D Animator for Social Ads",
    client: "TechCorp",
    day: "Friday",
    urgency: "Friday",
  },
];

export const MOCK_TOP_PERFORMING: TopPerformingCampaign[] = [
  {
    id: "top-1",
    title: "UGC Creators for Playlist Promo",
    client: "YouTube Music",
    metric: "42 apps in 2 days",
  },
];

// Fallback campaigns with rich mockup metadata for Screen 1
export const MOCK_LISTED_CAMPAIGNS = [
  {
    id: "nike-summer",
    client: "Nike",
    logoText: "N",
    title: "Lead Video Editor — Summer Launch",
    status: "ACTIVE",
    budget: "$4k - $6k",
    category: "Production",
    closesIn: "closes in 3 days",
    applicantsCount: 24,
    assignedText: "",
    assignedAvatars: ["/avatars/avatar1.jpg", "/avatars/avatar2.jpg"],
  },
  {
    id: "yt-playlist",
    client: "YouTube Music",
    logoText: "Y",
    title: "UGC Creators for Playlist Promo",
    status: "IN_REVIEW",
    budget: "$500/video",
    category: "Content Creation",
    closesIn: "Closed",
    applicantsCount: 42,
    assignedText: "Not yet assigned",
    assignedAvatars: [],
  },
];

// --------------------------------------------------------------------------
// Screen 2: Campaign Detail Mock Data
// --------------------------------------------------------------------------

export const MOCK_PIPELINE_STAGES: PipelineStage[] = [
  { label: "APPLIED", count: 12, colorClass: "bg-slate-500" },
  { label: "SHORTLISTED", count: 5, colorClass: "bg-blue-500" },
  { label: "INTERVIEW", count: 2, colorClass: "bg-purple-500" },
  { label: "ASSIGNED", count: 1, colorClass: "bg-[#476948]" },
];

export const MOCK_CAMPAIGN_BRIEF = `We are seeking a highly creative and technically proficient Lead Video Editor for Nike's upcoming Summer Launch campaign. The ideal candidate will be responsible for crafting high-energy, cinematic social media spots and long-form brand stories that resonate with a global audience of athletes and enthusiasts.

The campaign focuses on the "Limitless Summer" theme, requiring a unique blend of fast-paced montage editing, sophisticated sound design, and light motion graphics integration. You will work closely with our Creative Director and Production team to ensure brand consistency while pushing the boundaries of sports videography.

All assets will be provided in RAW 4K format. Turnaround times are tight, so efficiency and a clear organizational workflow are essential.`;

export const MOCK_SKILLS = [
  "Adobe Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Sound Mixing",
  "Color Grading",
  "Social Media Formats",
  "5+ Years Experience",
];

export const MOCK_TIMELINE: TimelineStep[] = [
  { id: "step-1", title: "Briefing & Kick-off", dateRange: "June 12, 2024", status: "done" },
  { id: "step-2", title: "Talent Scouting & Applications", dateRange: "June 15 - June 25, 2024", status: "done" },
  { id: "step-3", title: "Final Selection & Assignment", dateRange: "Deadline: June 28, 2024", status: "in-progress" },
  { id: "step-4", title: "Editing Phase 1 (First Cut)", dateRange: "Due: July 10, 2024", status: "upcoming" },
];

export const MOCK_AGENCY_INTERNAL = {
  primaryContact: {
    name: "Sarah Jenkins",
    role: "Marketing Lead, Nike",
    initials: "SJ",
  },
  internalNotes: "Client is specifically looking for \"dynamic energy\". Avoid slow cinematic fades. Prioritize talent with experience in high-impact sportswear.",
};

// Fallback talent profiles for Assign Talent widget
export const MOCK_ASSIGNABLE_TALENT = [
  { id: "tal-1", name: "Elena Rodriguez", role: "Senior Video Editor", initials: "ER" },
  { id: "tal-2", name: "James Wilson", role: "Motion Designer", initials: "JW" },
  { id: "tal-3", name: "David Kim", role: "Colorist", initials: "DK" },
];

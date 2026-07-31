// TODO: placeholder until agency company profile analytics/case studies/reviews backend is built

export interface ProfileStrengthItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface CompanyInfoField {
  label: string;
  value: string;
}

export interface SocialPresenceItem {
  platform: "Instagram" | "LinkedIn" | "Website" | string;
  handle: string;
  href: string;
}

export interface PublicRosterMember {
  id: string;
  name: string;
  niche: string;
  imageUrl: string;
  isTopTier?: boolean;
  followerStats: {
    platform: "instagram" | "tiktok" | "youtube" | "twitter" | "twitch";
    count: string;
  }[];
}

export interface SimilarAgency {
  id: string;
  name: string;
  niche: string;
  talentCount: number;
  logoText: string;
}

export interface CaseStudyItem {
  id: string;
  title: string;
  client: string;
  category: string;
  statBadge: string;
  imageClass: string;
  talentAvatars: string[];
}

export interface ReviewItem {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  campaignTag: string;
  timeAgo: string;
  comment: string;
  helpfulCount: number;
}

// --------------------------------------------------------------------------
// Profile Header Stats Mock
// --------------------------------------------------------------------------
export const MOCK_PROFILE_STATS = [
  { label: "Roster Size", value: "32 Talent" },
  { label: "Active Campaigns", value: "6" },
  { label: "Client Satisfaction", value: "4.8", showStars: true },
  { label: "Years on Castway", value: "2" },
];

// --------------------------------------------------------------------------
// Tab 1: Overview Mock Data
// --------------------------------------------------------------------------
export const MOCK_COMPANY_ABOUT = 
  "Vanguard Talent is a premier agency bridging the gap between high-tier digital creators and global brands. Founded in 2018, we specialize in end-to-end campaign management, focusing heavily on video production and long-term content strategy. Our roster includes award-winning YouTubers, TikTok trendsetters, and industry-leading podcasters.\n\nWe believe in authentic storytelling and data-driven results. Whether launching a new product or rebranding an established enterprise, our team provides the creative direction and talent necessary to dominate the digital landscape.";

export const MOCK_SPECIALTIES = [
  "Video Production",
  "Influencer Marketing",
  "Brand Strategy",
  "Content Creation",
];

export const MOCK_INDUSTRIES_SERVED = [
  "Tech",
  "Fashion",
  "Gaming",
  "Lifestyle",
];

// Sidebar Widgets
export const MOCK_PROFILE_STRENGTH_ITEMS: ProfileStrengthItem[] = [
  { id: "item-1", label: "Add Company Logo", completed: true },
  { id: "item-2", label: "Complete About Section", completed: true },
  { id: "item-3", label: "Link Social Accounts", completed: true },
  { id: "item-4", label: "Add First Case Study", completed: false },
];

export const MOCK_COMPANY_INFO: CompanyInfoField[] = [
  { label: "Team Size", value: "15 Employees" },
  { label: "Founded", value: "2018" },
  { label: "Headquarters", value: "Los Angeles, CA" },
];

export const MOCK_SOCIAL_PRESENCE: SocialPresenceItem[] = [
  { platform: "Instagram", handle: "@vanguardtalent", href: "https://instagram.com" },
  { platform: "LinkedIn", handle: "Vanguard Talent Agency", href: "https://linkedin.com" },
];

// --------------------------------------------------------------------------
// Tab 2: Public Roster Mock Data
// --------------------------------------------------------------------------
export const MOCK_PUBLIC_ROSTER: PublicRosterMember[] = [
  {
    id: "rost-1",
    name: "Sarah Jenkins",
    niche: "Lifestyle & Fashion",
    imageUrl: "/avatars/avatar1.jpg",
    isTopTier: true,
    followerStats: [
      { platform: "instagram", count: "1.2M" },
      { platform: "tiktok", count: "850K" },
    ],
  },
  {
    id: "rost-2",
    name: "Marcus Chen",
    niche: "Tech & Gadgets",
    imageUrl: "/avatars/avatar2.jpg",
    followerStats: [
      { platform: "youtube", count: "450K" },
      { platform: "twitter", count: "120K" },
    ],
  },
  {
    id: "rost-3",
    name: "Elena Rodriguez",
    niche: "Travel & Adventure",
    imageUrl: "/avatars/avatar3.jpg",
    followerStats: [
      { platform: "instagram", count: "2.1M" },
      { platform: "tiktok", count: "3.4M" },
    ],
  },
  {
    id: "rost-4",
    name: "David Kim",
    niche: "Gaming & Esports",
    imageUrl: "/avatars/avatar4.jpg",
    followerStats: [
      { platform: "twitch", count: "890K" },
      { platform: "youtube", count: "1.1M" },
    ],
  },
  {
    id: "rost-5",
    name: "Maya Williams",
    niche: "Beauty & Skincare",
    imageUrl: "/avatars/avatar5.jpg",
    followerStats: [
      { platform: "instagram", count: "670K" },
      { platform: "youtube", count: "920K" },
    ],
  },
  {
    id: "rost-6",
    name: "Jordan Smith",
    niche: "Fitness & Health",
    imageUrl: "/avatars/avatar6.jpg",
    followerStats: [
      { platform: "instagram", count: "1.5M" },
      { platform: "tiktok", count: "2.0M" },
    ],
  },
];

export const MOCK_SIMILAR_AGENCIES: SimilarAgency[] = [
  { id: "sim-1", name: "Pulse Talent", niche: "Gaming & Tech", talentCount: 45, logoText: "PT" },
  { id: "sim-2", name: "Echo Creators", niche: "Lifestyle", talentCount: 28, logoText: "EC" },
  { id: "sim-3", name: "Loom Media", niche: "Education", talentCount: 15, logoText: "LM" },
];

// --------------------------------------------------------------------------
// Tab 3: Case Studies Mock Data
// --------------------------------------------------------------------------
export const MOCK_CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "case-1",
    title: "Summer Tech Launch",
    client: "Logitech G",
    category: "INFLUENCER MARKETING",
    statBadge: "3.2M VIEWS",
    imageClass: "bg-red-950/20",
    talentAvatars: ["/avatars/avatar1.jpg", "/avatars/avatar2.jpg", "/avatars/avatar3.jpg"],
  },
  {
    id: "case-2",
    title: "Glow-Up Skincare Campaign",
    client: "Lush Cosmetics",
    category: "BRAND AWARENESS",
    statBadge: "12.5% CONVERSION",
    imageClass: "bg-amber-950/20",
    talentAvatars: ["/avatars/avatar4.jpg", "/avatars/avatar5.jpg"],
  },
  {
    id: "case-3",
    title: "Global Wanderer 2024",
    client: "Expedia",
    category: "CONTENT STRATEGY",
    statBadge: "450K NEW LEADS",
    imageClass: "bg-blue-950/20",
    talentAvatars: ["/avatars/avatar6.jpg", "/avatars/avatar1.jpg"],
  },
];

// --------------------------------------------------------------------------
// Tab 5: Reviews Mock Data
// --------------------------------------------------------------------------
export const MOCK_REVIEWS_SUMMARY = {
  averageRating: 4.8,
  reviewCount: 24,
  distribution: [
    { stars: 5, percentage: 85 },
    { stars: 4, percentage: 10 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 0 },
    { stars: 1, percentage: 0 },
  ],
};

export const MOCK_REVIEWS_LIST: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Sarah Jenkins",
    rating: 5,
    campaignTag: "LOGITECH SUMMER LAUNCH",
    timeAgo: "2 weeks ago",
    comment: "Vanguard is the best agency I've worked with. They really care about their talent and the campaigns are always high quality. The communication from Alex and the team made the whole production process seamless.",
    helpfulCount: 12,
  },
  {
    id: "rev-2",
    name: "David Miller",
    rating: 5,
    campaignTag: "GLOBAL WANDERER 2024",
    timeAgo: "1 month ago",
    comment: "Exceptional strategy and support throughout the Expedia campaign. They don't just find you deals; they help you build a brand. Highly recommend to any creator looking for serious management.",
    helpfulCount: 8,
  },
  {
    id: "rev-3",
    name: "Elena Rodriguez",
    rating: 4,
    campaignTag: "GLOW-UP SKINCARE",
    timeAgo: "2 months ago",
    comment: "Great team to work with. They have amazing connections with luxury brands. The only reason for 4 stars is some delays in response during the peak holiday season, but the results were fantastic.",
    helpfulCount: 10,
  },
];

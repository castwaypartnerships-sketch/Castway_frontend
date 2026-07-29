export type AgencySize = "SOLO" | "SMALL" | "MEDIUM" | "LARGE";

export interface SocialLinks {
  instagram?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  website?: string | null;
}

export interface PortfolioMetric {
  label: string;
  value: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  link?: string | null;
  order: number;
  metrics?: PortfolioMetric[];
}

export interface DateRange {
  id: string;
  start: string;
  end: string;
  note?: string | null;
}

export interface RateCardItem {
  id: string;
  deliverableType: string;
  price: string;
  order: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  brief: string;
  action: string;
  result: string;
  metrics: PortfolioMetric[];
  order: number;
}

export interface ResponseTimeSignal {
  averageMinutes: number | null;
  label: string;
}

/** "Live opportunities display on profile" — raw `Opportunity` fields only
 * (no `poster`/`viewerHasApplied` DTO enrichment, since the backend returns
 * this straight off `OpportunityService.listOpenByPoster` rather than
 * through `toOpportunityDtos` — the viewer already knows whose profile this
 * is, and application status isn't relevant here). */
export interface ProfileOpenOpportunity {
  id: string;
  title: string;
  description: string;
  type: "HIRING" | "COLLABORATION" | "BRAND_DEAL" | "FREELANCE_GIG";
  category: string | null;
  location: string | null;
  isRemote: boolean;
  budget: string | null;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description?: string | null;
}

export interface Education {
  id: string;
  school: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface Availability {
  isAvailableNow: boolean;
  nextAvailableDate: string | null;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  name: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  creatorCategory: string | null;
  location: string | null;
  languages: string[];
  skills: string[];
  services: string[];
  businessEmail: string | null;
  contactNumber: string | null;
  openForCollaboration: boolean;
  lookingToHire: boolean;
  availableForWork: boolean;
  socialLinks: SocialLinks | null;
  portfolioItems: PortfolioItem[];
  experience: Experience[];
  education: Education[];
  unavailableRanges: DateRange[];
  rateCardVisible: boolean;
  rateCardItems: RateCardItem[];
  minRate: number | null;
  maxRate: number | null;
  caseStudies: CaseStudy[];
  subSpecializations: string[];
  agencySize: AgencySize | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateInput {
  username?: string;
  name?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  creatorCategory?: string;
  location?: string;
  languages?: string[];
  skills?: string[];
  services?: string[];
  businessEmail?: string;
  contactNumber?: string;
  openForCollaboration?: boolean;
  lookingToHire?: boolean;
  availableForWork?: boolean;
  minRate?: number;
  maxRate?: number;
  agencySize?: AgencySize;
}

export interface ExperienceInput {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface EducationInput {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface PortfolioItemInput {
  title: string;
  imageUrl: string;
  description?: string;
  link?: string;
  order?: number;
  metrics?: PortfolioMetric[];
}

export interface RateCardItemInput {
  deliverableType: string;
  price: string;
  order?: number;
}

export interface CaseStudyInput {
  title: string;
  brief: string;
  action: string;
  result: string;
  metrics?: PortfolioMetric[];
  order?: number;
}

export type EndorsementCounts = Record<string, number>;

export interface UnavailableRangeInput {
  start: string;
  end: string;
  note?: string;
}

export interface ProfileSearchFilters {
  query?: string;
  category?: string;
  skills?: string[];
  subSpecializations?: string[];
  location?: string;
  openForCollaboration?: boolean;
  lookingToHire?: boolean;
  availableForWork?: boolean;
  verifiedOnly?: boolean;
  minFollowers?: number;
  rateMin?: number;
  rateMax?: number;
  agencySize?: AgencySize;
}

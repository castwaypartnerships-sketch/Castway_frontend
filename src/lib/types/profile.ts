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
  location?: string;
  openForCollaboration?: boolean;
  lookingToHire?: boolean;
  availableForWork?: boolean;
  verifiedOnly?: boolean;
}

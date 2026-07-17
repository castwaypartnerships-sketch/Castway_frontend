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

export interface Availability {
  isAvailableNow: boolean;
  nextAvailableDate: string | null;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  name: string;
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
  unavailableRanges: DateRange[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateInput {
  username?: string;
  name?: string;
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
}

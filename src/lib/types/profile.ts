export interface SocialLinks {
  instagram?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  website?: string | null;
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  link?: string | null;
  order: number;
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
}

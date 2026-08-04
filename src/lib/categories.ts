// Shared with onboarding (creatorCategory), profile search, and opportunity
// search — the same taxonomy backs `Profile.creatorCategory` and
// `Opportunity.category`, both plain strings matched by exact equality on
export const PROFILE_CATEGORY_OPTIONS = [
  "Design",
  "Technology",
  "Media",
  "Illustration",
  "Marketing",
  "Photography",
  "Writing",
  "Fashion",
  "Beauty",
  "Fitness",
  "Food & Beverage",
  "Travel",
  "Music",
  "Gaming",
  "Finance",
  "Education",
  "Real Estate",
  "Health & Wellness",
  "Non-profit",
  "Other",
] as const;

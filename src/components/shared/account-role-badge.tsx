const ROLE_META: Record<string, { label: string; className: string }> = {
  CREATOR: { label: "Creator", className: "bg-[#e6f4ea] text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]" },
  FREELANCER: {
    label: "Freelancer",
    className: "bg-[#e6f4ea] text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]",
  },
  AGENCY: { label: "Agency", className: "bg-[#eff6ff] text-[#2563eb]" },
  AGENCY_MANAGER: { label: "Agency", className: "bg-[#eff6ff] text-[#2563eb]" },
  BRAND: { label: "Brand", className: "bg-accent text-accent-foreground" },
  BRAND_TEAM_MEMBER: { label: "Brand", className: "bg-accent text-accent-foreground" },
};

export function AccountRoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role] ?? { label: role, className: "bg-muted text-muted-foreground" };
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

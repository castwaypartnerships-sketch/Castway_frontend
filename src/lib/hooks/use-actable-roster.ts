import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetAssignedRosterQuery, useGetMyRosterQuery } from "@/lib/redux/endpoints/roster-api";
import type { RosterEntryDto } from "@/lib/types/roster";

/** The roster members an actor is currently authorized to act on behalf of
 * (mirrors the backend's `RosterService.requireCanActFor`): an AGENCY sees
 * its whole ACCEPTED roster; an AGENCY_MANAGER sees only the subset
 * assigned to them. Shared by `ApplyOnBehalf` and the manager's
 * "My Assigned Roster" page so both stay in sync with the same source of
 * truth instead of one silently drifting from the other. */
export function useActableRosterEntries(): {
  entries: RosterEntryDto[];
  isLoading: boolean;
  canAct: boolean;
} {
  const { data: session } = useGetSessionQuery();
  const role = session?.user?.role;
  const isAgency = role === "AGENCY";
  const isManager = role === "AGENCY_MANAGER";

  const agencyRoster = useGetMyRosterQuery(undefined, { skip: !isAgency });
  const assignedRoster = useGetAssignedRosterQuery(undefined, { skip: !isManager });

  if (isAgency) {
    return {
      entries: (agencyRoster.data?.items ?? []).filter((entry) => entry.status === "ACCEPTED"),
      isLoading: agencyRoster.isLoading,
      canAct: true,
    };
  }
  if (isManager) {
    return { entries: assignedRoster.data?.items ?? [], isLoading: assignedRoster.isLoading, canAct: true };
  }
  return { entries: [], isLoading: false, canAct: false };
}

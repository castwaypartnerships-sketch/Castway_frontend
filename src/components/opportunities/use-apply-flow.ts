import { useState } from "react";
import { toast } from "sonner";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useApplyToOpportunityMutation } from "@/lib/redux/endpoints/opportunities-api";
import { useGetProposalTemplatesQuery } from "@/lib/redux/endpoints/proposal-templates-api";
import { canApplyToOpportunity } from "@/lib/rbac";

/**
 * Shared apply-to-opportunity flow: role/eligibility check, the compose
 * state (message + optional template pick), the mutation, and the
 * error-to-toast handling. Used by both `OpportunityCard`'s "Apply" button
 * and `PostCard`'s "Apply Proposal" button — both hit the exact same
 * `/opportunities/:id/apply` endpoint and need identical behavior, not a
 * one-off variant per card.
 *
 * `initiallyApplied` seeds the "already applied" state from the server
 * (`viewerHasApplied` on the opportunity/feed-item DTO). Without it, `hasApplied`
 * came only from this mutation hook's own `isSuccess` — which starts `false`
 * on every mount, so a page reload (or just landing on the card fresh) showed
 * "Apply" again for an opportunity the user had already applied to in a prior
 * session, even though the backend correctly rejected the resulting duplicate
 * apply with "You have already applied to this opportunity."
 *
 * `posterUserId` gates out the poster's own opportunity — the backend has
 * always rejected a poster applying to their own post with "You cannot apply
 * to your own opportunity" (see `ApplicationService.apply`), but nothing on
 * the frontend checked this, so a poster viewing their own proposal in the
 * Feed or Opportunities list saw a live "Apply" button that only failed
 * after being clicked.
 */
export function useApplyFlow(opportunityId: string, initiallyApplied = false, posterUserId?: string) {
  const [apply, { isLoading: isApplying, isSuccess }] = useApplyToOpportunityMutation();
  const hasApplied = initiallyApplied || isSuccess;
  const { data: session } = useGetSessionQuery();
  const isOwnOpportunity = Boolean(posterUserId) && session?.user?.id === posterUserId;
  const canApply = canApplyToOpportunity(session?.user?.role) && !isOwnOpportunity;
  const isFreelancer = session?.user?.role === "FREELANCER";
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { data: templates } = useGetProposalTemplatesQuery(undefined, { skip: !isFreelancer });

  async function handleApply(applyMessage?: string) {
    try {
      await apply({ opportunityId, message: applyMessage }).unwrap();
      setComposing(false);
    } catch (err) {
      const fallback = "Couldn't submit your application. Please try again.";
      const description =
        err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "error" in err.data
          ? String((err.data as { error: unknown }).error)
          : fallback;
      toast.error(description);
    }
  }

  function selectTemplate(id: string | null) {
    setSelectedTemplateId(id);
    const template = templates?.items.find((t) => t.id === id);
    if (template) setMessage(template.body);
  }

  return {
    canApply,
    isFreelancer,
    composing,
    setComposing,
    message,
    setMessage,
    selectedTemplateId,
    selectTemplate,
    templates,
    isApplying,
    hasApplied,
    handleApply,
  };
}

export type ApplyFlow = ReturnType<typeof useApplyFlow>;

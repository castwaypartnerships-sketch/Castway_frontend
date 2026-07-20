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
 */
export function useApplyFlow(opportunityId: string) {
  const [apply, { isLoading: isApplying, isSuccess: hasApplied }] = useApplyToOpportunityMutation();
  const { data: session } = useGetSessionQuery();
  const canApply = canApplyToOpportunity(session?.user?.role);
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

"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import {
  useGetOpportunityQuery,
  useUpdateOpportunityMutation,
} from "@/lib/redux/endpoints/opportunities-api";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";

export default function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useGetSessionQuery();
  const { data: opportunity, isLoading } = useGetOpportunityQuery(id);
  const [updateOpportunity, { isLoading: isSaving }] = useUpdateOpportunityMutation();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <Link
        href="/opportunities/mine"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to My Opportunities
      </Link>

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !opportunity ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Opportunity not found.
        </p>
      ) : opportunity.postedByUserId !== session?.user?.id ? (
        <p className="rounded-2xl border border-dashed border-destructive/40 py-16 text-center text-sm text-destructive">
          You don&apos;t own this opportunity.
        </p>
      ) : (
        <>
          <div>
            <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Edit opportunity
            </h1>
            <p className="text-sm text-muted-foreground">Changes are visible immediately.</p>
          </div>

          <OpportunityForm
            initial={opportunity}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            isSubmitting={isSaving}
            onSubmit={async (input) => {
              await updateOpportunity({ id, input }).unwrap();
              toast.success("Changes saved");
              router.push("/opportunities/mine");
            }}
          />
        </>
      )}
    </div>
  );
}

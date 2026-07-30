import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ApplyFlow } from "./use-apply-flow";

/** The compose block shared by `OpportunityCard` and `PostCard` — template
 * picker (when the applicant has any) + pitch textarea + send/cancel. */
export function ApplyComposer({ flow }: { flow: ApplyFlow }) {
  const { templates, selectedTemplateId, selectTemplate, message, setMessage, isApplying, handleApply, setComposing } =
    flow;

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-border p-4">
      {templates && templates.items.length > 0 ? (
        <Select value={selectedTemplateId} onValueChange={selectTemplate}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Use a proposal template…">
              {(id: string | null) => templates.items.find((t) => t.id === id)?.title}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {templates.items.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <Textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your pitch…"
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
          disabled={isApplying}
          onClick={() => void handleApply(message || undefined)}
        >
          {isApplying ? "Applying…" : "Send application"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setComposing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

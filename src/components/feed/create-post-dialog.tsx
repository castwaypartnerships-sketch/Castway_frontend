"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import type { FeedItem, PostCategory, PostVisibility } from "@/lib/types/feed";
import { categoryLabel } from "@/components/feed/category-badge";
import { PostEditor } from "@/components/feed/post-editor";
import { InlineImageUpload } from "@/components/upload/inline-image-upload";
import { useCreatePostMutation, useUpdatePostMutation } from "@/lib/redux/endpoints/feed-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { canPostOpportunity } from "@/lib/rbac";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function isContentEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

/** `proposal.deadlineLabel` is either an ISO date string or the literal
 * "Rolling" (see `FeedProposalDetails`) — only the former converts to a
 * `<input type="date">` value. */
function deadlineInputValue(deadlineLabel: string | undefined): string {
  if (!deadlineLabel || deadlineLabel === "Rolling") return "";
  const date = new Date(deadlineLabel);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

const GREEN_SWITCH = "data-checked:bg-[#476948] dark:data-checked:bg-[#1c3322]";

const CATEGORIES: PostCategory[] = ["GENERAL", "HIRING", "COLLABORATION", "BRAND_DEAL", "PARTNERSHIP", "PROJECT"];

const VISIBILITY_LABELS: Record<PostVisibility, string> = {
  PUBLIC: "Public — anyone can see this",
  CONNECTIONS_ONLY: "Connections only",
};

export function CreatePostDialog({
  open,
  onOpenChange,
  post,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present = edit mode. Render this component with `key={post.id}` from
   * the caller so switching which post is being edited remounts it with
   * fresh initial state, rather than needing a resync effect. */
  post?: FeedItem;
}) {
  const isEditing = post !== undefined;
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const isLoading = isCreating || isUpdating;
  const { data: session } = useGetSessionQuery();
  const canPostProposal = canPostOpportunity(session?.user?.role);

  const [content, setContent] = useState(post?.description ?? "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? "");
  const [category, setCategory] = useState<PostCategory>(post?.category ?? "GENERAL");
  const [visibility, setVisibility] = useState<PostVisibility>(post?.visibility ?? "PUBLIC");
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [title, setTitle] = useState(post?.title ?? "");
  const [budget, setBudget] = useState(post?.proposal?.budgetLabel ?? "");
  const [deadline, setDeadline] = useState(deadlineInputValue(post?.proposal?.deadlineLabel));
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setContent(post?.description ?? "");
    setImageUrl(post?.imageUrl ?? "");
    setCategory(post?.category ?? "GENERAL");
    setVisibility(post?.visibility ?? "PUBLIC");
    setSaveAsDraft(false);
    setScheduleForLater(false);
    setScheduledFor("");
    setTitle(post?.title ?? "");
    setBudget(post?.proposal?.budgetLabel ?? "");
    setDeadline(deadlineInputValue(post?.proposal?.deadlineLabel));
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isContentEmpty(content)) return;
    if (!isEditing && scheduleForLater && !scheduledFor) return;
    setError(null);

    try {
      if (isEditing) {
        await updatePost({
          postId: post.id,
          input: {
            content,
            imageUrl: imageUrl || undefined,
            category,
            visibility,
            title: title || undefined,
            budget: budget || undefined,
            applicationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
          },
        }).unwrap();
        toast.success("Post updated");
      } else {
        await createPost({
          content,
          imageUrl: imageUrl || undefined,
          category,
          visibility,
          saveAsDraft,
          title: title || undefined,
          budget: budget || undefined,
          applicationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
          scheduledFor: scheduleForLater && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        }).unwrap();
        toast.success(
          saveAsDraft ? "Saved as draft" : scheduleForLater ? "Post scheduled" : "Post published",
        );
      }
      reset();
      onOpenChange(false);
    } catch {
      setError(isEditing ? "Couldn't save your changes. Please try again." : "Couldn't publish your post. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e6f4ea] text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]">
              <Sparkles className="size-4" />
            </span>
            <DialogTitle>{isEditing ? "Edit post" : "New post"}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="post-category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as PostCategory)}>
              <SelectTrigger id="post-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {categoryLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-visibility">Who can see this</Label>
            <Select value={visibility} onValueChange={(value) => setVisibility(value as PostVisibility)}>
              <SelectTrigger id="post-visibility" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(VISIBILITY_LABELS) as PostVisibility[]).map((option) => (
                  <SelectItem key={option} value={option}>
                    {VISIBILITY_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-title">Heading (optional)</Label>
            <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Heading for your post" />
          </div>

          <div className="space-y-1.5">
            <Label>What do you want to share?</Label>
            <PostEditor
              content={content}
              onChange={setContent}
              placeholder="Share an update, opportunity, or proposal…"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Image (optional)</Label>
            <InlineImageUpload
              kind="posts"
              imageUrl={imageUrl}
              onUploaded={setImageUrl}
              onRemove={() => setImageUrl("")}
            />
          </div>

          {canPostProposal ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="post-budget">Budget (optional)</Label>
                <Input id="post-budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="$500 - $1,000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="post-deadline">Applications close (optional)</Label>
                <Input id="post-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
            </div>
          ) : null}

          {isEditing ? null : (
            <>
              <div className="flex items-center gap-2.5">
                <Switch
                  id="post-draft"
                  className={GREEN_SWITCH}
                  checked={saveAsDraft}
                  onCheckedChange={(checked) => {
                    setSaveAsDraft(checked);
                    if (checked) setScheduleForLater(false);
                  }}
                />
                <Label htmlFor="post-draft">Save as draft instead of publishing</Label>
              </div>

              {!saveAsDraft ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <Switch
                      id="post-schedule"
                      className={GREEN_SWITCH}
                      checked={scheduleForLater}
                      onCheckedChange={setScheduleForLater}
                    />
                    <Label htmlFor="post-schedule">Schedule for later instead of publishing now</Label>
                  </div>
                  {scheduleForLater ? (
                    <Input
                      type="datetime-local"
                      required
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                    />
                  ) : null}
                </div>
              ) : null}
            </>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="submit"
              className="bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
              disabled={isLoading || isContentEmpty(content) || (!isEditing && scheduleForLater && !scheduledFor)}
            >
              {isLoading
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : saveAsDraft
                    ? "Save draft"
                    : scheduleForLater
                      ? "Schedule"
                      : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

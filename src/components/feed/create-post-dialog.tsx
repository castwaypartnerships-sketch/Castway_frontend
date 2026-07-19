"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import type { PostCategory } from "@/lib/types/feed";
import { categoryLabel } from "@/components/feed/category-badge";
import { useCreatePostMutation } from "@/lib/redux/endpoints/feed-api";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES: PostCategory[] = ["GENERAL", "HIRING", "COLLABORATION", "BRAND_DEAL", "PARTNERSHIP", "PROJECT"];

export function CreatePostDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [createPost, { isLoading }] = useCreatePostMutation();

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("GENERAL");
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setContent("");
    setCategory("GENERAL");
    setTitle("");
    setBudget("");
    setDeadline("");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setError(null);

    try {
      await createPost({
        content,
        category,
        title: title || undefined,
        budget: budget || undefined,
        applicationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
      }).unwrap();
      toast.success("Post published");
      reset();
      onOpenChange(false);
    } catch {
      setError("Couldn't publish your post. Please try again.");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
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
            <Label htmlFor="post-title">Title (optional)</Label>
            <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline for your post" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-content">What do you want to share?</Label>
            <Textarea
              id="post-content"
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share an update, opportunity, or proposal…"
            />
          </div>

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

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? "Publishing…" : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

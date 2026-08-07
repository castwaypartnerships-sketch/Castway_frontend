"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ChevronDown, UserPlus } from "lucide-react";

import { useInviteTeamMemberMutation } from "@/lib/redux/endpoints/team-api";
import { PERMISSION_CATEGORIES, ROLE_LABEL_OPTIONS, type Permission } from "@/lib/permissions";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function InviteTeamMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [permissions, setPermissions] = useState<Set<Permission>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [inviteTeamMember, { isLoading }] = useInviteTeamMemberMutation();

  function togglePermission(key: Permission, checked: boolean) {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleCategoryCollapsed(label: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function resetForm() {
    setEmail("");
    setRoleLabel("");
    setPermissions(new Set());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await inviteTeamMember({
        email: email.trim(),
        roleLabel: roleLabel.trim(),
        permissions: [...permissions],
      }).unwrap();
      toast.success(`Invite sent to ${email.trim()}`);
      resetForm();
      setOpen(false);
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "error" in err.data
          ? String((err.data as { error: unknown }).error)
          : "Couldn't send that invite. Please try again.";
      toast.error(message);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button className="gap-1.5 bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]">
            <UserPlus className="size-4" />
            Invite Team Member
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              items={Object.fromEntries(ROLE_LABEL_OPTIONS.map((r) => [r, r]))}
              value={roleLabel || null}
              onValueChange={(value) => setRoleLabel(value ?? "")}
            >
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue placeholder="for example - Talent Manager" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_LABEL_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
              {PERMISSION_CATEGORIES.map((category) => {
                const collapsed = collapsedCategories.has(category.label);
                return (
                  <div key={category.label} className="rounded-lg">
                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapsed(category.label)}
                      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm font-semibold text-foreground hover:bg-muted"
                      aria-expanded={!collapsed}
                    >
                      <ChevronDown
                        className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", collapsed && "-rotate-90")}
                      />
                      {category.label}
                    </button>
                    {!collapsed ? (
                      <ul className="space-y-1 py-1 pl-7">
                        {category.permissions.map((perm) => (
                          <li key={perm.key} className="flex items-center gap-2">
                            <Checkbox
                              id={`perm-${perm.key}`}
                              checked={permissions.has(perm.key)}
                              onCheckedChange={(checked) => togglePermission(perm.key, checked === true)}
                            />
                            <Label htmlFor={`perm-${perm.key}`} className="cursor-pointer text-xs font-normal text-foreground">
                              {perm.label}
                            </Label>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
            >
              {isLoading ? "Sending…" : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

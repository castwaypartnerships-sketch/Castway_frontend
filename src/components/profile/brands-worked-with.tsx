"use client";

import { useState } from "react";
import { useUpdateProfileMutation } from "@/lib/redux/endpoints/profile-api";
import { useGetAcceptedBrandsQuery } from "@/lib/redux/endpoints/search-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, EyeOff } from "lucide-react";
import { InlineImageUpload } from "@/components/upload/inline-image-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BrandItem {
  brandUserId: string | null;
  name: string;
  logoUrl: string | null;
  isManual: boolean;
}

interface BrandsWorkedWithProps {
  brands: BrandItem[];
  profile: any;
  isOwnProfile: boolean;
}

export function BrandsWorkedWith({ brands, profile, isOwnProfile }: BrandsWorkedWithProps) {
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: acceptedBrands } = useGetAcceptedBrandsQuery(undefined, { skip: !isOwnProfile });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [selectedBrandUserId, setSelectedBrandUserId] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualLogoUrl, setManualLogoUrl] = useState("");

  if (!brands || brands.length === 0) {
    if (!isOwnProfile) return null;
  }

  const overrides = profile.brandsWorkedWithOverride || [];

  async function handleHide(item: BrandItem) {
    const nextOverrides = [...overrides];
    const index = nextOverrides.findIndex((o) => 
      item.brandUserId 
        ? o.brandUserId === item.brandUserId 
        : (o.manualBrandName && o.manualBrandName.trim().toLowerCase() === item.name.trim().toLowerCase())
    );

    if (index > -1) {
      nextOverrides[index] = { ...nextOverrides[index], isHidden: true };
    } else {
      nextOverrides.push({
        brandUserId: item.brandUserId,
        manualBrandName: item.isManual ? item.name : null,
        manualBrandLogoUrl: item.isManual ? item.logoUrl : null,
        isHidden: true
      });
    }

    try {
      await updateProfile({ brandsWorkedWithOverride: nextOverrides }).unwrap();
      toast.success(`Hidden "${item.name}" from your profile`);
    } catch {
      toast.error("Failed to hide brand. Please try again.");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const nextOverrides = [...overrides];

    if (isManual) {
      if (!manualName.trim() || !manualLogoUrl) {
        toast.error("Please enter a brand name and upload a logo");
        return;
      }
      nextOverrides.push({
        brandUserId: null,
        manualBrandName: manualName.trim(),
        manualBrandLogoUrl: manualLogoUrl,
        isHidden: false
      });
    } else {
      if (!selectedBrandUserId) {
        toast.error("Please select a brand");
        return;
      }
      nextOverrides.push({
        brandUserId: selectedBrandUserId,
        manualBrandName: null,
        manualBrandLogoUrl: null,
        isHidden: false
      });
    }

    try {
      await updateProfile({ brandsWorkedWithOverride: nextOverrides }).unwrap();
      toast.success("Brand added to your profile");
      setDialogOpen(false);
      setSelectedBrandUserId("");
      setManualName("");
      setManualLogoUrl("");
    } catch {
      toast.error("Failed to add brand. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 scroll-mt-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Brands Worked With
        </h3>
        {isOwnProfile ? (
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setDialogOpen(true)}>
            <Plus className="size-3.5" />
            Add Brand
          </Button>
        ) : null}
      </div>

      {brands && brands.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center justify-items-center py-4">
          {brands.map((brand, index) => {
            const key = brand.brandUserId ? `brand-${brand.brandUserId}` : `manual-${brand.name}-${index}`;
            return (
              <div key={key} className="group relative flex flex-col items-center justify-center p-3 h-16 w-full max-w-[120px]">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="max-h-12 max-w-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition duration-300"
                  />
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground text-center line-clamp-2 filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition duration-300">
                    {brand.name}
                  </span>
                )}
                {isOwnProfile ? (
                  <button
                    onClick={() => handleHide(brand)}
                    className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center rounded-full bg-destructive text-destructive-foreground p-1 shadow-sm hover:scale-105 transition"
                    title="Hide Brand"
                  >
                    <EyeOff className="size-3" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic py-2">
          No brands listed yet.
        </p>
      )}

      {isOwnProfile && dialogOpen ? (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Brand Worked With</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="flex items-center gap-4 border-b border-border/40 pb-3">
                <Button
                  type="button"
                  variant={isManual ? "outline" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsManual(false)}
                >
                  On Castway
                </Button>
                <Button
                  type="button"
                  variant={isManual ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsManual(true)}
                >
                  Brand not on Castway
                </Button>
              </div>

              {isManual ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="manual-brand-name">Brand Name</Label>
                    <Input
                      id="manual-brand-name"
                      placeholder="e.g. Pepsi"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Brand Logo</Label>
                    <InlineImageUpload
                      kind="portfolio"
                      imageUrl={manualLogoUrl}
                      onUploaded={setManualLogoUrl}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="platform-brand-select">Select Connected Brand</Label>
                  <select
                    id="platform-brand-select"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    value={selectedBrandUserId}
                    onChange={(e) => setSelectedBrandUserId(e.target.value)}
                  >
                    <option value="">Choose a brand...</option>
                    {(acceptedBrands?.items || []).map((b) => (
                      <option key={b.brandUserId} value={b.brandUserId}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {acceptedBrands?.items.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No accepted brand relationships found on your account. Use the "Brand not on Castway" option to add custom brands.
                    </p>
                  ) : null}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isUpdating}>
                  Add Brand
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

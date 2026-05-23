"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied.");
    } catch {
      toast.error("Copy failed.");
    }
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={share}
      className="text-[10px] tracking-widest"
    >
      share link
    </Button>
  );
}

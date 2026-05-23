"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({
  text,
  label = "copy",
}: {
  text: string;
  label?: string;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Copy failed.");
    }
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={copy}
      className="text-[9px] tracking-widest"
    >
      {label}
    </Button>
  );
}

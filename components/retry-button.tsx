"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";

export function RetryButton({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function retry() {
    setPending(true);
    try {
      const res = await fetch(`/api/analysis/${analysisId}/retry`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Could not retry.");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Could not retry. Check your network and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={retry}
      disabled={pending}
      className={buttonVariants({ variant: "outline" })}
    >
      {pending ? "retrying…" : "retry"}
    </button>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Errors that bubble up to this boundary should be logged for inspection.
    console.error("[app/error.tsx]", error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div
        className="border p-6 max-w-md w-full flex flex-col gap-4"
        style={{ borderColor: "var(--rd)", background: "var(--bg2)" }}
      >
        <h1
          className="font-mono text-xs tracking-widest"
          style={{ color: "var(--rd)" }}
        >
          &gt; [error] unexpected_failure
        </h1>
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: "var(--g)" }}
        >
          Something broke on our end. The error has been logged.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono" style={{ color: "var(--gd)" }}>
            digest: {error.digest}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className={buttonVariants({ variant: "outline" })}
          >
            retry
          </button>
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            home
          </Link>
        </div>
      </div>
    </main>
  );
}

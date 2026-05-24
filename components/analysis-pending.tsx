"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatJobId } from "@/lib/ascii-bar";

const ROTATING_MESSAGES = [
  "checking for buzzword overload…",
  "counting how many times you said 'passionate'…",
  "assessing impact language…",
  "calculating ATS keyword gaps…",
  "diffing your bullets against what hiring managers actually want…",
  "looking for unquantified achievements…",
];

type Status = "pending" | "processing" | "complete" | "failed";

export function AnalysisPending({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: Status;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [messageIdx, setMessageIdx] = useState(0);
  const [tick, setTick] = useState(0);

  // Poll the row every 2s. On terminal status, refresh the server page so it
  // re-renders with the persisted result.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analysis/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data: { status: Status } = await res.json();
        setStatus(data.status);
        if (data.status === "complete" || data.status === "failed") {
          clearInterval(interval);
          router.refresh();
        }
      } catch {
        // Network blips are non-fatal — next interval retries.
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [id, router]);

  // Rotating tagline every 3s.
  useEffect(() => {
    const t = setInterval(() => {
      setMessageIdx((i) => (i + 1) % ROTATING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Animated ASCII bar — width grows over time then wraps. Pure cosmetic.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(t);
  }, []);

  const barWidth = 32;
  const filled = (tick * 2) % (barWidth + 6);
  const bar =
    "█".repeat(Math.min(filled, barWidth)) +
    "░".repeat(barWidth - Math.min(filled, barWidth));

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        <p
          className="font-mono text-[10px] tracking-widest"
          style={{ color: "var(--gd)" }}
        >
          &gt; {formatJobId(id)}
        </p>
        <pre
          className="font-mono text-xs"
          style={{ color: "var(--g)", letterSpacing: "-0.5px" }}
        >
          {bar}
        </pre>
        <p className="font-mono text-[11px]" style={{ color: "var(--gb)" }}>
          [{status}] {ROTATING_MESSAGES[messageIdx]}
          <span className="cursor ml-1" />
        </p>
      </div>
    </main>
  );
}

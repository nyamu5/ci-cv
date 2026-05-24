import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div
        className="border p-6 max-w-md w-full flex flex-col gap-4"
        style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
      >
        <h1
          className="font-mono text-xs tracking-widest"
          style={{ color: "var(--rd)" }}
        >
          &gt; [404] route_not_found
        </h1>
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: "var(--g)" }}
        >
          The page you were looking for doesn&apos;t exist, or the analysis id
          isn&apos;t in our database.
        </p>
        <Link
          href="/"
          className={`${buttonVariants({ variant: "outline" })} self-start`}
        >
          home
        </Link>
      </div>
    </main>
  );
}

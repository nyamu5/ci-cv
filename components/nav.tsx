import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/supabase/server";

export async function Nav() {
  const session = await getSession();
  const email = session?.user.email;

  return (
    <nav
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{ borderColor: "var(--gx)" }}
    >
      <Link
        href="/"
        className="font-mono tracking-widest text-xs"
        style={{ color: "var(--gb)" }}
      >
        &gt; resume-roast 🔥
      </Link>
      <div className="flex items-center gap-3 text-xs font-mono">
        {email ? (
          <>
            <span style={{ color: "var(--gd)" }}>{email}</span>
            <SignOutButton />
          </>
        ) : (
          <Link
            href="/login"
            className="hover:underline"
            style={{ color: "var(--g)" }}
          >
            sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

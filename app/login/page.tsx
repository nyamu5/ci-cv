import { AuthButton } from "@/components/auth-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle
            className="font-mono text-sm tracking-widest"
            style={{ color: "var(--gb)" }}
          >
            &gt; sign in to save your analyses
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error === "auth" && (
            <p className="text-[11px] font-mono" style={{ color: "var(--rd)" }}>
              [auth_failed] Could not complete sign-in. Try again.
            </p>
          )}
          <AuthButton />
        </CardContent>
      </Card>
    </main>
  );
}

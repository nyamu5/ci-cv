// NOTE: a real hero / feature-card / how-it-works landing page lands in
// Ticket 3.4. For now this is just enough scaffolding to render the form
// so 3.1's verification can run end-to-end in the browser.

import { CvInputForm } from "@/components/cv-input-form";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1
            className="font-mono text-base tracking-widest"
            style={{ color: "var(--gb)" }}
          >
            &gt; get brutally honest feedback on your CV
          </h1>
          <p
            className="text-xs font-mono"
            style={{ color: "var(--gd)" }}
          >
            paste it, upload it, or pair it with a JD for match scoring.
          </p>
        </header>
        <CvInputForm />
      </div>
    </main>
  );
}

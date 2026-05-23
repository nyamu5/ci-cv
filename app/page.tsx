import { CvInputForm } from "@/components/cv-input-form";
import { TerminalWindow } from "@/components/ui/terminal-window";

export default function Home() {
  return (
    <main className="flex-1 px-4 py-10 max-w-4xl mx-auto w-full flex flex-col gap-14">
      <section className="flex flex-col gap-3">
        <p
          className="font-mono text-xs tracking-widest"
          style={{ color: "var(--gd)" }}
        >
          $ resume-roast init
        </p>
        <h1
          className="font-mono text-3xl md:text-5xl leading-tight tracking-tight"
          style={{ color: "var(--gb)" }}
        >
          get brutally honest
          <br />
          feedback on your CV
          <span className="cursor" />
        </h1>
        <p
          className="text-sm font-mono leading-relaxed"
          style={{ color: "var(--gm)" }}
        >
          paste it, upload it, or pair it with a JD for match scoring.
          <br />
          two AI passes — cheap gatekeeper, then full analyser. takes ~10
          seconds.
        </p>
      </section>

      <section>
        <TerminalWindow title="cv_input.sh">
          <CvInputForm />
        </TerminalWindow>
      </section>

      <section>
        <h2
          className="font-mono text-xs tracking-widest mb-3"
          style={{ color: "var(--gd)" }}
        >
          &gt; features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FeatureCard
            title="section_scoring"
            body="impact · clarity · structure · relevance · ATS — each scored 0-100 with concrete highlights and improvements."
          />
          <FeatureCard
            title="jd_match"
            body="paste a job description and we surface matched keywords, missing keywords, and skill gaps with a fit score."
          />
          <FeatureCard
            title="red_flags"
            body="sorted high → medium → low. each flag has a specific fix, not vague advice."
          />
          <FeatureCard
            title="ai_rewrites"
            body="weakest bullets get two concrete alternatives each. copy-paste ready."
          />
        </div>
      </section>

      <section>
        <h2
          className="font-mono text-xs tracking-widest mb-3"
          style={{ color: "var(--gd)" }}
        >
          &gt; how_it_works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StepCard
            step={1}
            title="submit"
            body="paste your CV or drop a PDF. optionally add a target role and JD."
          />
          <StepCard
            step={2}
            title="analyse"
            body="two AI passes run async — cheap gatekeeper (gpt-4o-mini) then full analyser (gpt-4o)."
          />
          <StepCard
            step={3}
            title="iterate"
            body="get scores, red flags, and rewrites. share the URL with mentors for second opinions."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="border p-3 flex flex-col gap-2"
      style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
    >
      <p
        className="font-mono text-[11px] tracking-widest"
        style={{ color: "var(--gb)" }}
      >
        {title}
      </p>
      <p className="text-[11px] leading-relaxed dim">{body}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  body,
}: {
  step: number;
  title: string;
  body: string;
}) {
  return (
    <div
      className="border p-3 flex flex-col gap-2"
      style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px]" style={{ color: "var(--gd)" }}>
          [{step}/3]
        </span>
        <span
          className="font-mono text-[11px] tracking-widest"
          style={{ color: "var(--gb)" }}
        >
          {title}
        </span>
      </div>
      <p className="text-[11px] leading-relaxed dim">{body}</p>
    </div>
  );
}

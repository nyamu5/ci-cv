interface TerminalWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function TerminalWindow({
  title = "ci/cv",
  children,
  className = "",
}: TerminalWindowProps) {
  return (
    <div
      className={`flex flex-col border ${className}`}
      style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-b"
        style={{ background: "var(--bg3)", borderColor: "var(--gx)" }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span
          className="mx-auto text-[9px] tracking-widest"
          style={{ color: "var(--gd)" }}
        >
          {title}
        </span>
      </div>
      <div className="p-3.5 font-mono text-[11px] leading-7 flex-1">
        {children}
      </div>
    </div>
  );
}

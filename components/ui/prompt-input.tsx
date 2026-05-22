import { forwardRef } from "react";

interface PromptInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const PromptInput = forwardRef<HTMLInputElement, PromptInputProps>(
  ({ label, className = "", ...props }, ref) => (
    <div>
      {label && (
        <p
          className="text-[9px] tracking-widest mb-1.5"
          style={{ color: "var(--gd)" }}
        >
          {label}
        </p>
      )}
      <div
        className="flex items-center gap-2 border-b py-1.5"
        style={{ borderColor: "var(--gx)" }}
      >
        <span style={{ color: "var(--g)" }} className="text-sm flex-shrink-0">
          &gt;
        </span>
        <input
          ref={ref}
          className={`flex-1 bg-transparent border-none outline-none text-[11px] font-mono ${className}`}
          style={{ color: "var(--g)" }}
          {...props}
        />
      </div>
    </div>
  ),
);
PromptInput.displayName = "PromptInput";

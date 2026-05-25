"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AnalyseRequestSchema } from "@/lib/validations";

type TabId = "paste" | "upload" | "jd";

const CvTextSchema = AnalyseRequestSchema.shape.cv_text;
const JdTextSchema = AnalyseRequestSchema.shape.jd_text;
const TargetRoleSchema = AnalyseRequestSchema.shape.target_role;

export function CvInputForm() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("paste");
  const [uploading, setUploading] = useState(false);
  const [qualityWarning, setQualityWarning] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { cv_text: "", jd_text: "", target_role: "" },
    onSubmit: async ({ value }) => {
      const body = {
        cv_text: value.cv_text,
        jd_text: value.jd_text || undefined,
        target_role: value.target_role || undefined,
      };
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        const { resetAt } = await res.json();
        const when = resetAt ? new Date(resetAt).toLocaleTimeString() : "later";
        toast.error(`Rate limit reached. Try again at ${when}.`);
        return;
      }
      if (!res.ok) {
        toast.error("Could not start analysis. Try again.");
        return;
      }
      const { id } = await res.json();
      router.push(`/analysis/${id}`);
    },
  });

  async function handleFile(file: File) {
    setUploading(true);
    setQualityWarning(false);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        return;
      }
      form.setFieldValue("cv_text", data.text);
      setQualityWarning(Boolean(data.qualityWarning));
      if (!data.qualityWarning) setTab("paste");
    } catch {
      setUploadError("Upload failed. Check your network and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4 w-full"
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="paste">paste cv</TabsTrigger>
          <TabsTrigger value="upload">upload pdf</TabsTrigger>
          <TabsTrigger value="jd">job description</TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="mt-3">
          <form.Field
            name="cv_text"
            validators={{
              onChange: ({ value }) => {
                const r = CvTextSchema.safeParse(value);
                return r.success ? undefined : r.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <div>
                <Textarea
                  rows={8}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="paste your CV text here — 200 to 15,000 chars…"
                  className="max-h-[28rem] overflow-y-auto"
                />
                <p
                  className="text-[10px] mt-1 font-mono"
                  style={{ color: "var(--gd)" }}
                >
                  {field.state.value.length.toString().padStart(5, "0")}/15000
                  chars · min 200
                </p>
              </div>
            )}
          </form.Field>
        </TabsContent>

        <TabsContent value="upload" className="mt-3">
          {qualityWarning && (
            <Alert variant="default" className="mb-3">
              <AlertDescription>
                Text extraction looks low quality (multi-column layout, custom
                fonts, or image-only CV). Switch to the Paste tab and paste your
                CV directly for best results.
              </AlertDescription>
            </Alert>
          )}
          <FileDropZone
            onFile={handleFile}
            disabled={uploading}
            error={uploadError}
          />
        </TabsContent>

        <TabsContent value="jd" className="mt-3">
          <form.Field
            name="jd_text"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const r = JdTextSchema.safeParse(value);
                return r.success ? undefined : r.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <div>
                <Textarea
                  rows={6}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="paste the job description (optional)…"
                  className="max-h-[22rem] overflow-y-auto"
                />
                <p
                  className="text-[10px] mt-1 font-mono"
                  style={{ color: "var(--gd)" }}
                >
                  optional · adding a JD enables match scoring
                </p>
              </div>
            )}
          </form.Field>
        </TabsContent>
      </Tabs>

      <form.Field
        name="target_role"
        validators={{
          onChange: ({ value }) => {
            if (!value) return undefined;
            const r = TargetRoleSchema.safeParse(value);
            return r.success ? undefined : r.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div>
            <label
              className="text-[10px] font-mono tracking-widest block mb-1"
              style={{ color: "var(--gd)" }}
              htmlFor="target-role"
            >
              target role · optional
            </label>
            <Input
              id="target-role"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Staff Engineer"
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
          cvText: state.values.cv_text,
        })}
      >
        {({ isSubmitting, cvText }) => {
          const cvValid = CvTextSchema.safeParse(cvText).success;
          return (
            <Button
              type="submit"
              disabled={!cvValid || isSubmitting}
              className="self-end"
            >
              {isSubmitting ? "queueing analysis…" : "Roast my CV 🔥"}
            </Button>
          );
        }}
      </form.Subscribe>
    </form>
  );
}

function FileDropZone({
  onFile,
  disabled,
  error,
}: {
  onFile: (f: File) => void;
  disabled: boolean;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className="w-full border border-dashed p-8 text-center text-xs font-mono select-none"
        style={{
          borderColor: error
            ? "var(--rd)"
            : dragging
              ? "var(--g)"
              : "var(--gx)",
          background: dragging ? "var(--gxx)" : "transparent",
          color: "var(--gm)",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {disabled
          ? "uploading…"
          : "drop a PDF here, or click to pick one (max 5MB)"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        aria-label="PDF file"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      {error && (
        <p
          role="alert"
          className="mt-2 text-[11px] font-mono"
          style={{ color: "var(--rd)" }}
        >
          [error] {error}
        </p>
      )}
    </div>
  );
}

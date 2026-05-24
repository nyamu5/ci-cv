import { type NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart/form-data body" },
      { status: 400 },
    );
  }

  const file = formData.get("pdf");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing 'pdf' file field" },
      { status: 400 },
    );
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only application/pdf is accepted" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File exceeds 5MB limit" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await extractTextFromPDF(buffer);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}

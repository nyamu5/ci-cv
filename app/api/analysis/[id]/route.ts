import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { analyses, db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const [row] = await db
    .select({
      status: analyses.status,
      result: analyses.result,
    })
    .from(analyses)
    .where(eq(analyses.id, id));

  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    status: row.status,
    result:
      row.status === "complete" || row.status === "failed" ? row.result : null,
  });
}

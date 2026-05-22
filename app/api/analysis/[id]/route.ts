// TODO: implement in Ticket 2.6 — return status + result for the polling client.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}

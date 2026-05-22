// TODO: implement in Ticket 1.4 — exchange OAuth code for a Supabase session.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/login", "http://localhost"));
}

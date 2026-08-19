import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/requirePlatformAdmin";

export async function GET() {
  const check = await requirePlatformAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
  return NextResponse.json({ admin: check.admin });
}

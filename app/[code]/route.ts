import { NextRequest, NextResponse } from "next/server";
import { getByCode, recordClick } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const params = await context.params;
  const code = params.code;
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const record = getByCode(code);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!record.active) {
    return NextResponse.json({ error: "Inactive" }, { status: 410 });
  }
  if (record.expires_at && new Date(record.expires_at) < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  try {
    recordClick(code);
  } catch {}
  return NextResponse.redirect(record.url, { status: 302 });
}



import { NextRequest, NextResponse } from "next/server";
import { getById, updateUrl, deleteUrl, type ShortUrl } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = Number(params.id);
  const row = getById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = Number(params.id);
  const row = getById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Partial<{
    url: string;
    expires_at: string | null;
    active: number | boolean;
    code: string;
  }>;

  const fields: Partial<Pick<ShortUrl, "url" | "expires_at" | "active" | "code">> = {};
  if (body.url !== undefined) fields.url = body.url;
  if (body.expires_at !== undefined) fields.expires_at = body.expires_at;
  if (body.active !== undefined) fields.active = body.active ? 1 : 0;
  if (body.code !== undefined) fields.code = body.code;

  const updated = updateUrl(id, fields);
  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = Number(params.id);
  const row = getById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  deleteUrl(id);
  return NextResponse.json({ ok: true });
}



import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { codeExists, insertShortUrl, listUrls, updateUrl } from "@/lib/db";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 7);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");
  const includeInactive = searchParams.get("includeInactive") === "true";
  const data = listUrls({ query: q, limit, offset, includeInactive });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputUrl: string | undefined = body?.url;
    let code: string | undefined = body?.code || undefined;
    const expiresAt: string | undefined = body?.expires_at || undefined;

    if (!inputUrl || typeof inputUrl !== "string") {
      return NextResponse.json({ error: "Missing 'url'" }, { status: 400 });
    }
    let parsed: URL;
    try {
      parsed = new URL(inputUrl);
      if (!parsed.protocol.startsWith("http")) throw new Error("invalid");
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (code) {
      if (codeExists(code)) {
        return NextResponse.json({ error: "Code already exists" }, { status: 409 });
      }
    } else {
      code = nanoid();
      for (let i = 0; i < 3 && codeExists(code); i++) code = nanoid();
    }

    const created = insertShortUrl(code, parsed.toString());
    const updated = expiresAt ? updateUrl(created.id, { expires_at: expiresAt }) : created;
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



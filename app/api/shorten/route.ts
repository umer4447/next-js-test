import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { codeExists, insertShortUrl } from "@/lib/db";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 7);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const inputUrl: string | undefined = body?.url;
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

    let code = nanoid();
    // Small attempt to avoid collision; loop a few times
    for (let attempt = 0; attempt < 3 && codeExists(code); attempt += 1) {
      code = nanoid();
    }

    const row = insertShortUrl(code, parsed.toString());
    return NextResponse.json({ code: row.code, url: row.url });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



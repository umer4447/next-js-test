import Database from "better-sqlite3";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  // Use a file-based SQLite DB in project root
  db = new Database(".data.sqlite");
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      clicks INTEGER NOT NULL DEFAULT 0,
      last_click_at TEXT,
      expires_at TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_urls_code ON urls(code);
  `);

  // Best-effort migrations to add columns if existing DB is older
  try { db!.exec("ALTER TABLE urls ADD COLUMN clicks INTEGER NOT NULL DEFAULT 0"); } catch {}
  try { db!.exec("ALTER TABLE urls ADD COLUMN last_click_at TEXT"); } catch {}
  try { db!.exec("ALTER TABLE urls ADD COLUMN expires_at TEXT"); } catch {}
  try { db!.exec("ALTER TABLE urls ADD COLUMN active INTEGER NOT NULL DEFAULT 1"); } catch {}

  return db;
}

export type ShortUrl = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  last_click_at: string | null;
  expires_at: string | null;
  active: number;
  created_at: string;
};

export function insertShortUrl(code: string, url: string): ShortUrl {
  const database = getDb();
  const stmt = database.prepare(
    "INSERT INTO urls (code, url) VALUES (?, ?) RETURNING id, code, url, clicks, last_click_at, expires_at, active, created_at"
  );
  const row = stmt.get(code, url) as ShortUrl;
  return row;
}

export function getByCode(code: string): ShortUrl | undefined {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT id, code, url, clicks, last_click_at, expires_at, active, created_at FROM urls WHERE code = ? LIMIT 1"
  );
  const row = stmt.get(code) as ShortUrl | undefined;
  return row;
}

export function codeExists(code: string): boolean {
  const database = getDb();
  const stmt = database.prepare("SELECT 1 FROM urls WHERE code = ? LIMIT 1");
  const row = stmt.get(code) as { 1: number } | undefined;
  return !!row;
}

export type ListParams = { query?: string; limit?: number; offset?: number; includeInactive?: boolean };
export function listUrls(params: ListParams = {}): ShortUrl[] {
  const database = getDb();
  const { query, limit = 50, offset = 0, includeInactive = true } = params;
  let sql = `SELECT id, code, url, clicks, last_click_at, expires_at, active, created_at FROM urls`;
  const conds: string[] = [];
  const args: unknown[] = [];
  if (!includeInactive) {
    conds.push("active = 1");
  }
  if (query) {
    conds.push("(code LIKE ? OR url LIKE ?)");
    args.push(`%${query}%`, `%${query}%`);
  }
  if (conds.length) sql += ` WHERE ${conds.join(" AND ")}`;
  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  args.push(limit, offset);
  const stmt = database.prepare(sql);
  return stmt.all(...args) as ShortUrl[];
}

export function updateUrl(id: number, fields: Partial<Pick<ShortUrl, "url" | "expires_at" | "active" | "code">>): ShortUrl | undefined {
  const database = getDb();
  const sets: string[] = [];
  const args: unknown[] = [];
  if (fields.url !== undefined) { sets.push("url = ?"); args.push(fields.url); }
  if (fields.expires_at !== undefined) { sets.push("expires_at = ?"); args.push(fields.expires_at); }
  if (fields.active !== undefined) { sets.push("active = ?"); args.push(fields.active); }
  if (fields.code !== undefined) { sets.push("code = ?"); args.push(fields.code); }
  if (!sets.length) return getById(id);
  const stmt = database.prepare(`UPDATE urls SET ${sets.join(", ")} WHERE id = ?`);
  stmt.run(...args, id);
  return getById(id);
}

export function deleteUrl(id: number): void {
  const database = getDb();
  database.prepare("DELETE FROM urls WHERE id = ?").run(id);
}

export function getById(id: number): ShortUrl | undefined {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT id, code, url, clicks, last_click_at, expires_at, active, created_at FROM urls WHERE id = ?"
  );
  return stmt.get(id) as ShortUrl | undefined;
}

export function recordClick(code: string): void {
  const database = getDb();
  database
    .prepare(
      "UPDATE urls SET clicks = clicks + 1, last_click_at = datetime('now') WHERE code = ?"
    )
    .run(code);
}



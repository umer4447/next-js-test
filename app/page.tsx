"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import './globals.css';
type UrlRow = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  last_click_at: string | null;
  expires_at: string | null;
  active: number;
  created_at: string;
};

type CreatePayload = {
  url: string;
  code?: string;
  expires_at?: string;
};

export default function Home() {
  const [rows, setRows] = useState<UrlRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const { confirm, element: confirmElement } = useConfirmDialog();

  // Create form state
  const [formUrl, setFormUrl] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formExpiry, setFormExpiry] = useState<Date | undefined>();
  const [formActive, setFormActive] = useState(true);
  const base = typeof window !== "undefined" ? window.location.origin : "";

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => r.code.toLowerCase().includes(q) || r.url.toLowerCase().includes(q));
  }, [rows, query]);

  async function fetchRows() {
    setLoading(true);
    const res = await fetch("/api/urls");
    const data = await res.json();
    setRows(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchRows();
  }, []);

  async function createUrl() {
    const payload: CreatePayload = { url: formUrl };
    if (formCode) payload.code = formCode;
    if (formExpiry) payload.expires_at = new Date(formExpiry.getTime() - formExpiry.getTimezoneOffset() * 60000).toISOString();
    const res = await fetch("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Failed to create");
      return;
    }
    await fetchRows();
    setCreateOpen(false);
    setFormUrl("");
    setFormCode("");
    setFormExpiry(undefined);
    setFormActive(true);
  }

  async function removeUrl(id: number) {
    const ok = await confirm();
    if (!ok) return;
    await fetch(`/api/urls/${id}`, { method: "DELETE" });
    fetchRows();
  }

  async function toggleActive(row: UrlRow) {
    const next = row.active ? 0 : 1;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, active: next } : r)));
    const res = await fetch(`/api/urls/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      // revert on failure
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, active: row.active } : r)));
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function openQr(text: string) {
    setQrValue(text);
    setQrOpen(true);
  }

  return (
    <div className="font-sans min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">URL Shortener Dashboard</h1>
            <p className="opacity-70 text-sm">Create, manage, and analyze your short links</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>New Short URL</Button>
        </div>

        <div className="flex gap-2 mb-4">
          <Input placeholder="Search by code or destination" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="overflow-x-auto rounded-lg border border-black/[.08] dark:border-white/[.145]">
          <table className="w-full text-sm">
            <thead className="bg-black/[.03] dark:bg-white/[.04] text-left">
              <tr>
                <th className="p-3">Short</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Clicks</th>
                <th className="p-3">Status</th>
                <th className="p-3">Expiry</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={6}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="p-4" colSpan={6}>No links yet</td></tr>
              ) : (
                filtered.map((r) => {
                  const short = `${base}/${r.code}`;
                  return (
                    <tr key={r.id} className="border-t border-black/[.06] dark:border-white/[.08]">
                      <td className="p-3">
                        <a href={short} className="underline" target="_blank" rel="noreferrer">{short}</a>
                      </td>
                      <td className="p-3 max-w-[380px] truncate" title={r.url}>{r.url}</td>
                      <td className="p-3">{r.clicks}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-2`}>
                          <Switch checked={!!r.active} onChange={() => toggleActive(r)} />
                          <span className="text-xs opacity-70">{r.active ? "Active" : "Inactive"}</span>
                        </span>
                      </td>
                      <td className="p-3">{r.expires_at ? new Date(r.expires_at).toLocaleString() : "—"}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => copyToClipboard(short)}>Copy</Button>
                          <Button variant="secondary" size="sm" onClick={() => openQr(short)}>QR</Button>
                          <Button variant="destructive" size="sm" onClick={() => removeUrl(r.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogHeader>Create short URL</DialogHeader>
        <div className="space-y-3">
          <div>
            <div className="text-xs mb-1">Destination URL</div>
            <Input placeholder="https://example.com" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} />
          </div>
          <div>
            <div className="text-xs mb-1">Custom code (optional)</div>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70 select-none">{base}/</span>
              <Input placeholder="my-alias" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="text-xs mb-1">Expiry (optional)</div>
            <Popover>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                  data-empty={!formExpiry}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formExpiry ? format(formExpiry, "PPP") : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formExpiry}
                  onSelect={setFormExpiry}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={formActive} onChange={(e) => setFormActive((e.target as HTMLInputElement).checked)} />
            <span className="text-sm">Active</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={createUrl}>Create</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
        <DialogHeader>QR Code</DialogHeader>
        <div className="flex items-center justify-center p-4">
          {qrValue ? (
            <div className="bg-white p-3 rounded border border-black/[.08] shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrValue)}`}
                alt="QR"
                width={240}
                height={240}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=${encodeURIComponent(qrValue || "")}\u0026chf=bg,s,FFFFFF`;
                }}
              />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button onClick={() => setQrOpen(false)}>Close</Button>
        </DialogFooter>
      </Dialog>
      {confirmElement}
    </div>
  );
}

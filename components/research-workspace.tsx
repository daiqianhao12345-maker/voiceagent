"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { shortDate } from "@/lib/utils";
import type { ScrapedData } from "@/types/crm";

const blank = {
  business_name: "",
  phone: "",
  email: "",
  website: "",
  source_url: "",
  summary: "",
  status: "new"
};

const statuses = ["new", "researching", "completed", "failed"];

export function ResearchWorkspace({ initialRows }: { initialRows: ScrapedData[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Partial<ScrapedData>>(blank);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return rows.filter((row) =>
      [row.id, row.business_name, row.phone, row.email, row.website, row.source_url, row.summary, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [query, rows]);

  async function addResearchItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/scraped-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (response.ok) {
      const data = await response.json();
      setRows((current) => [data.scrapedData, ...current]);
      setForm(blank);
    }
  }

  async function removeResearchItem(id: string) {
    setBusyId(id);
    const previous = rows;
    setRows((current) => current.filter((row) => row.id !== id));
    const response = await fetch(`/api/scraped-data/${id}`, { method: "DELETE" });
    if (!response.ok) setRows(previous);
    setBusyId(null);
  }

  return (
    <div className="grid items-start gap-5 min-[1500px]:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel min-w-0 overflow-hidden rounded-lg">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 text-ink/40" size={18} />
            <input
              className="focus-ring h-10 w-full rounded-md border border-line bg-field pl-10 pr-3 text-sm"
              placeholder="Search companies, websites, scrapedDataId"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="rounded-md border border-line bg-field px-3 py-2 text-xs font-semibold text-ink/65">
            n8n reads `status=new`
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-line bg-field text-xs uppercase tracking-[0.1em] text-ink/55">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">scrapedDataId</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink/60">
                    No research queue items yet. Add a company with status `new` to trigger the n8n research workflow.
                  </td>
                </tr>
              ) : filtered.map((row) => (
                <tr key={row.id} className="bg-white align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{row.business_name || "Unnamed company"}</p>
                    <p className="mt-1 max-w-sm text-xs leading-5 text-ink/55">{row.summary || "No summary yet"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-field px-2 py-1 text-xs text-ink/70">{row.id}</code>
                  </td>
                  <td className="px-4 py-3">
                    {row.website ? (
                      <a className="inline-flex items-center gap-1 text-brand hover:underline" href={row.website} target="_blank" rel="noreferrer">
                        Website <ExternalLink size={14} />
                      </a>
                    ) : "Pending"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      {(row.status || "new").replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">{shortDate(row.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        className="focus-ring grid size-9 place-items-center rounded-md border border-line text-rose-600 hover:bg-rose-50"
                        title="Delete research item"
                        disabled={busyId === row.id}
                        onClick={() => removeResearchItem(row.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form className="panel min-w-0 rounded-lg p-4" onSubmit={addResearchItem}>
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} />
          <h3 className="font-bold">Add Research Company</h3>
        </div>
        <div className="space-y-3">
          {[
            ["business_name", "Business Name"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["website", "Website"],
            ["source_url", "Source URL"]
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">{label}</span>
              <input
                className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-field px-3 text-sm"
                value={String(form[key as keyof ScrapedData] ?? "")}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                required={key === "business_name"}
              />
            </label>
          ))}
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">Status</span>
            <select
              className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-field px-3 text-sm"
              value={String(form.status || "new")}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">Summary</span>
            <textarea
              className="focus-ring mt-1 min-h-24 w-full rounded-md border border-line bg-field px-3 py-2 text-sm"
              value={String(form.summary ?? "")}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
            />
          </label>
        </div>
        <button className="focus-ring mt-4 h-11 w-full rounded-md bg-brand px-4 text-sm font-bold text-white hover:bg-brand/90">
          Add Research Item
        </button>
      </form>
    </div>
  );
}

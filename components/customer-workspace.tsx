"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Pencil, PhoneCall, Plus, Search, Trash2, Upload, UserPlus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { shortDate } from "@/lib/utils";
import type { Customer } from "@/types/crm";

const blank = {
  name: "",
  email: "",
  phone: "",
  company: "",
  title: "",
  source: "Manual",
  status: "new",
  notes: "",
  lead_score: 35,
  revenue: 0
};

export function CustomerWorkspace({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Partial<Customer>>(blank as Partial<Customer>);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [callNotice, setCallNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return customers.filter((customer) =>
      [customer.name, customer.email, customer.phone, customer.company, customer.source, customer.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [customers, query]);

  async function saveCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
    const response = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (response.ok) {
      const data = await response.json();
      setCustomers((current) =>
        editingId
          ? current.map((customer) => (customer.id === editingId ? data.customer : customer))
          : [data.customer, ...current]
      );
      setForm(blank as Partial<Customer>);
      setEditingId(null);
    }
  }

  async function removeCustomer(id: string) {
    setBusyId(id);
    const previous = customers;
    setCustomers((current) => current.filter((customer) => customer.id !== id));
    const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (!response.ok) setCustomers(previous);
    setBusyId(null);
  }

  async function startCall(id: string) {
    setBusyId(id);
    setCallNotice(null);
    const response = await fetch("/api/calls/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: id })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setCallNotice(data.error || "Call workflow could not be started.");
    } else if (data.demoMode) {
      setCallNotice("n8n calling webhook is not configured in Vercel. Add N8N_LEAD_CALLING_WEBHOOK_URL and redeploy.");
    } else {
      setCustomers((current) =>
        current.map((customer) => (customer.id === id ? { ...customer, status: "calling" } : customer))
      );
      const webhookTarget = data.webhook ? `${data.webhook.host}${data.webhook.path}` : "n8n";
      setCallNotice(`Call workflow started in ${webhookTarget}.`);
    }

    setBusyId(null);
  }

  function exportCsv() {
    const headers = ["Name", "Email", "Phone", "Company", "Lead Source", "Status", "Created Date"];
    const rows = customers.map((customer) => [
      customer.name,
      customer.email || "",
      customer.phone || "",
      customer.company || "",
      customer.source || "",
      customer.status,
      customer.created_at
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const [, ...rows] = text.split(/\r?\n/).filter(Boolean);
    for (const row of rows) {
      const [name, email, phone, company, source, status] = row.split(",").map((value) => value.replace(/^"|"$/g, ""));
      if (name) {
        const response = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, company, source, status: status || "new" })
        });
        if (response.ok) {
          const data = await response.json();
          setCustomers((current) => [data.customer, ...current]);
        }
      }
    }
    event.target.value = "";
  }

  return (
    <div className="grid items-start gap-5 min-[1500px]:grid-cols-[minmax(0,1fr)_340px] min-[1800px]:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel min-w-0 overflow-hidden rounded-lg">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md lg:flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 text-ink/40" size={18} />
            <input
              className="focus-ring h-10 w-full rounded-md border border-line bg-field pl-10 pr-3 text-sm"
              placeholder="Search leads, companies, phone numbers"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="focus-ring inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold transition hover:bg-field">
              <Upload size={16} />
              Import
              <input className="hidden" type="file" accept=".csv" onChange={importCsv} />
            </label>
            <button className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold transition hover:bg-field" onClick={exportCsv}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {callNotice ? (
          <div className="border-b border-line bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {callNotice}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] text-left text-sm">
            <thead className="border-b border-line bg-field text-xs uppercase tracking-[0.1em] text-ink/55">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12">
                    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                      <div className="grid size-12 place-items-center rounded-lg bg-field text-brand">
                        <UserPlus size={22} />
                      </div>
                      <p className="mt-4 font-bold text-ink">No customers yet</p>
                      <p className="mt-2 text-sm leading-6 text-ink/60">
                        Add your first lead with the form, or import a CSV to fill the pipeline.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((customer) => (
                <tr key={customer.id} className="bg-white">
                  <td className="px-4 py-3">
                    <Link href={`/customers/${customer.id}`} className="font-semibold text-brand hover:underline">
                      {customer.name}
                    </Link>
                    <p className="text-xs text-ink/55">{customer.email || "No email"}</p>
                  </td>
                  <td className="px-4 py-3">{customer.company || "Independent"}</td>
                  <td className="px-4 py-3">{customer.phone || "No phone"}</td>
                  <td className="px-4 py-3">{customer.source || "Manual"}</td>
                  <td className="px-4 py-3"><StatusBadge value={customer.status} /></td>
                  <td className="px-4 py-3">{shortDate(customer.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="focus-ring grid size-9 place-items-center rounded-md border border-line hover:bg-field" title="Start call" disabled={busyId === customer.id} onClick={() => startCall(customer.id)}>
                        <PhoneCall size={16} />
                      </button>
                      <button className="focus-ring grid size-9 place-items-center rounded-md border border-line hover:bg-field" title="Edit customer" onClick={() => { setEditingId(customer.id); setForm(customer); }}>
                        <Pencil size={16} />
                      </button>
                      <button className="focus-ring grid size-9 place-items-center rounded-md border border-line text-rose-600 hover:bg-rose-50" title="Delete customer" disabled={busyId === customer.id} onClick={() => removeCustomer(customer.id)}>
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

      <form className="panel min-w-0 rounded-lg p-4" onSubmit={saveCustomer}>
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} />
          <h3 className="font-bold">{editingId ? "Edit Customer" : "Add Customer"}</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 min-[1500px]:block min-[1500px]:space-y-3">
          {[
            ["name", "Name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["company", "Company"],
            ["title", "Title / Role"],
            ["source", "Lead Source"]
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">{label}</span>
              <input
                className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-field px-3 text-sm"
                value={String(form[key as keyof Customer] ?? "")}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                required={key === "name"}
              />
            </label>
          ))}
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">Status</span>
            <select
              className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-field px-3 text-sm"
              value={String(form.status || "new")}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Customer["status"] }))}
            >
              {["new", "contacted", "calling", "interested", "not_interested", "no_answer", "meeting_booked", "closed", "lost"].map((status) => (
                <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">Notes</span>
            <textarea
              className="focus-ring mt-1 min-h-24 w-full rounded-md border border-line bg-field px-3 py-2 text-sm"
              value={String(form.notes ?? "")}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">Lead Score</span>
              <input className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-field px-3 text-sm" type="number" value={Number(form.lead_score || 0)} onChange={(event) => setForm((current) => ({ ...current, lead_score: Number(event.target.value) }))} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">Revenue</span>
              <input className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-field px-3 text-sm" type="number" value={Number(form.revenue || 0)} onChange={(event) => setForm((current) => ({ ...current, revenue: Number(event.target.value) }))} />
            </label>
          </div>
        </div>
        <button className="focus-ring mt-4 h-11 w-full rounded-md bg-brand px-4 text-sm font-bold text-white hover:bg-brand/90">
          {editingId ? "Save Changes" : "Add Customer"}
        </button>
      </form>
    </div>
  );
}

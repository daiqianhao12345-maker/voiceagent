"use client";

import { useState } from "react";
import { Check, Clipboard, ExternalLink } from "lucide-react";

type WebhookItem = {
  label: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  description: string;
  payload?: string;
};

type WebhookGroup = {
  title: string;
  description: string;
  items: WebhookItem[];
};

export function WebhookDirectory({ groups }: { groups: WebhookGroup[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <section className="panel mt-5 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Webhook Directory</h3>
        <p className="mt-1 text-sm leading-6 text-ink/65">
          Use these production URLs when configuring n8n, Vapi, Retell, Bland, or other automation callbacks.
        </p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.title} className="rounded-lg border border-line bg-white">
            <div className="border-b border-line bg-field px-4 py-3">
              <h4 className="font-bold">{group.title}</h4>
              <p className="mt-1 text-sm text-ink/60">{group.description}</p>
            </div>
            <div className="divide-y divide-line">
              {group.items.map((item) => (
                <div key={item.label} className="grid gap-3 px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div>
                    <div className="flex items-center gap-2">
                      {item.method ? (
                        <span className="rounded bg-brand px-2 py-1 text-xs font-bold text-white">{item.method}</span>
                      ) : null}
                      <p className="font-semibold">{item.label}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink/60">{item.description}</p>
                  </div>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <code className="min-w-0 flex-1 overflow-x-auto rounded-md border border-line bg-field px-3 py-2 text-sm text-ink">
                        {item.url}
                      </code>
                      <button
                        className="focus-ring grid size-10 shrink-0 place-items-center rounded-md border border-line bg-white transition hover:bg-field"
                        type="button"
                        title="Copy webhook URL"
                        onClick={() => copy(item.url)}
                      >
                        {copied === item.url ? <Check size={17} /> : <Clipboard size={17} />}
                      </button>
                      {item.url.startsWith("http") ? (
                        <a
                          className="focus-ring grid size-10 shrink-0 place-items-center rounded-md border border-line bg-white transition hover:bg-field"
                          href={item.url}
                          title="Open URL"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={17} />
                        </a>
                      ) : null}
                    </div>
                    {item.payload ? (
                      <pre className="mt-2 overflow-x-auto rounded-md border border-line bg-ink p-3 text-xs leading-5 text-white">
                        {item.payload}
                      </pre>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

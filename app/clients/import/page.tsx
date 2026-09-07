"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { importClients, parseCsv, previewImport, type ImportColumnMap } from "@/lib/services/import";
import { useAppStore } from "@/lib/hooks/use-store";

export default function ImportClientsPage() {
  useAppStore();
  const router = useRouter();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [map, setMap] = useState<ImportColumnMap>({ phone: "" });
  const [count, setCount] = useState<number | null>(null);

  const preview = useMemo(() => (rows.length ? previewImport(rows, map) : []), [rows, map]);

  return (
    <main className="pb-8">
      <ScreenHeader title="Import clients" backHref="/clients" />
      <div className="flex flex-col gap-4 px-4">
        <p className="text-sm text-[var(--tg-subtitle-text-color)]">
          Upload a CSV, map columns, then preview before import.
        </p>
        <Input
          type="file"
          accept=".csv,text/csv"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const text = await file.text();
            const parsed = parseCsv(text);
            setHeaders(parsed.headers);
            setRows(parsed.rows);
            setMap({
              name: parsed.headers.find((item) => /name/i.test(item)),
              phone: parsed.headers.find((item) => /phone|tel/i.test(item)) ?? parsed.headers[0] ?? "",
              telegram: parsed.headers.find((item) => /telegram|username/i.test(item)),
              notes: parsed.headers.find((item) => /note/i.test(item)),
            });
          }}
        />
        {headers.length > 0 ? (
          <Card className="flex flex-col gap-3">
            <Field label="Name">
              <select className="select-field" value={map.name ?? ""} onChange={(e) => setMap({ ...map, name: e.target.value })}>
                <option value="">—</option>
                {headers.map((header) => (
                  <option key={header}>{header}</option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <select className="select-field" value={map.phone} onChange={(e) => setMap({ ...map, phone: e.target.value })}>
                {headers.map((header) => (
                  <option key={header}>{header}</option>
                ))}
              </select>
            </Field>
            <Field label="Telegram">
              <select className="select-field" value={map.telegram ?? ""} onChange={(e) => setMap({ ...map, telegram: e.target.value })}>
                <option value="">—</option>
                {headers.map((header) => (
                  <option key={header}>{header}</option>
                ))}
              </select>
            </Field>
            <Field label="Notes">
              <select className="select-field" value={map.notes ?? ""} onChange={(e) => setMap({ ...map, notes: e.target.value })}>
                <option value="">—</option>
                {headers.map((header) => (
                  <option key={header}>{header}</option>
                ))}
              </select>
            </Field>
          </Card>
        ) : null}
        {preview.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-semibold">Preview</p>
            <div className="overflow-hidden rounded-2xl bg-[var(--tg-section-bg-color)]">
              {preview.slice(0, 8).map((row, index) => (
                <div key={`${row.phone}-${index}`} className="border-b border-[color-mix(in_srgb,var(--tg-hint-color)_12%,transparent)] px-4 py-3 text-sm">
                  <div className="font-medium">
                    {row.firstName} {row.lastName}
                  </div>
                  <div className="text-[var(--tg-subtitle-text-color)]">{row.phone}</div>
                  {row.error ? <div className="text-[var(--tg-destructive-text-color)]">{row.error}</div> : null}
                </div>
              ))}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                const imported = importClients(preview);
                setCount(imported);
              }}
            >
              Import {preview.filter((row) => row.valid).length} clients
            </Button>
          </div>
        ) : null}
        {count != null ? (
          <Button variant="secondary" onClick={() => router.push("/clients")}>
            Imported {count}. Open clients
          </Button>
        ) : null}
      </div>
    </main>
  );
}

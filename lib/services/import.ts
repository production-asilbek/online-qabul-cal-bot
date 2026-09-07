import { createClient } from "@/lib/services/clients";
import { track } from "@/lib/services/analytics";

export interface ImportColumnMap {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  telegram?: string;
  notes?: string;
}

export interface ImportPreviewRow {
  firstName: string;
  lastName: string;
  phone: string;
  telegramUsername?: string;
  notes?: string;
  valid: boolean;
  error?: string;
}

export function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return { headers: [] as string[], rows: [] as Record<string, string>[] };

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
  });
  return { headers, rows };
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}

export function previewImport(rows: Record<string, string>[], map: ImportColumnMap): ImportPreviewRow[] {
  return rows.map((row) => {
    const name = map.name ? row[map.name] : "";
    const parts = name.split(" ").filter(Boolean);
    const firstName = (map.firstName ? row[map.firstName] : parts[0]) || "";
    const lastName = (map.lastName ? row[map.lastName] : parts.slice(1).join(" ")) || "";
    const phone = row[map.phone] || "";
    const telegramUsername = map.telegram ? row[map.telegram] : undefined;
    const notes = map.notes ? row[map.notes] : undefined;
    const valid = Boolean(firstName && lastName && phone);
    return {
      firstName,
      lastName,
      phone,
      telegramUsername,
      notes,
      valid,
      error: valid ? undefined : "Name and phone are required",
    };
  });
}

export function importClients(rows: ImportPreviewRow[]) {
  const created = rows.filter((row) => row.valid).map((row) => {
    const client = createClient({
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      telegramUsername: row.telegramUsername?.replace(/^@/, ""),
      notes: row.notes,
    });
    track("client_created", client.id);
    return client;
  });
  return created.length;
}

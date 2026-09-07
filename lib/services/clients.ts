import { formatISO, isAfter, parseISO } from "date-fns";
import { mockStore } from "@/lib/mock/store";
import type { Appointment, Client, ClientListItem, Paginated } from "@/types";

function db() {
  return mockStore.snapshot;
}

function businessId() {
  return db().currentBusinessId;
}

function nowIso() {
  return formatISO(new Date());
}

export function getClients(query = "", page = 1, pageSize = 40): Paginated<ClientListItem> {
  const normalized = query.trim().toLowerCase();
  const appointments = db().appointments.filter((item) => item.businessId === businessId());
  const items = db()
    .clients.filter((item) => item.businessId === businessId())
    .map((client) => toClientListItem(client, appointments))
    .filter((client) => {
      if (!normalized) return true;
      return [client.firstName, client.lastName, client.phone, client.telegramUsername]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    })
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

export function getClient(id: string) {
  return db().clients.find((client) => client.id === id && client.businessId === businessId()) ?? null;
}

export function getClientTags(clientId: string) {
  const tagIds = db().clientTags.filter((item) => item.clientId === clientId).map((item) => item.tagId);
  return db().tags.filter((tag) => tag.businessId === businessId() && tagIds.includes(tag.id));
}

export function getTags() {
  return db().tags.filter((tag) => tag.businessId === businessId());
}

export function createClient(
  input: Omit<Client, "id" | "businessId" | "createdAt" | "updatedAt"> & { tagIds?: string[] },
) {
  const created: Client = {
    ...input,
    id: crypto.randomUUID(),
    businessId: businessId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  mockStore.mutate((draft) => {
    draft.clients.unshift(created);
    for (const tagId of input.tagIds ?? []) {
      draft.clientTags.push({ clientId: created.id, tagId });
    }
  });

  return created;
}

export function updateClient(id: string, patch: Partial<Client> & { tagIds?: string[] }) {
  let updated: Client | null = null;
  mockStore.mutate((draft) => {
    const client = draft.clients.find((item) => item.id === id && item.businessId === draft.currentBusinessId);
    if (!client) return;
    Object.assign(client, patch, { updatedAt: nowIso() });
    if (patch.tagIds) {
      draft.clientTags = draft.clientTags.filter((item) => item.clientId !== id);
      for (const tagId of patch.tagIds) {
        draft.clientTags.push({ clientId: id, tagId });
      }
    }
    updated = { ...client };
  });
  return updated;
}

export function deleteClient(id: string) {
  mockStore.mutate((draft) => {
    draft.clients = draft.clients.filter((item) => item.id !== id);
    draft.clientTags = draft.clientTags.filter((item) => item.clientId !== id);
    draft.appointments = draft.appointments.filter((item) => item.clientId !== id);
  });
}

function toClientListItem(client: Client, appointments: Appointment[]): ClientListItem {
  const visits = appointments
    .filter((item) => item.clientId === client.id)
    .sort((a, b) => b.startAt.localeCompare(a.startAt));
  const now = new Date();
  const lastVisit = visits.find((item) => item.status === "completed" || parseISO(item.startAt) < now);
  const next = visits
    .filter((item) => ["scheduled", "confirmed"].includes(item.status) && isAfter(parseISO(item.startAt), now))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))[0];

  return {
    ...client,
    lastVisitAt: lastVisit?.startAt,
    nextAppointmentAt: next?.startAt,
    tags: getClientTags(client.id),
  };
}

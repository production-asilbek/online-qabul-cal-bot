import { formatISO } from "date-fns";
import { mockStore } from "@/lib/mock/store";
import type { Service } from "@/types";

function db() {
  return mockStore.snapshot;
}

function nowIso() {
  return formatISO(new Date());
}

export function getServices(includeArchived = false) {
  return db()
    .services.filter((item) => item.businessId === db().currentBusinessId)
    .filter((item) => includeArchived || item.active)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getService(id: string) {
  return db().services.find((item) => item.id === id && item.businessId === db().currentBusinessId) ?? null;
}

export function createService(input: Omit<Service, "id" | "businessId" | "createdAt" | "updatedAt">) {
  const service: Service = {
    ...input,
    id: crypto.randomUUID(),
    businessId: db().currentBusinessId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  mockStore.mutate((draft) => {
    draft.services.push(service);
  });
  return service;
}

export function updateService(id: string, patch: Partial<Service>) {
  mockStore.mutate((draft) => {
    const service = draft.services.find((item) => item.id === id && item.businessId === draft.currentBusinessId);
    if (!service) return;
    Object.assign(service, patch, { updatedAt: nowIso() });
  });
}

export function archiveService(id: string) {
  updateService(id, { active: false, archivedAt: nowIso() });
}

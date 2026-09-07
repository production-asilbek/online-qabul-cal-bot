import { formatISO } from "date-fns";
import { mockStore } from "@/lib/mock/store";
import type { StaffMember } from "@/types";

function db() {
  return mockStore.snapshot;
}

function nowIso() {
  return formatISO(new Date());
}

export function getStaff(includeInactive = false) {
  return db()
    .staff.filter((item) => item.businessId === db().currentBusinessId)
    .filter((item) => includeInactive || item.active)
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
}

export function getStaffMember(id: string) {
  return db().staff.find((item) => item.id === id && item.businessId === db().currentBusinessId) ?? null;
}

export function createStaff(input: Omit<StaffMember, "id" | "businessId" | "createdAt" | "updatedAt">) {
  const member: StaffMember = {
    ...input,
    id: crypto.randomUUID(),
    businessId: db().currentBusinessId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  mockStore.mutate((draft) => {
    draft.staff.push(member);
  });
  return member;
}

export function updateStaff(id: string, patch: Partial<StaffMember>) {
  mockStore.mutate((draft) => {
    const member = draft.staff.find((item) => item.id === id && item.businessId === draft.currentBusinessId);
    if (!member) return;
    Object.assign(member, patch, { updatedAt: nowIso() });
  });
}

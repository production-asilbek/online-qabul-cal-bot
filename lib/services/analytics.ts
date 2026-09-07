import { formatISO } from "date-fns";
import { mockStore } from "@/lib/mock/store";
import type { AnalyticsEventName } from "@/types";

export function track(name: AnalyticsEventName, entityId?: string) {
  mockStore.mutate((draft) => {
    draft.analyticsEvents.push({
      id: crypto.randomUUID(),
      businessId: draft.currentBusinessId,
      name,
      entityId,
      createdAt: formatISO(new Date()),
    });
  });
}

export function getAnalyticsEvents() {
  return mockStore.snapshot.analyticsEvents.filter(
    (item) => item.businessId === mockStore.snapshot.currentBusinessId,
  );
}

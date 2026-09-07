import { formatISO } from "date-fns";
import { mockStore } from "@/lib/mock/store";
import type { Business, BusinessSettings, BusinessType, WorkingHours } from "@/types";

function db() {
  return mockStore.snapshot;
}

function nowIso() {
  return formatISO(new Date());
}

export function getCurrentUser() {
  return db().users.find((user) => user.id === db().currentUserId) ?? db().users[0];
}

export function getCurrentBusiness() {
  return db().businesses.find((business) => business.id === db().currentBusinessId) ?? db().businesses[0];
}

export function getBusinessSettings(): BusinessSettings {
  const business = getCurrentBusiness();
  return (
    db().settings.find((item) => item.businessId === business.id) ?? {
      businessId: business.id,
      reminderOffsetsMin: [1440, 60],
      defaultChannel: "sms",
    }
  );
}

export function getWorkingHours(staffId?: string) {
  return db().workingHours.filter(
    (item) => item.businessId === db().currentBusinessId && item.staffId === staffId,
  );
}

export function getHolidays() {
  return db().holidays.filter((item) => item.businessId === db().currentBusinessId);
}

export function isClosedOn(date: Date, staffId?: string) {
  const holiday = getHolidays().some((item) => item.date === formatISO(date, { representation: "date" }));
  if (holiday) return true;
  const hours = getWorkingHours(staffId).find((item) => item.weekday === date.getDay());
  return hours?.isClosed ?? false;
}

export function updateBusiness(patch: Partial<Business>) {
  mockStore.mutate((draft) => {
    const business = draft.businesses.find((item) => item.id === draft.currentBusinessId);
    if (!business) return;
    Object.assign(business, patch, { updatedAt: nowIso() });
  });
  return getCurrentBusiness();
}

export function updateWorkingHours(hours: WorkingHours[]) {
  mockStore.mutate((draft) => {
    const staffId = hours[0]?.staffId;
    draft.workingHours = draft.workingHours.filter(
      (item) => !(item.businessId === draft.currentBusinessId && item.staffId === staffId),
    );
    draft.workingHours.push(...hours);
  });
}

export function updateReminderOffsets(minutes: number[]) {
  mockStore.mutate((draft) => {
    const settings = draft.settings.find((item) => item.businessId === draft.currentBusinessId);
    if (settings) settings.reminderOffsetsMin = minutes;
  });
}

export function completeOnboarding(input: { name: string; type: BusinessType; hours: WorkingHours[] }) {
  mockStore.mutate((draft) => {
    const business = draft.businesses.find((item) => item.id === draft.currentBusinessId);
    if (!business) return;
    business.name = input.name;
    business.type = input.type;
    business.onboardingComplete = true;
    business.updatedAt = nowIso();
    draft.workingHours = draft.workingHours.filter(
      (item) => !(item.businessId === draft.currentBusinessId && !item.staffId),
    );
    draft.workingHours.push(...input.hours);
  });
}

export function getBusinessCategory(business = getCurrentBusiness()) {
  return business.category || "medical service";
}

export function resetOnboarding() {
  mockStore.mutate((draft) => {
    const business = draft.businesses.find((item) => item.id === draft.currentBusinessId);
    if (business) business.onboardingComplete = false;
  });
}

export function finishRegistration(name: string) {
  mockStore.mutate((draft) => {
    const business = draft.businesses.find((item) => item.id === draft.currentBusinessId);
    if (!business) return;
    business.name = name.trim();
    business.category = "medical service";
    business.onboardingComplete = true;
    business.updatedAt = nowIso();
  });
  return getCurrentBusiness();
}

export function applyGoogleProfile(name: string) {
  mockStore.mutate((draft) => {
    const user = draft.users.find((item) => item.id === draft.currentUserId);
    if (!user) return;
    const [first, ...rest] = name.trim().split(/\s+/);
    user.firstName = first || user.firstName;
    if (rest.length) user.lastName = rest.join(" ");
    user.updatedAt = nowIso();
  });
}

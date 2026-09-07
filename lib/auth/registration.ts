export type RegistrationState = {
  complete: boolean;
  serviceName?: string;
};

const listeners = new Set<() => void>();
const cache = new Map<string, RegistrationState>();

function storageKey(accountId: string) {
  return `stom-registration-v1:${accountId}`;
}

function read(accountId: string): RegistrationState {
  if (typeof window === "undefined") return { complete: false };
  try {
    const raw = window.localStorage.getItem(storageKey(accountId));
    if (!raw) return { complete: false };
    const parsed = JSON.parse(raw) as RegistrationState;
    return { complete: Boolean(parsed.complete), serviceName: parsed.serviceName };
  } catch {
    return { complete: false };
  }
}

export function getRegistration(accountId: string | null | undefined): RegistrationState {
  if (!accountId) return { complete: false };
  const state = read(accountId);
  cache.set(accountId, state);
  return state;
}

export function completeRegistration(serviceName: string, accountId: string) {
  const state = { complete: true, serviceName };
  cache.set(accountId, state);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(accountId), JSON.stringify(state));
  }
  listeners.forEach((listener) => listener());
}

export function subscribeRegistration(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isRegistrationComplete(accountId: string | null | undefined) {
  return getRegistration(accountId).complete;
}

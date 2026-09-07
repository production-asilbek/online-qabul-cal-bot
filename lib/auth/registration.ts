const STORAGE_KEY = "stom-registration-v1";

export type RegistrationState = {
  complete: boolean;
  serviceName?: string;
};

const listeners = new Set<() => void>();
let cached: RegistrationState = { complete: false };

function read(): RegistrationState {
  if (typeof window === "undefined") return { complete: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { complete: false };
    const parsed = JSON.parse(raw) as RegistrationState;
    return { complete: Boolean(parsed.complete), serviceName: parsed.serviceName };
  } catch {
    return { complete: false };
  }
}

export function getRegistration() {
  cached = read();
  return cached;
}

export function completeRegistration(serviceName: string) {
  cached = { complete: true, serviceName };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  }
  listeners.forEach((listener) => listener());
}

export function subscribeRegistration(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isRegistrationComplete() {
  return getRegistration().complete;
}

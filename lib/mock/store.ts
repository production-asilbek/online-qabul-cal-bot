import type { DatabaseSnapshot } from "@/types";
import { createEmptyWorkspace } from "./seed";

type AccountProfile = { id: string; name: string; givenName?: string };

type Listener = () => void;

function storageKey(accountId: string) {
  return `stom-assistant-db-v2:${accountId}`;
}

class MockStore {
  private data: DatabaseSnapshot | null = null;
  private listeners = new Set<Listener>();
  private hydrated = false;
  private accountId: string | null = null;
  private profile: AccountProfile | null = null;
  version = 0;

  get snapshot(): DatabaseSnapshot {
    if (!this.data) {
      this.data = createEmptyWorkspace({ id: "anon", name: "User" });
    }
    return this.data;
  }

  get isHydrated() {
    return this.hydrated;
  }

  get currentAccountId() {
    return this.accountId;
  }

  hydrate() {
    this.switchAccount(this.accountId ?? "anon", this.profile ?? undefined);
  }

  switchAccount(accountId: string, profile?: AccountProfile) {
    if (this.hydrated && this.accountId === accountId && this.data) {
      this.profile = profile ?? this.profile;
      return;
    }

    if (typeof window !== "undefined" && this.hydrated && this.data && this.accountId) {
      this.persist();
    }

    this.accountId = accountId;
    this.profile = profile ?? { id: accountId, name: "User" };

    if (typeof window === "undefined") {
      this.data = createEmptyWorkspace(this.profile);
      this.hydrated = true;
      this.emit();
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey(accountId));
      this.data = raw
        ? (JSON.parse(raw) as DatabaseSnapshot)
        : createEmptyWorkspace(this.profile);
    } catch {
      this.data = createEmptyWorkspace(this.profile);
    }

    this.hydrated = true;
    this.persist();
    this.emit();
  }

  reset() {
    this.data = createEmptyWorkspace(this.profile ?? { id: this.accountId ?? "anon", name: "User" });
    this.persist();
    this.emit();
  }

  mutate(updater: (draft: DatabaseSnapshot) => void) {
    updater(this.snapshot);
    this.persist();
    this.emit();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private persist() {
    if (typeof window === "undefined" || !this.data || !this.accountId) return;
    window.localStorage.setItem(storageKey(this.accountId), JSON.stringify(this.data));
  }

  private emit() {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }
}

export const mockStore = new MockStore();

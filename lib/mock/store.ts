import type { DatabaseSnapshot } from "@/types";
import { createSeed } from "./seed";

const STORAGE_KEY = "stom-assistant-db-v1";

type Listener = () => void;

class MockStore {
  private data: DatabaseSnapshot | null = null;
  private listeners = new Set<Listener>();
  private hydrated = false;
  version = 0;

  get snapshot(): DatabaseSnapshot {
    if (!this.data) {
      this.data = createSeed();
    }
    return this.data;
  }

  get isHydrated() {
    return this.hydrated;
  }

  hydrate() {
    if (this.hydrated) return;
    if (typeof window === "undefined") {
      this.data = createSeed();
      this.hydrated = true;
      this.version += 1;
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      this.data = raw ? (JSON.parse(raw) as DatabaseSnapshot) : createSeed();
    } catch {
      this.data = createSeed();
    }
    this.hydrated = true;
    this.version += 1;
    this.persist();
  }

  reset() {
    this.data = createSeed();
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
    if (typeof window === "undefined" || !this.data) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  private emit() {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }
}

export const mockStore = new MockStore();

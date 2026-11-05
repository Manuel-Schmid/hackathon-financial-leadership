import { readJson, writeJson } from '@/lib/storage';
import type { ProfileInput, ProfileStore, SavedProfile } from './ProfileStore';

const KEY = 'kubus.guestProfiles';

export interface ProfileStorage {
  read(fallback: SavedProfile[]): SavedProfile[];
  write(value: SavedProfile[]): void;
}

const browserStorage: ProfileStorage = {
  read: (fallback) => readJson(KEY, fallback),
  write: (value) => writeJson(KEY, value),
};

/** Gastmodus und Offline-Modus: eigene Profile liegen nur in diesem Browser. */
export class LocalProfileStore implements ProfileStore {
  constructor(private storage: ProfileStorage = browserStorage) {}

  async list(): Promise<SavedProfile[]> {
    return this.storage.read([]);
  }

  async create(input: ProfileInput): Promise<SavedProfile> {
    const profiles = this.storage.read([]);
    const created: SavedProfile = { id: `local-${Date.now()}-${profiles.length}`, ...input, builtIn: false };
    this.storage.write([...profiles, created]);
    return created;
  }

  async update(id: string, input: ProfileInput): Promise<void> {
    this.storage.write(this.storage.read([]).map((p) => (p.id === id ? { ...p, ...input } : p)));
  }

  async remove(id: string): Promise<void> {
    this.storage.write(this.storage.read([]).filter((p) => p.id !== id));
  }
}

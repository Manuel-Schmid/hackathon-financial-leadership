import { describe, expect, it } from 'vitest';
import { LocalProfileStore, type ProfileStorage } from './LocalProfileStore';
import type { SavedProfile } from './ProfileStore';

function memory(): ProfileStorage {
  let value: SavedProfile[] | null = null;
  return {
    read: (fallback) => value ?? fallback,
    write: (next) => {
      value = next;
    },
  };
}

const weights = { liquiditaet: 0.3, rentabilitaet: 0.5, sicherheit: 0.2 };

describe('LocalProfileStore', () => {
  it('startet ohne eigene Profile', async () => {
    expect(await new LocalProfileStore(memory()).list()).toEqual([]);
  });
  it('speichert, ändert und löscht', async () => {
    const store = new LocalProfileStore(memory());
    const created = await store.create({ name: 'Kunde Müller', weights });
    expect(created.builtIn).toBe(false);
    expect(await store.list()).toEqual([created]);

    await store.update(created.id, { name: 'Müller', weights: { ...weights, sicherheit: 0.1, liquiditaet: 0.4 } });
    expect((await store.list())[0]).toMatchObject({ id: created.id, name: 'Müller', weights: { sicherheit: 0.1 } });

    await store.remove(created.id);
    expect(await store.list()).toEqual([]);
  });
  it('vergibt auch kurz hintereinander verschiedene ids', async () => {
    const store = new LocalProfileStore(memory());
    const [a, b] = [await store.create({ name: 'A', weights }), await store.create({ name: 'B', weights })];
    expect(a.id).not.toBe(b.id);
  });
});

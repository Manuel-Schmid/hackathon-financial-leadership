import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProfileInput, ProfileStore, SavedProfile } from './ProfileStore';

interface Row {
  id: string;
  name: string;
  liquiditaet: number;
  rentabilitaet: number;
  sicherheit: number;
}

const COLUMNS = 'id, name, liquiditaet, rentabilitaet, sicherheit';

function check<T extends { error: unknown }>(result: T): T {
  if (result.error) throw result.error;
  return result;
}

function fromRow(r: Row): SavedProfile {
  return {
    id: r.id,
    name: r.name,
    weights: { liquiditaet: r.liquiditaet, rentabilitaet: r.rentabilitaet, sicherheit: r.sicherheit },
    builtIn: false,
  };
}

/** Zugriffsschutz macht die Datenbank (RLS, supabase/schema.sql). */
export class SupabaseProfileStore implements ProfileStore {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  async list(): Promise<SavedProfile[]> {
    const { data } = check(await this.client.from('investor_profiles').select(COLUMNS).order('created_at'));
    return ((data ?? []) as Row[]).map(fromRow);
  }

  async create({ name, weights }: ProfileInput): Promise<SavedProfile> {
    const { data } = check(
      await this.client
        .from('investor_profiles')
        .insert({ user_id: this.userId, name, ...weights })
        .select(COLUMNS)
        .single(),
    );
    return fromRow(data as Row);
  }

  async update(id: string, { name, weights }: ProfileInput): Promise<void> {
    check(await this.client.from('investor_profiles').update({ name, ...weights }).eq('id', id));
  }

  async remove(id: string): Promise<void> {
    check(await this.client.from('investor_profiles').delete().eq('id', id));
  }
}

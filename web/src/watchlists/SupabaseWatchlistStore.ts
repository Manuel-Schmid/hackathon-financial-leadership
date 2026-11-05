import type { SupabaseClient } from '@supabase/supabase-js';
import { PROFILES } from '@/lib/config';
import type { NewWatchlist, Watchlist, WatchlistPatch, WatchlistStore } from './WatchlistStore';

const COLUMNS = 'id, name, client_name, investor_profile, investor_profile_id, watchlist_items(ticker, added_at)';

interface Row {
  id: string;
  name: string;
  client_name: string | null;
  investor_profile: string;
  investor_profile_id: string | null;
  watchlist_items: { ticker: string; added_at: string }[];
}

function check<T extends { error: unknown }>(result: T): T {
  if (result.error) throw result.error;
  return result;
}

function fromRow(r: Row): Watchlist {
  return {
    id: r.id,
    name: r.name,
    clientName: r.client_name,
    // Gelöschtes eigenes Profil: Die Datenbank setzt den Verweis auf null, es gilt wieder die Vorlage.
    investorProfile: r.investor_profile_id ?? r.investor_profile,
    tickers: [...r.watchlist_items].sort((a, b) => a.added_at.localeCompare(b.added_at)).map((i) => i.ticker),
  };
}

/** Vorlagen stehen als Name in investor_profile, eigene Profile als Verweis in investor_profile_id. */
function profileColumns(id: string): Record<string, string | null> {
  return id in PROFILES ? { investor_profile: id, investor_profile_id: null } : { investor_profile: 'ausgewogen', investor_profile_id: id };
}

/** Zugriffsschutz macht die Datenbank (RLS, supabase/schema.sql). */
export class SupabaseWatchlistStore implements WatchlistStore {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  async list(): Promise<Watchlist[]> {
    const { data } = check(await this.client.from('watchlists').select(COLUMNS).order('created_at'));
    return ((data ?? []) as Row[]).map(fromRow);
  }

  async create(input: NewWatchlist): Promise<Watchlist> {
    const { data } = check(
      await this.client
        .from('watchlists')
        .insert({
          user_id: this.userId,
          name: input.name,
          client_name: input.clientName ?? null,
          ...profileColumns(input.investorProfile ?? 'ausgewogen'),
        })
        .select(COLUMNS)
        .single(),
    );
    return fromRow(data as Row);
  }

  async update(id: string, patch: WatchlistPatch): Promise<void> {
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.clientName !== undefined) row.client_name = patch.clientName;
    if (patch.investorProfile !== undefined) Object.assign(row, profileColumns(patch.investorProfile));
    check(await this.client.from('watchlists').update(row).eq('id', id));
  }

  async remove(id: string): Promise<void> {
    check(await this.client.from('watchlists').delete().eq('id', id));
  }

  async addItem(id: string, ticker: string): Promise<void> {
    check(await this.client.from('watchlist_items').upsert({ watchlist_id: id, ticker }));
  }

  async removeItem(id: string, ticker: string): Promise<void> {
    check(await this.client.from('watchlist_items').delete().eq('watchlist_id', id).eq('ticker', ticker));
  }
}

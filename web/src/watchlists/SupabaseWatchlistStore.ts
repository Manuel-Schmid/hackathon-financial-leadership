import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvestorProfile } from '@/data/types';
import type { NewWatchlist, Watchlist, WatchlistPatch, WatchlistStore } from './WatchlistStore';

interface Row {
  id: string;
  name: string;
  client_name: string | null;
  investor_profile: InvestorProfile;
  is_active: boolean;
  watchlist_items: { ticker: string; added_at: string }[];
}

function check<T extends { error: unknown }>(result: T): T {
  if (result.error) throw result.error;
  return result;
}

/** Zugriffsschutz macht die Datenbank (RLS, supabase/schema.sql). */
export class SupabaseWatchlistStore implements WatchlistStore {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  async list(): Promise<Watchlist[]> {
    const { data } = check(
      await this.client
        .from('watchlists')
        .select('id, name, client_name, investor_profile, is_active, watchlist_items(ticker, added_at)')
        .order('created_at'),
    );
    return ((data ?? []) as Row[]).map((r) => ({
      id: r.id,
      name: r.name,
      clientName: r.client_name,
      investorProfile: r.investor_profile,
      isActive: r.is_active,
      tickers: [...r.watchlist_items].sort((a, b) => a.added_at.localeCompare(b.added_at)).map((i) => i.ticker),
    }));
  }

  async create(input: NewWatchlist): Promise<void> {
    check(
      await this.client.from('watchlists').insert({
        user_id: this.userId,
        name: input.name,
        client_name: input.clientName ?? null,
        investor_profile: input.investorProfile ?? 'ausgewogen',
      }),
    );
  }

  async update(id: string, patch: WatchlistPatch): Promise<void> {
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.clientName !== undefined) row.client_name = patch.clientName;
    if (patch.investorProfile !== undefined) row.investor_profile = patch.investorProfile;
    check(await this.client.from('watchlists').update(row).eq('id', id));
  }

  async remove(id: string): Promise<void> {
    const wasActive = (await this.list()).find((l) => l.id === id)?.isActive;
    check(await this.client.from('watchlists').delete().eq('id', id));
    if (wasActive) {
      const next = (await this.list())[0];
      if (next) await this.setActive(next.id);
    }
  }

  async addItem(id: string, ticker: string): Promise<void> {
    check(await this.client.from('watchlist_items').upsert({ watchlist_id: id, ticker }));
  }

  async removeItem(id: string, ticker: string): Promise<void> {
    check(await this.client.from('watchlist_items').delete().eq('watchlist_id', id).eq('ticker', ticker));
  }

  async setActive(id: string): Promise<void> {
    check(await this.client.from('watchlists').update({ is_active: false }).eq('user_id', this.userId));
    check(await this.client.from('watchlists').update({ is_active: true }).eq('id', id));
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DataSource } from './DataSource';
import type { Ampel, Company, CompanyKpi, DataMeta } from './types';

const PAGE = 1000; // Supabase liefert standardmässig höchstens 1000 Zeilen pro Abfrage

interface CompanyRow {
  ticker: string;
  name: string;
  sector: string;
  sector_de: string;
  index: Company['index'];
  country: string;
  currency: string;
  market_cap_usd: number | null;
  size_class: Company['sizeClass'];
  is_financial: boolean;
  fiscal_year: number;
  as_of: string;
}
interface KpiRow {
  ticker: string;
  year: number;
  kpi_id: string;
  value: number | null;
  ampel: Ampel | null;
  /** fehlt, solange die Spalte in Supabase nicht angelegt ist */
  ampel_branche?: Ampel | null;
}
interface ScoreRow {
  ticker: string;
  year: number;
  liquiditaet: number | null;
  rentabilitaet: number | null;
  sicherheit: number | null;
}

export class SupabaseSource implements DataSource {
  readonly kind = 'supabase' as const;
  private companies?: Promise<Company[]>;

  constructor(private client: SupabaseClient) {}

  /** Lädt alle Seiten. order muss eindeutig sein, sonst fehlen oder doppeln Zeilen an den Seitengrenzen. */
  private async all<T>(table: string, order: string[]): Promise<T[]> {
    const { count, error } = await this.client.from(table).select('*', { count: 'exact', head: true });
    if (error) throw error;
    const pages = Math.ceil((count ?? 0) / PAGE);
    const results = await Promise.all(
      Array.from({ length: pages }, (_, i) => {
        let query = this.client.from(table).select('*');
        for (const column of order) query = query.order(column);
        return query.range(i * PAGE, (i + 1) * PAGE - 1);
      }),
    );
    return results.flatMap((r) => {
      if (r.error) throw r.error;
      return (r.data ?? []) as T[];
    });
  }

  private async load(): Promise<Company[]> {
    const { data, error } = await this.client.from('companies').select('*');
    if (error) throw error;
    if (!data?.length) throw new Error('Supabase ist noch leer');
    const [kpiRows, scoreRows] = await Promise.all([
      this.all<KpiRow>('kpis', ['ticker', 'kpi_id', 'year']),
      this.all<ScoreRow>('scores', ['ticker', 'year']),
    ]);

    const kpis = new Map<string, Record<string, CompanyKpi>>();
    for (const row of kpiRows) {
      const byId = kpis.get(row.ticker) ?? {};
      const kpi = (byId[row.kpi_id] ??= { value: null, ampel: 'grey', ampelBranche: null, history: [] });
      kpi.history.push({ year: row.year, value: row.value });
      if (row.ampel) {
        kpi.value = row.value;
        kpi.ampel = row.ampel;
        kpi.ampelBranche = row.ampel_branche ?? null;
      }
      kpis.set(row.ticker, byId);
    }
    const scores = new Map(scoreRows.map((s) => [s.ticker, s]));

    return (data as CompanyRow[]).map((c) => {
      const s = scores.get(c.ticker);
      return {
        ticker: c.ticker,
        name: c.name,
        sector: c.sector,
        sectorDe: c.sector_de,
        index: c.index,
        country: c.country,
        currency: c.currency,
        marketCapUsd: c.market_cap_usd,
        sizeClass: c.size_class,
        isFinancial: c.is_financial,
        fiscalYear: c.fiscal_year,
        scores: {
          liquiditaet: s?.liquiditaet ?? null,
          rentabilitaet: s?.rentabilitaet ?? null,
          sicherheit: s?.sicherheit ?? null,
        },
        kpis: kpis.get(c.ticker) ?? {},
      };
    });
  }

  listCompanies(): Promise<Company[]> {
    this.companies ??= this.load();
    return this.companies;
  }

  async meta(): Promise<DataMeta> {
    const { data, error, count } = await this.client
      .from('companies')
      .select('as_of', { count: 'exact' })
      .order('as_of', { ascending: false })
      .limit(1);
    if (error) throw error;
    return { asOf: data?.[0]?.as_of ?? '', source: 'Yahoo Finance', count: count ?? 0 };
  }
}

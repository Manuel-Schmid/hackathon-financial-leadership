import { supabase } from '@/lib/supabaseClient';
import type { DataSource } from './DataSource';
import { JsonSource } from './JsonSource';
import { SupabaseSource } from './SupabaseSource';
import type { Company, DataMeta } from './types';

const TIMEOUT_MS = 8000;

export interface LoadedData {
  source: DataSource['kind'];
  companies: Company[];
  meta: DataMeta;
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Zeitüberschreitung')), TIMEOUT_MS);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

async function read(source: DataSource): Promise<LoadedData> {
  const [companies, meta] = await Promise.all([source.listCompanies(), source.meta()]);
  return { source: source.kind, companies, meta };
}

/** Modus aus VITE_DATA_MODE: auto = Supabase mit Rückfall auf JSON, json = nur Datei, supabase = ohne Rückfall. */
export async function loadData(): Promise<LoadedData> {
  const mode = import.meta.env.VITE_DATA_MODE ?? 'auto';
  if (!supabase) return read(new JsonSource());
  if (mode === 'supabase') return read(new SupabaseSource(supabase));
  try {
    return await withTimeout(read(new SupabaseSource(supabase)));
  } catch (err) {
    console.info('Offline-Modus: Supabase nicht verfügbar, nutze companies.json', err);
    return read(new JsonSource());
  }
}

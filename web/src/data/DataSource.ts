import type { Company, DataMeta } from './types';

/** Einziger Weg zu den Marktdaten. Komponenten kennen weder Supabase noch die JSON-Datei. */
export interface DataSource {
  readonly kind: 'json' | 'supabase';
  listCompanies(): Promise<Company[]>;
  meta(): Promise<DataMeta>;
}

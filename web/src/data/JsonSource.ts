import type { DataSource } from './DataSource';
import type { Company, DataMeta } from './types';

interface Payload {
  meta: DataMeta;
  companies: Company[];
}

/** Offline-Modus: Datei aus der Pipeline (data/pipeline/export_json.py). */
export class JsonSource implements DataSource {
  readonly kind = 'json' as const;
  private payload?: Promise<Payload>;

  private load(): Promise<Payload> {
    this.payload ??= fetch(`${import.meta.env.BASE_URL}data/companies.json`).then((res) => {
      if (!res.ok) throw new Error(`companies.json nicht gefunden (${res.status})`);
      return res.json() as Promise<Payload>;
    });
    return this.payload;
  }

  async listCompanies(): Promise<Company[]> {
    return (await this.load()).companies;
  }

  async meta(): Promise<DataMeta> {
    return (await this.load()).meta;
  }
}

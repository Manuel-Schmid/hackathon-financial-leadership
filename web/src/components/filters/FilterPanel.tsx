import type { Company } from '@/data/types';
import { SECTORS } from '@/lib/config';
import { DEFAULT_FILTERS, type Filters, type Universe } from '@/lib/filters';
import { CapRangeFilter } from './CapRangeFilter';

function toggled<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

const SECTOR_OPTIONS = Object.entries(SECTORS).sort((a, b) => a[1].de.localeCompare(b[1].de, 'de'));

interface Props {
  companies: Company[];
  filters: Filters;
  resultCount: number;
  onChange(next: Filters): void;
  onClose(): void;
}

export function FilterPanel({ companies, filters, resultCount, onChange, onClose }: Props) {
  const universe = (id: Universe, label: string) => {
    const on = filters.universes.includes(id);
    return (
      <button
        type="button"
        aria-pressed={on}
        className={`pill ${on ? 'pill-on' : ''}`}
        onClick={() => onChange({ ...filters, universes: toggled(filters.universes, id) })}
      >
        {label}
      </button>
    );
  };

  return (
    <div role="dialog" aria-label="Filter" className="card absolute right-0 top-[50px] z-40 w-[400px] space-y-4 p-5 shadow-pop">
      <div>
        <h3 className="mb-1.5 text-[13px] font-bold">Datenbank</h3>
        <div className="flex gap-1.5">
          {universe('SP500', 'S&P 500')}
          {universe('SWISS', 'SMI und SMIM')}
        </div>
      </div>
      <label className="block text-[13px] font-bold">
        Branche
        <select
          className="input mt-1.5 h-9 w-full cursor-pointer py-0 font-medium"
          value={filters.sector ?? ''}
          onChange={(e) => onChange({ ...filters, sector: e.target.value || null })}
        >
          <option value="">Alle Branchen</option>
          {SECTOR_OPTIONS.map(([id, sector]) => (
            <option key={id} value={id}>
              {sector.de}
            </option>
          ))}
        </select>
      </label>
      <div>
        <h3 className="mb-1.5 text-[13px] font-bold">Börsenwert</h3>
        <CapRangeFilter
          companies={companies}
          capMin={filters.capMin}
          capMax={filters.capMax}
          onChange={(capMin, capMax) => onChange({ ...filters, capMin, capMax })}
        />
      </div>
      <label
        className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold"
        title="Liquiditätsgrade sind bei Banken und Versicherungen nicht sinnvoll, deshalb nur eingeschränkt vergleichbar."
      >
        <input
          type="checkbox"
          className="h-4 w-4 accent-accent"
          checked={filters.includeFinancials}
          onChange={(e) => onChange({ ...filters, includeFinancials: e.target.checked })}
        />
        Banken und Versicherungen zeigen
      </label>
      <div className="flex gap-2">
        <button type="button" className="btn" onClick={() => onChange({ ...DEFAULT_FILTERS, search: filters.search })}>
          Zurücksetzen
        </button>
        <button type="button" className="btn btn-primary flex-1" onClick={onClose}>
          {resultCount} Unternehmen zeigen
        </button>
      </div>
    </div>
  );
}

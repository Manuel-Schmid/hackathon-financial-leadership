import type { SizeClass } from '@/data/types';
import { SECTORS } from '@/lib/config';
import { DEFAULT_FILTERS, type Filters, type Universe } from '@/lib/filters';

const SIZES: { id: SizeClass; label: string }[] = [
  { id: 'Large', label: 'Large >10 Mrd.' },
  { id: 'Mid', label: 'Mid 2–10' },
  { id: 'Small', label: 'Small <2' },
];

function toggled<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

interface Props {
  filters: Filters;
  onChange(next: Filters): void;
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="tag">{label}</span>
      <div className="flex h-[34px] items-center gap-1.5">{children}</div>
    </div>
  );
}

export function FilterBar({ filters, onChange }: Props) {
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
    <div className="flex flex-wrap items-start gap-x-6 gap-y-2 border-b border-line bg-white px-4 py-2.5 lg:px-7">
      <Group label="Datenbank">
        {universe('SP500', 'S&P 500')}
        {universe('SWISS', 'SMI / SMIM')}
      </Group>
      <Group label="Branche">
        <select
          aria-label="Branche"
          className="pill cursor-pointer"
          value={filters.sector ?? ''}
          onChange={(e) => onChange({ ...filters, sector: e.target.value || null })}
        >
          <option value="">Alle Branchen</option>
          {Object.entries(SECTORS)
            .sort((a, b) => a[1].de.localeCompare(b[1].de, 'de'))
            .map(([id, sector]) => (
              <option key={id} value={id}>
                {sector.de}
              </option>
            ))}
        </select>
      </Group>
      <Group label="Grösse (Börsenwert in USD)">
        <div className="flex overflow-hidden rounded-[9px] border border-line">
          {SIZES.map(({ id, label }) => {
            const on = filters.sizes.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                className={`border-r border-line px-3 py-1.5 text-[13px] font-semibold last:border-r-0 ${on ? 'bg-ink text-white' : 'bg-white'}`}
                onClick={() => onChange({ ...filters, sizes: toggled(filters.sizes, id) })}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Group>
      <Group label="Suche">
        <input
          type="search"
          className="input h-[34px] w-[230px] py-0"
          placeholder="Name oder Ticker, z.B. VACN"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </Group>
      <Group label="Finanzsektor">
        <label
          className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold"
          title="Banken und Versicherungen: Liquiditätsgrade sind nicht sinnvoll, deshalb nur eingeschränkt vergleichbar."
        >
          <input
            type="checkbox"
            className="h-4 w-4 accent-S"
            checked={filters.includeFinancials}
            onChange={(e) => onChange({ ...filters, includeFinancials: e.target.checked })}
          />
          Banken &amp; Versicherungen ⓘ
        </label>
      </Group>
      <div className="flex-1" />
      <button type="button" className="pill mt-[22px]" onClick={() => onChange(DEFAULT_FILTERS)}>
        ↺ Zurücksetzen
      </button>
    </div>
  );
}

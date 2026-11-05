import { Link } from 'react-router-dom';
import type { Company } from '@/data/types';
import { SECTORS } from '@/lib/config';
import { DEFAULT_FILTERS, type Filters, type Universe } from '@/lib/filters';
import { profileLabel } from '@/lib/weighting';
import { useProfiles } from '@/profiles/ProfileProvider';
import { TEMPLATES, type SavedProfile } from '@/profiles/ProfileStore';
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

function ProfileOption({ profile }: { profile: SavedProfile }) {
  return (
    <option value={profile.id}>
      {profile.name} ({profileLabel(profile.weights)})
    </option>
  );
}

export function FilterPanel({ companies, filters, resultCount, onChange, onClose }: Props) {
  const { own } = useProfiles();
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
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label htmlFor="filter-profile" className="text-[13px] font-bold">Anlegerprofil</label>
          <Link to="/profil" className="text-xs font-semibold text-muted underline hover:text-text">Profile verwalten</Link>
        </div>
        <select
          id="filter-profile"
          title="Gewichtet den Gesamt-Score in der Liste nach diesem Profil"
          className="input h-9 w-full cursor-pointer py-0 font-medium"
          value={filters.investorProfile ?? ''}
          onChange={(e) => onChange({ ...filters, investorProfile: e.target.value || null })}
        >
          <option value="">Keines (ausgewogen)</option>
          {own.length > 0 && (
            <optgroup label="Eigene Profile">
              {own.map((p) => <ProfileOption key={p.id} profile={p} />)}
            </optgroup>
          )}
          <optgroup label="Vorlagen">
            {TEMPLATES.filter((p) => p.id !== 'ausgewogen').map((p) => <ProfileOption key={p.id} profile={p} />)}
          </optgroup>
        </select>
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

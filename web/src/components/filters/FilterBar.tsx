import { useEffect, useRef, useState } from 'react';
import type { Company } from '@/data/types';
import { activeFilters, type Filters } from '@/lib/filters';
import { FilterPanel } from './FilterPanel';
import { SearchBar } from './SearchBar';

interface Props {
  companies: Company[];
  filters: Filters;
  resultCount: number;
  onChange(next: Filters): void;
  onPick(ticker: string): void;
}

export function FilterBar({ companies, filters, resultCount, onChange, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const panelArea = useRef<HTMLDivElement>(null);
  const active = activeFilters(filters);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!panelArea.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2 lg:px-7">
      <SearchBar
        companies={companies}
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
        onPick={onPick}
      />
      {active.map((chip) => (
        <button
          key={chip.id}
          type="button"
          aria-label={`Filter entfernen: ${chip.label}`}
          className="whitespace-nowrap rounded-full bg-accent-soft px-3 py-1.5 text-[13px] font-semibold text-accent hover:bg-note"
          onClick={() => onChange(chip.clear(filters))}
        >
          {chip.label} ×
        </button>
      ))}
      <div ref={panelArea} className="relative shrink-0">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          className={`btn flex h-11 items-center gap-2 px-5 text-[15px] ${open || active.length ? 'btn-primary' : ''}`}
          onClick={() => setOpen(!open)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-[18px] w-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 5h16l-6.5 7.5V19l-3 1.5v-8Z" />
          </svg>
          Filter{active.length > 0 && ` (${active.length})`}
        </button>
        {open && (
          <FilterPanel
            companies={companies}
            filters={filters}
            resultCount={resultCount}
            onChange={onChange}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

import { useMemo, useState, type KeyboardEvent } from 'react';
import type { Company } from '@/data/types';
import { searchSuggestions } from '@/lib/filters';
import { tickerAndSector } from '@/lib/format';
import { SectorDot } from '../ui/atoms';

/** Zusätzlicher Knopf pro Vorschlag, z. B. «zur Watchlist» auf der Vergleichsseite. */
export interface SuggestionAction {
  label(company: Company): string;
  /** Erledigt (z. B. schon in der Watchlist): Knopf zeigt den Zustand, ist aber nicht klickbar. */
  done?(company: Company): boolean;
  onAction(ticker: string): void;
}

interface Props {
  companies: Company[];
  value: string;
  onChange(value: string): void;
  onPick(ticker: string): void;
  action?: SuggestionAction;
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** Tippen filtert Liste und Würfel sofort; ein Vorschlag wählt die Firma direkt aus. */
export function SearchBar({ companies, value, onChange, onPick, action }: Props) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const suggestions = useMemo(() => searchSuggestions(companies, value), [companies, value]);
  const open = focused && suggestions.length > 0;

  const pick = (ticker: string) => {
    onPick(ticker);
    onChange('');
    setActiveIndex(0);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onChange('');
    } else if (open && e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (open && e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (open && e.key === 'Enter') {
      e.preventDefault();
      const target = suggestions[activeIndex] ?? suggestions[0];
      if (target) pick(target.ticker);
    }
  };

  return (
    <div className="relative min-w-[220px] flex-1">
      <input
        type="search"
        role="combobox"
        aria-label="Unternehmen suchen"
        aria-expanded={open}
        aria-controls="kubus-suggestions"
        aria-autocomplete="list"
        className="input h-11 w-full pr-10 text-[15px]"
        placeholder="Unternehmen suchen, z.B. VAT oder AAPL"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActiveIndex(0);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
      />
      <SearchIcon />
      {open && (
        <ul id="kubus-suggestions" role="listbox" aria-label="Vorschläge" className="card absolute left-0 right-0 top-[50px] z-40 max-w-[520px] p-1 shadow-pop">
          {suggestions.map((c, i) => (
            <li
              key={c.ticker}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-center gap-2 rounded-lg pr-2 ${i === activeIndex ? 'bg-accent-soft' : ''}`}
            >
              <button
                type="button"
                tabIndex={-1}
                // Vor dem Blur des Felds auslösen, sonst schliesst sich die Liste vor dem Klick
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(c.ticker);
                }}
                className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm"
              >
                <SectorDot company={c} />
                <span className="min-w-0">
                  <b className="block truncate">{c.name}</b>
                  <span className="block truncate text-xs text-muted">{tickerAndSector(c)}</span>
                </span>
              </button>
              {action && (
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={action.done?.(c)}
                  onMouseDown={(e) => {
                    // Feld behält den Fokus, die Liste bleibt offen und zeigt danach «In Watchlist»
                    e.preventDefault();
                    if (!action.done?.(c)) action.onAction(c.ticker);
                  }}
                  className="btn shrink-0 whitespace-nowrap px-3 py-1 text-xs disabled:cursor-default disabled:opacity-60"
                >
                  {action.label(c)}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

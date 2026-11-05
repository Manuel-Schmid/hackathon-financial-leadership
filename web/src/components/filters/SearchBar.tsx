import { useMemo, useState, type KeyboardEvent } from 'react';
import type { Company } from '@/data/types';
import { searchSuggestions } from '@/lib/filters';
import { SectorDot } from '../ui/atoms';

interface Props {
  companies: Company[];
  value: string;
  onChange(value: string): void;
  onPick(ticker: string): void;
}

/** Tippen filtert Liste und Würfel sofort; ein Vorschlag wählt die Firma direkt aus. */
export function SearchBar({ companies, value, onChange, onPick }: Props) {
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
        className="input h-11 w-full text-[15px]"
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
      {open && (
        <ul id="kubus-suggestions" role="listbox" aria-label="Vorschläge" className="card absolute left-0 right-0 top-[50px] z-40 max-w-[520px] p-1 shadow-pop">
          {suggestions.map((c, i) => (
            <li key={c.ticker} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                tabIndex={-1}
                // Vor dem Blur des Felds auslösen, sonst schliesst sich die Liste vor dem Klick
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(c.ticker);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${i === activeIndex ? 'bg-accent-soft' : ''}`}
              >
                <SectorDot company={c} />
                <b className="truncate">{c.name}</b>
                <span className="ml-auto shrink-0 text-xs text-muted">{c.ticker}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

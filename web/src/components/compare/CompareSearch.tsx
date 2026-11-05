import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/data/DataProvider';
import { SearchBar } from '../filters/SearchBar';

interface Props {
  /** Watchlist, die gerade verglichen wird; ohne sie gibt es keinen Hinzufügen-Knopf. */
  list?: { name: string; tickers: string[] };
  onAdd?(ticker: string): void;
}

/**
 * Grosse Suche wie im Explorer, ohne Filter: Ein Vorschlag öffnet die Detailseite,
 * der Knopf daneben fügt die Firma der verglichenen Watchlist hinzu.
 */
export function CompareSearch({ list, onAdd }: Props) {
  const companies = useCompanies();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  return (
    <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2 lg:px-7">
      <SearchBar
        companies={companies}
        value={query}
        onChange={setQuery}
        onPick={(ticker) => navigate(`/firma/${encodeURIComponent(ticker)}`)}
        action={
          list && onAdd
            ? {
                label: (c) => (list.tickers.includes(c.ticker) ? '✓ In Watchlist' : '+ Zur Watchlist'),
                done: (c) => list.tickers.includes(c.ticker),
                onAction: onAdd,
              }
            : undefined
        }
      />
    </div>
  );
}

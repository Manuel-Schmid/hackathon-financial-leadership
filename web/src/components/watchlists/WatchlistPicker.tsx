import { useState, type FormEvent } from 'react';
import { Popup } from '@/components/ui/Popup';
import type { Company } from '@/data/types';
import { useWatchlists } from '@/watchlists/WatchlistProvider';

/** Ab so vielen Watchlists hilft eine Suche, die richtige schnell zu finden. */
const SEARCH_FROM = 6;

function companiesLabel(count: number): string {
  return count === 1 ? '1 Firma' : `${count} Firmen`;
}

export function WatchlistPicker({ company, onClose }: { company: Company; onClose(): void }) {
  const { lists, addItem, removeItem, create } = useWatchlists();
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { ticker } = company;

  const q = query.trim().toLowerCase();
  const matches = lists.filter((l) => l.name.toLowerCase().includes(q) || l.clientName?.toLowerCase().includes(q));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create({ name: name.trim() })
      .then((created) => {
        addItem(created.id, ticker);
        setName('');
        setQuery('');
        setError(null);
      })
      .catch((err: Error) => setError(err.message || 'Die Watchlist konnte nicht erstellt werden.'));
  };

  return (
    <Popup
      title="Zu Watchlist hinzufügen"
      sub={`${company.name}: Häkchen setzen, wird sofort gespeichert.`}
      onClose={onClose}
      footer={<button type="button" className="btn btn-primary ml-auto px-5" onClick={onClose}>Fertig</button>}
    >
      {lists.length >= SEARCH_FROM && (
        <input
          data-autofocus
          type="search"
          aria-label="Watchlist suchen"
          className="input mb-2 w-full"
          placeholder="Watchlist oder Kunde suchen"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <div className="max-h-[45vh] overflow-y-auto">
        {matches.map((list) => {
          const on = list.tickers.includes(ticker);
          return (
            <label key={list.id} className="flex cursor-pointer items-center gap-3 border-t border-line-soft px-1 py-2.5 first:border-t-0 hover:bg-paper">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-accent"
                checked={on}
                onChange={() => (on ? removeItem(list.id, ticker) : addItem(list.id, ticker))}
              />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-sm">{list.name}</b>
                <span className="block truncate text-xs text-muted">
                  {list.clientName ? `${list.clientName}, ` : ''}{companiesLabel(list.tickers.length)}
                </span>
              </span>
            </label>
          );
        })}
        {lists.length === 0 && <p className="py-2 text-[13px] text-muted">Noch keine Watchlist. Erstell unten die erste.</p>}
        {lists.length > 0 && matches.length === 0 && <p className="py-2 text-[13px] text-muted">Keine Watchlist gefunden. Erstell unten eine neue.</p>}
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2 border-t border-line pt-3">
        <input
          data-autofocus={lists.length < SEARCH_FROM ? true : undefined}
          aria-label="Name der neuen Watchlist"
          className="input min-w-0 flex-1"
          placeholder="Neue Watchlist"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn whitespace-nowrap" disabled={!name.trim()}>+ Erstellen</button>
      </form>
      {error && <p role="alert" className="mt-2 text-[13px] text-bad">{error}</p>}
    </Popup>
  );
}

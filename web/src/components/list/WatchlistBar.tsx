import { Link } from 'react-router-dom';
import { useData } from '@/data/DataProvider';
import { useWatchlists } from '@/watchlists/WatchlistProvider';
import { SectorDot } from '../ui/atoms';

export function WatchlistBar() {
  const { active, toggle } = useWatchlists();
  const { byTicker } = useData();
  if (!active) return null;
  const items = active.tickers.map((t) => byTicker.get(t)).filter((c) => c !== undefined);

  return (
    <div className="card flex flex-wrap items-center gap-3 px-5 py-3">
      <Link to="/watchlists" className="font-title font-semibold hover:underline">
        {active.name}
        {active.investorProfile !== 'ausgewogen' && `, ${active.investorProfile}`}
      </Link>
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {items.map((c) => (
          <span key={c.ticker} className="flex items-center gap-2 rounded-[10px] border border-line px-3 py-1.5 text-[13px] font-bold">
            <SectorDot company={c} />
            {c.name}
            <button type="button" aria-label={`${c.name} entfernen`} className="font-normal text-muted hover:text-text" onClick={() => toggle(c.ticker)}>
              ×
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-muted">Noch leer: Stern in der Liste setzen.</span>}
      </div>
      {items.length > 0 && (
        <Link to="/vergleich" className="btn btn-primary whitespace-nowrap px-[18px]">
          {items.length} vergleichen
        </Link>
      )}
    </div>
  );
}

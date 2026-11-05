import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/data/DataProvider';
import { useProfiles } from '@/profiles/ProfileProvider';
import { useWatchlists } from '@/watchlists/WatchlistProvider';
import type { Watchlist } from '@/watchlists/WatchlistStore';
import { SectorDot } from '../ui/atoms';

const ICON_BUTTON = 'peer grid h-9 w-9 place-items-center rounded-[9px] border transition-colors';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

/** Erklärung beim Darüberfahren, auch mit der Tastatur erreichbar. */
function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] right-0 z-30 hidden whitespace-nowrap rounded-[7px] bg-ink px-2.5 py-1.5 text-xs font-semibold text-white shadow-pop peer-hover:block peer-focus-visible:block"
      >
        {text}
      </span>
    </span>
  );
}

function Row({ list, onSelect, onReveal }: { list: Watchlist; onSelect(ticker: string): void; onReveal(): void }) {
  const { isShown, setShown, focusId, setFocus } = useWatchlists();
  const { resolve } = useProfiles();
  const { byTicker } = useData();
  const shown = isShown(list.id);
  const focused = focusId === list.id;
  const companies = list.tickers.map((t) => byTicker.get(t)).filter((c) => c !== undefined);
  const focusText = focused ? 'Wieder alle Firmen farbig zeigen' : 'Nur diese Watchlist farbig zeigen';
  const shownText = shown ? 'Im Würfel ausblenden' : 'Im Würfel einblenden';
  const compareText = 'Diese Watchlist vergleichen';

  return (
    <li className="grid items-center gap-x-4 gap-y-2 border-t border-line-soft px-5 py-3 md:grid-cols-[220px_minmax(0,1fr)_auto]">
      <div className={`min-w-0 ${shown ? '' : 'opacity-50'}`}>
        <b className="block truncate font-title text-[15px] font-semibold" title={list.name}>{list.name}</b>
        <span className="block truncate text-xs text-muted">
          {list.clientName ? `${list.clientName}, ` : ''}Profil {resolve(list.investorProfile).name}, {companies.length === 1 ? '1 Firma' : `${companies.length} Firmen`}
        </span>
      </div>
      <div className={`flex min-w-0 flex-wrap gap-1.5 ${shown ? '' : 'opacity-50'}`}>
        {companies.map((c) => (
          <button
            key={c.ticker}
            type="button"
            title={`${c.name} im Würfel zeigen`}
            className="flex items-center gap-1.5 rounded-lg border border-line px-2 py-1 text-xs font-semibold hover:bg-paper"
            onClick={() => {
              onSelect(c.ticker);
              onReveal();
            }}
          >
            <SectorDot company={c} />
            {c.name}
          </button>
        ))}
        {companies.length === 0 && <span className="text-xs text-muted">Noch leer: In der Firmenliste oben mit dem Stern hinzufügen.</span>}
      </div>
      <div className="flex gap-1.5">
        <Tooltip text={focusText}>
          <button
            type="button"
            aria-label={focusText}
            aria-pressed={focused}
            className={`${ICON_BUTTON} ${focused ? 'border-ink bg-ink text-white hover:bg-ink-2' : 'border-line bg-white hover:bg-paper'}`}
            onClick={() => {
              setFocus(focused ? null : list.id);
              if (!focused) onReveal();
            }}
          >
            <Icon>
              <circle cx="12" cy="12" r="3.2" />
              <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
            </Icon>
          </button>
        </Tooltip>
        <Tooltip text={shownText}>
          <button
            type="button"
            aria-label={shownText}
            aria-pressed={!shown}
            className={`${ICON_BUTTON} border-line bg-white hover:bg-paper ${shown ? '' : 'text-muted'}`}
            onClick={() => setShown(list.id, !shown)}
          >
            <Icon>
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
              <circle cx="12" cy="12" r="2.8" />
              {!shown && <path d="M4 4l16 16" />}
            </Icon>
          </button>
        </Tooltip>
        <Tooltip text={compareText}>
          <Link
            to={`/vergleich?liste=${encodeURIComponent(list.id)}`}
            aria-label={compareText}
            className={`${ICON_BUTTON} border-line bg-white hover:bg-paper`}
          >
            <Icon>
              <path d="M12 4v16M8 20h8M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7ZM19 7l-3 7a3 3 0 0 0 6 0l-3-7Z" />
            </Icon>
          </Link>
        </Tooltip>
      </div>
    </li>
  );
}

interface Props {
  onSelect(ticker: string): void;
  /** Der Würfel liegt oben: Aktionen, die dort wirken, holen ihn ins Bild. */
  onReveal(): void;
}

/** Unter Würfel und Firmenliste: alle Watchlists als Zeilen. Die Punkte behalten ihre Branchenfarbe. */
export function WatchlistBar({ onSelect, onReveal }: Props) {
  const { lists, focusId, isShown, resetShown } = useWatchlists();
  const changed = focusId !== null || lists.some((l) => !isShown(l.id));

  return (
    <section id="watchlists" className="card mx-4 mb-4 scroll-mt-3 lg:mx-7">
      <header className="flex flex-wrap items-center gap-2 px-5 py-3">
        <h2 className="mr-auto font-title text-lg font-semibold">Watchlists</h2>
        {changed && <button type="button" className="btn" onClick={resetShown}>Alle zeigen</button>}
        <Link to="/watchlists" className="btn">Verwalten</Link>
      </header>
      <ul>
        {lists.map((list) => <Row key={list.id} list={list} onSelect={onSelect} onReveal={onReveal} />)}
        {lists.length === 0 && (
          <li className="border-t border-line-soft px-5 py-4 text-[13px] text-muted">
            Noch keine Watchlist. Der Stern in der Firmenliste erstellt die erste.
          </li>
        )}
      </ul>
    </section>
  );
}

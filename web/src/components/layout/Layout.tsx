import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { useData } from '@/data/DataProvider';
import { formatDate } from '@/lib/format';
import { useWatchlists } from '@/watchlists/WatchlistProvider';
import { EmptyState } from '../ui/atoms';

function NavItem({ to, children, end }: { to: string; children: React.ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold ${isActive ? 'bg-ink-2 text-white' : 'text-ink-nav hover:text-white'}`
      }
    >
      {children}
    </NavLink>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function DataPill() {
  const { data } = useData();
  if (!data) return null;
  const years = data.companies.map((c) => c.fiscalYear);
  const latest = years.length ? Math.max(...years) : null;
  return (
    <span className="hidden whitespace-nowrap rounded-full border border-ink-line px-3 py-1 text-xs text-ink-muted xl:inline">
      Daten: {data.meta.source}
      {latest ? ` · Geschäftsjahr bis ${latest}` : ''} · Stand {formatDate(data.meta.asOf)}
      {data.source === 'json' ? ' · Offline-Datei' : ''}
    </span>
  );
}

function Header() {
  const { user, profile } = useAuth();
  const { active } = useWatchlists();
  const count = active?.tickers.length ?? 0;
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 bg-ink px-4 text-white lg:px-7">
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo.svg" alt="" className="h-[34px] w-[34px]" />
        <div>
          <b className="block font-title text-[20px] font-bold leading-tight tracking-[.06em]">KUBUS</b>
          <small className="hidden text-[11px] tracking-[.04em] text-ink-muted sm:block">Kennzahlen im Zieldreieck</small>
        </div>
      </Link>
      <nav className="ml-2 flex min-w-0 gap-1 overflow-x-auto lg:ml-5">
        <NavItem to="/" end>Explorer</NavItem>
        <NavItem to="/vergleich">
          Vergleich
          {count > 0 && <span className="ml-1.5 rounded-full bg-accent px-[7px] py-px text-[11px] text-white">{count}</span>}
        </NavItem>
        <NavItem to="/watchlists">Watchlists</NavItem>
        <NavItem to="/methodik">Methodik</NavItem>
      </nav>
      <div className="flex-1" />
      <DataPill />
      <Link to={user ? '/profil' : '/login'} className="flex shrink-0 items-center gap-2.5 font-semibold">
        <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-gradient-to-br from-L to-S font-title text-[13px]">
          {user ? initials(profile.displayName) : '?'}
        </span>
        <span className="hidden sm:inline">{user ? profile.displayName : 'Anmelden'}</span>
      </Link>
    </header>
  );
}

export function Layout() {
  const { status, error } = useData();
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      {status === 'loading' && <EmptyState title="Daten werden geladen …" />}
      {status === 'error' && (
        <EmptyState title="Daten konnten nicht geladen werden">
          {error}. Zuerst die Pipeline ausführen: <code>python data/pipeline/run_all.py</code>
        </EmptyState>
      )}
      {status === 'ready' && <Outlet />}
    </div>
  );
}

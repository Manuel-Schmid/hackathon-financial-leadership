import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { useWatchlists } from '@/watchlists/WatchlistProvider';

function initials(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function DesktopLink({ to, end, children }: { to: string; end?: boolean; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center whitespace-nowrap border-b-2 py-1 text-sm font-semibold ${isActive ? 'border-R text-white' : 'border-transparent text-ink-nav hover:text-white'}`
      }
    >
      {children}
    </NavLink>
  );
}

function MobileLink({ to, end, children }: { to: string; end?: boolean; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `block rounded-lg px-3 py-2.5 font-semibold ${isActive ? 'bg-accent text-white' : 'hover:bg-paper'}`}
    >
      {children}
    </NavLink>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return <span className="ml-1.5 rounded-full bg-accent px-[7px] py-px text-[11px] font-semibold text-white">{count}</span>;
}

/** Laptop: Seiten direkt links. Handy: Menü-Symbol mit Aufklappkarte. Logo immer Mitte, Konto rechts. */
export function Header() {
  const { user, profile } = useAuth();
  const { allTickers } = useWatchlists();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const count = allTickers.size;

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="relative z-50 grid h-[85px] shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 bg-ink px-4 text-white lg:px-7">
      <div>
        <nav aria-label="Hauptmenü" className="hidden items-center gap-5 lg:flex">
          <DesktopLink to="/" end>Explorer</DesktopLink>
          <DesktopLink to="/vergleich">Vergleich<CountBadge count={count} /></DesktopLink>
          <DesktopLink to="/watchlists">Watchlists</DesktopLink>
        </nav>
        <button
          type="button"
          aria-label={open ? 'Menü schliessen' : 'Menü öffnen'}
          aria-expanded={open}
          className="flex items-center gap-2 text-sm font-semibold lg:hidden"
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true" className="text-xl leading-none">{open ? '×' : '☰'}</span>
          <span className="hidden sm:inline">Menü</span>
        </button>
      </div>

      <Link to="/" className="flex items-center gap-2.5">
        <img src="/logo.svg" alt="" className="h-[32px] w-[32px]" />
        <div>
          <b className="block font-title text-[20px] font-bold leading-tight tracking-[.06em]">KUBUS</b>
          <small className="hidden text-[11px] tracking-[.04em] text-ink-muted sm:block">Kennzahlen im Zieldreieck</small>
        </div>
      </Link>

      <Link to={user ? '/profil' : '/login'} className="flex items-center justify-end gap-2.5 font-semibold">
        <span className="hidden truncate sm:inline">{user ? profile.displayName : 'Anmelden'}</span>
        <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-accent font-title text-[13px]">
          {user ? initials(profile.displayName) : '?'}
        </span>
      </Link>

      {open && (
        <nav aria-label="Menü" className="card absolute left-3 top-[80px] w-[240px] p-2 text-[15px] text-text shadow-pop lg:hidden">
          <MobileLink to="/" end>Explorer</MobileLink>
          <MobileLink to="/vergleich">Vergleich<CountBadge count={count} /></MobileLink>
          <MobileLink to="/watchlists">Watchlists</MobileLink>
          <div className="my-1 border-t border-line" />
          <MobileLink to="/methodik">Methodik</MobileLink>
        </nav>
      )}
    </header>
  );
}

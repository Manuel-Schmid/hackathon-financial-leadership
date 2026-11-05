import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CompanyLink, PageTitle, SectorDot } from '@/components/ui/atoms';
import { useData } from '@/data/DataProvider';
import type { InvestorProfile } from '@/data/types';
import { PROFILE_IDS } from '@/lib/config';
import { profileLabel } from '@/lib/weighting';
import { useWatchlists } from '@/watchlists/WatchlistProvider';
import type { Watchlist } from '@/watchlists/WatchlistStore';

function ProfileSelect({ value, onChange }: { value: InvestorProfile; onChange(v: InvestorProfile): void }) {
  return (
    <select aria-label="Anlegerprofil" className="input cursor-pointer" value={value} onChange={(e) => onChange(e.target.value as InvestorProfile)}>
      {PROFILE_IDS.map((id) => <option key={id} value={id}>{id} ({profileLabel(id)})</option>)}
    </select>
  );
}

function ListCard({ list }: { list: Watchlist }) {
  const { update, remove, setActive, lists } = useWatchlists();
  const { byTicker } = useData();
  const [name, setName] = useState(list.name);
  const [client, setClient] = useState(list.clientName ?? '');

  const save = () => {
    const nextName = name.trim();
    if (!nextName) return setName(list.name);
    if (nextName !== list.name || client.trim() !== (list.clientName ?? '')) {
      update(list.id, { name: nextName, clientName: client.trim() || null });
    }
  };

  return (
    <div className={`card space-y-3 p-5 ${list.isActive ? 'border-accent' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <input aria-label="Name der Watchlist" className="input flex-1 font-title font-semibold" value={name} onChange={(e) => setName(e.target.value)} onBlur={save} />
        {list.isActive ? (
          <span className="pill border-accent text-accent">Aktiv</span>
        ) : (
          <button type="button" className="btn" onClick={() => setActive(list.id)}>Aktiv setzen</button>
        )}
        <button
          type="button"
          className="btn text-bad"
          disabled={lists.length === 1}
          title={lists.length === 1 ? 'Die letzte Watchlist kann nicht gelöscht werden' : undefined}
          onClick={() => window.confirm(`Watchlist „${list.name}“ löschen?`) && remove(list.id)}
        >
          Löschen
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input aria-label="Kundenname" className="input flex-1" placeholder="Kundenname" value={client} onChange={(e) => setClient(e.target.value)} onBlur={save} />
        <ProfileSelect value={list.investorProfile} onChange={(investorProfile) => update(list.id, { investorProfile })} />
      </div>
      <div className="flex flex-wrap gap-2">
        {list.tickers.map((t) => {
          const c = byTicker.get(t);
          return (
            <span key={t} className="flex items-center gap-2 rounded-[10px] border border-line px-3 py-1 text-[13px] font-semibold">
              {c && <SectorDot company={c} />}
              <CompanyLink ticker={t}>{c?.name ?? t}</CompanyLink>
            </span>
          );
        })}
        {list.tickers.length === 0 && <span className="text-muted">Noch keine Unternehmen.</span>}
      </div>
    </div>
  );
}

export function Watchlists() {
  const { lists, create, error, isGuest } = useWatchlists();
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [profile, setProfile] = useState<InvestorProfile>('ausgewogen');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create({ name: name.trim(), clientName: client.trim() || null, investorProfile: profile });
    setName('');
    setClient('');
  };

  return (
    <main className="mx-auto w-full max-w-[1000px] space-y-4 p-4 lg:p-7">
      <PageTitle
        tag="Pro Kunde eine Liste"
        title="Watchlists"
        sub={isGuest ? <>Gastmodus: nur in diesem Browser gespeichert. <Link className="underline" to="/login">Anmelden</Link></> : 'Gespeichert in deinem Konto.'}
      />
      {error && <p className="rounded-[10px] bg-[#FDECEA] px-4 py-2 text-[13px] text-bad">{error}</p>}
      {lists.map((list) => <ListCard key={list.id} list={list} />)}
      <form onSubmit={submit} className="card flex flex-wrap items-center gap-2 p-5">
        <input aria-label="Neue Watchlist" className="input flex-1" placeholder="Neue Watchlist, z.B. Kunde Müller" value={name} onChange={(e) => setName(e.target.value)} />
        <input aria-label="Kundenname der neuen Watchlist" className="input flex-1" placeholder="Kundenname (optional)" value={client} onChange={(e) => setClient(e.target.value)} />
        <ProfileSelect value={profile} onChange={setProfile} />
        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>Anlegen</button>
      </form>
    </main>
  );
}

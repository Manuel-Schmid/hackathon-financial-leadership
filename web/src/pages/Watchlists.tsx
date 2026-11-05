import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ProfileButton } from '@/components/profiles/ProfilePicker';
import { CompanyLink, PageTitle, SectorDot } from '@/components/ui/atoms';
import { useData } from '@/data/DataProvider';
import { useWatchlists } from '@/watchlists/WatchlistProvider';
import type { Watchlist } from '@/watchlists/WatchlistStore';

function CreateCard() {
  const { create } = useWatchlists();
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [profile, setProfile] = useState('ausgewogen');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create({ name: name.trim(), clientName: client.trim() || null, investorProfile: profile })
      .then(() => {
        setName('');
        setClient('');
        setProfile('ausgewogen');
        setError(null);
      })
      .catch((err: Error) => setError(err.message || 'Die Watchlist konnte nicht erstellt werden.'));
  };

  return (
    <section className="rounded-[14px] border border-accent/25 bg-accent-soft p-5">
      <h2 className="font-title text-[17px] font-semibold">Neue Watchlist erstellen</h2>
      <p className="mb-3 mt-0.5 text-[13px] text-muted">Pro Kunde eine Liste</p>
      <div className="flex flex-wrap items-center gap-2">
        {/* Das Profil-Popup enthält ein eigenes Formular: darum liegt es neben diesem, nicht darin. */}
        <form id="new-watchlist" onSubmit={submit} className="contents">
          <input aria-label="Name der Watchlist" className="input min-w-[200px] flex-1" placeholder="Name, z. B. Kunde Müller" value={name} onChange={(e) => setName(e.target.value)} />
          <input aria-label="Kundenname" className="input min-w-[180px] flex-1" placeholder="Kundenname (optional)" value={client} onChange={(e) => setClient(e.target.value)} />
        </form>
        <ProfileButton value={profile} onChange={setProfile} />
        <button type="submit" form="new-watchlist" className="btn border-accent bg-accent px-5 text-white hover:bg-accent hover:opacity-90" disabled={!name.trim()}>Erstellen</button>
      </div>
      {error && <p role="alert" className="mt-2 text-[13px] text-bad">{error}</p>}
    </section>
  );
}

function ListCard({ list }: { list: Watchlist }) {
  const { update, remove, removeItem } = useWatchlists();
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
    <div className="card space-y-3 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input aria-label="Name der Watchlist" className="input min-w-[200px] flex-1 font-title font-semibold" value={name} onChange={(e) => setName(e.target.value)} onBlur={save} />
        <input aria-label="Kundenname" className="input min-w-[180px] flex-1" placeholder="Kundenname" value={client} onChange={(e) => setClient(e.target.value)} onBlur={save} />
        <ProfileButton value={list.investorProfile} listName={list.name} onChange={(investorProfile) => update(list.id, { investorProfile })} />
        <Link to={`/vergleich?liste=${encodeURIComponent(list.id)}`} className="btn">Vergleichen</Link>
        <button
          type="button"
          className="btn text-bad"
          onClick={() => window.confirm(`Watchlist «${list.name}» löschen?`) && remove(list.id)}
        >
          Löschen
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.tickers.map((t) => {
          const c = byTicker.get(t);
          return (
            <span key={t} className="flex items-center gap-2 rounded-[10px] border border-line px-3 py-1 text-[13px] font-semibold">
              {c && <SectorDot company={c} />}
              <CompanyLink ticker={t}>{c?.name ?? t}</CompanyLink>
              <button type="button" aria-label={`${c?.name ?? t} entfernen`} className="text-[16px] font-normal leading-none text-muted hover:text-bad" onClick={() => removeItem(list.id, t)}>×</button>
            </span>
          );
        })}
        {list.tickers.length === 0 && <span className="text-muted">Noch keine Unternehmen. Im <Link className="underline" to="/">Explorer</Link> mit dem Stern hinzufügen.</span>}
      </div>
    </div>
  );
}

export function Watchlists() {
  const { lists, error, isGuest } = useWatchlists();

  return (
    <main className="mx-auto w-full max-w-[1100px] space-y-4 p-4 lg:p-7">
      <PageTitle
        title="Watchlists"
        sub={isGuest ? <>Gastmodus: nur in diesem Browser gespeichert. <Link className="underline" to="/login">Anmelden</Link></> : 'Gespeichert in deinem Konto.'}
      />
      {error && <p className="rounded-[10px] bg-[#FDECEA] px-4 py-2 text-[13px] text-bad">{error}</p>}
      <CreateCard />
      <section className="space-y-3 pt-4">
        <h2 className="flex items-center gap-2 font-title text-xl font-semibold">
          Meine Watchlists
          <span className="rounded-full bg-accent px-2 py-px font-sans text-xs font-semibold text-white">{lists.length}</span>
        </h2>
        {lists.map((list) => <ListCard key={list.id} list={list} />)}
        {lists.length === 0 && <p className="text-muted">Noch keine Watchlist. Erstell oben die erste.</p>}
      </section>
    </main>
  );
}

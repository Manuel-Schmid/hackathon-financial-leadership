import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AmpelMatrix } from '@/components/compare/AmpelMatrix';
import { CompareCard } from '@/components/compare/CompareCards';
import { CompareRadar } from '@/components/compare/CompareRadar';
import { CompareSearch } from '@/components/compare/CompareSearch';
import { CompareTable } from '@/components/compare/CompareTable';
import { ProfileButton } from '@/components/profiles/ProfilePicker';
import { EmptyState, PageTitle } from '@/components/ui/atoms';
import { useCompanies, useData } from '@/data/DataProvider';
import type { Company } from '@/data/types';
import { COMPARE_COLORS, MAX_COMPARE } from '@/lib/compare';
import { buildFazit } from '@/lib/fazit';
import { tickerAndSector } from '@/lib/format';
import { profileLabel } from '@/lib/weighting';
import { useProfiles } from '@/profiles/ProfileProvider';
import { useWatchlists } from '@/watchlists/WatchlistProvider';

function AddCompany({ onAdd }: { onAdd(ticker: string): void }) {
  const companies = useCompanies();
  const [value, setValue] = useState('');
  /** Exakter Treffer (Vorschlag gewählt oder Ticker getippt) wird direkt hinzugefügt. */
  const addIfExact = (text: string): boolean => {
    const query = text.trim().toLowerCase();
    const match = companies.find((c) => c.ticker.toLowerCase() === query || c.name.toLowerCase() === query);
    if (match) {
      onAdd(match.ticker);
      setValue('');
    }
    return Boolean(match);
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); addIfExact(value); }}>
      <input
        id="compare-add"
        list="kubus-companies"
        className="input h-9 w-full py-0 font-medium"
        placeholder="Name oder Ticker"
        value={value}
        onChange={(e) => {
          if (!addIfExact(e.target.value)) setValue(e.target.value);
        }}
      />
      <datalist id="kubus-companies">
        {companies.map((c) => <option key={c.ticker} value={c.name}>{tickerAndSector(c)}</option>)}
      </datalist>
    </form>
  );
}

const FIELD_LABEL = 'mb-1.5 block text-[13px] font-bold';

export function Compare() {
  const { lists, update, addItem, removeItem } = useWatchlists();
  const { resolve } = useProfiles();
  const { byTicker } = useData();
  const [params, setParams] = useSearchParams();
  const active = lists.find((l) => l.id === params.get('liste')) ?? lists[0];
  if (!active) return <EmptyState title="Keine Watchlist vorhanden"><Link className="underline" to="/watchlists">Watchlist erstellen</Link></EmptyState>;

  const all = active.tickers.map((t) => byTicker.get(t)).filter((c): c is Company => Boolean(c));
  const companies = all.slice(0, MAX_COMPARE);
  const profile = resolve(active.investorProfile);
  const add = (ticker: string) => addItem(active.id, ticker);

  return (
    <>
      <CompareSearch />
      <main className="mx-auto w-full max-w-[1600px] space-y-4 p-4 lg:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <PageTitle
            tag={`Watchlist · ${all.length} Unternehmen`}
            title={active.name}
            sub={`${active.clientName ? `Kunde: ${active.clientName}. ` : ''}Gewichtung ${profileLabel(profile.weights)}`}
          />
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-[660px]">
            <div className="min-w-0">
              <label htmlFor="compare-list" className={FIELD_LABEL}>Watchlist</label>
              <select
                id="compare-list"
                className="input h-9 w-full cursor-pointer py-0 font-medium"
                value={active.id}
                onChange={(e) => setParams({ liste: e.target.value }, { replace: true })}
              >
                {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor="compare-profile" className={FIELD_LABEL}>Anlegerprofil</label>
              <ProfileButton field id="compare-profile" value={active.investorProfile} listName={active.name} onChange={(investorProfile) => update(active.id, { investorProfile })} />
            </div>
            <div className="min-w-0">
              <label htmlFor="compare-add" className={FIELD_LABEL}>Unternehmen hinzufügen</label>
              <AddCompany onAdd={add} />
            </div>
          </div>
        </div>

        {companies.length === 0 && (
          <EmptyState title="Diese Watchlist ist leer">
            Im <Link className="underline" to="/">Explorer</Link> mit dem Stern Unternehmen hinzufügen oder oben direkt suchen.
          </EmptyState>
        )}
        {all.length > MAX_COMPARE && (
          <p className="rounded-[10px] bg-note px-4 py-2 text-[13px] text-note-text">
            Verglichen werden die ersten {MAX_COMPARE} von {all.length} Unternehmen. Entferne eines, um die nächsten zu sehen.
          </p>
        )}
        {companies.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {companies.map((c, i) => (
                <CompareCard key={c.ticker} company={c} color={COMPARE_COLORS[i]} profile={profile.weights} onRemove={() => removeItem(active.id, c.ticker)} />
              ))}
            </div>
            <AmpelMatrix companies={companies} />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
              <CompareRadar companies={companies} profile={profile} />
              <div className="min-w-0 space-y-4">
                <CompareTable companies={companies} />
                <div className="flex items-start gap-3.5 rounded-[14px] bg-ink px-5 py-4 text-white">
                  <span className="text-[22px] leading-none">◆</span>
                  <div>
                    <b className="font-title">Kurzfazit</b>
                    <p className="mt-0.5 leading-relaxed text-ink-nav">{buildFazit(companies)}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

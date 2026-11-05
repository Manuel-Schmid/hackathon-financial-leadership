import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CompareCard } from '@/components/compare/CompareCards';
import { CompareRadar } from '@/components/compare/CompareRadar';
import { CompareTable } from '@/components/compare/CompareTable';
import { EmptyState, PageTitle } from '@/components/ui/atoms';
import { useCompanies, useData } from '@/data/DataProvider';
import type { Company, InvestorProfile } from '@/data/types';
import { COMPARE_COLORS, MAX_COMPARE } from '@/lib/compare';
import { PROFILE_IDS } from '@/lib/config';
import { buildFazit } from '@/lib/fazit';
import { profileLabel } from '@/lib/weighting';
import { useWatchlists } from '@/watchlists/WatchlistProvider';

function AddCompany({ onAdd }: { onAdd(ticker: string): void }) {
  const companies = useCompanies();
  const [value, setValue] = useState('');
  const submit = () => {
    const query = value.trim().toLowerCase();
    const match = companies.find((c) => c.ticker.toLowerCase() === query || c.name.toLowerCase() === query);
    if (match) {
      onAdd(match.ticker);
      setValue('');
    }
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2">
      <input
        list="kubus-companies"
        className="input w-[220px] py-1.5"
        placeholder="+ Unternehmen hinzufügen"
        aria-label="Unternehmen hinzufügen"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <datalist id="kubus-companies">
        {companies.map((c) => <option key={c.ticker} value={c.name}>{c.ticker}</option>)}
      </datalist>
      <button type="submit" className="btn py-1.5">Hinzufügen</button>
    </form>
  );
}

export function Compare() {
  const { active, update, toggle } = useWatchlists();
  const { byTicker } = useData();
  if (!active) return <EmptyState title="Keine Watchlist vorhanden"><Link className="underline" to="/watchlists">Watchlist anlegen</Link></EmptyState>;

  const all = active.tickers.map((t) => byTicker.get(t)).filter((c): c is Company => Boolean(c));
  const companies = all.slice(0, MAX_COMPARE);
  const profile = active.investorProfile;
  const add = (ticker: string) => { if (!active.tickers.includes(ticker)) toggle(ticker); };

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-4 p-4 lg:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          tag={`Watchlist · ${all.length} Unternehmen`}
          title={active.name}
          sub={active.clientName ? `Kunde: ${active.clientName}` : `Gewichtung ${profileLabel(profile)}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <AddCompany onAdd={add} />
          <label className="flex items-center gap-2 text-[13px] font-semibold">
            Gewichtung
            <select
              className="pill cursor-pointer"
              value={profile}
              onChange={(e) => update(active.id, { investorProfile: e.target.value as InvestorProfile })}
            >
              {PROFILE_IDS.map((id) => <option key={id} value={id}>{id} ({profileLabel(id)})</option>)}
            </select>
          </label>
        </div>
      </div>

      {companies.length === 0 && (
        <EmptyState title="Diese Watchlist ist leer">
          Im <Link className="underline" to="/">Explorer</Link> mit dem Stern Unternehmen hinzufügen oder oben direkt suchen.
        </EmptyState>
      )}
      {all.length > MAX_COMPARE && (
        <p className="rounded-[10px] bg-[#FFF4D6] px-4 py-2 text-[13px] text-[#8A5A00]">
          Verglichen werden die ersten {MAX_COMPARE} von {all.length} Unternehmen. Entferne eines, um die nächsten zu sehen.
        </p>
      )}
      {companies.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {companies.map((c, i) => (
              <CompareCard key={c.ticker} company={c} color={COMPARE_COLORS[i]} profile={profile} onRemove={() => toggle(c.ticker)} />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
            <CompareRadar companies={companies} />
            <div className="min-w-0 space-y-4">
              <CompareTable companies={companies} />
              <div className="flex items-start gap-3.5 rounded-[14px] bg-ink px-5 py-4 text-white">
                <span className="text-[22px] leading-none">◆</span>
                <div>
                  <b className="font-title">Kurzfazit</b>
                  <p className="mt-0.5 leading-relaxed text-[#C7D0DF]">{buildFazit(companies)}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

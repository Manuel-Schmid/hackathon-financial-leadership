import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { KpiSection } from '@/components/company/KpiSection';
import { EmptyState } from '@/components/ui/atoms';
import { WatchlistPicker } from '@/components/watchlists/WatchlistPicker';
import { useCompanies, useData } from '@/data/DataProvider';
import { AXIS_IDS, FINANCIAL, REAL_ESTATE } from '@/lib/config';
import { formatMarketCap, formatScore } from '@/lib/format';
import { totalScore } from '@/lib/weighting';
import { useProfiles } from '@/profiles/ProfileProvider';
import { useWatchlists } from '@/watchlists/WatchlistProvider';

export function CompanyDetail() {
  const { ticker = '' } = useParams();
  const { byTicker } = useData();
  const all = useCompanies();
  const { selected } = useProfiles();
  const { lists } = useWatchlists();
  const [picking, setPicking] = useState(false);
  const company = byTicker.get(ticker);

  if (!company) {
    return (
      <EmptyState title="Unternehmen nicht gefunden">
        „{ticker}“ ist nicht in der Datenbank. <Link className="underline" to="/">Zum Explorer</Link>
      </EmptyState>
    );
  }
  const inLists = lists.filter((l) => l.tickers.includes(company.ticker)).length;
  const index = company.index === 'SP500' ? 'S&P 500' : company.index;

  return (
    <main className="w-full space-y-4 p-4 lg:px-7 lg:py-6">
      <Link to="/" className="text-[13px] font-semibold text-muted hover:text-text">Zum Explorer</Link>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-title text-[32px] font-semibold leading-tight">{company.name}</h1>
          <p className="mt-1 text-muted">
            {company.ticker}, {index}, {company.sectorDe}. Börsenwert {formatMarketCap(company.marketCapUsd)}, Geschäftsjahr{' '}
            {company.fiscalYear}, Währung {company.currency || 'unbekannt'}.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <button type="button" className="btn" onClick={() => setPicking(true)}>
            {inLists > 0 ? `★ In ${inLists === 1 ? '1 Watchlist' : `${inLists} Watchlists`}` : '☆ Zu Watchlist hinzufügen'}
          </button>
          <div className="text-right text-accent" title="Gesamt-Score nach Anlegerprofil">
            <b className="block font-title text-[40px] font-bold leading-none">
              {formatScore(totalScore(company.scores, selected?.weights ?? 'ausgewogen'))}
            </b>
            <span className="text-xs font-semibold">Gesamt-Score, {selected?.name ?? 'Ausgewogen'}</span>
          </div>
        </div>
      </div>
      {company.isFinancial && (
        <div className="rounded-[10px] bg-note px-4 py-3 text-[13px] text-note-text">
          <b>{FINANCIAL.note}.</b> Liquiditätsgrade sind bei Banken und Versicherungen nicht sinnvoll: kein Liquiditäts-Score,
          im Würfel in der Mitte (50). Rentabilität und Sicherheit stammen nur aus ROE, ROA, EK-Quote und Verschuldungsgrad und
          sind nur innerhalb des Finanzsektors gerankt.
        </div>
      )}
      {company.sector === 'Real Estate' && (
        <div className="rounded-[10px] bg-note px-4 py-3 text-[13px] text-note-text">
          <b>{REAL_ESTATE.note}.</b> Bei Immobilienunternehmen und REITs fliessen Portfolio-Neubewertungen (Fair Value) oft direkt
          in EBIT und Reingewinn ein, wodurch EBIT-Marge und Umsatzrendite über 100 % liegen können. Zudem führt die langfristige
          Hypothekarfinanzierung strukturell zu tiefen Liquiditätsgraden und einer hohen Tilgungsdauer.
        </div>
      )}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        {AXIS_IDS.map((axis) => (
          <KpiSection key={axis} axis={axis} company={company} all={all} />
        ))}
      </div>
      <p className="text-xs text-muted">
        Ampel je Richtwert: grün = erfüllt, gelb = bis 20 % daneben, rot = deutlich daneben, grau = kein Richtwert oder keine Daten.
        «Allgemein» = Richtwerte aus dem Buch (S. 292–293), exemplarisch. «Branche» = Richtwert für {company.sectorDe}, nur wo die
        Branche einen eigenen Wert hat (Herleitung unter Methodik).
      </p>
      {picking && <WatchlistPicker company={company} onClose={() => setPicking(false)} />}
    </main>
  );
}

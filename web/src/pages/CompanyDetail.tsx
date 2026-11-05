import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { KpiSection } from '@/components/company/KpiSection';
import { EmptyState, PageTitle, ScoreTiles } from '@/components/ui/atoms';
import { useCompanies, useData } from '@/data/DataProvider';
import { AXIS_IDS, FINANCIAL, REAL_ESTATE } from '@/lib/config';
import { formatMarketCap, formatScore } from '@/lib/format';
import { totalScore } from '@/lib/weighting';
import { useWatchlists } from '@/watchlists/WatchlistProvider';

export function CompanyDetail() {
  const { ticker = '' } = useParams();
  const { byTicker } = useData();
  const all = useCompanies();
  const { profile } = useAuth();
  const { activeTickers, toggle, active } = useWatchlists();
  const company = byTicker.get(ticker);

  if (!company) {
    return (
      <EmptyState title="Unternehmen nicht gefunden">
        „{ticker}“ ist nicht in der Datenbank. <Link className="underline" to="/">Zum Explorer</Link>
      </EmptyState>
    );
  }
  const starred = activeTickers.has(company.ticker);

  return (
    <main className="mx-auto w-full max-w-[1200px] space-y-4 p-4 lg:p-7">
      <Link to="/" className="text-[13px] font-semibold text-muted hover:text-text">← Zum Explorer</Link>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <PageTitle
            tag={`${company.ticker} · ${company.index === 'SP500' ? 'S&P 500' : company.index}`}
            title={company.name}
            sub={`${company.sectorDe} · Börsenwert ${formatMarketCap(company.marketCapUsd)} · Geschäftsjahr ${company.fiscalYear} · Währung ${company.currency || '–'}`}
          />
          <button type="button" className="btn mt-3" disabled={!active} onClick={() => toggle(company.ticker)}>
            {starred ? '★ Aus Watchlist entfernen' : `☆ Zu „${active?.name ?? 'Watchlist'}“ hinzufügen`}
          </button>
        </div>
        <div className="flex w-full max-w-[460px] items-stretch gap-2">
          <div className="grid min-w-[84px] place-items-center rounded-[10px] bg-accent-soft px-3 text-center">
            <div>
              <b className="block font-title text-[26px] leading-tight">{formatScore(totalScore(company.scores, profile.investorProfile))}</b>
              <small className="text-[10px] font-bold uppercase tracking-[.04em] text-muted">Gesamt</small>
            </div>
          </div>
          <div className="flex-1"><ScoreTiles scores={company.scores} /></div>
        </div>
      </div>
      {company.isFinancial && (
        <div className="rounded-[10px] bg-[#FFF4D6] px-4 py-3 text-[13px] text-[#8A5A00]">
          <b>{FINANCIAL.note}.</b> Liquiditätsgrade sind bei Banken und Versicherungen nicht sinnvoll: kein Liquiditäts-Score,
          im Würfel in der Mitte (50). Rentabilität und Sicherheit stammen nur aus ROE, ROA, EK-Quote und Verschuldungsgrad und
          sind nur innerhalb des Finanzsektors gerankt.
        </div>
      )}
      {company.sector === 'Real Estate' && (
        <div className="rounded-[10px] bg-[#FFF4D6] px-4 py-3 text-[13px] text-[#8A5A00]">
          <b>{REAL_ESTATE.note}.</b> Bei Immobilienunternehmen und REITs fliessen Portfolio-Neubewertungen (Fair Value) oft direkt
          in EBIT und Reingewinn ein, wodurch EBIT-Marge und Umsatzrendite über 100 % liegen können. Zudem führt die langfristige
          Hypothekarfinanzierung strukturell zu tiefen Liquiditätsgraden und einer hohen Tilgungsdauer.
        </div>
      )}
      {AXIS_IDS.map((axis) => (
        <KpiSection key={axis} axis={axis} company={company} all={all} />
      ))}
      <p className="text-xs text-muted">
        Formel: Kennzahl mit der Maus berühren. Ampel: grün = Richtwert erfüllt, gelb = bis 20 % daneben, rot = deutlich daneben,
        grau = kein Richtwert oder keine Daten. Richtwerte sind exemplarisch (Buch S. 293).
      </p>
    </main>
  );
}

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Company } from '@/data/types';
import { QUICK_KPIS } from '@/lib/compare';
import { KPI_BY_ID } from '@/lib/config';
import { formatKpi, formatMarketCap } from '@/lib/format';
import { ampelFor, richtwertFor } from '@/lib/richtwert';
import { useDragOffset } from '@/lib/useDragOffset';
import { AmpelDot, FinancialNote, ScoreTiles } from '../ui/atoms';

interface Props {
  company: Company;
  starred: boolean;
  onToggle(): void;
  onClose(): void;
}

export function QuickCard({ company, starred, onToggle, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { offset, handleProps } = useDragOffset(cardRef);

  return (
    <div
      ref={cardRef}
      className="card absolute right-4 top-4 z-20 w-[310px] max-w-[calc(100%-2rem)] px-[18px] pb-4 shadow-pop"
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      <button
        type="button"
        aria-label="Kurzkarte schliessen"
        title="Schliessen"
        className="absolute right-1.5 top-1.5 z-10 grid h-8 w-8 place-items-center rounded-full text-[24px] leading-none text-text hover:bg-line-soft hover:text-bad"
        onClick={onClose}
      >
        ×
      </button>
      {/* Griff: Der ganze Kopf verschiebt die Karte, die Knöpfe darunter bleiben normal klickbar. */}
      <div
        {...handleProps}
        role="button"
        tabIndex={0}
        aria-label="Kurzkarte verschieben, auch mit den Pfeiltasten"
        title="Zum Verschieben ziehen"
        className="-mx-[18px] cursor-grab touch-none select-none rounded-t-[14px] px-[18px] pb-3 pt-2 hover:bg-paper active:cursor-grabbing"
      >
        <div className="mx-auto mb-1.5 h-1 w-9 rounded-full bg-line-strong" aria-hidden="true" />
        <h3 className="pr-6 font-title text-[17px] font-semibold">{company.name}</h3>
        <div className="mt-0.5 text-xs text-muted">
          {company.ticker} · {company.sectorDe} · {company.index === 'SP500' ? 'S&P 500' : company.index} · Börsenwert{' '}
          {formatMarketCap(company.marketCapUsd)}
        </div>
      </div>
      {company.isFinancial && <div className="mb-2"><FinancialNote /></div>}
      <ScoreTiles scores={company.scores} />
      <div className="mt-3">
        {QUICK_KPIS.map((id) => {
          const def = KPI_BY_ID.get(id);
          const kpi = company.kpis[id];
          if (!def || !kpi) return null;
          const rw = richtwertFor(def, company.sector, 'branche', kpi);
          return (
            <div key={id} className="flex items-center justify-between gap-2 border-t border-line py-1.5 text-[13px]">
              <span>
                {def.short}
                {rw && (
                  <em className="block text-[11.5px] not-italic text-muted">
                    Richtwert {rw.source === 'branche' ? 'Branche' : 'allgemein'} {rw.label}
                  </em>
                )}
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap font-mono font-semibold">
                {formatKpi(kpi.value, def.unit, company.currency)}
                <AmpelDot ampel={ampelFor(kpi, 'branche')} />
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn flex-1" onClick={onToggle}>
          {starred ? '★ In Watchlist' : '☆ Zur Watchlist'}
        </button>
        <Link to={`/firma/${encodeURIComponent(company.ticker)}`} className="btn btn-primary flex-1 text-center">
          Details →
        </Link>
      </div>
    </div>
  );
}

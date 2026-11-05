import { Link } from 'react-router-dom';
import type { Company } from '@/data/types';
import { QUICK_KPIS } from '@/lib/compare';
import { KPI_BY_ID } from '@/lib/config';
import { formatKpi, formatMarketCap } from '@/lib/format';
import { richtwertFor } from '@/lib/richtwert';
import { AmpelDot, FinancialNote, ScoreTiles } from '../ui/atoms';

interface Props {
  company: Company;
  starred: boolean;
  onToggle(): void;
  onClose(): void;
}

export function QuickCard({ company, starred, onToggle, onClose }: Props) {
  return (
    <div className="card absolute right-4 top-4 z-10 w-[310px] max-w-[calc(100%-2rem)] px-[18px] py-4 shadow-pop">
      <button type="button" aria-label="Schliessen" className="absolute right-3 top-2 text-lg text-muted hover:text-text" onClick={onClose}>
        ×
      </button>
      <h3 className="pr-5 font-title text-[17px] font-semibold">{company.name}</h3>
      <div className="mb-3 mt-0.5 text-xs text-muted">
        {company.ticker} · {company.sectorDe} · {company.index === 'SP500' ? 'S&P 500' : company.index} · Börsenwert{' '}
        {formatMarketCap(company.marketCapUsd)}
      </div>
      {company.isFinancial && <div className="mb-2"><FinancialNote /></div>}
      <ScoreTiles scores={company.scores} />
      <div className="mt-3">
        {QUICK_KPIS.map((id) => {
          const def = KPI_BY_ID.get(id);
          const kpi = company.kpis[id];
          if (!def || !kpi) return null;
          const rw = richtwertFor(def, company.sector, 'branche');
          return (
            <div key={id} className="flex items-center justify-between gap-2 border-t border-line py-1.5 text-[13px]">
              <span>
                {def.short}
                {rw && (
                  <em className="block text-[11.5px] not-italic text-muted">
                    Richtwert {rw.source === 'branche' ? 'Branche' : 'Buch'} {rw.label}
                  </em>
                )}
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap font-mono font-semibold">
                {formatKpi(kpi.value, def.unit, company.currency)}
                <AmpelDot ampel={kpi.ampelBranche} />
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn flex-1" onClick={onToggle}>
          {starred ? '★ Entfernen' : '☆ Favorit'}
        </button>
        <Link to={`/firma/${encodeURIComponent(company.ticker)}`} className="btn btn-primary flex-1 text-center">
          Details →
        </Link>
      </div>
    </div>
  );
}

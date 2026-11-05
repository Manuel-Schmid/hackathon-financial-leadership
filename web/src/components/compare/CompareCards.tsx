import type { Company } from '@/data/types';
import { AXES, AXIS_IDS, AXIS_STYLE } from '@/lib/config';
import { formatScore } from '@/lib/format';
import { totalScore, type ProfileRef } from '@/lib/weighting';
import { Bar, CompanyLink, FinancialNote } from '../ui/atoms';

interface Props {
  company: Company;
  color: string;
  profile: ProfileRef;
  onRemove(): void;
}

export function CompareCard({ company, color, profile, onRemove }: Props) {
  return (
    <div className="card relative px-[18px] py-4" style={{ borderTop: `4px solid ${color}` }}>
      <button
        type="button"
        aria-label={`${company.name} entfernen`}
        title={`${company.name} entfernen`}
        className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full text-[24px] leading-none text-text hover:bg-paper hover:text-bad"
        onClick={onRemove}
      >
        ×
      </button>
      <div className="flex items-start justify-between gap-2 pr-7">
        <div className="min-w-0">
          <h3 className="truncate font-title text-[17px] font-semibold">
            <CompanyLink ticker={company.ticker}>{company.name}</CompanyLink>
          </h3>
          <div className="mt-0.5 text-xs text-muted">{company.ticker} · {company.sectorDe}</div>
        </div>
        <div className="mt-2 text-right font-title text-[26px] font-bold leading-none">
          {formatScore(totalScore(company.scores, profile))}
          <small className="block font-sans text-[10.5px] font-bold tracking-[.05em] text-muted">GESAMT</small>
        </div>
      </div>
      {company.isFinancial && <div className="mt-2"><FinancialNote /></div>}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {AXIS_IDS.map((axis) => (
          <div key={axis} className={`min-w-0 text-[9.5px] font-bold uppercase tracking-[.02em] ${AXIS_STYLE[axis].text}`}>
            <b className="mb-1 block font-mono text-base text-text">{formatScore(company.scores[axis])}</b>
            <span className="mb-1 block truncate">{AXES[axis].label}</span>
            <Bar value={company.scores[axis]} className={AXIS_STYLE[axis].bg} />
          </div>
        ))}
      </div>
    </div>
  );
}

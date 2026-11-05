import { memo, useEffect, useRef } from 'react';
import type { Company } from '@/data/types';
import { AXIS_IDS, AXIS_STYLE } from '@/lib/config';
import { SORT_LABELS, type SortKey } from '@/lib/filters';
import { formatScore } from '@/lib/format';
import { totalScore, type ProfileRef } from '@/lib/weighting';
import { Bar, FinancialNote, SectorDot } from '../ui/atoms';

const COLUMNS = 'grid-cols-[minmax(0,1fr)_90px_46px_20px]';

interface RowProps {
  company: Company;
  total: number | null;
  selected: boolean;
  starred: boolean;
  onSelect(ticker: string): void;
  onToggle(ticker: string): void;
}

const Row = memo(function Row({ company, total, selected, starred, onSelect, onToggle }: RowProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = ref.current;
    const box = row?.parentElement;
    if (!selected || !row || !box) return;
    // Nur die Liste selbst scrollen: scrollIntoView würde auch die Seite bewegen und das Hochscrollen zum Würfel abbrechen.
    const [r, b] = [row.getBoundingClientRect(), box.getBoundingClientRect()];
    if (r.top < b.top) box.scrollTop -= b.top - r.top;
    else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom;
  }, [selected]);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(company.ticker)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(company.ticker)}
      className={`grid cursor-pointer ${COLUMNS} items-center gap-2 border-t border-line-soft px-5 py-2 hover:bg-paper ${selected ? 'bg-accent-soft hover:bg-accent-soft' : ''}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-bold">
          <SectorDot company={company} />
          <span className="truncate">{company.name}</span>
        </div>
        <div className="mt-px truncate pl-[18px] text-xs text-muted">
          {company.ticker}, {company.index === 'SP500' ? 'S&P 500' : company.index}
        </div>
        {company.isFinancial && <div className="mt-0.5 pl-[18px]"><FinancialNote /></div>}
      </div>
      <div className="flex flex-col gap-[3px]">
        {AXIS_IDS.map((axis) => (
          <Bar key={axis} value={company.scores[axis]} className={AXIS_STYLE[axis].bg} />
        ))}
      </div>
      <b className="text-right font-title text-[17px] font-bold" title="Gesamt-Score nach Anlegerprofil">
        {formatScore(total)}
      </b>
      <button
        type="button"
        aria-label={`Watchlists für ${company.name} wählen`}
        aria-pressed={starred}
        className={`text-[17px] leading-none ${starred ? 'text-R' : 'text-line-strong hover:text-R'}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(company.ticker);
        }}
      >
        ★
      </button>
    </div>
  );
});

interface Props {
  companies: Company[];
  profile: ProfileRef;
  sort: SortKey;
  selected: string | null;
  starred: Set<string>;
  onSort(key: SortKey): void;
  onSelect(ticker: string): void;
  onToggle(ticker: string): void;
}

export function CompanyList({ companies, profile, sort, selected, starred, onSort, onSelect, onToggle }: Props) {
  return (
    <div className="card flex min-h-0 flex-col overflow-hidden">
      <div className="flex items-end justify-between gap-2 px-5 pb-3 pt-4">
        <h2 className="font-title text-lg font-semibold">{companies.length} Unternehmen</h2>
        <select
          aria-label="Sortieren"
          className="pill cursor-pointer"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
      </div>
      <div className={`grid ${COLUMNS} gap-2 border-t border-line px-5 py-2 text-xs font-semibold text-muted`}>
        <span>Unternehmen</span>
        <span>
          <span className={AXIS_STYLE.liquiditaet.text}>L</span>, <span className={AXIS_STYLE.rentabilitaet.text}>R</span>,{' '}
          <span className={AXIS_STYLE.sicherheit.text}>S</span>
        </span>
        <span className="text-right">Gesamt</span>
      </div>
      <div className="min-h-[320px] flex-1 overflow-y-auto lg:min-h-0">
        {companies.map((c) => (
          <Row
            key={c.ticker}
            company={c}
            total={totalScore(c.scores, profile)}
            selected={c.ticker === selected}
            starred={starred.has(c.ticker)}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
        {companies.length === 0 && <p className="p-5 text-muted">Keine Unternehmen für diese Filter.</p>}
      </div>
    </div>
  );
}

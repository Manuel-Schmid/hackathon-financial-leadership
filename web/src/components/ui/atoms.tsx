import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Ampel, AxisScores, Company } from '@/data/types';
import { AMPEL_STYLE } from '@/lib/ampel';
import { AXES, AXIS_IDS, AXIS_STYLE, SECTORS } from '@/lib/config';
import { formatScore } from '@/lib/format';

export function AmpelDot({ ampel }: { ampel: Ampel }) {
  const style = AMPEL_STYLE[ampel];
  return <i title={style.label} aria-label={style.label} className={`inline-block h-[9px] w-[9px] shrink-0 rounded-full ${style.dot}`} />;
}

export function SectorDot({ company }: { company: Pick<Company, 'sector' | 'isFinancial'> }) {
  const color = SECTORS[company.sector]?.color ?? '#7C8799';
  return company.isFinancial ? (
    <i className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border-2 bg-white" style={{ borderColor: color }} />
  ) : (
    <i className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
  );
}

export function Bar({ value, className }: { value: number | null; className: string }) {
  return (
    <div className="h-[5px] w-full overflow-hidden rounded-[3px] bg-line-soft">
      {value !== null && <i className={`block h-full rounded-[3px] ${className}`} style={{ width: `${value}%` }} />}
    </div>
  );
}

export function ScoreTiles({ scores }: { scores: AxisScores }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {AXIS_IDS.map((axis) => (
        <div key={axis} className={`min-w-0 rounded-[10px] px-2 py-2 ${AXIS_STYLE[axis].soft}`}>
          <small className={`block truncate text-[9.5px] font-bold uppercase tracking-[.02em] ${AXIS_STYLE[axis].text}`}>
            {AXES[axis].label}
          </small>
          <b className="block font-title text-[22px] leading-tight">{formatScore(scores[axis])}</b>
        </div>
      ))}
    </div>
  );
}

export function FinancialNote() {
  return (
    <span className="rounded-md bg-[#FFF4D6] px-1.5 py-px text-[11px] font-semibold text-[#8A5A00]">
      ⓘ eingeschränkt vergleichbar
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card mx-auto mt-10 max-w-xl p-8 text-center">
      <h2 className="font-title text-lg font-semibold">{title}</h2>
      <div className="mt-2 text-muted">{children}</div>
    </div>
  );
}

export function PageTitle({ tag, title, sub }: { tag?: string; title: string; sub?: ReactNode }) {
  return (
    <div>
      {tag && <span className="tag">{tag}</span>}
      <h1 className="font-title text-[26px] font-semibold leading-tight">{title}</h1>
      {sub && <p className="mt-1 text-muted">{sub}</p>}
    </div>
  );
}

export function CompanyLink({ ticker, children }: { ticker: string; children: ReactNode }) {
  return (
    <Link className="hover:underline" to={`/firma/${encodeURIComponent(ticker)}`}>
      {children}
    </Link>
  );
}

/** Fängt Fehler einzelner Bereiche ab, z.B. wenn WebGL im Browser fehlt. */
export class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

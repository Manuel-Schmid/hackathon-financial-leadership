import { Fragment } from 'react';
import type { Company } from '@/data/types';
import { bestIndex, COMPARE_COLORS } from '@/lib/compare';
import { AXES, AXIS_IDS, AXIS_STYLE, KPIS } from '@/lib/config';
import { formatKpi } from '@/lib/format';
import { ampelFor, compareMode, richtwertFor } from '@/lib/richtwert';
import { AmpelDot } from '../ui/atoms';

/** Alle Kennzahlen aus config/kpis.json, in derselben Reihenfolge wie auf der Detailseite. */
const DEFS = KPIS;

export function CompareTable({ companies }: { companies: Company[] }) {
  const modus = compareMode(companies);
  const sector = companies[0]?.sector ?? '';
  return (
    <div className="card overflow-x-auto pb-2 pt-[18px] print:overflow-visible">
      <h2 className="px-[22px] font-title text-[17px] font-semibold">Alle Kennzahlen</h2>
      <p className="px-[22px] text-[12.5px] text-muted">
        {modus === 'branche'
          ? `Richtwerte der Branche ${companies[0]?.sectorDe ?? ''} (Quellen: Methodik)`
          : 'Firmen aus verschiedenen Branchen: allgemeine Richtwerte'}
      </p>
      <table className="mt-2.5 w-full min-w-[640px] print:min-w-0 print:text-[12px] border-collapse text-[13.5px]">
        <thead>
          <tr className="tag border-b border-line text-right">
            <th className="py-2 pl-[22px] text-left font-bold">Kennzahl</th>
            <th className="px-3 py-2 font-bold">{modus === 'branche' ? `Richtwert ${companies[0]?.sectorDe ?? ''}` : 'Richtwert allgemein'}</th>
            {companies.map((c, i) => (
              <th key={c.ticker} className="px-3 py-2 font-bold" style={{ color: COMPARE_COLORS[i] }}>
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AXIS_IDS.map((axis) => (
            <Fragment key={axis}>
              <tr>
                <td colSpan={2 + companies.length} className={`pl-[22px] pt-2 text-[11px] font-extrabold uppercase tracking-[.06em] ${AXIS_STYLE[axis].text}`}>
                  {AXES[axis].label}
                </td>
              </tr>
              {DEFS.filter((d) => d.axis === axis).map((def) => {
                const best = bestIndex(companies, def);
                const rw = richtwertFor(def, sector, modus, companies[0]?.kpis[def.id]);
                return (
                  <tr key={def.id} className="border-b border-line-soft">
                    <td className="py-1.5 pl-[22px] font-bold" title={def.label}>
                      {def.short}
                      <small className="block text-[11.5px] font-medium text-muted">{def.formula}</small>
                    </td>
                    <td className="whitespace-nowrap px-3 text-right text-[12.5px] text-muted">{rw ? `${rw.label}${modus === 'branche' && rw.source === 'buch' ? ' (allgemein)' : ''}` : '–'}</td>
                    {companies.map((c, i) => (
                      <td key={c.ticker} className={`whitespace-nowrap px-3 text-right font-mono ${i === best ? 'bg-accent-soft font-semibold' : ''}`}>
                        <span className="inline-flex items-center gap-2">
                          {formatKpi(c.kpis[def.id]?.value, def.unit, def.unit === 'currency' ? c.currency : '')}
                          <AmpelDot ampel={ampelFor(c.kpis[def.id], modus)} />
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

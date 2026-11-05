import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import type { AxisId, Company } from '@/data/types';
import { AXES, AXIS_STYLE, KPIS, type KpiDef } from '@/lib/config';
import { formatKpi } from '@/lib/format';
import { sectorMedian } from '@/lib/medians';
import { ampelFor, richtwertFor } from '@/lib/richtwert';
import { AmpelDot } from '../ui/atoms';

function Sparkline({ company, def }: { company: Company; def: KpiDef }) {
  const history = company.kpis[def.id]?.history ?? [];
  const known = history.filter((p) => p.value !== null);
  if (known.length < 2) return <span className="text-xs text-muted">–</span>;
  return (
    <div className="h-8 w-[110px]">
      <ResponsiveContainer>
        <LineChart data={history} margin={{ top: 3, bottom: 3, left: 3, right: 3 }}>
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            wrapperStyle={{ zIndex: 20 }}
            contentStyle={{ fontSize: 12, padding: '2px 8px', borderRadius: 8 }}
            labelFormatter={(i) => String(history[Number(i)]?.year ?? '')}
            formatter={(v) => [formatKpi(v as number, def.unit, company.currency), def.short]}
          />
          <Line type="monotone" dataKey="value" stroke={AXES[def.axis].color} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function usage(def: KpiDef): string | null {
  if (def.inScore === 'ampel') return 'nur Ampel, nicht im Score';
  if (def.inScore === 'detail') return 'nur Anzeige, nicht im Score';
  return null;
}

export function KpiSection({ axis, company, all }: { axis: AxisId; company: Company; all: Company[] }) {
  const kpis = KPIS.filter((k) => k.axis === axis);
  return (
    <section className="card overflow-x-auto">
      <h2 className={`px-5 pt-4 font-title text-[17px] font-semibold ${AXIS_STYLE[axis].text}`}>{AXES[axis].label}</h2>
      <table className="mt-2 w-full min-w-[860px] border-collapse text-[13.5px]">
        <thead>
          <tr className="tag text-right">
            <th className="py-2 pl-5 text-left font-bold">Kennzahl</th>
            <th className="px-3 py-2 font-bold">Wert</th>
            <th className="px-3 py-2 font-bold">Richtwert Buch</th>
            <th className="px-3 py-2 font-bold">Richtwert {company.sectorDe}</th>
            <th className="px-3 py-2 font-bold">Branchen-Median</th>
            <th className="py-2 pl-3 pr-5 font-bold">Verlauf</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((def) => {
            const kpi = company.kpis[def.id];
            const med = sectorMedian(all, company.sector, def.id);
            const branche = richtwertFor(def, company.sector, 'branche', kpi);
            // Beträge in verschiedenen Währungen haben keinen sinnvollen Median
            const showMedian = def.unit !== 'currency';
            return (
              <tr key={def.id} className="border-t border-line-soft">
                <td className="py-2 pl-5 font-bold" title={`${def.formula} (${def.source})`}>
                  {def.label}
                  <small className="block font-medium text-muted">{def.formula}</small>
                  {usage(def) && <small className="block font-medium text-muted">{usage(def)}</small>}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold">
                  {formatKpi(kpi?.value, def.unit, company.currency)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-[12.5px] text-muted">
                  <span className="inline-flex items-center gap-2">
                    {def.richtwert?.label ?? '–'}
                    <AmpelDot ampel={kpi?.ampel ?? 'grey'} />
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-[12.5px] text-muted" title={def.richtwertBranche?.quelle}>
                  <span className="inline-flex items-center gap-2">
                    {branche ? (branche.source === 'buch' ? 'wie Buch' : branche.label) : '–'}
                    <AmpelDot ampel={ampelFor(kpi, 'branche')} />
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-muted">
                  {showMedian ? formatKpi(med, def.unit) : '–'}
                </td>
                <td className="py-1 pl-3 pr-5">
                  <div className="flex justify-end">
                    <Sparkline company={company} def={def} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

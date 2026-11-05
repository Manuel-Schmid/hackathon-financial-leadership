import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AxisId, Company } from '@/data/types';
import { axisTicks, companyYears, formatAxisTick, historyForYears } from '@/lib/chartAxis';
import { AXES, AXIS_STYLE, KPIS, THEME, type KpiDef } from '@/lib/config';
import { formatKpi, formatScore } from '@/lib/format';
import { sectorMedian } from '@/lib/medians';
import { AmpelDot } from '../ui/atoms';

const AXIS_TEXT = { fontSize: 11, fill: THEME.muted };
const AXIS_LINE = { stroke: THEME.line.strong };

interface ValueTickProps {
  x?: number;
  y?: number;
  payload?: { value: number };
  unit: KpiDef['unit'];
}

/** Eigene Beschriftung: Die der Bibliothek bricht «200 Mrd.» auf zwei Zeilen um. */
function ValueTick({ x = 0, y = 0, payload, unit }: ValueTickProps) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={AXIS_TEXT.fontSize} fill={AXIS_TEXT.fill}>
      {formatAxisTick(payload?.value ?? 0, unit)}
    </text>
  );
}

function TimeChart({ company, def, years }: { company: Company; def: KpiDef; years: number[] }) {
  const history = historyForYears(company.kpis[def.id]?.history ?? [], years);
  const values = history.map((p) => p.value).filter((v): v is number => v !== null);
  if (values.length < 2) {
    return <p className="self-center text-center text-xs text-muted">Kein Verlauf verfügbar</p>;
  }
  const ticks = axisTicks(values);

  return (
    <div className="h-[92px] min-w-0">
      <ResponsiveContainer>
        <LineChart data={history} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={THEME.line.soft} />
          <XAxis dataKey="year" tick={AXIS_TEXT} tickLine={false} axisLine={AXIS_LINE} interval={0} height={20} tickMargin={4} />
          <YAxis
            width={58}
            ticks={ticks}
            interval={0}
            domain={[ticks[0], ticks[ticks.length - 1]]}
            tick={(props: Omit<ValueTickProps, 'unit'>) => <ValueTick {...props} unit={def.unit} />}
            tickLine={false}
            axisLine={AXIS_LINE}
          />
          <Tooltip
            wrapperStyle={{ zIndex: 20 }}
            contentStyle={{ fontSize: 12, padding: '2px 8px', borderRadius: 8 }}
            formatter={(value) => [formatKpi(value as number, def.unit, company.currency), def.short]}
          />
          <Line type="linear" dataKey="value" stroke={AXES[def.axis].color} strokeWidth={2} dot={{ r: 2.5 }} isAnimationActive={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function usage(def: KpiDef): string {
  if (def.inScore === 'ampel') return ' Nur Ampel, nicht im Score.';
  if (def.inScore === 'detail') return ' Nur Anzeige, nicht im Score.';
  return '';
}

function KpiRow({ def, company, all, years }: { def: KpiDef; company: Company; all: Company[]; years: number[] }) {
  const kpi = company.kpis[def.id];
  // Beträge in verschiedenen Währungen haben keinen sinnvollen Median
  const median = def.unit === 'currency' ? null : sectorMedian(all, company.sector, def.id);
  return (
    <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-2 border-t border-line-soft py-2.5">
      <div className="min-w-0">
        <h3 className="text-[13.5px] font-bold leading-tight" title={`${def.label}: ${def.formula} (${def.source}).${usage(def)}`}>
          {def.short}
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap font-mono text-[15px] font-semibold leading-snug">
          {formatKpi(kpi?.value, def.unit, company.currency)}
          <AmpelDot ampel={kpi?.ampel ?? 'grey'} />
        </p>
        <p className="mt-0.5 text-xs leading-snug text-muted">Richtwert {def.richtwert?.label ?? 'keiner'}</p>
        {median !== null && <p className="text-xs leading-snug text-muted">Median {formatKpi(median, def.unit)}</p>}
      </div>
      <TimeChart company={company} def={def} years={years} />
    </div>
  );
}

/** Eine Spalte des Zieldreiecks: Achsen-Score oben, darunter alle Kennzahlen dieser Achse. */
export function KpiSection({ axis, company, all }: { axis: AxisId; company: Company; all: Company[] }) {
  const years = useMemo(() => companyYears(company), [company]);
  return (
    <section className="card rounded-t-none border-t-4 px-5 pb-1 pt-4" style={{ borderTopColor: AXES[axis].color }}>
      <div className={`mb-2 flex items-baseline justify-between ${AXIS_STYLE[axis].text}`}>
        <h2 className="font-title text-[17px] font-semibold">{AXES[axis].label}</h2>
        <b className="font-title text-[28px] font-bold leading-none">{formatScore(company.scores[axis])}</b>
      </div>
      {KPIS.filter((k) => k.axis === axis).map((def) => (
        <KpiRow key={def.id} def={def} company={company} all={all} years={years} />
      ))}
    </section>
  );
}

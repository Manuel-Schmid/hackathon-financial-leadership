import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import type { AxisId, Company } from '@/data/types';
import { AXES, THEME } from '@/lib/config';
import { COMPARE_COLORS } from '@/lib/compare';

// Rentabilität oben, wie im Mockup
const ORDER: AxisId[] = ['rentabilitaet', 'sicherheit', 'liquiditaet'];
const TEXT_COLOR: Record<AxisId, string> = {
  rentabilitaet: THEME.R.text,
  sicherheit: AXES.sicherheit.color,
  liquiditaet: AXES.liquiditaet.color,
};

interface TickProps {
  x?: number;
  y?: number;
  textAnchor?: 'start' | 'middle' | 'end';
  index?: number;
}

function AxisTick({ x = 0, y = 0, textAnchor, index = 0 }: TickProps) {
  const axis = ORDER[index];
  return (
    <text x={x} y={y} textAnchor={textAnchor} fontFamily="Sora" fontWeight={700} fontSize={12} fill={TEXT_COLOR[axis]}>
      {AXES[axis].label.toUpperCase()}
    </text>
  );
}

export function CompareRadar({ companies }: { companies: Company[] }) {
  const data = ORDER.map((axis) => ({
    axis,
    // Finanzsektor ohne Liquiditäts-Score: 0 zeichnet die Ecke sichtbar leer, statt das Polygon zu öffnen
    ...Object.fromEntries(companies.map((c) => [c.ticker, c.scores[axis] ?? 0])),
  }));

  return (
    <div className="card px-5 py-[18px]">
      <h2 className="font-title text-[17px] font-semibold">Profil im Zieldreieck</h2>
      <p className="mt-1 text-[13px] text-muted">Je weiter aussen, desto besser</p>
      <div className="h-[380px]">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke={THEME.line.DEFAULT} />
            <PolarAngleAxis dataKey="axis" tick={(props: TickProps) => <AxisTick {...props} />} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            {companies.map((c, i) => (
              <Radar
                key={c.ticker}
                dataKey={c.ticker}
                stroke={COMPARE_COLORS[i]}
                fill={COMPARE_COLORS[i]}
                fillOpacity={0.1}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: COMPARE_COLORS[i], fillOpacity: 1 }}
                isAnimationActive={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 px-6 text-[13px] font-bold">
        {companies.map((c, i) => (
          <span key={c.ticker} className="flex items-center gap-2">
            <i className="inline-block h-3 w-3 rounded-full" style={{ background: COMPARE_COLORS[i] }} />
            {c.name}
          </span>
        ))}
      </div>
    </div>
  );
}

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import type { AxisId, Company } from '@/data/types';
import { AXES, THEME } from '@/lib/config';
import { COMPARE_COLORS } from '@/lib/compare';
import { TRIANGLE_ORDER, weightsToPoint, type Point } from '@/lib/triangle';
import { profileLabel, type Weights } from '@/lib/weighting';
import type { SavedProfile } from '@/profiles/ProfileStore';

// Gleiche Anordnung wie das Profil-Dreieck: Rentabilität oben
const ORDER = TRIANGLE_ORDER;
const TEXT_COLOR: Record<AxisId, string> = {
  rentabilitaet: THEME.R.text,
  sicherheit: AXES.sicherheit.color,
  liquiditaet: AXES.liquiditaet.color,
};
/** Unsichtbare Ebene auf den Ecken (Wert 100): liefert die Pixel-Positionen für den Profilpunkt. */
const CORNER_KEY = '__ecke';

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

function ProfileMarker({ points, weights, name }: { points?: Point[]; weights: Weights; name: string }) {
  if (points?.length !== ORDER.length) return <g />;
  const corners = Object.fromEntries(ORDER.map((axis, i) => [axis, points[i]])) as Record<AxisId, Point>;
  const { x, y } = weightsToPoint(weights, corners);
  return (
    <g data-testid="profile-marker">
      <circle cx={x} cy={y} r={7.5} fill={THEME.accent.DEFAULT} stroke="#fff" strokeWidth={2.5} />
      <text
        x={x + 12}
        y={y + 4}
        fontFamily="Sora"
        fontWeight={700}
        fontSize={12}
        fill={THEME.accent.DEFAULT}
        stroke="#fff"
        strokeWidth={3}
        paintOrder="stroke"
      >
        {name}
      </text>
    </g>
  );
}

export function CompareRadar({ companies, profile }: { companies: Company[]; profile: SavedProfile }) {
  const data = ORDER.map((axis) => ({
    axis,
    [CORNER_KEY]: 100,
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
            {/* Zuletzt: Der Profilpunkt liegt über den Firmen. */}
            <Radar
              dataKey={CORNER_KEY}
              isAnimationActive={false}
              shape={(props: { points?: Point[] }) => <ProfileMarker points={props.points} weights={profile.weights} name={profile.name} />}
            />
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
      <p className="mx-6 mt-3 flex items-start gap-2 border-t border-line pt-3 text-xs text-muted">
        <i className="mt-px inline-block h-3 w-3 shrink-0 rounded-full border-2 border-white bg-accent ring-1 ring-accent" />
        <span>
          <b className="text-text">Anlegerprofil {profile.name} ({profileLabel(profile.weights)}).</b> Der Punkt zeigt die Gewichtung, keine Firma:
          Je näher an einer Ecke, desto stärker zählt diese Achse im Gesamt-Score.
        </span>
      </p>
    </div>
  );
}

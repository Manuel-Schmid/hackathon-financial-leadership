import { useMemo } from 'react';
import type { Company } from '@/data/types';
import { capBounds, capHistogram, capToPosition, positionToCap } from '@/lib/capRange';

const STEP = 0.001;
const MIN_GAP = 0.02;

interface Props {
  companies: Company[];
  capMin: number | null;
  capMax: number | null;
  onChange(capMin: number | null, capMax: number | null): void;
}

function billions(value: number | null): string {
  return value === null ? '' : String(value / 1e9);
}

function parseBillions(text: string): number | null {
  const value = Number(text);
  return text.trim() && Number.isFinite(value) && value > 0 ? value * 1e9 : null;
}

/** Histogramm mit zwei Griffen wie bei Digitec: Balken zeigen, wo die Firmen liegen. */
export function CapRangeFilter({ companies, capMin, capMax, onChange }: Props) {
  const bounds = useMemo(() => capBounds(companies), [companies]);
  const bars = useMemo(() => (bounds ? capHistogram(companies, bounds) : []), [companies, bounds]);
  if (!bounds) return <p className="text-[13px] text-muted">Keine Börsenwerte vorhanden.</p>;

  const from = capMin === null ? 0 : capToPosition(capMin, bounds);
  const to = capMax === null ? 1 : capToPosition(capMax, bounds);
  const tallest = Math.max(...bars, 1);

  // Am Anschlag gibt es keine Grenze: sonst fiele der grösste Wert durch die Rundung heraus.
  const setFrom = (position: number) => {
    const next = Math.min(position, to - MIN_GAP);
    onChange(next <= 0 ? null : positionToCap(next, bounds), capMax);
  };
  const setTo = (position: number) => {
    const next = Math.max(position, from + MIN_GAP);
    onChange(capMin, next >= 1 ? null : positionToCap(next, bounds));
  };

  return (
    <div>
      <div className="flex h-14 items-end gap-px" aria-hidden="true">
        {bars.map((count, i) => {
          const start = i / bars.length;
          const end = (i + 1) / bars.length;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-[1px] ${end > from && start < to ? 'bg-accent' : 'bg-line-strong'}`}
              style={{ height: count ? `${Math.max(6, (count / tallest) * 100)}%` : 0 }}
              title={`${count} Unternehmen`}
            />
          );
        })}
      </div>
      <div className="range-pair">
        <div className="range-track" />
        <div className="range-fill" style={{ left: `${from * 100}%`, right: `${(1 - to) * 100}%` }} />
        <input type="range" aria-label="Börsenwert von" min={0} max={1} step={STEP} value={from} onChange={(e) => setFrom(Number(e.target.value))} />
        <input type="range" aria-label="Börsenwert bis" min={0} max={1} step={STEP} value={to} onChange={(e) => setTo(Number(e.target.value))} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-[13px] font-semibold">
        <label>
          Von, in Mrd. USD
          <input
            type="number"
            min={0}
            className="input mt-1 h-9 w-full font-medium"
            placeholder={String(Math.floor(bounds.lo / 1e9))}
            value={billions(capMin)}
            onChange={(e) => onChange(parseBillions(e.target.value), capMax)}
          />
        </label>
        <label>
          Bis, in Mrd. USD
          <input
            type="number"
            min={0}
            className="input mt-1 h-9 w-full font-medium"
            placeholder={String(Math.ceil(bounds.hi / 1e9))}
            value={billions(capMax)}
            onChange={(e) => onChange(capMin, parseBillions(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

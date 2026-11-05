import { SECTORS } from '@/lib/config';

export function CubeLegend() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-3">
      <div className="flex flex-col gap-0.5 rounded-[10px] bg-white/90 px-3 py-2 text-xs text-muted">
        <span>Ziehen dreht, Scrollen zoomt, Klick öffnet Details.</span>
        <span>Je grösser der Punkt, desto höher der Börsenwert.</span>
      </div>
      <div className="grid shrink-0 grid-cols-3 gap-x-4 gap-y-1 rounded-[10px] bg-white/90 px-3 py-2 text-xs font-semibold text-text min-[1400px]:grid-cols-4">
        {Object.entries(SECTORS).map(([id, sector]) => (
          <span key={id} className="flex items-center gap-1.5 whitespace-nowrap">
            {sector.financial ? (
              <i className="inline-block h-2.5 w-2.5 rounded-full border-2 bg-white" style={{ borderColor: sector.color }} />
            ) : (
              <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: sector.color }} />
            )}
            {sector.de}
          </span>
        ))}
      </div>
    </div>
  );
}

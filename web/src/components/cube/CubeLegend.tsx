import { SECTORS } from '@/lib/config';

export function CubeLegend() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex flex-wrap items-end justify-between gap-3 px-5">
      <div className="flex flex-col gap-0.5 text-xs text-muted">
        <span>⟲ Ziehen zum Drehen · ⊕ Scrollen zum Zoomen · ● Klick für Details</span>
        <span>Punktgrösse = Börsenwert</span>
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs font-semibold text-[#3B4659] xl:grid-cols-4">
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

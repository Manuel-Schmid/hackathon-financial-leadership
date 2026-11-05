import { useRef, useState } from 'react';
import { Bar } from '@/components/ui/atoms';
import { AXES, AXIS_IDS, AXIS_STYLE } from '@/lib/config';
import { toPercents } from '@/lib/triangle';
import { useProfiles } from '@/profiles/ProfileProvider';
import type { SavedProfile } from '@/profiles/ProfileStore';
import { ProfileEditor } from './ProfileEditor';
import { MiniTriangle } from './WeightTriangle';

const SCROLL_STEP = 460;
const CARD = 'card w-[244px] shrink-0 snap-start p-4 text-left transition-colors hover:border-ink focus-visible:border-accent focus-visible:outline-none';

function ProfileCard({ profile, onOpen }: { profile: SavedProfile; onOpen(): void }) {
  const percents = toPercents(profile.weights);
  return (
    <button type="button" className={CARD} onClick={onOpen}>
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <b className="line-clamp-2 break-words font-title text-[16px] font-semibold leading-tight" title={profile.name}>{profile.name}</b>
          <span className="text-xs text-muted">{profile.builtIn ? 'Vorlage' : 'Eigenes Profil'}</span>
        </span>
        <MiniTriangle weights={profile.weights} />
      </span>
      <span className="mt-3 block space-y-1.5">
        {AXIS_IDS.map((axis) => (
          <span key={axis} className="grid grid-cols-[72px_minmax(0,1fr)_30px] items-center gap-1.5 text-[11.5px]">
            <span className={`truncate font-semibold ${AXIS_STYLE[axis].text}`}>{AXES[axis].label}</span>
            <Bar value={percents[axis]} className={AXIS_STYLE[axis].bg} />
            <span className="text-right font-semibold">{percents[axis]}%</span>
          </span>
        ))}
      </span>
    </button>
  );
}

export function ProfileGallery() {
  const { own, all } = useProfiles();
  const scroller = useRef<HTMLDivElement>(null);
  // undefined: Popup zu. null: neues Profil.
  const [open, setOpen] = useState<SavedProfile | null | undefined>(undefined);
  const scroll = (direction: 1 | -1) => scroller.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });

  return (
    <section className="card min-w-0 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3 px-5">
        <div>
          <h2 className="font-title text-[19px] font-semibold">Anlegerprofile</h2>
          <p className="text-[13px] text-muted">
            {own.length === 0 ? 'Noch kein eigenes Profil. Erstell eines oder geh von einer Vorlage aus.' : `${own.length === 1 ? '1 eigenes' : `${own.length} eigene`}, dazu ${all.length - own.length} Vorlagen.`}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button type="button" aria-label="Nach links blättern" className="btn h-9 w-9 p-0 text-[18px] leading-none" onClick={() => scroll(-1)}>‹</button>
          <button type="button" aria-label="Nach rechts blättern" className="btn h-9 w-9 p-0 text-[18px] leading-none" onClick={() => scroll(1)}>›</button>
        </div>
      </div>
      <div ref={scroller} className="mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scroll-padding-left:1.25rem]">
        <button
          type="button"
          className="flex w-[170px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-[14px] border border-dashed border-line-strong p-4 font-bold transition-colors hover:border-ink hover:bg-paper"
          onClick={() => setOpen(null)}
        >
          <span aria-hidden="true" className="font-title text-[30px] font-normal leading-none text-accent">+</span>
          Neues Profil
        </button>
        {all.map((p) => <ProfileCard key={p.id} profile={p} onOpen={() => setOpen(p)} />)}
      </div>
      {open !== undefined && <ProfileEditor profile={open} onClose={() => setOpen(undefined)} />}
    </section>
  );
}

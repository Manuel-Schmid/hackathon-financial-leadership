import { useState } from 'react';
import { Popup } from '@/components/ui/Popup';
import { profileLabel } from '@/lib/weighting';
import { useProfiles } from '@/profiles/ProfileProvider';
import { ProfileEditor } from './ProfileEditor';
import { MiniTriangle } from './WeightTriangle';

const SEARCH_FROM = 7;

interface PickerProps {
  value: string;
  listName?: string;
  onPick(id: string): void;
  onClose(): void;
}

function ProfilePicker({ value, listName, onPick, onClose }: PickerProps) {
  const { all, resolve } = useProfiles();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const current = resolve(value).id;
  const q = query.trim().toLowerCase();
  const matches = all.filter((p) => p.name.toLowerCase().includes(q));

  if (creating) {
    return (
      <ProfileEditor
        profile={null}
        onClose={() => setCreating(false)}
        onSaved={(saved) => {
          onPick(saved.id);
          onClose();
        }}
      />
    );
  }

  return (
    <Popup
      title="Anlegerprofil wählen"
      sub={listName ? `Bestimmt den Gesamt-Score von «${listName}».` : 'Bestimmt den Gesamt-Score dieser Watchlist.'}
      width="w-[560px]"
      onClose={onClose}
    >
      {all.length >= SEARCH_FROM && (
        <input
          data-autofocus
          type="search"
          aria-label="Anlegerprofil suchen"
          className="input mb-3 w-full"
          placeholder="Profil suchen"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <div className="grid max-h-[50vh] gap-2 overflow-y-auto sm:grid-cols-2">
        <button
          type="button"
          className="flex items-center gap-3 rounded-[14px] border border-dashed border-line-strong p-3 text-left font-bold transition-colors hover:border-ink hover:bg-paper"
          onClick={() => setCreating(true)}
        >
          <span aria-hidden="true" className="grid h-[50px] w-[57px] shrink-0 place-items-center font-title text-[30px] font-normal text-accent">+</span>
          Neues Profil
        </button>
        {matches.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={p.id === current}
            className={`card flex items-center gap-3 p-3 text-left transition-colors hover:border-ink ${p.id === current ? 'border-accent bg-accent-soft' : ''}`}
            onClick={() => {
              onPick(p.id);
              onClose();
            }}
          >
            <MiniTriangle weights={p.weights} />
            <span className="min-w-0">
              <b className="line-clamp-2 break-words font-title text-[15px] font-semibold leading-tight">{p.name}</b>
              <span className="mt-0.5 block text-xs text-muted">{profileLabel(p.weights)}</span>
            </span>
          </button>
        ))}
      </div>
      {matches.length === 0 && <p className="mt-3 text-[13px] text-muted">Kein Profil mit diesem Namen. Erstell oben ein neues.</p>}
    </Popup>
  );
}

interface ButtonProps {
  value: string;
  listName?: string;
  /** Sieht aus wie ein Auswahlfeld, für Stellen mit eigener Beschriftung. */
  field?: boolean;
  id?: string;
  onChange(id: string): void;
}

/** Zeigt das Profil einer Watchlist; ein Klick öffnet die Auswahl im Popup. */
export function ProfileButton({ value, listName, field, id, onChange }: ButtonProps) {
  const { resolve } = useProfiles();
  const [open, setOpen] = useState(false);
  const name = resolve(value).name;
  return (
    <>
      {field ? (
        <button
          id={id}
          type="button"
          aria-haspopup="dialog"
          className="input flex h-9 w-full cursor-pointer items-center justify-between gap-2 py-0 text-left font-medium"
          onClick={() => setOpen(true)}
        >
          <span className="truncate">{name}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : (
        <button type="button" className="btn whitespace-nowrap font-semibold" title="Anlegerprofil wählen" onClick={() => setOpen(true)}>
          Profil: {name}
        </button>
      )}
      {open && <ProfilePicker value={value} listName={listName} onPick={onChange} onClose={() => setOpen(false)} />}
    </>
  );
}

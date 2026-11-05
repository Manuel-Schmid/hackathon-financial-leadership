import { useDeferredValue, useMemo, useState, type FormEvent } from 'react';
import { Popup } from '@/components/ui/Popup';
import { Bar, SectorDot } from '@/components/ui/atoms';
import { useCompanies } from '@/data/DataProvider';
import { AXES, AXIS_IDS, AXIS_STYLE, PROFILES } from '@/lib/config';
import { DEFAULT_FILTERS, matchesFilters, sortCompanies } from '@/lib/filters';
import { formatScore } from '@/lib/format';
import { setAxisPercent, toPercents } from '@/lib/triangle';
import { totalScore, type Weights } from '@/lib/weighting';
import { useProfiles } from '@/profiles/ProfileProvider';
import { TEMPLATES, type SavedProfile } from '@/profiles/ProfileStore';
import { WeightTriangle } from './WeightTriangle';

const TOP_COUNT = 5;

function samePercents(a: Weights, b: Weights): boolean {
  const [x, y] = [toPercents(a), toPercents(b)];
  return AXIS_IDS.every((axis) => x[axis] === y[axis]);
}

function LiveRanking({ weights }: { weights: Weights }) {
  const companies = useCompanies();
  const pool = useMemo(() => companies.filter((c) => matchesFilters(c, DEFAULT_FILTERS)), [companies]);
  const deferred = useDeferredValue(weights);
  const top = useMemo(() => sortCompanies(pool, 'total', deferred).slice(0, TOP_COUNT), [pool, deferred]);

  return (
    <div>
      <h3 className="text-[13px] font-bold">Mit diesem Profil vorne</h3>
      <ol className="mt-1">
        {top.map((c, i) => (
          <li key={c.ticker} className="flex items-center gap-2 border-t border-line-soft py-1.5 text-[13px] first:border-t-0">
            <span className="w-3 shrink-0 text-muted">{i + 1}</span>
            <SectorDot company={c} />
            <span className="min-w-0 flex-1 truncate font-semibold">{c.name}</span>
            <b className="font-title text-[15px]">{formatScore(totalScore(c.scores, deferred))}</b>
          </li>
        ))}
      </ol>
      <p className="mt-1 text-[11.5px] leading-snug text-muted">
        Nur Kennzahlen im Vergleich zu den anderen Firmen, ohne Finanzsektor. Keine Kaufempfehlung.
      </p>
    </div>
  );
}

interface Props {
  /** Eigenes Profil: bearbeiten. Vorlage: als Ausgangspunkt übernehmen. null: neu. */
  profile: SavedProfile | null;
  onClose(): void;
  /** Bekommt das gespeicherte Profil, z. B. um es gleich einer Watchlist zuzuweisen. */
  onSaved?(saved: SavedProfile): void;
}

export function ProfileEditor({ profile, onClose, onSaved }: Props) {
  const { all, create, update, remove } = useProfiles();
  const editing = profile && !profile.builtIn ? profile : null;
  const [name, setName] = useState(editing?.name ?? '');
  const [weights, setWeights] = useState<Weights>(profile?.weights ?? PROFILES.ausgewogen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const percents = toPercents(weights);

  const trimmed = name.trim();
  const nameTaken = all.some((p) => p.id !== editing?.id && p.name.toLowerCase() === trimmed.toLowerCase());

  const run = (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    action()
      .then(onClose)
      .catch((err: Error) => {
        setError(err.message || 'Das Anlegerprofil konnte nicht gespeichert werden.');
        setBusy(false);
      });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed || nameTaken || busy) return;
    const input = { name: trimmed, weights };
    run(async () => {
      if (editing) {
        await update(editing.id, input);
        onSaved?.({ ...editing, ...input });
      } else {
        // Erst speichern, dann melden: In onSaved?.(await …) liefe das Speichern ohne Rückruf gar nicht.
        const created = await create(input);
        onSaved?.(created);
      }
    });
  };

  const title = editing ? 'Anlegerprofil bearbeiten' : profile ? `Vorlage ${profile.name}` : 'Neues Anlegerprofil';
  const sub = profile?.builtIn
    ? 'Vorlagen bleiben unverändert. Mit einem Namen speicherst du sie als eigenes Profil.'
    : 'Zieh den Punkt dorthin, wo das Profil liegen soll. Die drei Werte ergeben immer 100 %.';

  return (
    <Popup
      title={title}
      sub={sub}
      width="w-[800px]"
      onClose={onClose}
      footer={
        <>
          {editing && (
            <button
              type="button"
              className="btn text-bad"
              disabled={busy}
              onClick={() => window.confirm(`Anlegerprofil «${editing.name}» löschen?`) && run(() => remove(editing.id))}
            >
              Löschen
            </button>
          )}
          {error && <p role="alert" className="min-w-0 flex-1 text-[13px] text-bad">{error}</p>}
          <div className="ml-auto flex gap-2">
            <button type="button" className="btn" onClick={onClose}>Abbrechen</button>
            <button type="submit" form="profile-form" className="btn btn-primary px-5" disabled={!trimmed || nameTaken || busy}>
              {editing ? 'Änderungen speichern' : 'Profil speichern'}
            </button>
          </div>
        </>
      }
    >
      <form id="profile-form" onSubmit={submit} className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="rounded-[12px] bg-paper p-3">
          <WeightTriangle weights={weights} onChange={setWeights} />
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3">
            {AXIS_IDS.map((axis) => (
              <label key={axis} className="min-w-0 text-[12px] font-bold">
                <span className={`block truncate ${AXIS_STYLE[axis].text}`}>{AXES[axis].label}</span>
                <span className="mt-1 flex items-center gap-1 font-normal text-muted">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="input w-full px-2 py-1 font-semibold text-text"
                    value={percents[axis]}
                    onChange={(e) => setWeights(setAxisPercent(weights, axis, e.target.valueAsNumber))}
                  />
                  %
                </span>
                <span className="mt-1.5 block"><Bar value={percents[axis]} className={AXIS_STYLE[axis].bg} /></span>
              </label>
            ))}
          </div>
        </div>
        <div className="min-w-0 space-y-4">
          <label className="block text-[13px] font-bold">
            Name
            <input
              data-autofocus
              className="input mt-1.5 w-full font-medium"
              placeholder="z. B. Kunde Müller"
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {trimmed && nameTaken && <span className="mt-1 block text-xs font-normal text-bad">Diesen Namen gibt es schon.</span>}
          </label>
          <div>
            <h3 className="mb-1.5 text-[13px] font-bold">Von einer Vorlage ausgehen</h3>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => {
                const on = samePercents(t.weights, weights);
                return (
                  <button key={t.id} type="button" aria-pressed={on} className={`pill ${on ? 'pill-on' : ''}`} onClick={() => setWeights(t.weights)}>
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
          <LiveRanking weights={weights} />
        </div>
      </form>
    </Popup>
  );
}

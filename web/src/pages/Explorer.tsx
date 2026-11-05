import { lazy, Suspense, useMemo, useState } from 'react';
import { QuickCard } from '@/components/company/QuickCard';
import { CubeLegend } from '@/components/cube/CubeLegend';
import { FilterBar } from '@/components/filters/FilterBar';
import { CompanyList } from '@/components/list/CompanyList';
import { WatchlistBar } from '@/components/list/WatchlistBar';
import { ErrorBoundary } from '@/components/ui/atoms';
import { WatchlistPicker } from '@/components/watchlists/WatchlistPicker';
import { useCompanies, useData } from '@/data/DataProvider';
import { DEFAULT_FILTERS, matchesFilters, sortCompanies, type Filters, type SortKey } from '@/lib/filters';
import { useProfiles } from '@/profiles/ProfileProvider';
import { useWatchlists } from '@/watchlists/WatchlistProvider';

// three.js ist gross: erst laden, wenn der Würfel wirklich gebraucht wird
const CubeCanvas = lazy(() => import('@/components/cube/CubeCanvas').then((m) => ({ default: m.CubeCanvas })));

const CUBE_FALLBACK = (
  <div className="grid h-full place-items-center p-8 text-center text-muted">
    Der 3D-Würfel braucht WebGL. Die Liste rechts funktioniert trotzdem.
  </div>
);

function revealCube() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Erst nach dem Klick: Eine neue Auswahl scrollt auch die Firmenliste und würde das sanfte Scrollen sonst abbrechen.
  setTimeout(() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }), 0);
}

export function Explorer() {
  const companies = useCompanies();
  const { byTicker } = useData();
  const { lists, focusId, setFocus, allTickers, shownTickers, spotlight } = useWatchlists();
  const focusedList = lists.find((l) => l.id === focusId);
  const [picking, setPicking] = useState<string | null>(null);
  const pickingCompany = picking ? byTicker.get(picking) : undefined;
  const { all: profiles, selected: selectedProfile, select: selectProfile } = useProfiles();
  // Das Profil überlebt den Abstecher auf eine Detailseite, damit dort derselbe Score steht.
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, investorProfile: selectedProfile?.id ?? null });
  const [sort, setSort] = useState<SortKey>('total');
  const [selected, setSelected] = useState<string | null>(null);
  const profile = useMemo(
    () => profiles.find((p) => p.id === filters.investorProfile)?.weights ?? 'ausgewogen',
    [profiles, filters.investorProfile],
  );

  const changeFilters = (next: Filters) => {
    // Wer ein Profil wählt, will sehen, welche Firmen am besten dazu passen.
    if (next.investorProfile && next.investorProfile !== filters.investorProfile) setSort('total');
    selectProfile(next.investorProfile);
    setFilters(next);
  };

  const filtered = useMemo(() => companies.filter((c) => matchesFilters(c, filters)), [companies, filters]);
  const visible = useMemo(() => new Set(filtered.map((c) => c.ticker)), [filtered]);
  const sorted = useMemo(() => sortCompanies(filtered, sort, profile), [filtered, sort, profile]);
  const selectedCompany = selected ? byTicker.get(selected) : undefined;
  const missingScores = filtered.filter((c) => !c.isFinancial && Object.values(c.scores).includes(null)).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FilterBar
        companies={companies}
        filters={filters}
        resultCount={filtered.length}
        onChange={changeFilters}
        onPick={setSelected}
      />
      <main className="grid flex-1 gap-4 p-4 lg:h-[calc(100vh-146px)] lg:flex-none lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_420px] lg:grid-rows-[minmax(0,1fr)] lg:px-7">
        <div className="flex min-h-0 flex-col gap-4">
          <section className="card relative min-h-[520px] flex-1 overflow-hidden">
            {/* Textflächen lassen die Maus durch: Darunter dreht, zoomt und klickt man wie überall im Würfel. */}
            <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[380px] rounded-[10px] bg-white/90 px-4 py-2.5">
              <h2 className="font-title text-xl font-semibold">Zieldreieck als Würfel</h2>
              <p className="mt-0.5 text-[13px] text-muted">
                Jeder Punkt ist ein Unternehmen. Oben rechts hinten liegen die liquiden, rentablen und sicheren.
                {missingScores > 0 && ` ${missingScores} ohne vollständige Scores fehlen im Würfel.`}
              </p>
              {/* Die Watchlists liegen unter dem Würfel: Der Fokus lässt sich auch von hier aus beenden. */}
              {focusedList ? (
                <button
                  type="button"
                  className="pointer-events-auto mt-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] font-semibold text-accent hover:bg-note"
                  onClick={() => setFocus(null)}
                >
                  Nur {focusedList.name} ×
                </button>
              ) : (
                <a href="#watchlists" className="pointer-events-auto mt-1 inline-block text-[13px] font-semibold text-accent underline">
                  Zu den Watchlists ({lists.length})
                </a>
              )}
            </div>
            {/* isolate: Firmennamen im Würfel bleiben unter den Textflächen und der Kurzkarte. */}
            <div className="absolute inset-0 isolate">
              <ErrorBoundary fallback={CUBE_FALLBACK}>
                <Suspense fallback={<div className="grid h-full place-items-center text-muted">Würfel wird geladen …</div>}>
                  <CubeCanvas
                    companies={companies}
                    visible={visible}
                    selected={selected}
                    highlighted={shownTickers}
                    spotlight={spotlight}
                    onSelect={setSelected}
                    onDeselect={() => setSelected(null)}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
            {selectedCompany && (
              <QuickCard
                company={selectedCompany}
                starred={allTickers.has(selectedCompany.ticker)}
                onToggle={() => setPicking(selectedCompany.ticker)}
                onClose={() => setSelected(null)}
              />
            )}
            <CubeLegend />
          </section>
        </div>
        <CompanyList
          companies={sorted}
          profile={profile}
          sort={sort}
          selected={selected}
          starred={allTickers}
          onSort={setSort}
          onSelect={setSelected}
          onToggle={setPicking}
        />
      </main>
      <WatchlistBar onSelect={setSelected} onReveal={revealCube} />
      {pickingCompany && <WatchlistPicker company={pickingCompany} onClose={() => setPicking(null)} />}
    </div>
  );
}

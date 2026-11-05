import { lazy, Suspense, useMemo, useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { QuickCard } from '@/components/company/QuickCard';
import { CubeLegend } from '@/components/cube/CubeLegend';
import { FilterBar } from '@/components/filters/FilterBar';
import { CompanyList } from '@/components/list/CompanyList';
import { WatchlistBar } from '@/components/list/WatchlistBar';
import { ErrorBoundary } from '@/components/ui/atoms';
import { useCompanies, useData } from '@/data/DataProvider';
import { matchesFilters, restoreFilters, restoreSort, sortCompanies, type Filters, type SortKey } from '@/lib/filters';
import { useSessionState } from '@/lib/useSessionState';
import { useWatchlists } from '@/watchlists/WatchlistProvider';

// three.js ist gross: erst laden, wenn der Würfel wirklich gebraucht wird
const CubeCanvas = lazy(() => import('@/components/cube/CubeCanvas').then((m) => ({ default: m.CubeCanvas })));

const CUBE_FALLBACK = (
  <div className="grid h-full place-items-center p-8 text-center text-muted">
    Der 3D-Würfel braucht WebGL. Die Liste rechts funktioniert trotzdem.
  </div>
);

export function Explorer() {
  const companies = useCompanies();
  const { byTicker } = useData();
  const { profile } = useAuth();
  const { activeTickers, toggle } = useWatchlists();
  // Filter und Sortierung bleiben beim Seitenwechsel erhalten, bis das Browserfenster geschlossen wird
  const [filters, setFilters] = useSessionState<Filters>('kubus.explorerFilters', restoreFilters);
  const [sort, setSort] = useSessionState<SortKey>('kubus.explorerSort', restoreSort);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => companies.filter((c) => matchesFilters(c, filters)), [companies, filters]);
  const visible = useMemo(() => new Set(filtered.map((c) => c.ticker)), [filtered]);
  const sorted = useMemo(() => sortCompanies(filtered, sort, profile.investorProfile), [filtered, sort, profile.investorProfile]);
  const selectedCompany = selected ? byTicker.get(selected) : undefined;
  const missingScores = filtered.filter((c) => !c.isFinancial && Object.values(c.scores).includes(null)).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FilterBar
        companies={companies}
        filters={filters}
        resultCount={filtered.length}
        onChange={setFilters}
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
            </div>
            {/* isolate: Firmennamen im Würfel bleiben unter den Textflächen und der Kurzkarte. */}
            <div className="absolute inset-0 isolate">
              <ErrorBoundary fallback={CUBE_FALLBACK}>
                <Suspense fallback={<div className="grid h-full place-items-center text-muted">Würfel wird geladen …</div>}>
                  <CubeCanvas
                    companies={companies}
                    visible={visible}
                    selected={selected}
                    highlighted={activeTickers}
                    onSelect={setSelected}
                    onDeselect={() => setSelected(null)}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
            {selectedCompany && (
              <QuickCard
                company={selectedCompany}
                starred={activeTickers.has(selectedCompany.ticker)}
                onToggle={() => toggle(selectedCompany.ticker)}
                onClose={() => setSelected(null)}
              />
            )}
            <CubeLegend />
          </section>
          <WatchlistBar />
        </div>
        <CompanyList
          companies={sorted}
          profile={profile.investorProfile}
          sort={sort}
          selected={selected}
          starred={activeTickers}
          onSort={setSort}
          onSelect={setSelected}
          onToggle={toggle}
        />
      </main>
    </div>
  );
}

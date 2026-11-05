import { lazy, Suspense, useMemo, useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { QuickCard } from '@/components/company/QuickCard';
import { CubeLegend } from '@/components/cube/CubeLegend';
import { FilterBar } from '@/components/filters/FilterBar';
import { CompanyList } from '@/components/list/CompanyList';
import { WatchlistBar } from '@/components/list/WatchlistBar';
import { ErrorBoundary } from '@/components/ui/atoms';
import { useCompanies, useData } from '@/data/DataProvider';
import { DEFAULT_FILTERS, matchesFilters, sortCompanies, type Filters, type SortKey } from '@/lib/filters';
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
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('total');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => companies.filter((c) => matchesFilters(c, filters)), [companies, filters]);
  const visible = useMemo(() => new Set(filtered.map((c) => c.ticker)), [filtered]);
  const sorted = useMemo(() => sortCompanies(filtered, sort, profile.investorProfile), [filtered, sort, profile.investorProfile]);
  const selectedCompany = selected ? byTicker.get(selected) : undefined;
  const missingScores = filtered.filter((c) => !c.isFinancial && Object.values(c.scores).includes(null)).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FilterBar filters={filters} onChange={setFilters} />
      <main className="grid flex-1 gap-4 p-4 lg:h-[calc(100vh-150px)] lg:flex-none lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)] lg:px-7">
        <div className="flex min-h-0 flex-col gap-4">
          <section className="card relative min-h-[520px] flex-1 overflow-hidden">
            <div className="pointer-events-none absolute left-6 top-4 z-10">
              <h2 className="font-title text-xl font-semibold">Zieldreieck als Würfel</h2>
              <p className="mt-1 max-w-[520px] text-[13px] text-muted">
                Jeder Punkt ist ein Unternehmen · Scores 0–100 · oben rechts hinten = liquide, rentabel und sicher
                {missingScores > 0 && ` · ${missingScores} ohne vollständige Scores nicht im Würfel`}
              </p>
            </div>
            <div className="absolute inset-0">
              <ErrorBoundary fallback={CUBE_FALLBACK}>
                <Suspense fallback={<div className="grid h-full place-items-center text-muted">Würfel wird geladen …</div>}>
                  <CubeCanvas
                    companies={companies}
                    visible={visible}
                    selected={selected}
                    highlighted={activeTickers}
                    onSelect={setSelected}
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

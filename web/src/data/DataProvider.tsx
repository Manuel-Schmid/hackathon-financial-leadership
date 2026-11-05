import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadData, type LoadedData } from './index';
import type { Company } from './types';

interface DataState {
  status: 'loading' | 'error' | 'ready';
  error?: string;
  data?: LoadedData;
  byTicker: Map<string, Company>;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Pick<DataState, 'status' | 'error' | 'data'>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    loadData()
      .then((data) => active && setState({ status: 'ready', data }))
      .catch((err: Error) => active && setState({ status: 'error', error: err.message }));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<DataState>(
    () => ({ ...state, byTicker: new Map(state.data?.companies.map((c) => [c.ticker, c])) }),
    [state],
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData ausserhalb von DataProvider');
  return ctx;
}

export function useCompanies(): Company[] {
  return useData().data?.companies ?? EMPTY;
}

const EMPTY: Company[] = [];

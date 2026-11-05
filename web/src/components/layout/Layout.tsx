import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useData } from '@/data/DataProvider';
import { EmptyState } from '../ui/atoms';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
  const { status, error } = useData();
  const { pathname } = useLocation();

  // Links in der Fusszeile werden von unten geklickt: neue Seite beginnt immer oben.
  // Mit Klammern: scrollTo gibt in neueren Browsern ein Promise zurück, das darf useEffect nicht erhalten.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      {status === 'loading' && <EmptyState title="Daten werden geladen …" />}
      {status === 'error' && (
        <EmptyState title="Daten konnten nicht geladen werden">
          {error}. Zuerst die Pipeline ausführen: <code>python data/pipeline/run_all.py</code>
        </EmptyState>
      )}
      {status === 'ready' && <Outlet />}
      <Footer />
    </div>
  );
}

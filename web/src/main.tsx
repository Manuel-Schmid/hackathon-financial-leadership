import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthProvider';
import { Layout } from '@/components/layout/Layout';
import { EmptyState } from '@/components/ui/atoms';
import { DataProvider } from '@/data/DataProvider';
import { Compare } from '@/pages/Compare';
import { CompanyDetail } from '@/pages/CompanyDetail';
import { Explorer } from '@/pages/Explorer';
import { Login } from '@/pages/Login';
import { Method } from '@/pages/Method';
import { Profile } from '@/pages/Profile';
import { Watchlists } from '@/pages/Watchlists';
import { WatchlistProvider } from '@/watchlists/WatchlistProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <DataProvider>
          <WatchlistProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Explorer />} />
                <Route path="vergleich" element={<Compare />} />
                <Route path="firma/:ticker" element={<CompanyDetail />} />
                <Route path="watchlists" element={<Watchlists />} />
                <Route path="methodik" element={<Method />} />
                <Route path="login" element={<Login />} />
                <Route path="profil" element={<Profile />} />
                <Route path="*" element={<EmptyState title="Seite nicht gefunden" />} />
              </Route>
            </Routes>
          </WatchlistProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

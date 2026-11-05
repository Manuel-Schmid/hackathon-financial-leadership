import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/data/DataProvider';
import { formatDate } from '@/lib/format';

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-[13px] font-semibold text-ink-muted">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="block font-semibold text-white hover:text-R">
      {children}
    </Link>
  );
}

export function Footer() {
  const { data } = useData();
  const years = data?.companies.map((c) => c.fiscalYear) ?? [];
  const latest = years.length ? Math.max(...years) : null;

  return (
    <footer className="mt-auto print:hidden bg-ink px-4 pb-6 pt-10 text-[15px] leading-relaxed text-ink-nav lg:px-7">
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="h-[30px] w-[30px]" />
            <b className="font-title text-[19px] font-bold tracking-[.06em] text-white">KUBUS</b>
          </div>
          <p className="mt-3 max-w-[280px]">Unternehmen vergleichen im Zieldreieck aus Liquidität, Rentabilität und Sicherheit.</p>
        </div>
        <Column title="Projekt">
          <FooterLink to="/ueber-uns">Über uns</FooterLink>
          <FooterLink to="/impressum">Impressum</FooterLink>
        </Column>
        <Column title="Methodik">
          <FooterLink to="/methodik">Kennzahlen und Scores</FooterLink>
        </Column>
        <Column title="Datenquelle">
          {data ? (
            <p>
              <span className="font-semibold text-white">{data.meta.source}</span>
              {latest && <span className="block">Geschäftsjahre bis {latest}</span>}
              <span className="block">
                Stand {formatDate(data.meta.asOf)}
                {data.source === 'json' ? ', Offline-Datei' : ''}
              </span>
            </p>
          ) : (
            <p>Wird geladen …</p>
          )}
        </Column>
      </div>
      <div className="mt-8 flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-ink-line pt-4 text-[13px] text-ink-muted">
        <span>Hackathon Finanzielle Führung, HSG, HS26</span>
        <span>Studierendenprojekt, keine Anlageberatung</span>
      </div>
    </footer>
  );
}

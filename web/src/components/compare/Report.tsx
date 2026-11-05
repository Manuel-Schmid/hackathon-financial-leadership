import type { ReactNode } from 'react';
import { useData } from '@/data/DataProvider';
import { formatDate } from '@/lib/format';
import { isoDate, reportTitle } from '@/lib/report';
import { profileLabel } from '@/lib/weighting';
import type { SavedProfile } from '@/profiles/ProfileStore';
import type { Watchlist } from '@/watchlists/WatchlistStore';

interface Props {
  list: Watchlist;
  profile: SavedProfile;
  /** Anzahl verglichener Firmen (max. 4) und Anzahl in der Watchlist */
  shown: number;
  total: number;
}

/** Logo in dunkler Linie für weisses Papier (logo.svg ist weiss für den dunklen Seitenkopf). */
function LogoDark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="h-7 w-7 text-ink" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g stroke="currentColor" strokeWidth="2.6">
        <path d="M29.5 8.4 20 3 5 11.5V28.5L20 37 35 28.5V18" />
        <path d="M5 11.5 20 20 28.5 15.2M20 20V37" />
      </g>
      <circle cx="35" cy="11.5" r="4.4" fill="#D99A1C" />
    </svg>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[.06em] text-muted">{label}</div>
      <div className="font-semibold">{children}</div>
    </div>
  );
}

/** Nur im Ausdruck: Kopf des Kundenreports mit Kunde, Watchlist, Profil, Datum und Datenstand. */
export function ReportHeader({ list, profile, shown, total }: Props) {
  const { data } = useData();
  return (
    <div className="hidden print:block">
      <div className="flex items-end justify-between border-b-2 border-ink pb-2">
        <div className="flex items-center gap-2.5">
          <LogoDark />
          <div>
            <b className="font-title text-[20px] font-bold tracking-[.06em]">KUBUS</b>
            <span className="ml-2 font-title text-[20px] font-semibold">Kundenreport</span>
          </div>
        </div>
        <span className="text-[13px]">{formatDate(isoDate(new Date()))}</span>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-4 text-[13px]">
        <Fact label="Kunde">{list.clientName || '–'}</Fact>
        <Fact label="Watchlist">{list.name}</Fact>
        <Fact label="Anlegerprofil">
          {profile.name} <span className="font-normal text-muted">({profileLabel(profile.weights)})</span>
        </Fact>
        <Fact label="Unternehmen">{shown === total ? total : `${shown} von ${total} (die ersten ${shown})`}</Fact>
        <Fact label="Datenstand">{data ? `${formatDate(data.meta.asOf)}, ${data.meta.source}` : '–'}</Fact>
      </div>
      <p className="mt-2 text-[11.5px] text-muted">
        Vergleich im Zieldreieck: Liquidität, Rentabilität und Sicherheit als Scores 0–100 (Rang unter allen Firmen, 100 = beste).
        Gesamt-Score nach Anlegerprofil gewichtet. Ampeln messen die Kennzahlen an Richtwerten.
      </p>
    </div>
  );
}

/** Nur im Ausdruck: Quellen und Hinweis am Ende des Reports. */
export function ReportFooter() {
  return (
    <p className="hidden border-t border-line pt-2 text-[10.5px] text-muted print:block">
      Erstellt mit KUBUS, Hackathon Finanzielle Führung, Universität St. Gallen. Daten: Yahoo Finance (Geschäftsberichte der
      Unternehmen). Allgemeine Richtwerte: Grundlagen der finanziellen Führung, S. 292–293; Branchen-Richtwerte: BACH (ECCBSO)
      und Damodaran (NYU Stern), Herleitung auf der Methodik-Seite. Studierendenprojekt, keine Anlageberatung.
    </p>
  );
}

/** Öffnet den Druckdialog («Als PDF speichern»); der Dokumenttitel wird zum vorgeschlagenen Dateinamen. */
export function PrintReportButton({ list, disabled }: { list: Watchlist; disabled?: boolean }) {
  const print = () => {
    const previous = document.title;
    document.title = reportTitle(list, new Date());
    window.addEventListener('afterprint', () => (document.title = previous), { once: true });
    window.print();
  };
  return (
    <button type="button" className="btn btn-primary h-9 whitespace-nowrap py-0 print:hidden" disabled={disabled} onClick={print}>
      Als Report drucken
    </button>
  );
}

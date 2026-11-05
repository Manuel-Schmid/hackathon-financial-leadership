import { KPIS, SECTORS } from '@/lib/config';

const WITH_BRANCHE = KPIS.filter((k) => k.richtwertBranche);
const LINK = 'text-accent underline-offset-2 hover:underline';

/** Methodik: Herleitung und Tabelle der Branchen-Richtwerte (docs/BRANCHEN_RICHTWERTE.md). */
export function BranchenRichtwerte() {
  return (
    <section className="card overflow-x-auto py-4">
      <h2 className="px-5 font-title text-[17px] font-semibold">Branchen-Richtwerte</h2>
      <div className="max-w-[860px] space-y-2 px-5 pt-2 text-[13.5px] leading-relaxed">
        <p>
          Die Richtwerte aus dem Buch passen nicht zu jeder Branche: Bei der ROIC erreichen nur 9 % der Versorger den Buch-Richtwert,
          bei der Tilgungsdauer keine einzige Immobilienfirma. Darum gibt es für 9 Kennzahlen zusätzlich Branchen-Richtwerte.
        </p>
        <p>
          <b>Methode:</b> Branchen-Richtwert = Buch-Richtwert × Branchenfaktor (Wert der Branche ÷ Wert aller Branchen, aus derselben
          Quelle). Das Buch bleibt der Anker. Es entspricht ziemlich genau dem Median aller grossen Unternehmen in der
          Zentralbank-Statistik (Current Ratio 150 % vs. 146 %, ROE 10–15 % vs. 13 %).
        </p>
        <p>
          <b>Quellen:</b>{' '}
          <a className={LINK} href="https://www.bach.banque-france.fr/?lang=en" target="_blank" rel="noreferrer">BACH</a>{' '}
          (Bilanzdatenbank der europäischen Zentralbanken, grosse Unternehmen, 2024) für Bilanz-Kennzahlen, Current Ratio und ROA;{' '}
          <a className={LINK} href="https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datacurrent.html" target="_blank" rel="noreferrer">
            Damodaran, NYU Stern
          </a>{' '}
          (kotierte US-Firmen, 01/2026) für ROE, Umsatzrendite, ROIC und Tilgungsdauer.
        </p>
        <p>
          <b>Wo sie gelten:</b> im Vergleich, wenn alle Firmen aus derselben Branche sind; auf der Detailseite neben dem Buch-Richtwert;
          in der Kurzkarte. Über Branchen hinweg gilt das Buch. Scores und Würfel sind unverändert.
        </p>
        <p className="text-muted">
          Grenzen: BACH enthält Einzelabschlüsse europäischer Firmen, Damodaran US-Firmen. Cash Ratio und Quick Ratio haben keine
          Branchen-Richtwerte, weil die Quellen dafür zu wenig belastbar sind. Bei Banken und Versicherungen gilt für die
          Bilanz-Kennzahlen das Buch.
        </p>
      </div>
      <table className="mt-3 w-full min-w-[980px] border-collapse text-[12.5px]">
        <thead>
          <tr className="tag text-right">
            <th className="py-2 pl-5 text-left font-bold">Branche</th>
            {WITH_BRANCHE.map((k) => (
              <th key={k.id} className="px-2 py-2 font-bold" title={k.richtwertBranche?.quelle}>
                {k.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-line-soft font-semibold">
            <td className="py-1.5 pl-5">Buch</td>
            {WITH_BRANCHE.map((k) => (
              <td key={k.id} className="whitespace-nowrap px-2 text-right">{k.richtwert?.label ?? '–'}</td>
            ))}
          </tr>
          {Object.entries(SECTORS).map(([sector, s]) => (
            <tr key={sector} className="border-t border-line-soft">
              <td className="py-1.5 pl-5">{s.de}</td>
              {WITH_BRANCHE.map((k) => {
                const rw = k.richtwertBranche?.werte[sector];
                return (
                  <td key={k.id} className={`whitespace-nowrap px-2 text-right ${rw ? 'font-mono' : 'text-muted'}`}>
                    {rw?.label ?? 'Buch'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

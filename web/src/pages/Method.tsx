import { BranchenRichtwerte } from '@/components/method/BranchenRichtwerte';
import { PageTitle } from '@/components/ui/atoms';
import { useData } from '@/data/DataProvider';
import { AXES, AXIS_IDS, AXIS_STYLE, KPIS, PROFILE_IDS } from '@/lib/config';
import { formatDate } from '@/lib/format';
import { profileLabel } from '@/lib/weighting';

function scoreUse(inScore: boolean | string): string {
  if (inScore === true) return 'ja';
  return inScore === 'ampel' ? 'nur Ampel' : 'nur Detail';
}

const LIMITS = [
  'Scores sind eine Vereinfachung: Auswahl und Gewichtung der Kennzahlen sind ein Werturteil.',
  'Perzentile sind relativ zur Auswahl: Score 80 heisst „besser als 80 % der anderen“, nicht „gut“.',
  'Nur Jahresdaten und keine Prognose; keine Marktbewertung (KGV) im Score.',
  'Yahoo-Daten sind ungeprüft und lückenhaft. Fehlt ein Feld, bleibt die Kennzahl leer und zählt nicht im Score.',
  'Yahoo bereinigt manche Posten: Bei VAT 2025 weist Yahoo einen tieferen EBIT aus als der Geschäftsbericht (24.3 % statt 25.4 % Marge), und Zinsen stammen teils aus dem Aufwand statt aus den bezahlten Zinsen.',
  'Banken und Versicherungen sind nur eingeschränkt vergleichbar.',
  'Richtwerte sind exemplarische Erwartungswerte und branchenabhängig (Buch S. 293).',
];

export function Method() {
  const { data } = useData();
  return (
    <main className="mx-auto w-full max-w-[1100px] space-y-4 p-4 lg:p-7">
      <PageTitle title="Methodik" sub="So entstehen die Punkte im Würfel. Quelle: Grundlagen der finanziellen Führung (HSG), Kapitel 11, S. 292–293." />

      <section className="card space-y-2 p-5">
        <h2 className="font-title text-[17px] font-semibold">Zieldreieck</h2>
        <p>
          Rentabilität, Liquidität und Sicherheit stehen in einem konkurrierenden Verhältnis. Die Risiko-Achse zeigen wir als
          <b> Sicherheit</b> (hoch = wenig Risiko). So gilt auf allen drei Achsen „hoch = gut“, und die Ideal-Ecke 100·100·100 ist eindeutig.
        </p>
      </section>

      <section className="card space-y-2 p-5">
        <h2 className="font-title text-[17px] font-semibold">Scoring</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Kennzahlen pro Unternehmen für das letzte Geschäftsjahr berechnen (Ø = Mittel aus Anfangs- und Endbestand).</li>
          <li>Jede Kennzahl im Score wird zum Perzentil-Rang 0–100 unter allen nicht-finanziellen Unternehmen (bestes = 100, bei „tiefer besser“ umgekehrt).</li>
          <li>Achsen-Score = Durchschnitt der vorhandenen Teilscores.</li>
          <li>Gesamt-Score = gewichteter Durchschnitt der Achsen, je nach Anlegerprofil: {PROFILE_IDS.map((id) => `${id} (${profileLabel(id)})`).join(', ')}.</li>
          <li>Ampel separat und absolut gegen den Richtwert: grün = erfüllt, gelb = bis 20 % daneben, rot = deutlich daneben, grau = kein Richtwert oder keine Daten.</li>
          <li>Finanzsektor: kein Liquiditäts-Score, Rentabilität aus ROE + ROA, Sicherheit aus EK-Quote + Verschuldungsgrad, Rang nur innerhalb des Sektors. Im Würfel hohler Punkt auf Liquidität 50.</li>
          <li>Negatives Eigenkapital: schlechtester Rang beim Verschuldungsgrad, keine ROE.</li>
        </ol>
      </section>

      <section className="card overflow-x-auto py-4">
        <h2 className="px-5 font-title text-[17px] font-semibold">Kennzahlen und Richtwerte</h2>
        <table className="mt-2 w-full min-w-[720px] border-collapse text-[13px]">
          <thead>
            <tr className="tag border-b border-line text-left">
              <th className="py-2 pl-5 font-bold">Kennzahl</th>
              <th className="px-3 py-2 font-bold">Formel</th>
              <th className="px-3 py-2 font-bold">Richtwert</th>
              <th className="px-3 py-2 font-bold">Richtung</th>
              <th className="py-2 pl-3 pr-5 font-bold">Im Score</th>
            </tr>
          </thead>
          {AXIS_IDS.map((axis) => (
            <tbody key={axis}>
              <tr>
                <td colSpan={5} className={`pl-5 pt-3 text-[11px] font-extrabold uppercase tracking-[.06em] ${AXIS_STYLE[axis].text}`}>{AXES[axis].label}</td>
              </tr>
              {KPIS.filter((k) => k.axis === axis).map((k) => (
                <tr key={k.id} className="border-b border-line-soft">
                  <td className="py-1.5 pl-5 font-bold">{k.label}</td>
                  <td className="px-3 py-1.5">{k.formula}</td>
                  <td className="whitespace-nowrap px-3 py-1.5">{k.richtwert?.label ?? '–'}</td>
                  <td className="whitespace-nowrap px-3 py-1.5">{k.direction === 'higher' ? 'höher besser' : 'tiefer besser'}</td>
                  <td className="whitespace-nowrap py-1.5 pl-3 pr-5">{scoreUse(k.inScore)}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </section>

      <BranchenRichtwerte />

      <section className="card space-y-2 p-5">
        <h2 className="font-title text-[17px] font-semibold">Datenquelle und Grenzen</h2>
        <p>
          {data?.meta.source}, {data?.meta.count} Unternehmen (S&amp;P 500 + SMI/SMIM), Stand {data ? formatDate(data.meta.asOf) : '–'}.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {LIMITS.map((limit) => <li key={limit}>{limit}</li>)}
        </ul>
      </section>
    </main>
  );
}

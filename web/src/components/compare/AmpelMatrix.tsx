import type { Ampel, Company } from '@/data/types';
import { AMPEL_STYLE } from '@/lib/ampel';
import { ampelMatrix, MATRIX_KPIS } from '@/lib/ampelMatrix';
import { COMPARE_COLORS } from '@/lib/compare';
import { AXES, AXIS_IDS, AXIS_STYLE } from '@/lib/config';
import { formatKpi } from '@/lib/format';
import { compareMode } from '@/lib/richtwert';

/** Weiche Trennstellen für lange Spaltenköpfe, damit die gleich breiten Spalten sauber umbrechen. */
const SHY = String.fromCharCode(173); // weiches Trennzeichen
const SOFT: Record<string, string> = {
  Tilgungsdauer: `Tilgungs${SHY}dauer`,
  Umsatzrendite: `Umsatz${SHY}rendite`,
  Verschuldungsgrad: `Verschul${SHY}dungs${SHY}grad`,
  'Anlagedeckung II': `Anlage${SHY}deckung II`,
};
const ORDER: Ampel[] = ['green', 'yellow', 'red', 'grey'];
const COUNT_LABEL: Record<Ampel, string> = { green: 'erfüllt', yellow: 'knapp daneben', red: 'deutlich daneben', grey: 'ohne Daten' };

/** Alle Kennzahlen mit Richtwert als farbige Felder: Firmen × Kennzahlen, das Muster auf einen Blick. */
export function AmpelMatrix({ companies }: { companies: Company[] }) {
  const modus = compareMode(companies);
  const rows = ampelMatrix(companies, modus);
  return (
    <section className="card overflow-x-auto px-[22px] pb-4 pt-[18px]">
      <h2 className="font-title text-[17px] font-semibold">Ampel-Matrix</h2>
      <p className="text-[12.5px] text-muted">
        Alle Kennzahlen mit Richtwert auf einen Blick ·{' '}
        {modus === 'branche' ? `Richtwerte der Branche ${companies[0]?.sectorDe ?? ''}` : 'allgemeine Richtwerte (verschiedene Branchen)'}
      </p>
      <table className="mt-3 w-full min-w-[900px] table-fixed border-separate border-spacing-1 text-[12px]">
        <colgroup>
          <col className="w-[150px]" />
          {MATRIX_KPIS.map((k) => <col key={k.id} />)}
          <col className="w-[130px]" />
        </colgroup>
        <thead>
          <tr>
            <th />
            {AXIS_IDS.map((axis) => (
              <th
                key={axis}
                colSpan={MATRIX_KPIS.filter((k) => k.axis === axis).length}
                className={`border-b-2 pb-1 text-left text-[11px] font-extrabold uppercase tracking-[.06em] ${AXIS_STYLE[axis].text}`}
                style={{ borderColor: AXES[axis].color }}
              >
                {AXES[axis].label}
              </th>
            ))}
            <th />
          </tr>
          <tr className="text-muted">
            <th />
            {MATRIX_KPIS.map((k) => (
              <th key={k.id} className="break-words px-0.5 pb-1 text-center align-bottom font-semibold leading-tight" title={k.label}>
                {SOFT[k.short] ?? k.short}
              </th>
            ))}
            <th className="pb-1 pl-3 text-left align-bottom font-semibold">Bilanz</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.company.ticker}>
              <th scope="row" className="truncate pr-3 text-left text-[13.5px] font-bold" style={{ color: COMPARE_COLORS[i] }}>
                {row.company.name}
              </th>
              {row.cells.map((cell) => {
                const text = `${row.company.name}, ${cell.kpi.short}: ${formatKpi(cell.value, cell.kpi.unit, row.company.currency)} · Richtwert ${cell.richtwert ?? '–'} · ${AMPEL_STYLE[cell.ampel].label}`;
                return (
                  <td key={cell.kpi.id} className="p-0">
                    <div title={text} aria-label={text} className={`h-8 rounded-md ${AMPEL_STYLE[cell.ampel].dot}`} />
                  </td>
                );
              })}
              <td className="whitespace-nowrap pl-3">
                <span className="inline-flex items-center gap-2.5 font-semibold">
                  {ORDER.filter((a) => row.counts[a] > 0).map((a) => (
                    <span key={a} className="inline-flex items-center gap-1" title={`${row.counts[a]} ${COUNT_LABEL[a]}`}>
                      <i className={`inline-block h-[9px] w-[9px] rounded-full ${AMPEL_STYLE[a].dot}`} />
                      {row.counts[a]}
                    </span>
                  ))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {ORDER.map((a) => (
          <span key={a} className="inline-flex items-center gap-1.5">
            <i className={`inline-block h-[9px] w-[9px] rounded-full ${AMPEL_STYLE[a].dot}`} />
            {AMPEL_STYLE[a].label}
          </span>
        ))}
        <span>· Mit der Maus auf ein Feld zeigen für Wert und Richtwert</span>
      </p>
    </section>
  );
}

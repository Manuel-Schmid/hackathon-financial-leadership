import { describe, expect, it } from 'vitest';
import { isoDate, reportTitle } from './report';

const nov5 = new Date(2026, 10, 5, 21, 30);

describe('isoDate', () => {
  it('lokales Datum als JJJJ-MM-TT, auch spätabends (keine UTC-Verschiebung)', () => {
    expect(isoDate(nov5)).toBe('2026-11-05');
    expect(isoDate(new Date(2026, 0, 9, 23, 59))).toBe('2026-01-09');
  });
});

describe('reportTitle (Dokumenttitel = vorgeschlagener PDF-Dateiname)', () => {
  it('mit Kunde: Kunde und Datum', () => {
    expect(reportTitle({ name: 'Kunde Müller', clientName: 'Hans Müller' }, nov5)).toBe('KUBUS Kundenreport – Hans Müller – 2026-11-05');
  });
  it('ohne Kunde: Name der Watchlist', () => {
    expect(reportTitle({ name: 'Meine Favoriten', clientName: null }, nov5)).toBe('KUBUS Kundenreport – Meine Favoriten – 2026-11-05');
  });
  it('Zeichen, die in Dateinamen nicht erlaubt sind, werden ersetzt', () => {
    expect(reportTitle({ name: 'A/B', clientName: 'Meier: "Gold"' }, nov5)).toBe('KUBUS Kundenreport – Meier- -Gold- – 2026-11-05');
  });
});

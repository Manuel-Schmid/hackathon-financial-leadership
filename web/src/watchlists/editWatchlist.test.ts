import { describe, expect, it } from 'vitest';
import { detailsPatch } from './editWatchlist';
import type { Watchlist } from './WatchlistStore';

const list: Watchlist = { id: 'w1', name: 'Kunde Müller', clientName: 'Hans Müller', investorProfile: 'ausgewogen', tickers: [] };

describe('detailsPatch (Name und Kunde einer Watchlist speichern)', () => {
  it('keine Änderung -> nichts zu speichern', () => {
    expect(detailsPatch(list, 'Kunde Müller', 'Hans Müller')).toBeNull();
    expect(detailsPatch(list, '  Kunde Müller ', ' Hans Müller ')).toBeNull();
  });

  it('geänderter Name oder Kunde -> beides getrimmt speichern', () => {
    expect(detailsPatch(list, ' Kunde Meier ', 'Hans Müller')).toEqual({ name: 'Kunde Meier', clientName: 'Hans Müller' });
    expect(detailsPatch(list, 'Kunde Müller', 'Eva Müller')).toEqual({ name: 'Kunde Müller', clientName: 'Eva Müller' });
  });

  it('leerer Kundenname wird zu null (Kunde entfernt)', () => {
    expect(detailsPatch(list, 'Kunde Müller', '   ')).toEqual({ name: 'Kunde Müller', clientName: null });
    expect(detailsPatch({ ...list, clientName: null }, 'Kunde Müller', '')).toBeNull();
  });

  it('leerer Name ist nicht erlaubt', () => {
    expect(detailsPatch(list, '   ', 'Hans Müller')).toBe('invalid');
  });
});

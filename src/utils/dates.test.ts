import { enUS, fr } from 'date-fns/locale';
import { describe, expect, it } from 'vitest';
import {
  canNavigateWeek,
  formatWeekRange,
  getWeekDays,
  getWeekStart,
  isWeekWithinBounds,
  isWithinBounds,
  shiftWeek,
  toDayKey,
} from './dates';

// Dates construites en heure locale : les tests ne dépendent pas du fuseau de la machine.
const wed = new Date(2026, 10, 18, 15, 30); // mercredi 18 novembre 2026
const monday = new Date(2026, 10, 16);

describe('getWeekStart', () => {
  it('commence le lundi en français', () => {
    expect(getWeekStart(wed, fr)).toEqual(monday);
  });

  it('commence le dimanche en anglais (US)', () => {
    expect(getWeekStart(wed, enUS)).toEqual(new Date(2026, 10, 15));
  });
});

describe('getWeekDays', () => {
  it('renvoie 7 jours consécutifs', () => {
    const days = getWeekDays(monday);
    expect(days).toHaveLength(7);
    expect(days.map(toDayKey)).toEqual([
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
    ]);
  });
});

describe('shiftWeek', () => {
  it('avance et recule d’une semaine', () => {
    expect(shiftWeek(monday, 1)).toEqual(new Date(2026, 10, 23));
    expect(shiftWeek(monday, -1)).toEqual(new Date(2026, 10, 9));
  });
});

describe('isWithinBounds', () => {
  it('accepte tout sans bornes', () => {
    expect(isWithinBounds(wed, {})).toBe(true);
  });

  it('inclut les bornes elles-mêmes', () => {
    expect(isWithinBounds(wed, { minDate: wed, maxDate: wed })).toBe(true);
  });

  it('rejette avant minDate et après maxDate', () => {
    expect(isWithinBounds(wed, { minDate: new Date(2026, 10, 19) })).toBe(false);
    expect(isWithinBounds(wed, { maxDate: new Date(2026, 10, 17) })).toBe(false);
  });

  it('rejette une date invalide', () => {
    expect(isWithinBounds(new Date(Number.NaN), {})).toBe(false);
  });
});

describe('isWeekWithinBounds / canNavigateWeek', () => {
  const bounds = { minDate: new Date(2026, 10, 18), maxDate: new Date(2026, 10, 25, 12) };

  it('accepte une semaine qui chevauche partiellement les bornes', () => {
    expect(isWeekWithinBounds(monday, fr, bounds)).toBe(true);
    expect(isWeekWithinBounds(new Date(2026, 10, 23), fr, bounds)).toBe(true);
  });

  it('rejette une semaine entièrement hors bornes', () => {
    expect(isWeekWithinBounds(new Date(2026, 10, 9), fr, bounds)).toBe(false);
    expect(isWeekWithinBounds(new Date(2026, 10, 30), fr, bounds)).toBe(false);
  });

  it('bloque la navigation au-delà des bornes', () => {
    expect(canNavigateWeek(monday, -1, fr, bounds)).toBe(false);
    expect(canNavigateWeek(monday, 1, fr, bounds)).toBe(true);
    expect(canNavigateWeek(new Date(2026, 10, 23), 1, fr, bounds)).toBe(false);
  });
});

describe('formatWeekRange', () => {
  it('même mois', () => {
    expect(formatWeekRange(monday, fr)).toBe('16 – 22 nov. 2026');
  });

  it('deux mois', () => {
    expect(formatWeekRange(new Date(2026, 10, 30), fr)).toBe('30 nov. – 6 déc. 2026');
  });

  it('deux années', () => {
    expect(formatWeekRange(new Date(2026, 11, 28), fr)).toBe('28 déc. 2026 – 3 janv. 2027');
  });
});

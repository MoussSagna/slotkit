import { describe, expect, it } from 'vitest';
import { getWeekDays } from './dates';
import {
  findSlot,
  getSlotEnd,
  getSlotState,
  groupSlotsByDay,
  isSlotSelectable,
  type Slot,
} from './slots';

const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute);

const slot = (id: string, start: Date, available?: boolean): Slot =>
  available === undefined ? { id, start } : { id, start, available };

describe('getSlotEnd', () => {
  it('ajoute la durée en minutes', () => {
    expect(getSlotEnd({ start: at(18, 9) }, 45)).toEqual(at(18, 9, 45));
  });
});

describe('getSlotState', () => {
  const s = slot('a', at(18, 10));

  it('disponible par défaut', () => {
    expect(getSlotState(s, { selectedId: null })).toBe('available');
  });

  it('sélectionné quand son id est la valeur', () => {
    expect(getSlotState(s, { selectedId: 'a' })).toBe('selected');
  });

  it('indisponible si available vaut false, même sélectionné', () => {
    expect(getSlotState(slot('a', at(18, 10), false), { selectedId: 'a' })).toBe('unavailable');
  });

  it('indisponible avant minDate ou après maxDate', () => {
    expect(getSlotState(s, { selectedId: null, minDate: at(18, 11) })).toBe('unavailable');
    expect(getSlotState(s, { selectedId: null, maxDate: at(18, 9) })).toBe('unavailable');
  });

  it('indisponible si la date est invalide', () => {
    expect(getSlotState(slot('x', new Date(Number.NaN)), { selectedId: null })).toBe('unavailable');
  });
});

describe('isSlotSelectable', () => {
  it('refuse uniquement les créneaux indisponibles', () => {
    expect(isSlotSelectable('available')).toBe(true);
    expect(isSlotSelectable('selected')).toBe(true);
    expect(isSlotSelectable('unavailable')).toBe(false);
  });
});

describe('groupSlotsByDay', () => {
  const days = getWeekDays(at(16, 0));

  it('renvoie les 7 jours, même vides, et trie chaque jour', () => {
    const grouped = groupSlotsByDay(
      [slot('b', at(17, 14)), slot('a', at(17, 9)), slot('c', at(20, 10))],
      days,
    );
    expect(grouped).toHaveLength(7);
    expect(grouped[1]?.slots.map((x) => x.id)).toEqual(['a', 'b']);
    expect(grouped[4]?.slots.map((x) => x.id)).toEqual(['c']);
    expect(grouped[0]?.slots).toEqual([]);
  });

  it('ignore les créneaux hors semaine et les dates invalides', () => {
    const grouped = groupSlotsByDay(
      [slot('out', at(30, 9)), slot('bad', new Date(Number.NaN))],
      days,
    );
    expect(grouped.flatMap((d) => d.slots)).toEqual([]);
  });

  it('ne modifie pas le tableau reçu', () => {
    const input = [slot('b', at(17, 14)), slot('a', at(17, 9))];
    groupSlotsByDay(input, days);
    expect(input.map((x) => x.id)).toEqual(['b', 'a']);
  });
});

describe('findSlot', () => {
  const slots = [slot('a', at(18, 9))];

  it('trouve par id', () => {
    expect(findSlot(slots, 'a')?.id).toBe('a');
  });

  it('renvoie undefined pour null ou un id inconnu', () => {
    expect(findSlot(slots, null)).toBeUndefined();
    expect(findSlot(slots, 'z')).toBeUndefined();
  });
});

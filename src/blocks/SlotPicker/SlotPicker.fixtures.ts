import { addDays, addWeeks } from 'date-fns';
import type { Slot } from './SlotPicker.types';

/** Semaine de référence des démos et des tests (lundi 16 novembre 2026), pour des rendus stables. */
export const DEMO_WEEK = new Date(2026, 10, 16);

const MORNING = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const AFTERNOON = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

/** Horaires par jour de la semaine (0 = premier jour affiché, ici le lundi). */
const SCHEDULE: Record<number, string[]> = {
  0: [...MORNING, ...AFTERNOON],
  1: [...MORNING, ...AFTERNOON],
  2: MORNING,
  3: [...MORNING, ...AFTERNOON],
  4: [...MORNING, ...AFTERNOON.slice(0, 3)],
  5: MORNING.slice(0, 4),
  6: [],
};

/**
 * Génère des créneaux de démonstration, déterministes, sur plusieurs semaines.
 * Environ un créneau sur quatre est indisponible.
 */
export function createDemoSlots(firstWeek: Date = DEMO_WEEK, weekCount = 6): Slot[] {
  const slots: Slot[] = [];
  for (let w = 0; w < weekCount; w++) {
    const weekStart = addWeeks(firstWeek, w);
    for (let d = 0; d < 7; d++) {
      const day = addDays(weekStart, d);
      for (const [i, time] of (SCHEDULE[d] ?? []).entries()) {
        const [hours = 0, minutes = 0] = time.split(':').map(Number);
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
        const id = start.toISOString();
        slots.push((i + d + w) % 4 === 1 ? { id, start, available: false } : { id, start });
      }
    }
  }
  return slots;
}

import { addMinutes, isValid } from 'date-fns';
import { type DateBounds, isWithinBounds, toDayKey } from './dates';

/** Un créneau réservable. */
export interface Slot {
  /** Identifiant stable, utilisé pour la sélection. */
  id: string;
  /** Début du créneau (heure locale). */
  start: Date;
  /** `false` : le créneau est affiché mais ne peut pas être réservé. Par défaut `true`. */
  available?: boolean;
}

/** État visuel d'un créneau, dérivé par le composant (jamais fourni par le parent). */
export type SlotState = 'available' | 'unavailable' | 'selected';

/** Durée par défaut d'un créneau, en minutes. */
export const DEFAULT_SLOT_DURATION = 30;

/** Fin du créneau : début + durée (en minutes). */
export function getSlotEnd(slot: Pick<Slot, 'start'>, durationMinutes: number): Date {
  return addMinutes(slot.start, durationMinutes);
}

export interface SlotStateContext extends DateBounds {
  /** id du créneau sélectionné, ou `null`. */
  selectedId: string | null;
}

/**
 * Calcule l'état d'un créneau.
 *
 * Règles, par ordre de priorité :
 * 1. hors bornes (`minDate` / `maxDate`, comparées au début du créneau) ou date invalide → `unavailable` ;
 * 2. `available: false` → `unavailable` ;
 * 3. id égal à `selectedId` → `selected` ;
 * 4. sinon → `available`.
 *
 * Un créneau indisponible n'est donc jamais affiché comme sélectionné, même si
 * le parent passe son id dans `value` (cas d'un créneau pris entre-temps).
 */
export function getSlotState(
  slot: Slot,
  { selectedId, minDate, maxDate }: SlotStateContext,
): SlotState {
  if (!isWithinBounds(slot.start, { minDate, maxDate })) return 'unavailable';
  if (slot.available === false) return 'unavailable';
  if (slot.id === selectedId) return 'selected';
  return 'available';
}

/** Un créneau peut être choisi s'il n'est pas indisponible. */
export function isSlotSelectable(state: SlotState): boolean {
  return state !== 'unavailable';
}

/** Une journée et ses créneaux, triés par heure de début. */
export interface DaySlots {
  date: Date;
  /** Clé `yyyy-MM-dd`. */
  key: string;
  slots: Slot[];
}

/**
 * Répartit les créneaux sur les jours donnés (en général les 7 jours d'une semaine).
 * Les créneaux hors de ces jours ou avec une date invalide sont ignorés ;
 * chaque jour est trié par heure de début. Tous les jours sont renvoyés, même vides.
 */
export function groupSlotsByDay(slots: readonly Slot[], days: readonly Date[]): DaySlots[] {
  const byKey = new Map<string, Slot[]>(days.map((day) => [toDayKey(day), []]));
  for (const slot of slots) {
    if (!isValid(slot.start)) continue;
    byKey.get(toDayKey(slot.start))?.push(slot);
  }
  return days.map((date) => {
    const key = toDayKey(date);
    const daySlots = (byKey.get(key) ?? []).sort((a, b) => a.start.getTime() - b.start.getTime());
    return { date, key, slots: daySlots };
  });
}

/** Retrouve un créneau par son id. */
export function findSlot(slots: readonly Slot[], id: string | null): Slot | undefined {
  return id === null ? undefined : slots.find((slot) => slot.id === id);
}

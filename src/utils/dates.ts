import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  isSameYear,
  isValid,
  startOfWeek,
  type Locale,
} from 'date-fns';

/** Bornes optionnelles d'une plage de dates (incluses). */
export interface DateBounds {
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
}

/** Premier jour de la semaine contenant `date`, selon la locale (lundi en français). */
export function getWeekStart(date: Date, locale: Locale): Date {
  return startOfWeek(date, { locale });
}

/** Les 7 jours (à minuit) de la semaine qui commence à `weekStart`. */
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/** Semaine précédente (`-1`) ou suivante (`1`). */
export function shiftWeek(weekStart: Date, direction: -1 | 1): Date {
  return addWeeks(weekStart, direction);
}

/** `true` si `date` est dans les bornes (incluses). Une borne absente n'impose rien. */
export function isWithinBounds(date: Date, { minDate, maxDate }: DateBounds): boolean {
  if (!isValid(date)) return false;
  if (minDate && date.getTime() < minDate.getTime()) return false;
  if (maxDate && date.getTime() > maxDate.getTime()) return false;
  return true;
}

/**
 * `true` si la semaine qui commence à `weekStart` chevauche les bornes,
 * c'est-à-dire si au moins un instant de la semaine est autorisé.
 */
export function isWeekWithinBounds(weekStart: Date, locale: Locale, bounds: DateBounds): boolean {
  const weekEnd = endOfWeek(weekStart, { locale });
  if (bounds.minDate && weekEnd.getTime() < bounds.minDate.getTime()) return false;
  if (bounds.maxDate && weekStart.getTime() > bounds.maxDate.getTime()) return false;
  return true;
}

/** `true` si l'on peut naviguer vers la semaine voisine dans la direction donnée. */
export function canNavigateWeek(
  weekStart: Date,
  direction: -1 | 1,
  locale: Locale,
  bounds: DateBounds,
): boolean {
  return isWeekWithinBounds(shiftWeek(weekStart, direction), locale, bounds);
}

/**
 * Libellé lisible d'une semaine, ex. « 16 – 22 nov. 2026 »,
 * « 30 nov. – 6 déc. 2026 » ou « 28 déc. 2026 – 3 janv. 2027 ».
 */
export function formatWeekRange(weekStart: Date, locale: Locale): string {
  const weekEnd = addDays(weekStart, 6);
  const end = format(weekEnd, 'd MMM yyyy', { locale });
  if (!isSameYear(weekStart, weekEnd)) {
    return `${format(weekStart, 'd MMM yyyy', { locale })} – ${end}`;
  }
  if (!isSameMonth(weekStart, weekEnd)) {
    return `${format(weekStart, 'd MMM', { locale })} – ${end}`;
  }
  return `${format(weekStart, 'd', { locale })} – ${end}`;
}

/** Clé stable d'un jour (`yyyy-MM-dd`, heure locale), utile pour les `key` React et les Map. */
export function toDayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

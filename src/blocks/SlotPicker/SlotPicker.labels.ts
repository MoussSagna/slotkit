import { format } from 'date-fns';
import { formatWeekRange } from '../../utils';
import type { SlotPickerLabels } from './SlotPicker.types';

/** Textes par défaut, en français. Les fonctions reçoivent la locale active pour formater les dates. */
export const defaultSlotPickerLabels: SlotPickerLabels = {
  groupLabel: 'Créneaux disponibles',
  previousWeek: 'Semaine précédente',
  nextWeek: 'Semaine suivante',
  weekRange: (weekStart, locale) => formatWeekRange(weekStart, locale),
  dayShort: (date, locale) => format(date, 'EEE d', { locale }),
  dayLong: (date, locale) => format(date, 'EEEE d MMMM', { locale }),
  slotTime: (start, locale) => format(start, 'p', { locale }),
  slotAriaLabel: (start, end, locale) =>
    `${format(start, 'EEEE d MMMM', { locale })}, de ${format(start, 'p', { locale })} à ${format(end, 'p', { locale })}`,
  unavailable: 'indisponible',
  dayTabsLabel: 'Jours de la semaine',
  availableCount: (count) => (count === 0 ? 'Aucun' : `${count} créneau${count > 1 ? 'x' : ''}`),
  noSlotsForDay: 'Aucun créneau',
  noSlotsForWeek: 'Aucun créneau disponible cette semaine.',
  goToNextWeek: 'Voir la semaine suivante',
  loading: 'Chargement des créneaux…',
  errorTitle: 'Impossible de charger les créneaux',
  errorMessage: 'Vérifiez votre connexion puis réessayez.',
  retry: 'Réessayer',
};

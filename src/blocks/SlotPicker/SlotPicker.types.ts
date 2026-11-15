import type { SxProps, Theme } from '@mui/material/styles';
import type { Locale } from 'date-fns';
import type { ReactNode } from 'react';
import type { Slot, SlotState } from '../../utils';

export type { Slot, SlotState };

/**
 * Disposition du SlotPicker.
 * - `auto` : une colonne par jour sur desktop, un jour à la fois sous le breakpoint `sm`.
 * - `week` : toujours une colonne par jour.
 * - `day` : toujours un jour à la fois.
 */
export type SlotPickerLayout = 'auto' | 'week' | 'day';

/** Textes affichés et lus par les lecteurs d'écran. Tous surchargeables via la prop `labels`. */
export interface SlotPickerLabels {
  /** Nom accessible du groupe de créneaux. */
  groupLabel: string;
  previousWeek: string;
  nextWeek: string;
  /** Titre de la semaine affichée, annoncé à chaque changement de semaine. */
  weekRange: (weekStart: Date, locale: Locale) => string;
  /** En-tête court d'un jour, ex. « lun. 16 ». */
  dayShort: (date: Date, locale: Locale) => string;
  /** Nom complet d'un jour, ex. « lundi 16 novembre ». */
  dayLong: (date: Date, locale: Locale) => string;
  /** Heure affichée sur un créneau, ex. « 10:00 ». */
  slotTime: (start: Date, locale: Locale) => string;
  /** Nom accessible d'un créneau, ex. « lundi 16 novembre, de 10:00 à 10:30 ». */
  slotAriaLabel: (start: Date, end: Date, locale: Locale) => string;
  /** Ajouté au nom accessible d'un créneau indisponible. */
  unavailable: string;
  /** Nom accessible de la liste des onglets de jours (mode `day`). */
  dayTabsLabel: string;
  /** Nombre de créneaux réservables, affiché sous chaque onglet de jour (mode `day`). */
  availableCount: (count: number) => string;
  /** Colonne d'un jour sans créneau. */
  noSlotsForDay: string;
  /** Semaine sans aucun créneau. */
  noSlotsForWeek: string;
  /** Bouton proposé dans l'état vide pour passer à la semaine suivante. */
  goToNextWeek: string;
  /** Annonce lue pendant le chargement. */
  loading: string;
  errorTitle: string;
  /** Message utilisé quand `error` vaut `true`. */
  errorMessage: string;
  retry: string;
}

export interface SlotPickerProps {
  /**
   * Créneaux à afficher. Il peut y en avoir sur plusieurs semaines :
   * le composant n'affiche que ceux de la semaine courante.
   */
  slots: readonly Slot[];
  /** id du créneau sélectionné, ou `null` (composant contrôlé). */
  value: string | null;
  /** Appelé avec le créneau choisi, ou `null` si `allowDeselect` est activé et que l'on désélectionne. */
  onChange: (slot: Slot | null) => void;
  /** Un second clic sur le créneau sélectionné le désélectionne. Par défaut `false`. */
  allowDeselect?: boolean;

  /** Durée d'un créneau, en minutes. Sert au libellé accessible. Par défaut `30`. */
  slotDuration?: number;
  /**
   * Instant minimal (inclus) : les créneaux qui commencent avant sont indisponibles
   * et la navigation ne peut pas remonter avant cette semaine.
   */
  minDate?: Date;
  /** Instant maximal (inclus), même logique que `minDate`. */
  maxDate?: Date;
  /** Locale date-fns. Détermine aussi le premier jour de la semaine. Par défaut `fr`. */
  locale?: Locale;

  /** Semaine affichée (n'importe quel jour de la semaine). La rend contrôlée, avec `onWeekChange`. */
  week?: Date;
  /** Semaine affichée au premier rendu, en mode non contrôlé. Par défaut : celle du créneau sélectionné, sinon celle d'aujourd'hui (ou de `minDate`). */
  defaultWeek?: Date;
  /** Appelé avec le premier jour de la nouvelle semaine : c'est le moment de charger ses créneaux. */
  onWeekChange?: (weekStart: Date) => void;

  /** Affiche des squelettes à la place des créneaux. */
  loading?: boolean;
  /** Affiche l'état d'erreur. `true` utilise le message par défaut, un nœud React le remplace. */
  error?: ReactNode;
  /** Si fourni, l'état d'erreur propose un bouton « Réessayer ». */
  onRetry?: () => void;

  /** Disposition. Par défaut `auto`. */
  layout?: SlotPickerLayout;
  /** Surcharge partielle des textes. */
  labels?: Partial<SlotPickerLabels>;
  /** Styles de l'élément racine, via le thème. */
  sx?: SxProps<Theme>;
}

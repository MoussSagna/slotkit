import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  type FocusEvent,
  type KeyboardEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  canNavigateWeek,
  DEFAULT_SLOT_DURATION,
  findSlot,
  getSlotEnd,
  getSlotState,
  getWeekDays,
  getWeekStart,
  groupSlotsByDay,
  isSlotSelectable,
  mergeSx,
  shiftWeek,
  type Slot,
  type SlotState,
} from '../../utils';
import { SlotButton } from './components/SlotButton';
import { EmptyState, ErrorState, LoadingState } from './components/SlotPickerStates';
import { WeekHeader } from './components/WeekHeader';
import { defaultSlotPickerLabels } from './SlotPicker.labels';
import type { SlotPickerProps } from './SlotPicker.types';
import { getNextFocusId, getTabStopId, isNavKey, type NavColumn } from './slotNavigation';

interface SlotCell {
  slot: Slot;
  state: SlotState;
}

interface DayCells {
  date: Date;
  key: string;
  cells: SlotCell[];
}

/** Valeur spéciale de focus différé : premier créneau de la semaine, sinon le titre. */
const FOCUS_WEEK_START = Symbol('week-start');

function getInitialWeek(slots: readonly Slot[], value: string | null, minDate?: Date): Date {
  const selected = findSlot(slots, value);
  if (selected) return selected.start;
  const now = new Date();
  return minDate && minDate.getTime() > now.getTime() ? minDate : now;
}

/** Jour affiché par défaut en mode `day` : celui de la sélection, sinon le premier jour réservable. */
function getDefaultDay(days: readonly DayCells[]): DayCells | undefined {
  return (
    days.find((day) => day.cells.some((cell) => cell.state === 'selected')) ??
    days.find((day) => day.cells.some((cell) => isSlotSelectable(cell.state))) ??
    days.find((day) => isToday(day.date)) ??
    days[0]
  );
}

/**
 * Sélecteur de créneaux sur une semaine.
 *
 * Composant contrôlé : il ne fait aucun appel réseau. Le parent fournit les créneaux
 * (`slots`), la sélection (`value` / `onChange`) et, s'il le souhaite, la semaine
 * affichée (`week` / `onWeekChange`), ce qui lui permet de charger les créneaux
 * de chaque semaine à la demande.
 *
 * Clavier : Tab entre dans la grille ; ↑ ↓ changent de créneau, ← → de jour,
 * Début / Fin vont au premier / dernier créneau du jour, Page préc. / Page suiv.
 * changent de semaine ; Espace ou Entrée sélectionne.
 */
export function SlotPicker({
  slots,
  value,
  onChange,
  allowDeselect = false,
  slotDuration = DEFAULT_SLOT_DURATION,
  minDate,
  maxDate,
  locale = fr,
  week,
  defaultWeek,
  onWeekChange,
  loading = false,
  error,
  onRetry,
  layout = 'auto',
  labels: labelOverrides,
  sx,
}: SlotPickerProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const mode = layout === 'auto' ? (isSmallScreen ? 'day' : 'week') : layout;
  const labels = { ...defaultSlotPickerLabels, ...labelOverrides };
  const baseId = useId();
  const titleId = `${baseId}-title`;

  // --- Semaine affichée (contrôlée ou non) ---------------------------------
  const [internalWeek, setInternalWeek] = useState<Date>(
    () => defaultWeek ?? getInitialWeek(slots, value, minDate),
  );
  const weekStart = getWeekStart(week ?? internalWeek, locale);
  const bounds = { minDate, maxDate };
  const canGoPrevious = canNavigateWeek(weekStart, -1, locale, bounds);
  const canGoNext = canNavigateWeek(weekStart, 1, locale, bounds);

  const changeWeek = (direction: -1 | 1) => {
    if (!canNavigateWeek(weekStart, direction, locale, bounds)) return;
    const next = shiftWeek(weekStart, direction);
    if (week === undefined) setInternalWeek(next);
    onWeekChange?.(next);
  };

  // --- Données dérivées ----------------------------------------------------
  const days: DayCells[] = groupSlotsByDay(slots, getWeekDays(weekStart)).map((day) => ({
    date: day.date,
    key: day.key,
    cells: day.slots.map((slot) => ({
      slot,
      state: getSlotState(slot, { selectedId: value, minDate, maxDate }),
    })),
  }));
  const weekIsEmpty = days.every((day) => day.cells.length === 0);

  // Jour actif en mode `day`. Si le jour mémorisé n'est pas dans la semaine, on prend le jour par défaut.
  const [activeDayKey, setActiveDayKey] = useState<string | null>(null);
  const activeDay = days.find((day) => day.key === activeDayKey) ?? getDefaultDay(days);
  const visibleDays = mode === 'week' ? days : days.filter((day) => day === activeDay);

  // --- Clavier : roving tabindex -------------------------------------------
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<string | typeof FOCUS_WEEK_START | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const toNavColumns = (list: readonly DayCells[]): NavColumn[] =>
    list.map((day) =>
      day.cells.map((cell) => ({ id: cell.slot.id, selectable: isSlotSelectable(cell.state) })),
    );
  const navColumns = toNavColumns(days);
  const tabStopId = getTabStopId(toNavColumns(visibleDays), [focusedId, value]);

  // Applique un focus demandé pendant un événement clavier, une fois le rendu à jour
  // (changement de jour en mode `day`, changement de semaine).
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    if (target === FOCUS_WEEK_START) {
      const first = tabStopId === null ? undefined : buttonRefs.current.get(tabStopId);
      (first ?? titleRef.current)?.focus();
    } else {
      buttonRefs.current.get(target)?.focus();
    }
  });

  const registerButton = (id: string) => (element: HTMLButtonElement | null) => {
    if (element) buttonRefs.current.set(id, element);
    return () => {
      buttonRefs.current.delete(id);
    };
  };

  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    const id = event.target.dataset.slotId;
    if (id !== undefined) setFocusedId(id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!(event.target instanceof HTMLElement)) return;
    const currentId = event.target.dataset.slotId;
    if (currentId === undefined) return;

    if (event.key === 'PageUp' || event.key === 'PageDown') {
      const direction = event.key === 'PageUp' ? -1 : 1;
      if (!canNavigateWeek(weekStart, direction, locale, bounds)) return;
      event.preventDefault();
      pendingFocus.current = FOCUS_WEEK_START;
      setFocusedId(null);
      changeWeek(direction);
      return;
    }

    if (!isNavKey(event.key)) return;
    event.preventDefault();
    const nextId = getNextFocusId(navColumns, currentId, event.key);
    if (nextId === null) return;

    const element = buttonRefs.current.get(nextId);
    if (element) {
      element.focus();
    } else {
      // Mode `day` : le créneau est dans un autre jour, pas encore rendu.
      const targetDay = days.find((day) => day.cells.some((cell) => cell.slot.id === nextId));
      if (targetDay) setActiveDayKey(targetDay.key);
      pendingFocus.current = nextId;
    }
    setFocusedId(nextId);
  };

  const handleSelect = (slot: Slot) => {
    if (slot.id === value) {
      if (allowDeselect) onChange(null);
      return;
    }
    onChange(slot);
  };

  // --- Rendu ---------------------------------------------------------------
  const renderSlot = ({ slot, state }: SlotCell) => {
    const end = getSlotEnd(slot, slotDuration);
    const ariaLabel = labels.slotAriaLabel(slot.start, end, locale);
    return (
      <SlotButton
        key={slot.id}
        slot={slot}
        state={state}
        label={labels.slotTime(slot.start, locale)}
        ariaLabel={state === 'unavailable' ? `${ariaLabel}, ${labels.unavailable}` : ariaLabel}
        tabIndex={slot.id === tabStopId ? 0 : -1}
        onSelect={handleSelect}
        buttonRef={registerButton(slot.id)}
      />
    );
  };

  const noSlotsForDay = (
    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', py: 1 }}>
      {labels.noSlotsForDay}
    </Typography>
  );

  const radioGroupProps = {
    role: 'radiogroup',
    'aria-label': labels.groupLabel,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
  } as const;

  let body;
  const hasError = error !== undefined && error !== null && error !== false;
  if (hasError) {
    body = (
      <ErrorState
        title={labels.errorTitle}
        message={error === true ? labels.errorMessage : error}
        retryLabel={labels.retry}
        onRetry={onRetry}
      />
    );
  } else if (loading) {
    body = <LoadingState label={labels.loading} columns={mode === 'week' ? 7 : 1} />;
  } else if (weekIsEmpty) {
    body = (
      <EmptyState
        message={labels.noSlotsForWeek}
        actionLabel={labels.goToNextWeek}
        onAction={
          canGoNext
            ? () => {
                changeWeek(1);
              }
            : undefined
        }
      />
    );
  } else if (mode === 'week') {
    body = (
      <Box
        {...radioGroupProps}
        sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
      >
        {days.map((day) => (
          <Stack
            key={day.key}
            role="group"
            aria-label={labels.dayLong(day.date, locale)}
            spacing={1}
          >
            <Typography
              aria-hidden
              component="div"
              variant="caption"
              sx={{
                textAlign: 'center',
                textTransform: 'capitalize',
                fontWeight: 'fontWeightBold',
                color: isToday(day.date) ? 'primary.main' : 'text.secondary',
              }}
            >
              {labels.dayShort(day.date, locale)}
            </Typography>
            {day.cells.length === 0 ? noSlotsForDay : day.cells.map(renderSlot)}
          </Stack>
        ))}
      </Box>
    );
  } else if (activeDay) {
    const tabId = (key: string) => `${baseId}-tab-${key}`;
    const panelId = `${baseId}-panel`;
    body = (
      <Stack spacing={2}>
        <Tabs
          value={activeDay.key}
          onChange={(_, key: string) => {
            setActiveDayKey(key);
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label={labels.dayTabsLabel}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {days.map((day) => (
            <Tab
              key={day.key}
              value={day.key}
              id={tabId(day.key)}
              aria-controls={panelId}
              // Le nom accessible est le texte visible (WCAG 2.5.3) : « lun. 16 2 créneaux ».
              label={
                <Box
                  component="span"
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <span>{labels.dayShort(day.date, locale)}</span>{' '}
                  <Box component="span" sx={{ typography: 'caption', textTransform: 'none' }}>
                    {labels.availableCount(
                      day.cells.filter((cell) => isSlotSelectable(cell.state)).length,
                    )}
                  </Box>
                </Box>
              }
              sx={{ minWidth: 80, textTransform: 'capitalize' }}
            />
          ))}
        </Tabs>
        <Box role="tabpanel" id={panelId} aria-labelledby={tabId(activeDay.key)}>
          {activeDay.cells.length === 0 ? (
            noSlotsForDay
          ) : (
            <Box
              {...radioGroupProps}
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
              }}
            >
              {activeDay.cells.map(renderSlot)}
            </Box>
          )}
        </Box>
      </Stack>
    );
  }

  return (
    <Paper
      component="section"
      variant="outlined"
      aria-labelledby={titleId}
      aria-busy={loading && !hasError}
      sx={mergeSx({ p: { xs: 1.5, sm: 2 } }, sx)}
    >
      <Stack spacing={2}>
        <WeekHeader
          titleId={titleId}
          title={labels.weekRange(weekStart, locale)}
          previousLabel={labels.previousWeek}
          nextLabel={labels.nextWeek}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={() => {
            changeWeek(-1);
          }}
          onNext={() => {
            changeWeek(1);
          }}
          titleRef={titleRef}
        />
        {body}
      </Stack>
    </Paper>
  );
}

import CheckIcon from '@mui/icons-material/Check';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { Ref } from 'react';
import type { Slot, SlotState } from '../SlotPicker.types';

export interface SlotButtonProps {
  slot: Slot;
  state: SlotState;
  /** Texte visible (l'heure). */
  label: string;
  /** Nom accessible complet (jour, heures, disponibilité). */
  ariaLabel: string;
  /** 0 pour le seul créneau atteignable avec Tab (roving tabindex), -1 sinon. */
  tabIndex: 0 | -1;
  onSelect: (slot: Slot) => void;
  buttonRef?: Ref<HTMLButtonElement>;
}

const stateStyles = {
  available: (theme: Theme) => ({
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    '&:hover': { backgroundColor: theme.palette.action.hover },
  }),
  selected: (theme: Theme) => ({
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    '&:hover': { backgroundColor: theme.palette.primary.dark },
  }),
  unavailable: (theme: Theme) => ({
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.action.disabledBackground,
    borderColor: theme.palette.divider,
    textDecoration: 'line-through',
  }),
} satisfies Record<SlotState, (theme: Theme) => object>;

/** Un créneau : bouton au rôle `radio`, dont l'état est porté par `aria-checked` / `disabled`. */
export function SlotButton({
  slot,
  state,
  label,
  ariaLabel,
  tabIndex,
  onSelect,
  buttonRef,
}: SlotButtonProps) {
  const selected = state === 'selected';
  return (
    <ButtonBase
      ref={buttonRef}
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      disabled={state === 'unavailable'}
      tabIndex={tabIndex}
      data-slot-id={slot.id}
      data-state={state}
      onClick={() => {
        onSelect(slot);
      }}
      sx={[
        (theme) => ({
          width: '100%',
          minHeight: 40,
          gap: 0.5,
          px: 1,
          border: 1,
          borderRadius: `${theme.shape.borderRadius}px`,
          ...theme.typography.body2,
          fontWeight: theme.typography.fontWeightMedium,
          fontVariantNumeric: 'tabular-nums',
          transition: theme.transitions.create(['background-color', 'color', 'border-color'], {
            duration: theme.transitions.duration.shortest,
          }),
        }),
        stateStyles[state],
      ]}
    >
      {selected && <CheckIcon fontSize="inherit" />}
      {label}
    </ButtonBase>
  );
}

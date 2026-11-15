import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Ref } from 'react';

export interface WeekHeaderProps {
  /** id du titre, référencé par `aria-labelledby`. */
  titleId: string;
  title: string;
  previousLabel: string;
  nextLabel: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  titleRef?: Ref<HTMLHeadingElement>;
}

/** Barre de navigation entre les semaines. Le titre est annoncé à chaque changement. */
export function WeekHeader({
  titleId,
  title,
  previousLabel,
  nextLabel,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  titleRef,
}: WeekHeaderProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
    >
      <IconButton onClick={onPrevious} disabled={!canGoPrevious} aria-label={previousLabel}>
        <ChevronLeftIcon />
      </IconButton>
      <Typography
        ref={titleRef}
        id={titleId}
        component="h2"
        variant="subtitle1"
        aria-live="polite"
        tabIndex={-1}
        sx={{ fontWeight: 'fontWeightBold', textAlign: 'center', outline: 'none' }}
      >
        {title}
      </Typography>
      <IconButton onClick={onNext} disabled={!canGoNext} aria-label={nextLabel}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}

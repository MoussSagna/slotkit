import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { visuallyHidden } from './visuallyHidden';

export interface LoadingStateProps {
  label: string;
  columns: number;
  rows?: number;
}

/** Squelettes pendant le chargement ; seule l'annonce textuelle est exposée aux lecteurs d'écran. */
export function LoadingState({ label, columns, rows = 4 }: LoadingStateProps) {
  return (
    <>
      <Box role="status" sx={visuallyHidden}>
        {label}
      </Box>
      <Box
        aria-hidden
        data-testid="slot-picker-skeleton"
        sx={{ display: 'grid', gap: 1, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }, (_, column) => (
          <Stack key={column} spacing={1}>
            <Skeleton variant="text" sx={{ mx: 'auto', width: '60%' }} />
            {Array.from({ length: rows }, (_, row) => (
              <Skeleton key={row} variant="rounded" height={40} />
            ))}
          </Stack>
        ))}
      </Box>
    </>
  );
}

export interface EmptyStateProps {
  message: string;
  actionLabel: string;
  /** Si absent, le bouton n'est pas affiché (ex. dernière semaine autorisée). */
  onAction?: (() => void) | undefined;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
      <Typography role="status" sx={{ color: 'text.secondary' }}>
        {message}
      </Typography>
      {onAction && (
        <Button variant="outlined" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

export interface ErrorStateProps {
  title: string;
  message: ReactNode;
  retryLabel: string;
  onRetry?: (() => void) | undefined;
}

export function ErrorState({ title, message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      variant="outlined"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            {retryLabel}
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
}

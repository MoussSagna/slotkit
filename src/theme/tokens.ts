/**
 * Tokens de design de Slotkit.
 *
 * C'est le SEUL fichier qui contient des valeurs brutes (couleurs, tailles).
 * Les blocs n'y accèdent jamais directement : ils lisent le thème MUI généré
 * par `createSlotkitTheme`. Pour personnaliser le kit, surchargez ces tokens
 * via `createSlotkitTheme({ tokens: { ... } })` plutôt que de modifier les blocs.
 *
 * Les couleurs ont été choisies pour respecter un contraste WCAG AA (≥ 4.5:1)
 * entre le texte et son fond ; `theme.test.ts` le vérifie automatiquement.
 */

export type ColorMode = 'light' | 'dark';

export interface ColorTokens {
  primary: { main: string; contrastText: string };
  secondary: { main: string; contrastText: string };
  error: { main: string; contrastText: string };
  success: { main: string; contrastText: string };
  background: { default: string; paper: string };
  text: { primary: string; secondary: string; disabled: string };
  divider: string;
}

export interface SlotkitTokens {
  /** Couleurs par mode (clair / sombre). */
  colors: Record<ColorMode, ColorTokens>;
  /** Unité d'espacement en pixels : `theme.spacing(1)` vaut cette valeur. */
  spacingUnit: number;
  /** Rayons d'arrondi en pixels. `md` devient `theme.shape.borderRadius`. */
  radius: { sm: number; md: number; lg: number };
  typography: {
    fontFamily: string;
    /** Taille de base en pixels. */
    fontSize: number;
    fontWeightRegular: number;
    fontWeightMedium: number;
    fontWeightBold: number;
  };
  /** Anneau de focus clavier, appliqué à tous les éléments interactifs. */
  focusRing: { width: number; offset: number };
}

export const defaultTokens: SlotkitTokens = {
  colors: {
    light: {
      primary: { main: '#1d4ed8', contrastText: '#ffffff' },
      secondary: { main: '#6d28d9', contrastText: '#ffffff' },
      error: { main: '#b91c1c', contrastText: '#ffffff' },
      success: { main: '#15803d', contrastText: '#ffffff' },
      background: { default: '#f8fafc', paper: '#ffffff' },
      text: { primary: '#0f172a', secondary: '#475569', disabled: '#94a3b8' },
      divider: '#e2e8f0',
    },
    dark: {
      primary: { main: '#93c5fd', contrastText: '#0f172a' },
      secondary: { main: '#c4b5fd', contrastText: '#0f172a' },
      error: { main: '#fca5a5', contrastText: '#0f172a' },
      success: { main: '#86efac', contrastText: '#0f172a' },
      background: { default: '#0b1120', paper: '#111827' },
      text: { primary: '#f1f5f9', secondary: '#cbd5e1', disabled: '#64748b' },
      divider: '#1f2937',
    },
  },
  spacingUnit: 8,
  radius: { sm: 6, md: 10, lg: 16 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
  },
  focusRing: { width: 2, offset: 2 },
};

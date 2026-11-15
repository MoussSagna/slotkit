import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import { type ColorMode, defaultTokens, type SlotkitTokens } from './tokens';

/** Rend toutes les propriétés optionnelles, récursivement (hors fonctions). */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: never[]) => unknown
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

declare module '@mui/material/styles' {
  interface Theme {
    /** Tokens Slotkit d'origine, accessibles dans `sx` : `(theme) => theme.slotkit.radius.lg`. */
    slotkit: SlotkitTokens;
  }
  interface ThemeOptions {
    slotkit?: SlotkitTokens;
  }
}

export interface CreateSlotkitThemeOptions {
  /** Mode de couleur. Par défaut `'light'`. */
  mode?: ColorMode;
  /** Surcharge partielle des tokens (fusion profonde avec `defaultTokens`). */
  tokens?: DeepPartial<SlotkitTokens>;
  /** Options MUI supplémentaires, appliquées en dernier (priorité maximale). */
  themeOptions?: ThemeOptions;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Fusion profonde immuable : `override` l'emporte sur `base`. */
export function mergeTokens<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) return base;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const current = result[key];
    result[key] =
      isPlainObject(current) && isPlainObject(value) ? mergeTokens(current, value) : value;
  }
  return result as T;
}

/**
 * Crée le thème MUI de Slotkit à partir des tokens.
 *
 * @example
 * const theme = createSlotkitTheme({
 *   mode: 'dark',
 *   tokens: { colors: { dark: { primary: { main: '#fbbf24' } } }, radius: { md: 4 } },
 * });
 */
export function createSlotkitTheme(options: CreateSlotkitThemeOptions = {}): Theme {
  const { mode = 'light', tokens: tokenOverrides, themeOptions } = options;
  const tokens = mergeTokens(defaultTokens, tokenOverrides);
  const colors = tokens.colors[mode];

  const base = createTheme({
    slotkit: tokens,
    palette: {
      mode,
      primary: colors.primary,
      secondary: colors.secondary,
      error: colors.error,
      success: colors.success,
      background: colors.background,
      text: colors.text,
      divider: colors.divider,
    },
    spacing: tokens.spacingUnit,
    shape: { borderRadius: tokens.radius.md },
    typography: {
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
      fontWeightRegular: tokens.typography.fontWeightRegular,
      fontWeightMedium: tokens.typography.fontWeightMedium,
      fontWeightBold: tokens.typography.fontWeightBold,
      button: { textTransform: 'none', fontWeight: tokens.typography.fontWeightMedium },
    },
    components: {
      MuiButtonBase: {
        defaultProps: { disableRipple: false },
        styleOverrides: {
          root: ({ theme }) => ({
            // Focus clavier toujours visible, dans tous les blocs.
            '&.Mui-focusVisible': {
              outline: `${tokens.focusRing.width}px solid ${theme.palette.primary.main}`,
              outlineOffset: tokens.focusRing.offset,
            },
          }),
        },
      },
    },
  });

  return themeOptions ? createTheme(base, themeOptions) : base;
}

/** Thème clair par défaut. */
export const lightTheme: Theme = createSlotkitTheme({ mode: 'light' });
/** Thème sombre par défaut. */
export const darkTheme: Theme = createSlotkitTheme({ mode: 'dark' });

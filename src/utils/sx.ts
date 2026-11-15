import type { SxProps, Theme } from '@mui/material/styles';

type SxItem = Exclude<SxProps<Theme>, readonly unknown[]> | boolean;

/**
 * Combine plusieurs valeurs `sx` (objet, fonction ou tableau) en une seule.
 * Les suivantes l'emportent : passez les styles par défaut d'un bloc en premier
 * et la prop `sx` de l'utilisateur en dernier.
 */
export function mergeSx(...styles: readonly (SxProps<Theme> | undefined)[]): SxProps<Theme> {
  return styles.flatMap((style): readonly SxItem[] => {
    if (style === undefined) return [];
    return Array.isArray(style) ? (style as readonly SxItem[]) : [style as SxItem];
  });
}

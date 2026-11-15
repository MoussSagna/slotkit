import { getContrastRatio } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { createSlotkitTheme, mergeTokens } from './createSlotkitTheme';
import { type ColorMode, defaultTokens } from './tokens';

const AA = 4.5;
const modes: ColorMode[] = ['light', 'dark'];

describe('createSlotkitTheme', () => {
  it.each(modes)('applique les tokens du mode %s', (mode) => {
    const theme = createSlotkitTheme({ mode });
    expect(theme.palette.mode).toBe(mode);
    expect(theme.palette.primary.main).toBe(defaultTokens.colors[mode].primary.main);
    expect(theme.spacing(2)).toBe(`${defaultTokens.spacingUnit * 2}px`);
    expect(theme.shape.borderRadius).toBe(defaultTokens.radius.md);
    expect(theme.slotkit).toEqual(defaultTokens);
  });

  it('fusionne une surcharge partielle sans perdre les autres tokens', () => {
    const theme = createSlotkitTheme({
      tokens: { colors: { light: { primary: { main: '#000000' } } }, radius: { md: 2 } },
    });
    expect(theme.palette.primary.main).toBe('#000000');
    expect(theme.palette.primary.contrastText).toBe(
      defaultTokens.colors.light.primary.contrastText,
    );
    expect(theme.shape.borderRadius).toBe(2);
    expect(theme.slotkit.radius.lg).toBe(defaultTokens.radius.lg);
  });

  it('applique themeOptions en dernier', () => {
    const theme = createSlotkitTheme({ themeOptions: { shape: { borderRadius: 0 } } });
    expect(theme.shape.borderRadius).toBe(0);
  });
});

describe('mergeTokens', () => {
  it('ne modifie pas les objets sources', () => {
    const base = { a: { b: 1, c: 2 } };
    const merged = mergeTokens(base, { a: { b: 3 } });
    expect(merged).toEqual({ a: { b: 3, c: 2 } });
    expect(base).toEqual({ a: { b: 1, c: 2 } });
  });
});

describe('contrastes WCAG AA des tokens par défaut', () => {
  describe.each(modes)('mode %s', (mode) => {
    const c = defaultTokens.colors[mode];

    it.each(['primary', 'secondary', 'error', 'success'] as const)('texte sur %s.main', (key) => {
      expect(getContrastRatio(c[key].contrastText, c[key].main)).toBeGreaterThanOrEqual(AA);
    });

    it.each(['default', 'paper'] as const)(
      'texte principal et secondaire sur background.%s',
      (bg) => {
        expect(getContrastRatio(c.text.primary, c.background[bg])).toBeGreaterThanOrEqual(AA);
        expect(getContrastRatio(c.text.secondary, c.background[bg])).toBeGreaterThanOrEqual(AA);
      },
    );

    it.each(['primary', 'error'] as const)('%s.main lisible sur le fond papier', (key) => {
      expect(getContrastRatio(c[key].main, c.background.paper)).toBeGreaterThanOrEqual(AA);
    });
  });
});

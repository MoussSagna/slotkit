import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

/**
 * jsdom n'implémente pas matchMedia, utilisé par useMediaQuery de MUI.
 * Par défaut, aucune media query ne correspond (affichage desktop).
 * Utiliser `mockViewport('mobile')` dans un test pour simuler un petit écran.
 */
function createMatchMedia(matches: (query: string) => boolean) {
  return (query: string): MediaQueryList => ({
    matches: matches(query),
    media: query,
    onchange: null,
    // Méthodes dépréciées mais exigées par l'interface MediaQueryList.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    addListener: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  });
}

window.matchMedia = createMatchMedia(() => false);

export function mockViewport(viewport: 'mobile' | 'desktop'): void {
  // Pour MUI, down('sm') donne une requête du type "(max-width:599.95px)".
  window.matchMedia = createMatchMedia((query) =>
    viewport === 'mobile' ? query.includes('max-width') : query.includes('min-width'),
  );
}

export function resetViewport(): void {
  window.matchMedia = createMatchMedia(() => false);
}

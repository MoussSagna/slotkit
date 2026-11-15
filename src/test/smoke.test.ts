import { describe, expect, it } from 'vitest';

describe('environnement de test', () => {
  it('fournit jsdom', () => {
    expect(document.body).toBeInTheDocument();
  });
});

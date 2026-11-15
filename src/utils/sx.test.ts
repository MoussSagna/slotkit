import { describe, expect, it } from 'vitest';
import { mergeSx } from './sx';

describe('mergeSx', () => {
  it('aplatit objets, fonctions et tableaux, dans l’ordre', () => {
    const fn = () => ({ color: 'red' });
    expect(mergeSx({ p: 1 }, [{ m: 1 }, fn], undefined, { p: 2 })).toEqual([
      { p: 1 },
      { m: 1 },
      fn,
      { p: 2 },
    ]);
  });
});

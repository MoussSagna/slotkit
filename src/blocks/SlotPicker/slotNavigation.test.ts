import { describe, expect, it } from 'vitest';
import { getNextFocusId, getTabStopId, isNavKey, type NavColumn } from './slotNavigation';

const cell = (id: string, selectable = true) => ({ id, selectable });

// Lundi : a0 a1(indispo) a2 · Mardi : vide · Mercredi : c0 c1 c2 c3 · Jeudi : d0(indispo)
const columns: NavColumn[] = [
  [cell('a0'), cell('a1', false), cell('a2')],
  [],
  [cell('c0'), cell('c1'), cell('c2'), cell('c3')],
  [cell('d0', false)],
];

describe('getNextFocusId', () => {
  it('↓ / ↑ sautent les créneaux indisponibles', () => {
    expect(getNextFocusId(columns, 'a0', 'ArrowDown')).toBe('a2');
    expect(getNextFocusId(columns, 'a2', 'ArrowUp')).toBe('a0');
  });

  it('ne bouge pas aux extrémités d’une colonne', () => {
    expect(getNextFocusId(columns, 'a2', 'ArrowDown')).toBeNull();
    expect(getNextFocusId(columns, 'a0', 'ArrowUp')).toBeNull();
  });

  it('→ saute les jours vides et vise la hauteur la plus proche', () => {
    expect(getNextFocusId(columns, 'a2', 'ArrowRight')).toBe('c2');
    expect(getNextFocusId(columns, 'a0', 'ArrowRight')).toBe('c0');
  });

  it('← revient au jour précédent, sur le créneau sélectionnable le plus proche', () => {
    expect(getNextFocusId(columns, 'c1', 'ArrowLeft')).toBe('a0');
    expect(getNextFocusId(columns, 'c3', 'ArrowLeft')).toBe('a2');
  });

  it('→ ne bouge pas si aucun jour suivant n’a de créneau sélectionnable', () => {
    expect(getNextFocusId(columns, 'c0', 'ArrowRight')).toBeNull();
  });

  it('Début / Fin vont au premier / dernier créneau du jour', () => {
    expect(getNextFocusId(columns, 'c2', 'Home')).toBe('c0');
    expect(getNextFocusId(columns, 'c0', 'End')).toBe('c3');
    expect(getNextFocusId(columns, 'c0', 'Home')).toBeNull();
  });

  it('renvoie null pour un id inconnu', () => {
    expect(getNextFocusId(columns, 'zz', 'ArrowDown')).toBeNull();
  });
});

describe('getTabStopId', () => {
  it('privilégie le premier candidat sélectionnable', () => {
    expect(getTabStopId(columns, ['c2', 'a0'])).toBe('c2');
  });

  it('ignore les candidats absents ou indisponibles', () => {
    expect(getTabStopId(columns, [null, 'a1', 'zz', 'c1'])).toBe('c1');
  });

  it('se rabat sur le premier créneau sélectionnable', () => {
    expect(getTabStopId(columns, [null])).toBe('a0');
  });

  it('renvoie null sans créneau sélectionnable', () => {
    expect(getTabStopId([[cell('x', false)]], [])).toBeNull();
  });
});

describe('isNavKey', () => {
  it('reconnaît les touches de navigation', () => {
    expect(isNavKey('ArrowLeft')).toBe(true);
    expect(isNavKey('Enter')).toBe(false);
  });
});

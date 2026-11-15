/**
 * Logique pure de navigation clavier dans la grille de créneaux.
 *
 * La grille est modélisée en colonnes (une par jour) de cellules (une par créneau).
 * Seules les cellules `selectable` peuvent recevoir le focus : les créneaux
 * indisponibles sont sautés, comme les boutons radio désactivés.
 */

export interface NavCell {
  id: string;
  selectable: boolean;
}

export type NavColumn = readonly NavCell[];

export type NavKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End';

const NAV_KEYS = new Set<string>([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);

export function isNavKey(key: string): key is NavKey {
  return NAV_KEYS.has(key);
}

interface Position {
  column: number;
  row: number;
}

function findPosition(columns: readonly NavColumn[], id: string): Position | null {
  for (const [column, cells] of columns.entries()) {
    const row = cells.findIndex((cell) => cell.id === id);
    if (row !== -1) return { column, row };
  }
  return null;
}

/** Cellule sélectionnable la plus proche de `row` (à égalité, la plus haute). */
function closestSelectable(cells: NavColumn, row: number): NavCell | undefined {
  let best: { cell: NavCell; distance: number } | undefined;
  for (const [index, cell] of cells.entries()) {
    if (!cell.selectable) continue;
    const distance = Math.abs(index - row);
    if (!best || distance < best.distance) best = { cell, distance };
  }
  return best?.cell;
}

/**
 * Renvoie l'id de la cellule qui doit recevoir le focus après l'appui sur `key`,
 * ou `null` si le focus ne bouge pas.
 *
 * - ↑ / ↓ : créneau précédent / suivant du même jour ;
 * - ← / → : jour précédent / suivant ayant un créneau sélectionnable, à la hauteur la plus proche ;
 * - Début / Fin : premier / dernier créneau du jour.
 */
export function getNextFocusId(
  columns: readonly NavColumn[],
  currentId: string,
  key: NavKey,
): string | null {
  const position = findPosition(columns, currentId);
  if (!position) return null;
  const cells = columns[position.column] ?? [];

  switch (key) {
    case 'ArrowDown':
      return cells.slice(position.row + 1).find((cell) => cell.selectable)?.id ?? null;
    case 'ArrowUp':
      return cells.slice(0, position.row).findLast((cell) => cell.selectable)?.id ?? null;
    case 'Home': {
      const first = cells.find((cell) => cell.selectable);
      return first && first.id !== currentId ? first.id : null;
    }
    case 'End': {
      const last = cells.findLast((cell) => cell.selectable);
      return last && last.id !== currentId ? last.id : null;
    }
    case 'ArrowLeft':
    case 'ArrowRight': {
      const step = key === 'ArrowRight' ? 1 : -1;
      for (let c = position.column + step; c >= 0 && c < columns.length; c += step) {
        const target = closestSelectable(columns[c] ?? [], position.row);
        if (target) return target.id;
      }
      return null;
    }
  }
}

/**
 * Cellule qui porte le `tabIndex={0}` (roving tabindex) : la dernière ayant eu
 * le focus si elle est toujours là, sinon la sélection, sinon la première sélectionnable.
 */
export function getTabStopId(
  columns: readonly NavColumn[],
  candidates: readonly (string | null)[],
): string | null {
  const selectable = columns.flat().filter((cell) => cell.selectable);
  for (const candidate of candidates) {
    if (candidate !== null && selectable.some((cell) => cell.id === candidate)) return candidate;
  }
  return selectable[0]?.id ?? null;
}

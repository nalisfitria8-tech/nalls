import { h } from './dom.js';
import { formatNumber } from '../engine/number.js';

/**
 * Tabel hubungan dua besaran (F05).
 * spec = {
 *   caption?: "SENILAI ↑↑",
 *   columns: [{ label: "Buku", arrow?: "↑" }, ...],
 *   rows: [[1, 4000], [2, null]]   // null = sel yang ditanya (?)
 * }
 */
export function relationTable(spec) {
  const head = h(
    'tr',
    {},
    spec.columns.map((c) =>
      h('th', { scope: 'col' }, c.label, c.arrow ? h('span', { class: 'arrow' }, ' ', c.arrow) : null),
    ),
  );
  const body = spec.rows.map((row) =>
    h(
      'tr',
      {},
      row.map((cell) =>
        cell === null
          ? h('td', { class: 'unknown', 'aria-label': 'ditanya' }, '?')
          : h('td', {}, typeof cell === 'number' ? formatNumber(cell) : cell),
      ),
    ),
  );
  return h(
    'table',
    { class: 'rel-table' },
    spec.caption ? h('caption', {}, spec.caption) : null,
    h('thead', {}, head),
    h('tbody', {}, body),
  );
}

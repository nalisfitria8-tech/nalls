import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/base.css', import.meta.url), 'utf8');

/** Ukuran huruf (px) di blok CSS yang selektornya persis `selector`. */
function fontSizeOf(selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return null;
  const block = css.slice(start, css.indexOf('}', start));
  const m = block.match(/font-size:\s*(\d+)px/);
  return m ? Number(m[1]) : null;
}

describe('ukuran huruf tabel (AGENTS.md §4: huruf ≥ 16 px)', () => {
  it('judul kolom tabel hubungan minimal 16 px', () => {
    expect(fontSizeOf('.rel-table th')).toBeGreaterThanOrEqual(16);
  });
});

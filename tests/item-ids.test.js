import { describe, it, expect } from 'vitest';
import m0 from '../src/content/m0.json';
import m1 from '../src/content/m1.json';
import m2 from '../src/content/m2.json';
import m3 from '../src/content/m3.json';

/** Aturan yang sama dengan fungsi SQL module_of() di docs/api.md §7. */
const moduleOf = (itemId) => (/^[ICQ][0-9]+$/.test(itemId) ? 'M2' : itemId.split('-')[0]);

/** ID soal yang tercatat di step_responses / hint_uses (bukan diagnostik D1–D8). */
function loggedItemIds(content) {
  const lists = ['items', 'quiz', 'identify', 'check', 'quick'];
  const ids = lists.flatMap((k) => (content[k] || []).map((i) => i.id));
  // soal diagnostik M0 (D1–D8) hanya masuk diagnostic_results
  return content.module === 'M0' ? [] : ids;
}

describe('pemetaan ID soal ke modul (architecture.md §6.4, api.md §7)', () => {
  for (const content of [m0, m1, m2, m3]) {
    it(`semua soal ${content.module} terbaca sebagai ${content.module}`, () => {
      for (const id of loggedItemIds(content)) expect([id, moduleOf(id)]).toEqual([id, content.module]);
    });
  }

  it('soal M2 memakai I1–I5, C1–C5, Q1–Q5', () => {
    expect(m2.identify.map((i) => i.id)).toEqual(['I1', 'I2', 'I3', 'I4', 'I5']);
    expect(m2.check.map((i) => i.id)).toEqual(['C1', 'C2', 'C3', 'C4', 'C5']);
    expect(m2.quick.map((i) => i.id)).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'Q5']);
  });

  it('kartu pengingat M0 terbaca sebagai M0', () => {
    for (const card of Object.values(m0.reminders)) expect(moduleOf(card.check.id)).toBe('M0');
  });
});

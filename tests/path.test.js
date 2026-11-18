import { describe, it, expect } from 'vitest';
import m0 from '../src/content/m0.json';
import { scoreDiagnostic, remindersNeeded, startModule, moduleStatuses, isCorrectAnswer, isItemLocked, moduleEntryHash } from '../src/engine/path.js';

const allRight = { D1: '100', D2: '9.000', D3: '12', D4: '4000', D5: '2/3', D6: '15', D7: '2 : 3', D8: '15' };

describe('diagnostik (F02)', () => {
  it('semua benar → semua lancar, tanpa pengingat', () => {
    const scores = scoreDiagnostic(m0.items, allRight);
    expect(Object.values(scores).every((s) => s.fluent && s.total === 2)).toBe(true);
    expect(remindersNeeded(scores)).toEqual([]);
  });

  it('satu salah pada pecahan → pengingat pecahan saja', () => {
    const scores = scoreDiagnostic(m0.items, { ...allRight, D5: '6/9' });
    expect(remindersNeeded(scores)).toEqual(['pecahan']);
  });

  it('soal tidak dijawab dihitung belum lancar', () => {
    const { D8, ...rest } = allRight;
    expect(remindersNeeded(scoreDiagnostic(m0.items, rest))).toEqual(['perbandingan']);
  });

  it('isian menerima format Indonesia; pilihan harus persis', () => {
    expect(isCorrectAnswer({ form: 'isian', answer: 9000 }, '9.000')).toBe(true);
    expect(isCorrectAnswer({ form: 'isian', answer: 9000 }, '900')).toBe(false);
    expect(isCorrectAnswer({ form: 'pilihan', answer: '2 : 3' }, '3 : 2')).toBe(false);
  });
});

describe('titik mulai', () => {
  const lancar = scoreDiagnostic(m0.items, allRight);
  const belum = scoreDiagnostic(m0.items, { ...allRight, D7: '3 : 2' });
  it('kelas VII selalu mulai M1', () => expect(startModule(7, lancar)).toBe('M1'));
  it('kelas VIII lancar perbandingan → M2', () => expect(startModule(8, lancar)).toBe('M2'));
  it('kelas VIII belum lancar perbandingan → M1', () => expect(startModule(8, belum)).toBe('M1'));
});

describe('status modul di peta belajar', () => {
  const available = ['M1', 'M2', 'M3'];

  it('sebelum diagnostik: hanya M0 terbuka', () => {
    const st = moduleStatuses({ diagnostic: { done: false }, progress: {} }, available);
    expect(st.M0).toBe('terbuka');
    expect(st.M1).toBe('terkunci');
  });

  it('kelas VII: M1 terbuka, M2 terkunci sampai M1 selesai', () => {
    let st = moduleStatuses({ diagnostic: { done: true, start: 'M1' }, progress: {} }, available);
    expect([st.M0, st.M1, st.M2]).toEqual(['selesai', 'terbuka', 'terkunci']);
    st = moduleStatuses({ diagnostic: { done: true, start: 'M1' }, progress: { M1: 'selesai' } }, available);
    expect(st.M2).toBe('terbuka');
  });

  it('kelas VIII lancar: M1 boleh dilewati, M2 dan M3 terbuka', () => {
    const st = moduleStatuses({ diagnostic: { done: true, start: 'M2' }, progress: {} }, available);
    expect([st.M1, st.M2, st.M3]).toEqual(['boleh_dilewati', 'terbuka', 'terkunci']);
  });

  it('modul tanpa konten → segera', () => {
    const st = moduleStatuses({ diagnostic: { done: true, start: 'M1' }, progress: { M1: 'selesai', M2: 'selesai', M3: 'selesai' } }, available);
    expect(st.M4).toBe('segera');
  });
});

describe('gerbang DS02: latihan mandiri', () => {
  it('soal mandiri terkunci sebelum lulus cek M2', () => {
    expect(isItemLocked({ phase: 'mandiri' }, { m2: { passed: false } })).toBe(true);
    expect(isItemLocked({ phase: 'mandiri' }, {})).toBe(true);
  });
  it('soal mandiri terbuka setelah lulus; fase lain tidak pernah dikunci', () => {
    expect(isItemLocked({ phase: 'mandiri' }, { m2: { passed: true } })).toBe(false);
    expect(['contoh', 'setengah', 'latihan'].some((phase) => isItemLocked({ phase }, { m2: { passed: false } }))).toBe(false);
  });
});

describe('pintu masuk modul dari peta belajar', () => {
  it('M2 kelas VIII yang belum cek cepat → tawaran cek cepat', () => {
    expect(moduleEntryHash('M2', { grade: 8, m2: { quickDone: false } }, 'terbuka')).toBe('#/m2/tawar');
  });
  it('M2 kelas VII, atau kelas VIII yang sudah cek cepat → layar materi', () => {
    expect(moduleEntryHash('M2', { grade: 7, m2: { quickDone: false } }, 'terbuka')).toBe('#/modul/M2/0');
    expect(moduleEntryHash('M2', { grade: 8, m2: { quickDone: true } }, 'terbuka')).toBe('#/modul/M2/0');
  });
  it('M0 selesai → layar hasil', () => {
    expect(moduleEntryHash('M0', {}, 'selesai')).toBe('#/diagnostik/99');
    expect(moduleEntryHash('M0', {}, 'terbuka')).toBe('#/diagnostik/intro');
  });
});

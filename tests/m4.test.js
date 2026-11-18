// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import m2 from '../src/content/m2.json';
import m4 from '../src/content/m4.json';
import { solveScreen } from '../src/screens/solve.js';
import { lessonScreen } from '../src/screens/lesson.js';
import { solve, resultDirection, unknownPosition } from '../src/engine/solver.js';
import { formatNumber, parseNumber } from '../src/engine/number.js';
import { numberTokens } from '../src/engine/marking.js';
import { isItemLocked, moduleStatuses } from '../src/engine/path.js';
import { pendingEvents, clearEvents } from '../src/data/logger.js';

const recallCard = m2.screens.find((s) => s.id === 'M2-07');
const byId = (id) => m4.items.find((i) => i.id === id);
const indexOf = (id) => m4.items.findIndex((i) => i.id === id);

function mount(id) {
  const calls = [];
  const root = document.createElement('div');
  root.append(...solveScreen({ lesson: m4, index: indexOf(id), recallCard, go: (h) => calls.push(h), onFinish: () => calls.push('finish') }));
  return { root, calls };
}

const $ = (root, sel) => root.querySelector(sel);
const $$ = (root, sel) => [...root.querySelectorAll(sel)];
const buttonByText = (root, text) => $$(root, 'button').find((b) => b.textContent.trim() === text);
const stepLabel = (root) => $(root, '.steps li.current')?.textContent;
const errorTypes = () => pendingEvents().filter((e) => e.table === 'step_responses').map((e) => [e.row.step, e.row.error_type]);

/** Kolom tempat sebuah angka bertanda (0 kiri, 1 kanan), dibaca dari tabel kunci. */
function columnOf(item, token) {
  const v = parseNumber(token);
  const [[a1, b1], [a2, b2]] = item.table.rows;
  if ([a1, a2].includes(v)) return 0;
  if ([b1, b2].includes(v)) return 1;
  throw new Error(`${item.id}: ${token} tidak ada di tabel`);
}

/** Langkah 1 lewat fitur tandai (F07): ketuk angka relevan menurut urutan teks, pilih kolomnya. */
function step1ByMarking(root, item, tokens = item.marks.relevant) {
  const order = numberTokens(item.text).filter((t) => tokens.includes(t));
  for (const token of order) {
    $$(root, '.mark-btn.num').find((b) => b.textContent === token).click();
    buttonByText(root, item.table.columns[columnOf(item, token)]).click();
  }
  buttonByText(root, 'Periksa').click();
}

function step2(root, item) {
  $$(root, '.cell-btn')[unknownPosition(item.table.rows) === 'a2' ? 0 : 1].click();
}

function step3(root) {
  buttonByText(root, 'berkurang').click();
  buttonByText(root, '↑↓ Berbalik nilai').click();
  buttonByText(root, 'Periksa').click();
}

function step4(root, item, { bentuk = 'hasil kali', hasil } = {}) {
  const value = hasil ?? formatNumber(solve(item.type, item.table.rows));
  $$(root, '.choice.mono').find((b) => b.textContent.includes(bentuk)).click();
  const input = $(root, '.answer-input');
  input.value = value;
  input.dispatchEvent(new Event('input'));
  buttonByText(root, resultDirection(item.type, item.table.rows) === 'naik' ? 'lebih besar' : 'lebih kecil').click();
  buttonByText(root, 'Periksa').click();
}

beforeEach(() => clearEvents());

describe('konten M4 (naskah M4)', () => {
  it('9 soal berbalik nilai: 2 contoh setengah jadi, 4 latihan, 3 mandiri', () => {
    expect(m4.items.map((i) => i.id)).toEqual(['M4-E2', 'M4-E3', 'M4-L1', 'M4-L2', 'M4-L3', 'M4-L4', 'M4-M1', 'M4-M2', 'M4-M3']);
    expect(m4.items.every((i) => i.type === 'berbalik')).toBe(true);
    expect(m4.items.map((i) => i.phase)).toEqual(['setengah', 'setengah', 'latihan', 'latihan', 'latihan', 'latihan', 'mandiri', 'mandiri', 'mandiri']);
  });

  it('kunci dan rumus tertukar sama dengan naskah', () => {
    const naskah = { 'M4-E2': [12, 18.75], 'M4-E3': [2, 4.5], 'M4-L1': [10, 22.5], 'M4-L2': [60, 26.67], 'M4-L3': [3, 5.33], 'M4-L4': [30, 53.33], 'M4-M1': [24, 13.5], 'M4-M2': [30, 53.33], 'M4-M3': [45, 28.8] };
    for (const [id, [kunci, tertukar]] of Object.entries(naskah)) expect([id, byId(id).answer, byId(id).swappedAnswer]).toEqual([id, kunci, tertukar]);
  });

  it('soal kembar: angka dan kunci sesuai lampiran naskah', () => {
    const naskah = { 'M4-E2': [[[30, 12], [40, null]], 9], 'M4-E3': [[[50, 6], [75, null]], 4], 'M4-L1': [[[10, 12], [15, null]], 8], 'M4-L2': [[[30, 4], [null, 3]], 40], 'M4-L3': [[[3, 8], [6, null]], 4], 'M4-L4': [[[2, 60], [3, null]], 40] };
    for (const [id, [rows, kunci]] of Object.entries(naskah)) {
      expect([id, byId(id).twin.rows, byId(id).twin.answer]).toEqual([id, rows, kunci]);
      expect(numberTokens(byId(id).twin.text).map(parseNumber).filter((n) => rows.flat().includes(n)).length).toBe(3);
    }
    expect(['M4-M1', 'M4-M2', 'M4-M3'].every((id) => !byId(id).twin)).toBe(true); // mandiri tanpa T3, tanpa soal kembar
  });

  it('layar materi M4-01 … M4-E1-5 tampil dengan navigasi', () => {
    expect(m4.screens.map((s) => s.id)).toEqual(['M4-01', 'M4-02', 'M4-E1-1', 'M4-E1-2', 'M4-E1-3', 'M4-E1-4', 'M4-E1-5']);
    m4.screens.forEach((s, i) => {
      const root = document.createElement('div');
      root.append(...lessonScreen({ lesson: m4, index: i, go: () => {} }));
      expect([...root.querySelectorAll('.navbar button')].map((b) => b.textContent)).toEqual(['Kembali', 'Ulangi', 'Lanjut']);
      expect(root.querySelectorAll('table').length).toBe(s.tables?.length || 0);
    });
  });
});

describe('semua soal M4 bisa dikerjakan lewat alur 4 langkah + F07', () => {
  for (const item of m4.items) {
    it(`${item.id}: jalur benar sampai "Tepat!"`, () => {
      const { root } = mount(item.id);
      const pre = new Set(item.prefilled || []);
      if (!pre.has('diketahui')) {
        expect($$(root, '.mark-btn.num').map((b) => b.textContent)).toEqual(numberTokens(item.text));
        step1ByMarking(root, item);
      }
      if (!pre.has('ditanya')) step2(root, item);
      if (!pre.has('jenis')) step3(root);
      expect(stepLabel(root)).toContain('Hitung');
      step4(root, item);
      expect($(root, '.feedback.ok').textContent).toContain(formatNumber(item.answer));
      expect(errorTypes().every(([, err]) => err === null)).toBe(true);
    });
  }
});

describe('kasus khusus M4', () => {
  it('M4-L2: yang ditanya di kolom kiri (kecepatan); memilih sel kanan = salah ambil data', () => {
    const item = byId('M4-L2');
    const { root } = mount('M4-L2');
    step1ByMarking(root, item);
    expect($$(root, '.cell-input')).toHaveLength(0);
    $$(root, '.cell-btn')[1].click(); // sel waktu (2) — bukan yang ditanya
    expect($(root, '.feedback.err').textContent).toContain('Periksa data lagi');
    $$(root, '.cell-btn')[0].click(); // sel kecepatan yang kosong
    step3(root);
    expect($(root, '.problem').textContent).toContain('berapa kecepatannya?');
    step4(root, item); // 60, lebih besar dari 40
    expect($(root, '.feedback.ok').textContent).toBe('Tepat!? = 60. Hasilnya lebih besar dari 40, masuk akal.');
    expect(errorTypes()).toEqual([['diketahui', null], ['ditanya', 'ambil_data'], ['ditanya', null], ['jenis', null], ['bentuk', null], ['hasil', null], ['kewajaran', null]]);
  });

  it('M4-L4: angka 600 bisa diketuk (pengecoh); dipakai → salah ambil data, lalu bisa diperbaiki', () => {
    const item = byId('M4-L4');
    expect(item.marks.distractors).toEqual(['600']);
    const { root } = mount('M4-L4');
    expect($$(root, '.mark-btn.num').map((b) => b.textContent)).toEqual(['600', '3', '40', '4']);
    // siswa menaruh 600 di kolom Keran
    $$(root, '.mark-btn.num').find((b) => b.textContent === '600').click();
    buttonByText(root, 'Keran').click();
    for (const [token, col] of [['40', 'Menit'], ['4', 'Keran']]) {
      $$(root, '.mark-btn.num').find((b) => b.textContent === token).click();
      buttonByText(root, col).click();
    }
    buttonByText(root, 'Periksa').click();
    expect($(root, '.feedback.err').textContent).toContain('Tidak semua angka dipakai');
    expect(errorTypes()).toEqual([['diketahui', 'ambil_data']]);
    const placed = pendingEvents().find((e) => e.row.type === 'mark_place' && e.row.payload.token === '600');
    expect(placed.row).toMatchObject({ module_id: 'M4', item_id: 'M4-L4' });

    // batalkan 600, tandai 3
    $$(root, '.mark-btn.num').find((b) => b.textContent === '600').click();
    $$(root, '.mark-btn.num').find((b) => b.textContent === '3').click();
    buttonByText(root, 'Keran').click();
    buttonByText(root, 'Periksa').click();
    expect(stepLabel(root)).toContain('Ditanya');
  });

  it('salah rumus: memilih bentuk hasil bagi → pembahasan "hasil kali tetap"', () => {
    const item = byId('M4-L4');
    const { root } = mount('M4-L4');
    step1ByMarking(root, item);
    step2(root, item);
    step3(root);
    step4(root, item, { bentuk: 'hasil bagi' });
    const fb = $(root, '.feedback.err').textContent;
    expect(fb).toContain('Jenisnya sudah benar, bentuk hitungannya belum');
    expect(fb).toContain('Pada berbalik nilai, hasil kali tetap. Susun 3 × 40 = 4 × ?.');
    expect(errorTypes().at(-1)).toEqual(['bentuk', 'rumus']);
  });

  it('salah rumus: bentuk benar tetapi hasilnya dari rumus senilai (53,33) → tetap dikenali "rumus"', () => {
    const item = byId('M4-L4');
    const { root } = mount('M4-L4');
    step1ByMarking(root, item);
    step2(root, item);
    step3(root);
    step4(root, item, { hasil: '53,33' });
    expect(errorTypes().find(([step]) => step === 'hasil')).toEqual(['hasil', 'rumus']);
  });

  it('salah jenis (memilih senilai) → Langkah 4 tetap terkunci', () => {
    const item = byId('M4-L1');
    const { root } = mount('M4-L1');
    step1ByMarking(root, item);
    step2(root, item);
    buttonByText(root, 'ikut bertambah').click();
    buttonByText(root, '↑↑ Senilai').click();
    buttonByText(root, 'Periksa').click();
    expect(stepLabel(root)).toContain('Jenis');
    expect($$(root, '.steps li')[3].textContent).toContain('🔒');
    expect(errorTypes().at(-1)).toEqual(['jenis', 'jenis']);
  });
});

describe('gerbang DS02 dan peta belajar untuk M4', () => {
  it('soal mandiri M4 terkunci sebelum lulus cek M2, terbuka sesudahnya; soal lain tidak', () => {
    const mandiri = m4.items.filter((i) => i.phase === 'mandiri');
    expect(mandiri.map((i) => i.id)).toEqual(['M4-M1', 'M4-M2', 'M4-M3']);
    expect(mandiri.every((i) => isItemLocked(i, { m2: { passed: false } }))).toBe(true);
    expect(mandiri.some((i) => isItemLocked(i, { m2: { passed: true } }))).toBe(false);
    expect(m4.items.filter((i) => i.phase !== 'mandiri').some((i) => isItemLocked(i, { m2: { passed: false } }))).toBe(false);
  });

  it('M4 terbuka setelah M3 selesai; sebelumnya terkunci', () => {
    const available = ['M1', 'M2', 'M3', 'M4'];
    const base = { diagnostic: { done: true, start: 'M1' } };
    expect(moduleStatuses({ ...base, progress: { M1: 'selesai', M2: 'selesai' } }, available).M4).toBe('terkunci');
    expect(moduleStatuses({ ...base, progress: { M1: 'selesai', M2: 'selesai', M3: 'selesai' } }, available).M4).toBe('terbuka');
  });
});

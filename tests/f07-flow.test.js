// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import m2 from '../src/content/m2.json';
import m3 from '../src/content/m3.json';
import { solveScreen } from '../src/screens/solve.js';
import { pendingEvents, clearEvents } from '../src/data/logger.js';

const recallCard = m2.screens.find((s) => s.id === 'M2-07');
const idx = (id) => m3.items.findIndex((i) => i.id === id);

function mountSolve(id) {
  const calls = [];
  const root = document.createElement('div');
  root.append(...solveScreen({ lesson: m3, index: idx(id), recallCard, go: (h) => calls.push(h), onFinish: () => calls.push('finish') }));
  return root;
}

const $ = (root, sel) => root.querySelector(sel);
const $$ = (root, sel) => [...root.querySelectorAll(sel)];
const buttonByText = (root, text) => $$(root, 'button').find((b) => b.textContent.trim() === text);
const numBtn = (root, token) => $$(root, '.mark-btn.num').find((b) => b.textContent === token);
const cellValues = (root) => $$(root, '.cell-input').map((i) => i.value);
const stepLabel = (root) => $(root, '.steps li.current')?.textContent;

/** Tandai angka lalu pilih kolomnya. */
function markTo(root, token, column) {
  numBtn(root, token).click();
  buttonByText(root, column).click();
}

beforeEach(() => clearEvents());

describe('F07: tandai angka di Langkah 1', () => {
  it('semua angka di teks bisa diketuk; awalnya belum ada yang ditandai', () => {
    const root = mountSolve('M3-L1');
    expect($$(root, '.mark-btn.num').map((b) => b.textContent)).toEqual(['4', '56.000', '7']);
    expect($$(root, '.mark-btn.num[aria-pressed="true"]')).toHaveLength(0);
    expect($(root, '.mark-chooser')).toBeNull();
    expect($(root, '.known-table caption').textContent).toBe('Diketahui');
  });

  it('ketuk angka → ditandai dan ditanya kolomnya → angka masuk tabel', () => {
    const root = mountSolve('M3-L1');
    numBtn(root, '56.000').click();
    expect(numBtn(root, '56.000').getAttribute('aria-pressed')).toBe('true');
    expect($(root, '.mark-chooser').textContent).toContain('56.000 masuk ke kolom');
    buttonByText(root, 'Harga (Rp)').click();
    expect($(root, '.mark-chooser')).toBeNull();
    expect(cellValues(root)).toEqual(['', '56.000', '', '']);
  });

  it('jalur benar: menandai 4, 56.000, 7 mengisi tabel dan lolos Langkah 1', () => {
    const root = mountSolve('M3-L1');
    markTo(root, '4', 'Beras (kg)');
    markTo(root, '56.000', 'Harga (Rp)');
    markTo(root, '7', 'Beras (kg)');
    expect(cellValues(root)).toEqual(['4', '56.000', '7', '']);
    buttonByText(root, 'Periksa').click();
    expect(stepLabel(root)).toContain('Ditanya');
    const step = pendingEvents().find((e) => e.table === 'step_responses').row;
    expect(step).toMatchObject({ step: 'diketahui', is_correct: true, response: [['4', '56.000'], ['7', null]] });
  });

  it('tanda tetap terlihat di langkah berikutnya, tetapi tidak bisa diketuk lagi', () => {
    const root = mountSolve('M3-L1');
    markTo(root, '4', 'Beras (kg)');
    markTo(root, '56.000', 'Harga (Rp)');
    markTo(root, '7', 'Beras (kg)');
    buttonByText(root, 'Periksa').click();
    expect($$(root, '.mark-btn')).toHaveLength(0);
    expect($$(root, '.mark.num.on').map((e) => e.textContent)).toEqual(['4', '56.000', '7']);
  });

  it('ketuk ulang membatalkan tanda dan mengosongkan selnya', () => {
    const root = mountSolve('M3-L1');
    markTo(root, '4', 'Beras (kg)');
    markTo(root, '7', 'Beras (kg)');
    numBtn(root, '4').click();
    expect(numBtn(root, '4').getAttribute('aria-pressed')).toBe('false');
    expect(cellValues(root)).toEqual(['', '', '7', '']);
  });

  it('"Batal, hapus tanda" pada pertanyaan kolom membatalkan tanda', () => {
    const root = mountSolve('M3-L1');
    numBtn(root, '7').click();
    buttonByText(root, 'Batal, hapus tanda').click();
    expect($(root, '.mark-chooser')).toBeNull();
    expect(numBtn(root, '7').getAttribute('aria-pressed')).toBe('false');
  });

  it('kolom penuh → pesan, angka belum ditaruh', () => {
    const root = mountSolve('M3-L1');
    markTo(root, '4', 'Beras (kg)');
    markTo(root, '7', 'Beras (kg)');
    numBtn(root, '56.000').click();
    buttonByText(root, 'Beras (kg)').click();
    expect($(root, '.mark-chooser').textContent).toContain('Kolom Beras (kg) sudah penuh');
    expect(cellValues(root)).toEqual(['4', '', '7', '']);
  });

  it('angka pengecoh (06.00) dipakai → "salah ambil data"; isian tabel tidak hilang', () => {
    const root = mountSolve('M3-L4');
    expect($$(root, '.mark-btn.num').map((b) => b.textContent)).toEqual(['06.00', '3', '45', '5']);
    markTo(root, '06.00', 'Jarak (km)');
    markTo(root, '45', 'Waktu (menit)');
    markTo(root, '5', 'Jarak (km)');
    buttonByText(root, 'Periksa').click();
    expect($(root, '.feedback.err').textContent).toContain('Periksa data lagi');
    expect(stepLabel(root)).toContain('Diketahui');
    expect(cellValues(root)).toEqual(['06.00', '45', '5', '']);
    expect(pendingEvents().find((e) => e.table === 'step_responses').row.error_type).toBe('ambil_data');

    // perbaiki: batalkan pengecoh, tandai 3
    numBtn(root, '06.00').click();
    markTo(root, '3', 'Jarak (km)');
    expect(cellValues(root)).toEqual(['3', '45', '5', '']);
    buttonByText(root, 'Periksa').click();
    expect(stepLabel(root)).toContain('Ditanya');
  });

  it('mengetik langsung tetap bisa dan tidak hilang saat menandai angka lain', () => {
    const root = mountSolve('M3-L1');
    const cells = $$(root, '.cell-input');
    cells[0].value = '4';
    cells[0].dispatchEvent(new Event('input'));
    markTo(root, '56.000', 'Harga (Rp)');
    expect(cellValues(root)).toEqual(['4', '56.000', '', '']);
    markTo(root, '7', 'Beras (kg)'); // sel kiri atas sudah terisi ketikan → masuk baris 2
    expect(cellValues(root)).toEqual(['4', '56.000', '7', '']);
  });

  it('angka yang selnya sudah diubah siswa tidak menghapus ketikan saat tandanya dibatalkan', () => {
    const root = mountSolve('M3-L1');
    markTo(root, '4', 'Beras (kg)');
    const first = $$(root, '.cell-input')[0];
    first.value = '40';
    first.dispatchEvent(new Event('input'));
    numBtn(root, '4').click();
    expect(cellValues(root)[0]).toBe('40');
  });
});

describe('F07: tandai kalimat yang ditanya', () => {
  const wordsOf = (root, i) => $$(root, `.sentence[data-sentence="${i}"] .mark-btn.words`);

  it('ketuk bagian kalimat → seluruh kalimat ditandai; ketuk lagi → batal', () => {
    const root = mountSolve('M3-L1');
    wordsOf(root, 1)[1].click(); // "kg beras yang sama?" di kalimat pertanyaan
    expect($(root, '.sentence.ask').textContent).toBe('Berapa harga 7 kg beras yang sama?');
    expect(wordsOf(root, 1).every((b) => b.getAttribute('aria-pressed') === 'true')).toBe(true);
    wordsOf(root, 1)[0].click();
    expect($(root, '.sentence.ask')).toBeNull();
  });

  it('bisa dipakai dengan papan ketik (Enter / Spasi) dan bukan elemen <button> agar teks bisa pindah baris', () => {
    const root = mountSolve('M3-L1');
    const part = wordsOf(root, 1)[0];
    expect(part.tagName).toBe('SPAN');
    expect(part.getAttribute('role')).toBe('button');
    expect(part.getAttribute('tabindex')).toBe('0');
    part.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect($(root, '.sentence.ask')).not.toBeNull();
    wordsOf(root, 1)[0].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect($(root, '.sentence.ask')).toBeNull();
  });

  it('angka di dalam kalimat pertanyaan tetap bisa ditandai terpisah', () => {
    const root = mountSolve('M3-L1');
    wordsOf(root, 1)[0].click();
    markTo(root, '7', 'Beras (kg)');
    expect($(root, '.sentence.ask')).not.toBeNull();
    expect(numBtn(root, '7').getAttribute('aria-pressed')).toBe('true');
  });
});

describe('F07: data yang dicatat (api.md §5)', () => {
  it('mark_toggle (angka & kalimat) dan mark_place tercatat dengan isi yang benar', () => {
    const root = mountSolve('M3-M3');
    markTo(root, '2020', 'Lembar'); // pengecoh
    numBtn(root, '2020').click(); // batal
    $$(root, '.sentence[data-sentence="2"] .mark-btn.words')[0].click();
    const rows = pendingEvents().filter((e) => e.table === 'events').map((e) => e.row);
    expect(rows.map((r) => [r.type, r.payload])).toEqual([
      ['mark_toggle', { token: '2020', kind: 'num', on: true, pos: 2 }],
      ['mark_place', { token: '2020', pos: 2, column: 0, row: 0 }],
      ['mark_toggle', { token: '2020', kind: 'num', on: false, pos: 2 }],
      ['mark_toggle', { token: 'Berapa menit untuk 300 lembar?', kind: 'ask', on: true, sentence: 2 }],
    ]);
    expect(rows.every((r) => r.module_id === 'M3' && r.item_id === 'M3-M3')).toBe(true);
  });
});

describe('F07: soal yang Langkah 1-nya sudah terisi', () => {
  it('contoh setengah jadi (M3-E2) tidak menampilkan tombol tandai', () => {
    const root = mountSolve('M3-E2');
    expect($$(root, '.mark-btn')).toHaveLength(0);
    expect($(root, '.problem').textContent).toBe(m3.items[idx('M3-E2')].text);
  });
});

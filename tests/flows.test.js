// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import m0 from '../src/content/m0.json';
import m2 from '../src/content/m2.json';
import m3 from '../src/content/m3.json';
import { solveScreen } from '../src/screens/solve.js';
import { diagnosticScreen } from '../src/screens/diagnostic.js';
import { store } from '../src/data/store.js';
import { pendingEvents, clearEvents } from '../src/data/logger.js';

const recallCard = m2.screens.find((s) => s.id === 'M2-07');

function mountSolve(index, overrides = {}) {
  const lesson = overrides.lesson || m3;
  const calls = [];
  const root = document.createElement('div');
  root.append(...solveScreen({ lesson, index, recallCard, go: (h) => calls.push(h), onFinish: () => calls.push('finish') }));
  return { root, calls };
}

const $ = (root, sel) => root.querySelector(sel);
const $$ = (root, sel) => [...root.querySelectorAll(sel)];
const buttonByText = (root, text) => $$(root, 'button').find((b) => b.textContent.trim() === text);
const type = (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('input'));
};
const stepLabel = (root) => $(root, '.steps li.current')?.textContent;

/** Mengerjakan langkah 1–3 dengan benar untuk soal M3-L1 (4 kg Rp56.000 → 7 kg). */
function doSteps123(root) {
  const cells = $$(root, '.cell-input');
  ['4', '56.000', '7', ''].forEach((v, i) => type(cells[i], v));
  buttonByText(root, 'Periksa').click();
  $$(root, '.cell-btn')[1].click(); // sel harga di baris kedua
  buttonByText(root, 'ikut bertambah').click();
  buttonByText(root, '↑↑ Senilai').click();
  buttonByText(root, 'Periksa').click();
}

function doStep4(root, { bentuk, hasil, arah }) {
  $$(root, '.choice.mono').find((b) => b.textContent.includes(bentuk)).click();
  type($(root, '.answer-input'), hasil);
  buttonByText(root, arah).click();
  buttonByText(root, 'Periksa').click();
}

const L1 = m3.items.findIndex((i) => i.id === 'M3-L1');

beforeEach(() => clearEvents());

describe('alur 4 langkah (F04)', () => {
  it('jalur benar: 1 → 2 → 3 → 4 → selesai', () => {
    const { root, calls } = mountSolve(L1);
    expect(stepLabel(root)).toContain('Diketahui');
    expect($$(root, '.steps li')[3].textContent).toContain('🔒');
    doSteps123(root);
    expect(stepLabel(root)).toContain('Hitung');
    doStep4(root, { bentuk: 'hasil bagi', hasil: '98.000', arah: 'lebih besar' });
    expect($(root, '.feedback.ok').textContent).toContain('98.000');
    buttonByText(root, 'Soal berikut').click();
    expect(calls).toEqual([`#/soal/M3/${L1 + 1}`]);
  });

  it('Langkah 3 salah → tetap di Langkah 3 (Langkah 4 terkunci) dengan pembahasan "jenis"', () => {
    const { root } = mountSolve(L1);
    const cells = $$(root, '.cell-input');
    ['4', '56000', '7', ''].forEach((v, i) => type(cells[i], v));
    buttonByText(root, 'Periksa').click();
    $$(root, '.cell-btn')[1].click();
    buttonByText(root, 'berkurang').click();
    buttonByText(root, '↑↓ Berbalik nilai').click();
    buttonByText(root, 'Periksa').click();
    expect(stepLabel(root)).toContain('Jenis');
    expect($(root, '.feedback.err').textContent).toContain('Periksa jenisnya');
    expect($(root, '.recall')).not.toBeNull(); // kartu "Ingat lagi" terbuka
  });

  it('angka pengecoh di Langkah 1 → salah ambil data', () => {
    const idx = m3.items.findIndex((i) => i.id === 'M3-L4'); // pengecoh 06.00
    const { root } = mountSolve(idx);
    const cells = $$(root, '.cell-input');
    ['6', '45', '5', ''].forEach((v, i) => type(cells[i], v));
    buttonByText(root, 'Periksa').click();
    expect($(root, '.feedback.err').textContent).toContain('Periksa data lagi');
  });

  it('rumus tertukar → "salah rumus"; hitungan meleset → "salah hitung"', () => {
    const { root } = mountSolve(L1);
    doSteps123(root);
    doStep4(root, { bentuk: 'hasil kali', hasil: '32.000', arah: 'lebih kecil' });
    expect($(root, '.feedback.err').textContent).toContain('bentuk hitungannya belum');
    doStep4(root, { bentuk: 'hasil bagi', hasil: '96.000', arah: 'lebih besar' });
    expect($(root, '.feedback.err').textContent).toContain('periksa hitungannya');
  });

  it('cek kewajaran salah meski angka benar → pembahasan kewajaran (F10)', () => {
    const { root } = mountSolve(L1);
    doSteps123(root);
    doStep4(root, { bentuk: 'hasil bagi', hasil: '98000', arah: 'lebih kecil' });
    expect($(root, '.feedback.err').textContent).toContain('masuk akal');
  });

  it('contoh setengah jadi mulai dari langkah yang belum terisi', () => {
    const { root } = mountSolve(m3.items.findIndex((i) => i.id === 'M3-E2'));
    expect(stepLabel(root)).toContain('Hitung');
  });

  it('salah terus → petunjuk naik bertahap → pembahasan lengkap → soal kembar', () => {
    const { root } = mountSolve(L1);
    doSteps123(root);
    for (let i = 0; i < 6 && !$(root, '.feedback.info'); i++) {
      doStep4(root, { bentuk: 'hasil bagi', hasil: '1', arah: 'lebih besar' });
    }
    expect($(root, '.feedback.info').textContent).toContain('98.000');
    buttonByText(root, 'Coba soal kembar').click();
    expect($(root, '.progress').textContent).toContain('kembar');
    expect($(root, '.problem').textContent).toContain('3 kg beras Rp42.000');
    expect($$(root, '.hint').length).toBe(0); // petunjuk mulai lagi dari nol
  });

  it('mencatat jawaban per langkah ke antrean data (F15)', () => {
    const { root } = mountSolve(L1);
    doSteps123(root);
    const steps = pendingEvents().filter((e) => e.table === 'step_responses').map((e) => e.row.step);
    expect(steps).toEqual(['diketahui', 'ditanya', 'jenis']);
    expect(pendingEvents().every((e) => e.row.client_event_id)).toBe(true);
  });
});

describe('diagnostik → hasil & titik mulai (F02)', () => {
  it('kelas VIII semua benar → mulai M2, tanpa pengingat', () => {
    store.reset();
    store.update((s) => (s.grade = 8));
    Object.assign(store.get().diagnostic.answers, { D1: '100', D2: '9000', D3: '12', D4: '4000', D5: '2/3', D6: '15', D7: '2 : 3', D8: '15' });
    const root = document.createElement('div');
    const calls = [];
    root.append(...diagnosticScreen({ m0, index: m0.items.length, store, go: (h) => calls.push(h) }));
    expect(store.get().diagnostic).toMatchObject({ done: true, start: 'M2', reminders: [] });
    buttonByText(root, 'Lanjut').click();
    expect(calls).toEqual(['#/']);
  });

  it('kelas VII salah pecahan → pengingat pecahan', () => {
    store.reset();
    store.update((s) => (s.grade = 7));
    Object.assign(store.get().diagnostic.answers, { D1: '100', D2: '9000', D3: '12', D4: '4000', D5: '6/9', D6: '15', D7: '2 : 3', D8: '15' });
    const root = document.createElement('div');
    const calls = [];
    root.append(...diagnosticScreen({ m0, index: m0.items.length, store, go: (h) => calls.push(h) }));
    expect(root.textContent).toContain('pecahan');
    expect(store.get().diagnostic.start).toBe('M1');
    buttonByText(root, 'Lanjut').click();
    expect(calls).toEqual(['#/pengingat/pecahan/0']);
  });
});

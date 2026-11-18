// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import m2 from '../src/content/m2.json';
import { store } from '../src/data/store.js';
import { pendingEvents, clearEvents } from '../src/data/logger.js';
import {
  identifyScreen,
  offerScreen,
  quickScreen,
  practiceScreen,
  checkScreen,
  explainScreen,
  afterM2Lesson,
  mandiriLockedScreen,
} from '../src/screens/m2.js';

const recallCard = m2.screens.find((s) => s.id === 'M2-07');
const M2_06 = m2.screens.findIndex((s) => s.id === 'M2-06');

const $$ = (root, sel) => [...root.querySelectorAll(sel)];
const buttonByText = (root, text) => $$(root, 'button').find((b) => b.textContent.trim() === text);
const ARAH_TEXT = { searah: 'ikut bertambah', berlawanan: 'berkurang' };
const JENIS_TEXT = { senilai: '↑↑ Senilai', berbalik: '↑↓ Berbalik nilai' };
const WRONG = { arah: { searah: 'berlawanan', berlawanan: 'searah' }, jenis: { senilai: 'berbalik', berbalik: 'senilai' } };

function mount(nodes) {
  const root = document.createElement('div');
  root.append(...nodes);
  return root;
}

/** Menjawab satu soal identifikasi; right=false → arah dan jenis dibalik. */
function answer(root, item, right = true) {
  const arah = right ? item.arah : WRONG.arah[item.arah];
  const jenis = right ? item.jenis : WRONG.jenis[item.jenis];
  buttonByText(root, ARAH_TEXT[arah]).click();
  buttonByText(root, JENIS_TEXT[jenis]).click();
  (buttonByText(root, 'Periksa') || buttonByText(root, 'Simpan')).click();
}

function ctx(extra = {}) {
  const calls = [];
  return { calls, m2, store, recallCard, go: (h) => calls.push(h), finishModule: () => calls.push('finish'), ...extra };
}

/** Mengerjakan seluruh cek pemahaman; benarSet = ID yang dijawab benar. */
function runCheck(benarSet) {
  mount(checkScreen({ ...ctx(), index: 'mulai' }));
  const order = store.get().m2.cek.order;
  for (let i = 0; i < order.length; i++) {
    const item = m2.check.find((c) => c.id === order[i]);
    answer(mount(checkScreen({ ...ctx(), index: i })), item, benarSet.has(item.id));
  }
  const c = ctx();
  const root = mount(checkScreen({ ...c, index: order.length }));
  return { root, calls: c.calls };
}

beforeEach(() => {
  store.reset();
  store.update((s) => (s.grade = 7));
  clearEvents();
});

describe('soal identifikasi: latihan (I1–I5)', () => {
  const I1 = m2.identify[0];

  it('tombol Periksa aktif setelah arah dan jenis dipilih', () => {
    const root = mount(practiceScreen({ ...ctx(), index: 0 }));
    expect(buttonByText(root, 'Periksa').disabled).toBe(true);
    buttonByText(root, ARAH_TEXT[I1.arah]).click();
    expect(buttonByText(root, 'Periksa').disabled).toBe(true);
    buttonByText(root, JENIS_TEXT[I1.jenis]).click();
    expect(buttonByText(root, 'Periksa').disabled).toBe(false);
  });

  it('benar → umpan balik "Tepat!" lalu ke soal berikut', () => {
    const c = ctx();
    const root = mount(practiceScreen({ ...c, index: 0 }));
    answer(root, I1);
    expect(root.querySelector('.feedback.ok').textContent).toContain('Tepat!');
    buttonByText(root, 'Lanjut').click();
    expect(c.calls).toEqual(['#/m2/latih/1']);
  });

  it('salah → boleh mencoba lagi; T1 setelah salah ke-2; pembahasan setelah salah ke-4', () => {
    const root = mount(practiceScreen({ ...ctx(), index: 0 }));
    answer(root, I1, false);
    expect(root.querySelector('.feedback.err')).not.toBeNull();
    expect($$(root, '.hint')).toHaveLength(0);
    answer(root, I1, false);
    expect($$(root, '.hint')).toHaveLength(1);
    expect(root.textContent).not.toContain(I1.jenis === 'senilai' ? 'Jadi ↑↑ senilai' : 'Jadi ↑↓ berbalik nilai'); // petunjuk tidak memberi jawaban
    answer(root, I1, false);
    answer(root, I1, false);
    expect(root.querySelector('.feedback.info').textContent).toContain('Begini caranya');
    expect(root.textContent).not.toContain('null'); // anak kosong tidak boleh tampil sebagai teks
    const steps = pendingEvents().filter((e) => e.table === 'step_responses');
    expect(steps.map((e) => e.row.attempt_no)).toEqual([1, 2, 3, 4]);
    expect(steps.every((e) => e.row.step === 'jenis' && e.row.phase === 'latihan')).toBe(true);
  });

  it('soal terakhir → cek pemahaman', () => {
    const c = ctx();
    const last = m2.identify.length - 1;
    const root = mount(practiceScreen({ ...c, index: last }));
    answer(root, m2.identify[last]);
    buttonByText(root, 'Lanjut').click();
    expect(c.calls).toEqual(['#/m2/cek/mulai']);
  });

  it('kartu "Ingat lagi" bisa dibuka dan tercatat', () => {
    const root = mount(practiceScreen({ ...ctx(), index: 0 }));
    buttonByText(root, 'ⓘ Ingat lagi: cara menentukan jenis').click();
    expect(root.querySelector('.recall').textContent).toContain('Tentukan dua besaran');
    expect(pendingEvents().some((e) => e.row.type === 'recall_open')).toBe(true);
  });

  it('membuka petunjuk tercatat (hint_uses)', () => {
    const root = mount(practiceScreen({ ...ctx(), index: 0 }));
    buttonByText(root, 'Petunjuk (1 dari 2)').click();
    expect(pendingEvents().filter((e) => e.table === 'hint_uses').map((e) => e.row)).toMatchObject([{ item_id: 'I1', step: 'jenis', level: 1 }]);
  });
});

describe('cek pemahaman (C1–C5) dan gerbang DS02', () => {
  it('sekali jawab; hanya T1 yang tersedia', () => {
    mount(checkScreen({ ...ctx(), index: 'mulai' }));
    const root = mount(checkScreen({ ...ctx(), index: 0 }));
    expect(buttonByText(root, 'Petunjuk (1 dari 1)')).toBeDefined();
    answer(root, m2.check[0], false);
    expect(buttonByText(root, 'Periksa')).toBeUndefined();
    expect(root.querySelector('.feedback.info').textContent).toContain('Belum tepat.');
  });

  it('urutan percobaan pertama sesuai naskah', () => {
    mount(checkScreen({ ...ctx(), index: 'mulai' }));
    expect(store.get().m2.cek).toMatchObject({ attempt: 1, open: true, order: m2.check.map((c) => c.id) });
  });

  it('4 dari 5 benar → lulus, latihan mandiri terbuka, lanjut ke "jelaskan"', () => {
    const { root, calls } = runCheck(new Set(['C1', 'C2', 'C3', 'C4']));
    expect(root.textContent).toContain('benar 4 dari 5');
    expect(store.get().m2.passed).toBe(true);
    expect(store.get().m2.cek.result).toEqual({ attempt: 1, correct: 4, passed: true });
    buttonByText(root, 'Lanjut').click();
    expect(calls).toEqual(['#/m2/jelaskan']);
    const ev = pendingEvents().find((e) => e.row.type === 'check_result');
    expect(ev.row.payload).toEqual({ kind: 'pemahaman', attempt: 1, correct: 4, passed: true });
  });

  it('3 dari 5 benar → belum lulus, wajib ulang dari M2-06, lalu cek dengan urutan diacak', () => {
    const { root, calls } = runCheck(new Set(['C1', 'C2', 'C3']));
    expect(store.get().m2.passed).toBe(false);
    buttonByText(root, 'Ulangi bagian tadi').click();
    expect(calls).toEqual([`#/modul/M2/${M2_06}`]);

    // belum mengulang materi → tidak bisa langsung mencoba lagi
    const blocked = mount(checkScreen({ ...ctx(), index: 'mulai' }));
    expect(blocked.textContent).toContain('ulang dulu bagian yang tadi');
    expect(store.get().m2.cek.attempt).toBe(1);

    // selesai mengulang M2-06..07 → langsung ke cek, percobaan ke-2 diacak
    expect(afterM2Lesson(store)).toBe('#/m2/cek/mulai');
    mount(checkScreen({ ...ctx(), index: 'mulai' }));
    const cek = store.get().m2.cek;
    expect(cek).toMatchObject({ attempt: 2, open: true, answers: {} });
    expect([...cek.order].sort()).toEqual(m2.check.map((c) => c.id));
  });

  it('percobaan kedua lulus; setelah lulus, materi M2 lanjut ke latihan biasa', () => {
    runCheck(new Set(['C1']));
    afterM2Lesson(store);
    runCheck(new Set(['C1', 'C2', 'C3', 'C4', 'C5']));
    expect(store.get().m2.passed).toBe(true);
    expect(store.get().m2.cek.result).toEqual({ attempt: 2, correct: 5, passed: true });
    expect(afterM2Lesson(store)).toBe('#/m2/latih/0');
    const payloads = pendingEvents().filter((e) => e.row.type === 'check_result').map((e) => e.row.payload);
    expect(payloads.map((p) => [p.attempt, p.passed])).toEqual([[1, false], [2, true]]);
  });

  it('layar terkunci untuk soal mandiri mengarah ke Modul 2 dan tercatat', () => {
    const c = ctx();
    const root = mount(mandiriLockedScreen({ moduleId: 'M3', item: { id: 'M3-M1' }, go: c.go }));
    expect(root.textContent).toContain('lulus cek pemahaman');
    buttonByText(root, 'Ke Modul 2').click();
    expect(c.calls).toEqual(['#/modul/M2/0']);
    expect(pendingEvents().find((e) => e.row.type === 'gate_locked').row).toMatchObject({ module_id: 'M3', item_id: 'M3-M1' });
  });
});

describe('temuan A: jawaban pertama terkunci (tombol Kembali, muat ulang, pindah layar)', () => {
  it('kembali ke soal yang sudah dijawab → jawaban lama tampil terkunci, tidak bisa dijawab ulang', () => {
    mount(checkScreen({ ...ctx(), index: 'mulai' }));
    answer(mount(checkScreen({ ...ctx(), index: 0 })), m2.check[0], false); // C1 salah
    answer(mount(checkScreen({ ...ctx(), index: 1 })), m2.check[1], true);

    const back = mount(checkScreen({ ...ctx(), index: 0 })); // tombol Kembali browser
    expect(buttonByText(back, 'Periksa')).toBeUndefined();
    expect($$(back, '.choices')).toHaveLength(0);
    expect(back.querySelector('.saved-answer').textContent).toContain('Jawabanmu:');
    expect(back.querySelector('.feedback.info').textContent).toContain('Belum tepat.');
    expect(store.get().m2.cek.answers.C1.correct).toBe(false);
  });

  it('jawaban tersimpan tidak tertimpa walau onAnswered terpanggil lagi', () => {
    mount(checkScreen({ ...ctx(), index: 'mulai' }));
    const first = mount(checkScreen({ ...ctx(), index: 0 }));
    // dua layar soal yang sama terbuka (misal dua tab), keduanya dijawab
    const second = mount(checkScreen({ ...ctx(), index: 0 }));
    answer(first, m2.check[0], false);
    answer(second, m2.check[0], true);
    expect(store.get().m2.cek.answers.C1.correct).toBe(false);
  });

  it('membuka "mulai" lagi di tengah percobaan tidak menghapus jawaban', () => {
    mount(checkScreen({ ...ctx(), index: 'mulai' }));
    answer(mount(checkScreen({ ...ctx(), index: 0 })), m2.check[0], false);
    const c = ctx();
    const again = mount(checkScreen({ ...c, index: 'mulai' }));
    expect(store.get().m2.cek).toMatchObject({ attempt: 1, open: true });
    expect(Object.keys(store.get().m2.cek.answers)).toEqual(['C1']);
    buttonByText(again, 'Lanjutkan').click();
    expect(c.calls).toEqual(['#/m2/cek/1']);
  });

  it('tidak bisa melompat ke soal atau hasil sebelum soal sebelumnya dijawab', () => {
    mount(checkScreen({ ...ctx(), index: 'mulai' }));
    const jump = mount(checkScreen({ ...ctx(), index: 4 }));
    expect(jump.querySelector('.progress').textContent).toBe('1/5');
    const result = mount(checkScreen({ ...ctx(), index: 5 }));
    expect(result.textContent).not.toContain('Kamu menjawab benar');
    expect(store.get().m2.cek.open).toBe(true);
  });

  it('cek cepat: soal yang sudah disimpan terkunci; setelah selesai tidak bisa diulang', () => {
    store.update((s) => (s.grade = 8));
    answer(mount(quickScreen({ ...ctx(), index: 0 })), m2.quick[0], false);
    const back = mount(quickScreen({ ...ctx(), index: 0 }));
    expect(buttonByText(back, 'Simpan')).toBeUndefined();
    expect(back.textContent).toContain('Jawabanmu sudah disimpan.');
    expect(back.querySelector('.feedback')).toBeNull(); // tetap tanpa umpan balik benar/salah
    for (let i = 1; i < m2.quick.length; i++) answer(mount(quickScreen({ ...ctx(), index: i })), m2.quick[i], true);
    mount(quickScreen({ ...ctx(), index: m2.quick.length }));
    expect(store.get().m2.quickScore).toBe(4);

    const retry = mount(quickScreen({ ...ctx(), index: 0 }));
    expect(retry.textContent).toContain('benar 4 dari 5');
    expect(buttonByText(retry, 'Simpan')).toBeUndefined();
  });
});

describe('temuan C: hasil cek dicatat sekali per percobaan', () => {
  it('membuka ulang layar hasil cek pemahaman tidak mencatat ulang', () => {
    runCheck(new Set(['C1', 'C2', 'C3', 'C4']));
    mount(checkScreen({ ...ctx(), index: 5 }));
    mount(checkScreen({ ...ctx(), index: 'mulai' })); // sudah lulus → tampil hasil
    mount(checkScreen({ ...ctx(), index: 2 }));
    expect(pendingEvents().filter((e) => e.row.type === 'check_result')).toHaveLength(1);
    expect(store.get().m2.cek.attempt).toBe(1);
  });

  it('membuka ulang layar hasil cek cepat tidak mencatat ulang', () => {
    store.update((s) => (s.grade = 8));
    for (let i = 0; i < m2.quick.length; i++) answer(mount(quickScreen({ ...ctx(), index: i })), m2.quick[i], true);
    mount(quickScreen({ ...ctx(), index: 5 }));
    mount(quickScreen({ ...ctx(), index: 5 }));
    const types = pendingEvents().filter((e) => e.table === 'events').map((e) => e.row.type);
    expect(types).toEqual(['check_result', 'skip_module']);
  });
});

describe('temuan A: muat ulang halaman (keadaan dibaca lagi dari penyimpanan)', () => {
  // lingkungan tes tidak punya localStorage; pakai tiruan di memori
  function memoryStorage() {
    const data = new Map();
    return { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) };
  }
  async function freshStore() {
    vi.resetModules();
    return (await import('../src/data/store.js')).store;
  }
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('jawaban dan nomor percobaan tetap ada setelah halaman dimuat ulang', async () => {
    const before = await freshStore();
    before.update((s) => (s.grade = 7));
    mount(checkScreen({ ...ctx({ store: before }), index: 'mulai' }));
    answer(mount(checkScreen({ ...ctx({ store: before }), index: 0 })), m2.check[0], false);

    const after = await freshStore(); // = muat ulang halaman
    expect(after).not.toBe(before);
    expect(after.get().m2.cek).toMatchObject({ attempt: 1, open: true, answers: { C1: { correct: false } } });

    const root = mount(checkScreen({ ...ctx({ store: after }), index: 0 }));
    expect(buttonByText(root, 'Periksa')).toBeUndefined();
    expect(root.querySelector('.saved-answer')).not.toBeNull();
    const next = mount(checkScreen({ ...ctx({ store: after }), index: 1 }));
    expect(next.querySelector('.progress').textContent).toBe('2/5');
  });

  it('hasil yang sudah tercatat tidak dicatat ulang setelah muat ulang', async () => {
    const before = await freshStore();
    mount(checkScreen({ ...ctx({ store: before }), index: 'mulai' }));
    const order = before.get().m2.cek.order;
    order.forEach((id, i) => answer(mount(checkScreen({ ...ctx({ store: before }), index: i })), m2.check.find((c) => c.id === id), true));
    mount(checkScreen({ ...ctx({ store: before }), index: 5 }));

    expect(pendingEvents().filter((e) => e.row.type === 'check_result')).toHaveLength(1);
    clearEvents();

    const after = await freshStore();
    mount(checkScreen({ ...ctx({ store: after }), index: 5 })); // layar hasil dibuka lagi
    expect(after.get().m2.cek.result).toEqual({ attempt: 1, correct: 5, passed: true });
    expect(pendingEvents().filter((e) => e.row.type === 'check_result')).toHaveLength(0);
  });

  it('data lama di perangkat (bentuk sebelum perbaikan) tetap terbaca', async () => {
    localStorage.setItem('mathsave:v1', JSON.stringify({ grade: 8, m2: { quickDone: true, quickScore: 5, passed: true, cekOrder: null, cekResults: {}, retry: false } }));
    const reloaded = await freshStore();
    expect(reloaded.get().m2).toMatchObject({ passed: true, quickDone: true, cek: { attempt: 0, open: false }, quick: { answers: {} } });
  });
});

describe('cek cepat kelas VIII (M2-00)', () => {
  beforeEach(() => store.update((s) => (s.grade = 8)));

  function runQuick(benar) {
    for (let i = 0; i < m2.quick.length; i++) {
      const c = ctx();
      const root = mount(quickScreen({ ...c, index: i }));
      expect(root.querySelector('.hints')).toBeNull(); // tanpa petunjuk
      expect(root.textContent).not.toContain('Ingat lagi');
      answer(root, m2.quick[i], i < benar);
      expect(root.querySelector('.feedback')).toBeNull(); // tanpa umpan balik per soal
      expect(c.calls).toEqual([`#/m2/cepat/${i + 1}`]);
    }
    const c = ctx();
    return { root: mount(quickScreen({ ...c, index: m2.quick.length })), calls: c.calls };
  }

  it('tawaran: coba cek cepat atau pelajari dari awal', () => {
    const c = ctx();
    const root = mount(offerScreen(c));
    buttonByText(root, 'Coba cek cepat').click();
    buttonByText(root, 'Pelajari dari awal').click();
    expect(c.calls).toEqual(['#/m2/cepat/0', '#/modul/M2/0']);
  });

  it('4/5 benar → M2 selesai, mandiri terbuka, tetap boleh mempelajari M2', () => {
    const { root, calls } = runQuick(4);
    expect(store.get().m2).toMatchObject({ quickDone: true, quickScore: 4, passed: true });
    expect(store.get().progress.M2).toBe('selesai');
    buttonByText(root, 'Tetap pelajari Modul 2').click();
    expect(calls).toEqual(['#/modul/M2/0']);
    const types = pendingEvents().filter((e) => e.table === 'events').map((e) => e.row.type);
    expect(types).toEqual(['check_result', 'skip_module']);
  });

  it('3/5 benar → belajar dari awal, tanpa skip_module', () => {
    const { root, calls } = runQuick(3);
    expect(store.get().m2).toMatchObject({ quickDone: true, quickScore: 3, passed: false });
    expect(store.get().progress.M2).toBeUndefined();
    expect(root.textContent).toContain('Kita pelajari pelan-pelan, ya.');
    buttonByText(root, 'Mulai belajar').click();
    expect(calls).toEqual(['#/modul/M2/0']);
    expect(pendingEvents().some((e) => e.row.type === 'skip_module')).toBe(false);
  });
});

describe('jelaskan ke temanmu (M2-10)', () => {
  it('mengisi kalimat rumpang → contoh + daftar cek → modul selesai, teks tercatat', () => {
    const c = ctx();
    const root = mount(explainScreen(c));
    const selects = $$(root, 'select');
    const values = ['berbalik nilai', 'pekerja', 'hari', 'berkurang', 'hasil kali'];
    selects.forEach((s, i) => {
      s.value = values[i];
      s.dispatchEvent(new Event('change'));
    });
    buttonByText(root, 'Kirim').click();
    expect(root.textContent).toContain('Contoh penjelasan');
    expect(root.textContent).not.toContain('null'); // teks bebas dikosongkan
    buttonByText(root, 'Lanjut').click();
    expect(c.calls).toEqual(['finish']);
    const row = pendingEvents().find((e) => e.table === 'explanations').row;
    expect(row).toMatchObject({ module_id: 'M2', prompt_id: 'M2-10', cloze: m2.explain.expected });
  });
});

describe('identifyScreen mode cepat tidak menampilkan umpan balik', () => {
  it('Simpan langsung memanggil onNext', () => {
    let next = 0;
    const root = mount(identifyScreen({ item: m2.quick[0], mode: 'cepat', title: 't', recallCard, onNext: () => (next += 1) }));
    answer(root, m2.quick[0]);
    expect(next).toBe(1);
  });
});

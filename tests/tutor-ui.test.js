// @vitest-environment happy-dom
// Tombol mengambang Tanya Nalls (KP-36) dengan pengirim TIRUAN (tanpa jaringan, tanpa API key).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import m0 from '../src/content/m0.json';
import m1 from '../src/content/m1.json';
import m2 from '../src/content/m2.json';
import m3 from '../src/content/m3.json';
import m4 from '../src/content/m4.json';
import mlTest from '../src/content/ml-test.json';
import tutor from '../src/content/tutor.json';
import { solveScreen } from '../src/screens/solve.js';
import { lessonScreen } from '../src/screens/lesson.js';
import { quizScreen } from '../src/screens/quiz.js';
import { diagnosticScreen, reminderScreen } from '../src/screens/diagnostic.js';
import { mlTaskScreen, mlIntroScreen, mlGraderHome, mlMcqScreen } from '../src/screens/mlTest.js';
import { quickScreen, checkScreen, practiceScreen, explainScreen } from '../src/screens/m2.js';
import { homeScreen } from '../src/screens/home.js';
import { createTutorWidget, sendTutorRequest, tutorMode, TUTOR_ENDPOINT } from '../src/components/tutor.js';
import { clearTutorContext, getTutorContext } from '../src/components/tutorContext.js';
import { store } from '../src/data/store.js';
import { pendingEvents, clearEvents } from '../src/data/logger.js';

const recallCard = m2.screens.find((s) => s.id === 'M2-07');
const $ = (root, sel) => root.querySelector(sel);
const $$ = (root, sel) => [...root.querySelectorAll(sel)];
const byText = (root, text) => $$(root, 'button').find((b) => b.textContent.trim() === text);
const startsWith = (root, text) => $$(root, 'button').find((b) => b.textContent.trim().startsWith(text));
const type = (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('input'));
};
const flush = () => new Promise((r) => setTimeout(r, 0));
const go = () => {};

let page; // seperti #app
let widget;
let send;

/** Seperti router: konteks dikosongkan, layar digambar, tombol diperbarui. */
function show(nodes) {
  clearTutorContext();
  const made = typeof nodes === 'function' ? nodes() : nodes;
  page.replaceChildren(...made);
  widget.refresh();
}
const visible = () => !widget.fab.hidden;
const okSend = (reply = 'Angka mana yang penting di soal ini?') => vi.fn(async () => ({ status: 'ok', reply, tokens: 700 }));

function mountWidget(sender) {
  send = sender;
  widget = createTutorWidget({ tutor, store, send: sender, root: document.body });
}

async function ask(text) {
  if (widget.panel.hidden) widget.fab.click();
  type($(widget.panel, '.tutor-input'), text);
  byText(widget.panel, tutor.messages.send).click();
  await flush();
}

const solve = (lesson, id) => () => solveScreen({ lesson, index: lesson.items.findIndex((i) => i.id === id), recallCard, go, onFinish: go });

beforeEach(() => {
  store.reset();
  store.update((s) => (s.grade = 7));
  clearEvents();
  page = document.createElement('div');
  page.id = 'app';
  document.body.append(page);
  mountWidget(okSend());
});

afterEach(() => {
  widget.destroy();
  page.remove();
  clearTutorContext();
});

describe('tombol tampil di halaman belajar & latihan M0–M4', () => {
  const pages = [
    ['M0 kartu pengingat', () => reminderScreen({ m0, skill: 'pecahan', index: 0, store, go }), { module: 'M0', kind: 'pengingat', ref: 'M0-P3-1' }],
    ['M0 cek kartu pengingat', () => reminderScreen({ m0, skill: 'pecahan', index: 2, store, go }), { module: 'M0', kind: 'latihan', ref: 'M0-P3-C' }],
    ['M1 materi', () => lessonScreen({ lesson: m1, index: 0, go }), { module: 'M1', kind: 'materi', ref: 'M1-01' }],
    ['M1 latihan', () => quizScreen({ lesson: m1, index: 0, go, onFinish: go }), { module: 'M1', kind: 'latihan', ref: 'M1-L1' }],
    ['M2 materi (M2-06)', () => lessonScreen({ lesson: m2, index: 5, go }), { module: 'M2', kind: 'materi', ref: 'M2-06' }],
    ['M2 latihan identifikasi', () => practiceScreen({ m2, index: 0, go, recallCard }), { module: 'M2', kind: 'identifikasi', ref: 'I1' }],
    ['M3 materi', () => lessonScreen({ lesson: m3, index: 0, go }), { module: 'M3', kind: 'materi', ref: m3.screens[0].id }],
    ['M3 soal setengah', solve(m3, 'M3-E2'), { module: 'M3', kind: 'soal', ref: 'M3-E2' }],
    ['M4 soal latihan', solve(m4, 'M4-L4'), { module: 'M4', kind: 'soal', ref: 'M4-L4', step: 'diketahui' }],
  ];
  for (const [name, screen, ctx] of pages) {
    it(name, () => {
      show(screen);
      expect(visible(), name).toBe(true);
      expect(getTutorContext()).toMatchObject(ctx);
      expect(document.body.classList.contains('tutor-on')).toBe(true);
    });
  }

  it('latihan mandiri: tombol tampil, panel hanya mengarahkan ke Petunjuk (tanpa AI, tanpa jatah)', async () => {
    show(solve(m3, 'M3-M1'));
    expect(visible()).toBe(true);
    widget.fab.click();
    expect(widget.panel.textContent).toContain(tutor.messages.mandiriRest);
    expect($(widget.panel, '.tutor-input')).toBeNull();
    await widget.submit();
    expect(send).not.toHaveBeenCalled();
    expect(store.get().tutor.count).toBe(0);
  });
});

describe('tombol TIDAK tampil: diagnostik, tes, penilaian, cek M2, peta belajar', () => {
  store.reset?.();
  const hidden = [
    ['diagnostik M0', () => diagnosticScreen({ m0, index: 0, store, go })],
    ['tes awal (pengantar)', () => mlIntroScreen({ test: mlTest, phase: 'awal', store, go })],
    ['tes awal (soal)', () => {
      store.update((s) => (s.ml.awal.startedAt = 'x'));
      return mlTaskScreen({ test: mlTest, phase: 'awal', index: 0, store, go });
    }],
    ['tes awal (PG)', () => mlMcqScreen({ test: mlTest, phase: 'awal', index: 0, store, go })],
    ['penilai', () => mlGraderHome({ test: mlTest, store, go })],
    ['cek pemahaman M2', () => checkScreen({ m2, store, go, recallCard, index: 'mulai', finishModule: go })],
    ['cek cepat M2', () => quickScreen({ m2, store, go, recallCard, index: 0, finishModule: go })],
    ['peta belajar', () => homeScreen({ state: store.get(), titles: {}, available: [], go, onReset: go })],
  ];
  for (const [name, screen] of hidden) {
    it(name, () => {
      show(solve(m3, 'M3-L1')); // sebelumnya di halaman yang tercakup
      widget.fab.click();
      show(screen);
      expect(visible(), name).toBe(false);
      expect(widget.panel.hidden, name).toBe(true); // panel ikut tertutup
      expect(document.body.classList.contains('tutor-on')).toBe(false);
    });
  }

  it('"jelaskan ke temanmu" M2 tidak memasang konteks', () => {
    store.update((s) => (s.m2.passed = true));
    show(() => explainScreen({ m2, store, go, recallCard, finishModule: go }));
    expect(visible()).toBe(false);
  });

  it('mode untuk konteks yang tidak dikenal = tidak tampil', () => {
    expect(tutorMode(tutor.settings, { module: 'M2', kind: 'latihan', ref: 'C1' })).toBeNull();
    expect(tutorMode(tutor.settings, { module: 'M3', kind: 'soal', ref: 'X', phase: 'akhir' })).toBeNull();
    expect(tutorMode(tutor.settings, null)).toBeNull();
  });
});

describe('panel di atas halaman (tidak pindah halaman)', () => {
  it('terbuka saat diketuk, menutup dengan Tutup/Esc; halaman soal tetap ada', () => {
    show(solve(m3, 'M3-L1'));
    const problem = $(page, '.problem');
    widget.fab.click();
    expect(widget.panel.hidden).toBe(false);
    expect(widget.panel.getAttribute('role')).toBe('dialog');
    expect(widget.panel.textContent).toContain('Jangan tulis namamu');
    expect($(page, '.problem')).toBe(problem);
    byText(widget.panel, tutor.messages.close).click();
    expect(widget.panel.hidden).toBe(true);
    expect(visible()).toBe(true);
    widget.fab.click();
    widget.panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(widget.panel.hidden).toBe(true);
    expect(pendingEvents().filter((e) => e.row.type === 'tutor_open')).toHaveLength(2);
  });

  it('di halaman dengan bilah navigasi, tombol diberi tanda agar berada di atasnya', () => {
    show(() => lessonScreen({ lesson: m1, index: 0, go }));
    expect(document.body.classList.contains('tutor-navbar')).toBe(true);
  });
});

describe('konteks yang dikirim sesuai halaman', () => {
  it('soal M3: langkah, kesalahan terakhir, petunjuk', async () => {
    show(solve(m3, 'M3-L1'));
    const cells = $$(page, '.cell-input');
    ['4', '7', '56.000', ''].forEach((v, i) => type(cells[i], v));
    byText(page, 'Periksa').click(); // salah → ambil_data
    startsWith(page, 'Petunjuk (').click();
    await ask('kenapa salah?');
    expect(send.mock.calls[0][0]).toEqual({
      module: 'M3', kind: 'soal', ref: 'M3-L1', twin: false, step: 'diketahui', errorType: 'ambil_data', hintLevel: 1, history: [], message: 'kenapa salah?',
    });
    expect($(widget.panel, '.tutor-reply').textContent).toContain('Angka mana yang penting');
    expect(widget.panel.textContent).toContain(tutor.messages.aiLabel);
  });

  it('latihan M1: kesalahan "jawaban" dan petunjuk ikut terkirim', async () => {
    show(() => quizScreen({ lesson: m1, index: 0, go, onFinish: go }));
    byText(page, '3 : 2').click(); // pilihan salah
    byText(page, 'Periksa').click();
    await ask('bingung');
    expect(send.mock.calls[0][0]).toMatchObject({ module: 'M1', kind: 'latihan', ref: 'M1-L1', errorType: 'jawaban' });
  });

  it('materi M2-06, identifikasi M2, kartu pengingat M0', async () => {
    show(() => lessonScreen({ lesson: m2, index: 5, go }));
    await ask('maksud tabel ini apa?');
    show(() => practiceScreen({ m2, index: 1, go, recallCard }));
    await ask('ini apa?');
    show(() => reminderScreen({ m0, skill: 'pecahan', index: 1, store, go }));
    await ask('kenapa dibagi 4?');
    expect(send.mock.calls.map((c) => [c[0].module, c[0].kind, c[0].ref])).toEqual([
      ['M2', 'materi', 'M2-06'], ['M2', 'identifikasi', m2.identify[1].id], ['M0', 'pengingat', 'M0-P3-2'],
    ]);
  });

  it('pindah halaman → percakapan baru (riwayat tidak terbawa)', async () => {
    show(() => lessonScreen({ lesson: m1, index: 0, go }));
    await ask('q1');
    await ask('q2');
    expect(send.mock.calls[1][0].history).toHaveLength(2);
    show(() => lessonScreen({ lesson: m1, index: 1, go }));
    expect(widget.panel.hidden).toBe(true); // pindah layar menutup panel
    widget.fab.click();
    expect($(widget.panel, '.tutor-reply')).toBeNull(); // percakapan baru
    expect(widget.panel.textContent).toContain('Jangan tulis namamu');
    await ask('q3');
    expect(send.mock.calls[2][0].history).toEqual([]);
  });

  it('balasan untuk halaman lama dibuang jika siswa sudah pindah halaman', async () => {
    let resolve;
    mountWidget(vi.fn(() => new Promise((r) => (resolve = r))));
    show(() => lessonScreen({ lesson: m1, index: 0, go }));
    widget.fab.click();
    type($(widget.panel, '.tutor-input'), 'q');
    byText(widget.panel, tutor.messages.send).click();
    show(() => lessonScreen({ lesson: m1, index: 1, go }));
    resolve({ status: 'ok', reply: 'BALASAN-LAMA' });
    await flush();
    expect(widget.panel.textContent).not.toContain('BALASAN-LAMA');
    expect(store.get().tutor.count).toBe(0);
  });
});

describe('jatah & pesan batas', () => {
  it('4/hari per perangkat untuk SELURUH aplikasi: pertanyaan ke-5 tidak dikirim', async () => {
    show(() => lessonScreen({ lesson: m1, index: 0, go }));
    await ask('1');
    await ask('2');
    show(solve(m4, 'M4-L1'));
    await ask('3');
    await ask('4');
    await ask('5');
    expect(send).toHaveBeenCalledTimes(4);
    expect(widget.panel.textContent).toContain(tutor.messages.limitDevice);
    expect(widget.panel.textContent).toContain('Sisa tanya hari ini: 0');
  });

  const cases = [['limit_busy', 'limitBusy'], ['limit_day', 'limitDay'], ['unavailable', 'unavailable'], ['disabled', 'disabled'], ['aneh', 'unavailable']];
  for (const [status, key] of cases) {
    it(`status ${status} → pesan jelas, jatah tetap, Petunjuk tetap bisa dipakai`, async () => {
      mountWidget(vi.fn(async () => ({ status })));
      show(solve(m3, 'M3-L1'));
      await ask('tolong');
      expect(widget.panel.textContent).toContain(tutor.messages[key]);
      expect(store.get().tutor.count).toBe(0);
      startsWith(page, 'Petunjuk (1').click();
      expect(page.textContent).toContain(`Petunjuk 1: ${m3.items.find((i) => i.id === 'M3-L1').hints[0]}`);
    });
  }

  it('pesan kosong → pesan menulis, tanpa mengirim', async () => {
    show(solve(m3, 'M3-L1'));
    await ask('   ');
    expect(send).not.toHaveBeenCalled();
    expect(widget.panel.textContent).toContain(tutor.messages.invalid);
  });

  it('teks yang sedang diketik tidak hilang saat layar soal digambar ulang', () => {
    show(solve(m3, 'M3-L1'));
    widget.fab.click();
    type($(widget.panel, '.tutor-input'), 'sedang mengetik');
    startsWith(page, 'Petunjuk (1').click();
    expect($(widget.panel, '.tutor-input').value).toBe('sedang mengetik');
  });
});

describe('privasi', () => {
  it('yang disimpan & dicatat hanya jumlah dan status, bukan isi percakapan', async () => {
    mountWidget(okSend('BALASAN-RAHASIA'));
    show(() => lessonScreen({ lesson: m2, index: 0, go }));
    await ask('PERTANYAAN-RAHASIA');
    for (const blob of [JSON.stringify(store.get()), JSON.stringify(pendingEvents())]) {
      expect(blob).not.toContain('PERTANYAAN-RAHASIA');
      expect(blob).not.toContain('BALASAN-RAHASIA');
    }
    expect(store.get().tutor).toEqual({ date: expect.any(String), count: 1 });
    expect(pendingEvents().find((e) => e.row.type === 'tutor_message').row).toMatchObject({
      module_id: 'M2', item_id: 'M2-01', payload: { kind: 'materi', step: null, status: 'ok', tokens: 700 },
    });
  });
});

describe('pengirim ke fungsi server', () => {
  it('POST JSON ke /.netlify/functions/tutor', async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ status: 'ok', reply: 'x' })));
    expect(await sendTutorRequest({ a: 1 }, f)).toEqual({ status: 'ok', reply: 'x' });
    expect(f.mock.calls[0][0]).toBe(TUTOR_ENDPOINT);
    expect(f.mock.calls[0][1]).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json' } });
  });

  it('tanpa server (404 HTML), offline, atau isi aneh → unavailable', async () => {
    expect(await sendTutorRequest({}, async () => new Response('<html>Not found</html>', { status: 404 }))).toEqual({ status: 'unavailable' });
    expect(await sendTutorRequest({}, async () => { throw new TypeError('offline'); })).toEqual({ status: 'unavailable' });
    expect(await sendTutorRequest({}, async () => new Response('{"x":1}'))).toEqual({ status: 'unavailable' });
  });
});

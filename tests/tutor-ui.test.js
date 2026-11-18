// @vitest-environment happy-dom
// Panel Tanya Nalls di layar soal, dengan pengirim TIRUAN (tanpa jaringan, tanpa API key).
import { describe, it, expect, beforeEach, vi } from 'vitest';
import m2 from '../src/content/m2.json';
import m3 from '../src/content/m3.json';
import m4 from '../src/content/m4.json';
import mlTest from '../src/content/ml-test.json';
import tutor from '../src/content/tutor.json';
import { solveScreen } from '../src/screens/solve.js';
import { mlTaskScreen, mlIntroScreen } from '../src/screens/mlTest.js';
import { quickScreen, checkScreen, practiceScreen } from '../src/screens/m2.js';
import { sendTutorRequest, TUTOR_ENDPOINT } from '../src/components/tutor.js';
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

function mount(lesson, id, send) {
  const root = document.createElement('div');
  const index = lesson.items.findIndex((i) => i.id === id);
  root.append(...solveScreen({ lesson, index, recallCard, go: () => {}, onFinish: () => {}, tutorSend: send }));
  return root;
}
const okSend = (reply = 'Angka mana yang penting di soal ini?') => vi.fn(async () => ({ status: 'ok', reply, tokens: 700 }));

async function ask(root, text) {
  if (!$(root, '.tutor-head')) startsWith(root, tutor.messages.open).click();
  type($(root, '.tutor-input'), text);
  byText(root, tutor.messages.send).click();
  await flush();
}

beforeEach(() => {
  store.reset();
  store.update((s) => (s.grade = 7));
  clearEvents();
});

describe('tempat panel', () => {
  it('muncul di soal terbimbing M3 dan M4 (setengah & latihan)', () => {
    for (const [lesson, id] of [[m3, 'M3-E2'], [m3, 'M3-L1'], [m4, 'M4-E3'], [m4, 'M4-L4']]) {
      const btn = startsWith(mount(lesson, id, okSend()), tutor.messages.open);
      expect(btn, id).toBeTruthy();
      expect(btn.textContent).toContain('Sisa tanya hari ini: 4');
    }
  });

  it('TIDAK muncul di latihan mandiri', () => {
    for (const [lesson, id] of [[m3, 'M3-M1'], [m3, 'M3-M3'], [m4, 'M4-M2']]) {
      expect($(mount(lesson, id, okSend()), '.tutor'), id).toBeNull();
    }
  });

  it('TIDAK muncul di tes literasi maupun cek M2', () => {
    store.update((s) => (s.ml.awal.startedAt = 'x'));
    const go = () => {};
    const screens = [
      mlIntroScreen({ test: mlTest, phase: 'awal', store, go }),
      mlTaskScreen({ test: mlTest, phase: 'awal', index: 0, store, go }),
      quickScreen({ m2, store, go, recallCard, index: 0, finishModule: () => {} }),
      checkScreen({ m2, store, go, recallCard, index: 'mulai', finishModule: () => {} }),
      practiceScreen({ m2, store, go, recallCard, index: 0, finishModule: () => {} }),
    ];
    for (const nodes of screens) {
      const root = document.createElement('div');
      root.append(...nodes);
      expect($(root, '.tutor')).toBeNull();
      expect(root.textContent).not.toContain('Tanya Nalls');
    }
  });

  it('hanya terbuka jika diketuk; menampilkan pengingat privasi', () => {
    const root = mount(m3, 'M3-L1', okSend());
    expect($(root, '.tutor-input')).toBeNull();
    startsWith(root, tutor.messages.open).click();
    expect(root.textContent).toContain('Jangan tulis namamu');
    expect(pendingEvents().some((e) => e.row.type === 'tutor_open')).toBe(true);
  });
});

describe('bertanya', () => {
  it('mengirim langkah, jenis kesalahan, tingkat petunjuk; balasan tampil dengan label AI; jatah berkurang', async () => {
    const send = okSend('Coba lihat lagi angka yang kamu tulis. Mana harga untuk 4 kg?');
    const root = mount(m3, 'M3-L1', send);
    // salah di langkah 1 → errorType ambil_data
    const cells = $$(root, '.cell-input');
    ['4', '7', '56.000', ''].forEach((v, i) => type(cells[i], v));
    byText(root, 'Periksa').click();
    await ask(root, 'kenapa salah?');
    expect(send.mock.calls[0][0]).toMatchObject({ module: 'M3', itemId: 'M3-L1', step: 'diketahui', errorType: 'ambil_data', hintLevel: 0, message: 'kenapa salah?', history: [] });
    expect($(root, '.tutor-reply').textContent).toContain('Mana harga untuk 4 kg?');
    expect(root.textContent).toContain(tutor.messages.aiLabel);
    expect(store.get().tutor).toMatchObject({ count: 1 });
    expect(root.textContent).toContain('Sisa tanya hari ini: 3');
  });

  it('pertanyaan kedua membawa riwayat singkat (hanya di memori)', async () => {
    const send = okSend();
    const root = mount(m3, 'M3-L1', send);
    await ask(root, 'q1');
    await ask(root, 'q2');
    expect(send.mock.calls[1][0].history).toEqual([{ role: 'user', content: 'q1' }, { role: 'assistant', content: 'Angka mana yang penting di soal ini?' }]);
  });

  it('pesan kosong → pesan petunjuk menulis, tanpa mengirim', async () => {
    const send = okSend();
    const root = mount(m3, 'M3-L1', send);
    await ask(root, '   ');
    expect(send).not.toHaveBeenCalled();
    expect(root.textContent).toContain(tutor.messages.invalid);
  });
});

describe('batas penggunaan', () => {
  it('jatah 4/hari per perangkat: pertanyaan ke-5 tidak dikirim', async () => {
    const send = okSend();
    const root = mount(m3, 'M3-L1', send);
    for (let i = 1; i <= 5; i++) await ask(root, `pertanyaan ${i}`);
    expect(send).toHaveBeenCalledTimes(4);
    expect(root.textContent).toContain(tutor.messages.limitDevice);
    expect(pendingEvents().filter((e) => e.row.type === 'tutor_message').map((e) => e.row.payload.status)).toEqual(['ok', 'ok', 'ok', 'ok', 'limit_device']);
  });

  const cases = [['limit_busy', 'limitBusy'], ['limit_day', 'limitDay'], ['unavailable', 'unavailable'], ['disabled', 'disabled'], ['aneh', 'unavailable']];
  for (const [status, key] of cases) {
    it(`status ${status} → pesan jelas, jatah tidak berkurang, Petunjuk tetap bisa dipakai`, async () => {
      const root = mount(m3, 'M3-L1', vi.fn(async () => ({ status })));
      await ask(root, 'tolong');
      expect(root.textContent).toContain(tutor.messages[key]);
      expect(store.get().tutor.count).toBe(0);
      startsWith(root, 'Petunjuk (1').click();
      expect(root.textContent).toContain(`Petunjuk 1: ${m3.items.find((i) => i.id === 'M3-L1').hints[0]}`);
    });
  }

  it('teks yang sedang diketik tidak hilang saat layar soal digambar ulang', () => {
    const root = mount(m3, 'M3-L1', okSend());
    startsWith(root, tutor.messages.open).click();
    type($(root, '.tutor-input'), 'sedang mengetik');
    startsWith(root, 'Petunjuk (1').click();
    expect($(root, '.tutor-input').value).toBe('sedang mengetik');
  });
});

describe('privasi', () => {
  it('yang disimpan & dicatat hanya jumlah dan status, bukan isi percakapan', async () => {
    const root = mount(m3, 'M3-L1', okSend('BALASAN-RAHASIA'));
    await ask(root, 'PERTANYAAN-RAHASIA');
    const saved = JSON.stringify(store.get());
    const events = JSON.stringify(pendingEvents());
    for (const blob of [saved, events]) {
      expect(blob).not.toContain('PERTANYAAN-RAHASIA');
      expect(blob).not.toContain('BALASAN-RAHASIA');
    }
    expect(store.get().tutor).toEqual({ date: expect.any(String), count: 1 });
    expect(pendingEvents().find((e) => e.row.type === 'tutor_message').row.payload).toEqual({ step: 1, status: 'ok', tokens: 700 });
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

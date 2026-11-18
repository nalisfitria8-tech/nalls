// Fungsi server Tanya Nalls dengan Groq TIRUAN: tanpa internet, tanpa API key asli, tanpa kuota.
import { describe, it, expect, vi, afterEach } from 'vitest';
import tutor from '../src/content/tutor.json';
import m3 from '../src/content/m3.json';
import handler, { handleTutor, validateRequest, classifyRateLimit, GROQ_URL, DEFAULT_MODEL, LIMITS } from '../netlify/functions/tutor.js';

const FAKE_KEY = 'gsk_TIRUAN_bukan_kunci_asli';
const ENV = { TUTOR_ENABLED: 'true', GROQ_API_KEY: FAKE_KEY };
const L1 = m3.items.find((i) => i.id === 'M3-L1'); // kunci 98.000
const BODY = { module: 'M3', itemId: 'M3-L1', step: 'hitung', errorType: 'rumus', hintLevel: 1, history: [], message: 'aku bingung harus kali atau bagi' };

/** Groq tiruan: mengembalikan status/isi/header yang ditentukan dan mencatat permintaannya. */
function fakeGroq({ status = 200, json = null, headers = {}, throws = null, hang = false } = {}) {
  const calls = [];
  const fn = vi.fn(async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    if (throws) throw throws;
    if (hang) {
      return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted'))));
    }
    return new Response(JSON.stringify(json ?? {}), { status, headers });
  });
  fn.calls = calls;
  return fn;
}
const reply = (content, total = 640) => ({ choices: [{ message: { content } }], usage: { total_tokens: total } });

afterEach(() => vi.restoreAllMocks());

describe('saklar dan kunci', () => {
  it('bawaan MATI: tanpa TUTOR_ENABLED=true tidak ada panggilan ke Groq', async () => {
    const f = fakeGroq();
    for (const env of [{}, { GROQ_API_KEY: FAKE_KEY }, { TUTOR_ENABLED: '1', GROQ_API_KEY: FAKE_KEY }]) {
      expect((await handleTutor(BODY, { env, fetchImpl: f })).body).toEqual({ status: 'disabled' });
    }
    expect(f).not.toHaveBeenCalled();
  });

  it('kunci belum diatur → tidak tersedia, tanpa panggilan', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fakeGroq();
    expect((await handleTutor(BODY, { env: { TUTOR_ENABLED: 'true' }, fetchImpl: f })).body).toEqual({ status: 'unavailable' });
    expect(f).not.toHaveBeenCalled();
  });
});

describe('validasi permintaan (tanpa panggilan ke Groq)', () => {
  const bad = [
    ['modul bukan M3/M4', { ...BODY, module: 'M2' }],
    ['soal mandiri', { ...BODY, itemId: 'M3-M1' }],
    ['soal tidak dikenal', { ...BODY, itemId: 'M3-X9' }],
    ['langkah tidak dikenal', { ...BODY, step: 'bentuk' }],
    ['pesan kosong', { ...BODY, message: '  ' }],
    ['pesan > 200 huruf', { ...BODY, message: 'a'.repeat(201) }],
    ['bukan objek', null],
  ];
  for (const [name, body] of bad) {
    it(name, async () => {
      const f = fakeGroq();
      expect(await handleTutor(body, { env: ENV, fetchImpl: f })).toEqual({ httpStatus: 400, body: { status: 'invalid' } });
      expect(f).not.toHaveBeenCalled();
    });
  }

  it('tingkat petunjuk & jenis kesalahan yang aneh dinormalkan', () => {
    const v = validateRequest({ ...BODY, hintLevel: 99, errorType: 'hack' });
    expect(v).toMatchObject({ ok: true, hintLevel: 3, errorType: null });
  });
});

describe('panggilan ke Groq', () => {
  it('permintaan hemat: model gpt-oss-120b, berpikir rendah, tanpa teks berpikir, maks. 350 token, kunci hanya di header', async () => {
    const f = fakeGroq({ json: reply('Coba ingat: untuk senilai, yang tetap hasil bagi atau hasil kali?') });
    const out = await handleTutor({ ...BODY, message: 'wa aku 081234567890, bingung' }, { env: ENV, fetchImpl: f });
    expect(out).toEqual({ httpStatus: 200, body: { status: 'ok', reply: 'Coba ingat: untuk senilai, yang tetap hasil bagi atau hasil kali?', tokens: 640 } });
    const { url, init, body } = f.calls[0];
    expect(url).toBe(GROQ_URL);
    expect(init.headers.Authorization).toBe(`Bearer ${FAKE_KEY}`);
    expect(body).toMatchObject({ model: DEFAULT_MODEL, max_completion_tokens: LIMITS.maxCompletionTokens, reasoning_effort: 'low', include_reasoning: false, stream: false });
    expect(DEFAULT_MODEL).toBe('openai/gpt-oss-120b');
    expect(body.messages[0].content).toContain(tutor.stepFocus.hitung);
    expect(body.messages.at(-1)).toEqual({ role: 'user', content: 'wa aku [nomor], bingung' }); // nomor HP disamarkan
    expect(JSON.stringify(out)).not.toContain(FAKE_KEY);
  });

  it('model bisa diganti lewat TUTOR_MODEL tanpa mengubah kode', async () => {
    const f = fakeGroq({ json: reply('Apa yang ditanya?') });
    await handleTutor(BODY, { env: { ...ENV, TUTOR_MODEL: 'model-lain' }, fetchImpl: f });
    expect(f.calls[0].body.model).toBe('model-lain');
  });

  it('balasan memuat jawaban akhir → diganti petunjuk berikutnya (guarded)', async () => {
    const f = fakeGroq({ json: reply('Gampang, jawabannya Rp98.000 ya!') });
    const out = await handleTutor(BODY, { env: ENV, fetchImpl: f });
    expect(out.body).toMatchObject({ status: 'guarded', reply: L1.hints[1] });
  });

  it('balasan kosong (misal habis token saat berpikir) → petunjuk, bukan galat', async () => {
    const f = fakeGroq({ json: { choices: [{ message: { content: '' }, finish_reason: 'length' }] } });
    expect((await handleTutor(BODY, { env: ENV, fetchImpl: f })).body).toMatchObject({ status: 'guarded', reply: L1.hints[1], tokens: null });
  });
});

describe('batas Groq dan galat → pesan yang jelas (Petunjuk tetap bisa dipakai)', () => {
  const cases = [
    ['429 per menit (retry-after 20 dtk)', { status: 429, headers: { 'retry-after': '20' }, json: { error: { message: 'Rate limit reached ... tokens per minute (TPM)' } } }, 'limit_busy'],
    ['429 batas token per hari', { status: 429, headers: { 'retry-after': '30' }, json: { error: { message: 'Rate limit reached ... tokens per day (TPD): Limit 200000' } } }, 'limit_day'],
    ['429 permintaan per hari habis (header)', { status: 429, headers: { 'x-ratelimit-remaining-requests': '0' } }, 'limit_day'],
    ['429 retry-after lama', { status: 429, headers: { 'retry-after': '3600' } }, 'limit_day'],
    ['413 permintaan terlalu besar untuk jatah per menit', { status: 413 }, 'limit_busy'],
    ['401 kunci ditolak', { status: 401 }, 'unavailable'],
    ['500 server Groq', { status: 500 }, 'unavailable'],
    ['jaringan putus', { throws: new TypeError('fetch failed') }, 'unavailable'],
  ];
  for (const [name, opts, expected] of cases) {
    it(name, async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const out = await handleTutor(BODY, { env: ENV, fetchImpl: fakeGroq(opts) });
      expect(out.body).toEqual({ status: expected });
      expect(tutor.messages[{ limit_busy: 'limitBusy', limit_day: 'limitDay', unavailable: 'unavailable' }[expected]]).toContain('Petunjuk');
    });
  }

  it('Groq terlalu lama → dihentikan (batas waktu) → tidak tersedia', async () => {
    const out = await handleTutor(BODY, { env: ENV, fetchImpl: fakeGroq({ hang: true }), timeoutMs: 30 });
    expect(out.body).toEqual({ status: 'unavailable' });
  });

  it('pembeda batas harian/menit', () => {
    const h = (o) => new Headers(o);
    expect(classifyRateLimit(429, h({ 'retry-after': '5' }), '')).toBe('limit_busy');
    expect(classifyRateLimit(429, h({}), 'requests per day (RPD)')).toBe('limit_day');
  });
});

describe('privasi: kunci dan isi pesan tidak pernah tercatat', () => {
  it('log galat tidak memuat kunci maupun pesan siswa', async () => {
    const logs = [];
    for (const m of ['log', 'info', 'warn', 'error']) vi.spyOn(console, m).mockImplementation((...a) => logs.push(a.join(' ')));
    await handleTutor(BODY, { env: ENV, fetchImpl: fakeGroq({ status: 401 }) });
    await handleTutor(BODY, { env: ENV, fetchImpl: fakeGroq({ json: reply('Apa yang ditanya?') }) });
    await handleTutor(BODY, { env: { TUTOR_ENABLED: 'true' }, fetchImpl: fakeGroq() });
    const all = logs.join('\n');
    expect(all).not.toContain(FAKE_KEY);
    expect(all).not.toContain(BODY.message);
  });
});

describe('penangan HTTP Netlify', () => {
  const post = (body, type = 'application/json') =>
    new Request('http://localhost/.netlify/functions/tutor', { method: 'POST', headers: { 'content-type': type }, body });

  it('hanya POST JSON; tidak disimpan cache', async () => {
    expect((await handler(new Request('http://localhost/x', { method: 'GET' }))).status).toBe(405);
    expect((await handler(post('{}', 'text/plain'))).status).toBe(415);
    expect((await handler(post('{rusak'))).status).toBe(400);
    expect((await handler(post('x'.repeat(LIMITS.maxBodyBytes + 1)))).status).toBe(413);
  });

  it('tanpa TUTOR_ENABLED di lingkungan → status disabled (tidak memanggil apa pun)', async () => {
    const before = process.env.TUTOR_ENABLED;
    delete process.env.TUTOR_ENABLED;
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await handler(post(JSON.stringify(BODY)));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ status: 'disabled' });
    expect(fetchSpy).not.toHaveBeenCalled();
    if (before !== undefined) process.env.TUTOR_ENABLED = before;
  });
});

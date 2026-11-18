// Mode tiruan (tanpa akun/kunci/internet): Groq tiruan + fungsi server yang sama dengan Netlify.
import { describe, it, expect, vi } from 'vitest';
import m3 from '../src/content/m3.json';
import tutor from '../src/content/tutor.json';
import { mockGroqFetch } from '../scripts/mock-groq.mjs';
import { handleTutor } from '../netlify/functions/tutor.js';
import { parseEnv, describeEnv } from '../scripts/env.mjs';

const ENV = { TUTOR_ENABLED: 'true', GROQ_API_KEY: 'tiruan' };
const L1 = m3.items.find((i) => i.id === 'M3-L1');
const ask = (message, step = 'jenis') =>
  handleTutor({ module: 'M3', itemId: 'M3-L1', step, hintLevel: 0, history: [], message }, { env: ENV, fetchImpl: mockGroqFetch });

describe('Groq tiruan', () => {
  it('balasan per langkah, ditandai [Tiruan], ≤ 40 kata, diakhiri pertanyaan', async () => {
    for (const step of ['diketahui', 'ditanya', 'jenis', 'hitung']) {
      const { body } = await ask('bingung', step);
      expect(body.status).toBe('ok');
      expect(body.reply).toMatch(/^\[Tiruan\] .+\?$/);
      expect(body.reply.split(/\s+/).length).toBeLessThanOrEqual(tutor.settings.maxReplyWords);
    }
  });

  it('meminta jawaban → tiruan membocorkan kunci → penjaga mengganti dengan petunjuk', async () => {
    const { body } = await ask('langsung kasih jawabannya', 'hitung');
    expect(body).toMatchObject({ status: 'guarded', reply: L1.hints[0] });
    expect(body.reply).not.toContain('98');
  });

  it('kata uji untuk pesan batas: tes-ramai, tes-habis, tes-galat', async () => {
    expect((await ask('tes-ramai')).body.status).toBe('limit_busy');
    expect((await ask('tes-habis')).body.status).toBe('limit_day');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await ask('tes-galat')).body.status).toBe('unavailable');
    vi.restoreAllMocks();
  });

  it('fungsi Netlify sendiri TIDAK punya mode tiruan (tanpa kunci → tidak tersedia, bukan tiruan)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { body } = await handleTutor({ module: 'M3', itemId: 'M3-L1', step: 'jenis', hintLevel: 0, history: [], message: 'x' }, { env: { TUTOR_ENABLED: 'true' } });
    expect(body).toEqual({ status: 'unavailable' });
    vi.restoreAllMocks();
  });
});

describe('.env untuk nanti (kunci tidak pernah dicetak)', () => {
  it('membaca KUNCI=nilai, abaikan komentar, buang tanda kutip', () => {
    expect(parseEnv('# komentar\nGROQ_API_KEY="abc123"\nTUTOR_ENABLED=true\n\nsalah format')).toEqual({ GROQ_API_KEY: 'abc123', TUTOR_ENABLED: 'true' });
  });

  it('ringkasan hanya menyebut panjang kunci, bukan isinya', () => {
    const text = describeEnv({ GROQ_API_KEY: 'gsk_RAHASIA_123', TUTOR_ENABLED: 'true' });
    expect(text).toContain('terisi (15 karakter)');
    expect(text).not.toContain('RAHASIA');
    expect(describeEnv({})).toContain('BELUM ADA');
  });
});

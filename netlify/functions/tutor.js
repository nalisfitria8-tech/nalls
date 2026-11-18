/**
 * Netlify Function: Tanya Nalls (F18, fitur pendukung).
 * POST /.netlify/functions/tutor  { module, itemId, step, errorType, hintLevel, history, message }
 *   → { status, reply? }   status: lihat STATUS di src/engine/tutorPolicy.js
 *
 * Variabel lingkungan (diatur pemilik proyek di dasbor Netlify, BUKAN di kode/Git):
 *   GROQ_API_KEY   kunci Groq (paket Free). Tidak pernah dikirim ke browser atau dicatat.
 *   TUTOR_ENABLED  "true" untuk menyalakan; selain itu chatbot mati (bawaan: mati).
 *   TUTOR_MODEL    bawaan "openai/gpt-oss-120b".
 *
 * Tidak menyimpan apa pun: tanpa basis data, tanpa log isi pesan. Jatah per siswa
 * dihitung di perangkat (lihat docs/architecture.md: keterbatasannya).
 */
import tutor from '../../src/content/tutor.json';
import m3 from '../../src/content/m3.json';
import m4 from '../../src/content/m4.json';
import {
  STATUS, TUTOR_STEPS, tutorAllowed, sanitizeMessage, buildMessages, finalizeReply, fallbackReply,
} from '../../src/engine/tutorPolicy.js';

export const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const DEFAULT_MODEL = 'openai/gpt-oss-120b';
export const LIMITS = {
  maxBodyBytes: 8000, // permintaan dari aplikasi jauh lebih kecil
  maxCompletionTokens: 350, // proses berpikir + balasan ±40 kata
  timeoutMs: 8000, // jauh di bawah batas 60 detik fungsi Netlify
};
const MODULES = { M3: m3, M4: m4 };
const ERROR_TYPES = ['ambil_data', 'jenis', 'rumus', 'hitung', 'kewajaran'];

/** Memeriksa isi permintaan. Mengembalikan { ok, item, step, ... } atau { ok: false }. */
export function validateRequest(body) {
  if (!body || typeof body !== 'object') return { ok: false };
  const lesson = MODULES[body.module];
  const item = lesson?.items.find((i) => i.id === body.itemId);
  if (!tutorAllowed(tutor.settings, body.module, item)) return { ok: false };
  if (!TUTOR_STEPS.includes(body.step)) return { ok: false };
  const msg = sanitizeMessage(body.message, tutor.settings.maxMessageChars);
  if (!msg.ok) return { ok: false };
  const hintLevel = Number.isInteger(body.hintLevel) ? Math.min(Math.max(body.hintLevel, 0), 3) : 0;
  const errorType = ERROR_TYPES.includes(body.errorType) ? body.errorType : null;
  return { ok: true, item, step: body.step, hintLevel, errorType, history: body.history, message: msg.text };
}

/** Groq 429: batas harian (token/permintaan per hari) atau batas per menit. */
export function classifyRateLimit(status, headers, errorMessage = '') {
  if (status === 413) return STATUS.LIMIT_BUSY; // satu permintaan melebihi jatah per menit
  const retryAfter = Number(headers.get('retry-after'));
  const perDay = /per day|\bTPD\b|\bRPD\b/i.test(errorMessage) || headers.get('x-ratelimit-remaining-requests') === '0';
  return perDay || retryAfter > 120 ? STATUS.LIMIT_DAY : STATUS.LIMIT_BUSY;
}

/**
 * Inti fungsi (bisa dites tanpa jaringan): env & fetch disuntikkan.
 * Mengembalikan { httpStatus, body }.
 */
export async function handleTutor(body, { env = {}, fetchImpl = fetch, timeoutMs = LIMITS.timeoutMs } = {}) {
  if (env.TUTOR_ENABLED !== 'true') return { httpStatus: 200, body: { status: STATUS.DISABLED } };
  if (!env.GROQ_API_KEY) {
    console.error('tutor: GROQ_API_KEY belum diatur di Netlify');
    return { httpStatus: 200, body: { status: STATUS.UNAVAILABLE } };
  }
  const req = validateRequest(body);
  if (!req.ok) return { httpStatus: 400, body: { status: STATUS.INVALID } };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.TUTOR_MODEL || DEFAULT_MODEL,
        messages: buildMessages(tutor, req.item, req),
        max_completion_tokens: LIMITS.maxCompletionTokens,
        reasoning_effort: 'low',
        include_reasoning: false,
        stream: false,
      }),
      signal: controller.signal,
    });
  } catch {
    return { httpStatus: 200, body: { status: STATUS.UNAVAILABLE } }; // jaringan putus / terlalu lama
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429 || res.status === 413) {
    let message = '';
    try {
      message = (await res.json())?.error?.message ?? '';
    } catch {
      /* isi galat bukan JSON */
    }
    return { httpStatus: 200, body: { status: classifyRateLimit(res.status, res.headers, message) } };
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) console.error('tutor: kunci Groq ditolak (periksa GROQ_API_KEY)');
    return { httpStatus: 200, body: { status: STATUS.UNAVAILABLE } };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return { httpStatus: 200, body: { status: STATUS.UNAVAILABLE } };
  }
  const raw = data?.choices?.[0]?.message?.content;
  const { text, status } = raw
    ? finalizeReply(raw, tutor, req.item, req)
    : { text: fallbackReply(tutor, req.item, req.step, req.hintLevel), status: STATUS.GUARDED };
  const tokens = Number.isInteger(data?.usage?.total_tokens) ? data.usage.total_tokens : null;
  return { httpStatus: 200, body: { status, reply: text, tokens } };
}

const json = (httpStatus, body) =>
  new Response(JSON.stringify(body), {
    status: httpStatus,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

/** Penangan Netlify Functions (format Request → Response). */
export default async function handler(request) {
  if (request.method !== 'POST') return json(405, { status: STATUS.INVALID });
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json(415, { status: STATUS.INVALID });
  const raw = await request.text();
  if (raw.length > LIMITS.maxBodyBytes) return json(413, { status: STATUS.INVALID });
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { status: STATUS.INVALID });
  }
  const { httpStatus, body: out } = await handleTutor(body, { env: process.env });
  return json(httpStatus, out);
}

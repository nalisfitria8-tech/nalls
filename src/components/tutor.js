/**
 * Tanya Nalls (F18) — tombol mengambang di pojok kanan bawah untuk halaman belajar & latihan
 * M0–M4 (KP-36). Panel terbuka di atas halaman (tanpa pindah halaman):
 *   HP: lembar dari bawah (maks. ±75% tinggi layar) · laptop: kartu ±380 px di pojok kanan bawah.
 *
 * - Konteks dari components/tutorContext.js (diisi tiap layar); tanpa konteks → tombol tidak tampil.
 * - Latihan mandiri: tombol tetap tampil, panel hanya mengarahkan ke Petunjuk (tanpa AI, tanpa jatah).
 * - Jatah harian per perangkat (tutor.json → settings.dailyPerDevice) dihitung di penyimpanan
 *   perangkat. Pembatasan SEDERHANA: bisa dilewati (hapus data browser, mode penyamaran, perangkat
 *   lain). Batas sesungguhnya tetap batas akun Groq Free.
 * - Isi percakapan hanya ada di memori (hilang saat pindah layar/soal); yang disimpan & dicatat
 *   hanya jumlah dan status.
 */
import { h, fill } from './dom.js';
import { feedbackBox } from './question.js';
import { STATUS, STATUS_MESSAGE, sanitizeMessage, quotaStatus, consumeQuota, kindAllowed } from '../engine/tutorPolicy.js';
import { getTutorContext, onTutorContext } from './tutorContext.js';
import { logEvent } from '../data/logger.js';

export const TUTOR_ENDPOINT = '/.netlify/functions/tutor';

/** Mengirim ke fungsi server. Galat apa pun (offline, 404 tanpa server, bukan JSON) → unavailable. */
export async function sendTutorRequest(payload, fetchImpl = globalThis.fetch) {
  try {
    const res = await fetchImpl(TUTOR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data && typeof data.status === 'string' ? data : { status: STATUS.UNAVAILABLE };
  } catch {
    return { status: STATUS.UNAVAILABLE };
  }
}

/** 'ai' (boleh bertanya), 'mandiri' (tombol tampil, tanpa AI), atau null (tidak tampil). */
export function tutorMode(settings, ctx) {
  if (!ctx) return null;
  if (ctx.kind === 'mandiri') return 'mandiri';
  if (!kindAllowed(settings, ctx.module, ctx.kind)) return null;
  if (ctx.kind === 'soal' && !settings.phases.includes(ctx.phase)) return null;
  return 'ai';
}

const keyOf = (c) => (c ? `${c.module}|${c.kind}|${c.ref}|${c.twin ? 'K' : ''}` : '');

/**
 * Tombol + panel. Dipasang SEKALI (main.js) ke `root` (bawaan document.body).
 * tutor = isi tutor.json · store = penyimpanan perangkat (hanya { date, count }) · send = pengirim (bisa diganti di tes)
 */
export function createTutorWidget({ tutor, store, send = sendTutorRequest, now = () => new Date(), root = document.body, doc = document }) {
  const t = tutor.messages;
  const limit = tutor.settings.dailyPerDevice;
  const fab = h('button', { type: 'button', class: 'tutor-fab', 'aria-expanded': 'false', 'aria-controls': 'tutor-panel', hidden: true },
    h('span', { class: 'tutor-fab-icon', 'aria-hidden': 'true' }, '?'), h('span', {}, t.open));
  const panel = h('section', { id: 'tutor-panel', class: 'tutor-panel', role: 'dialog', 'aria-label': t.open, hidden: true });
  const input = h('input', {
    type: 'text',
    class: 'answer-input tutor-input',
    maxlength: String(tutor.settings.maxMessageChars),
    autocomplete: 'off',
    placeholder: t.placeholder,
    'aria-label': t.placeholder,
  });
  root.append(fab, panel);

  let open = false;
  let waiting = false;
  let last = null; // { question, reply }
  let notice = null;
  let history = []; // { role, content } — hanya di memori
  let key = '';

  const quota = () => quotaStatus(store.get().tutor, limit, now());

  function resetFor(ctx) {
    const k = keyOf(ctx);
    if (k === key) return;
    key = k;
    history = [];
    last = null;
    notice = null;
  }

  async function submit() {
    const ctx = getTutorContext();
    if (waiting || tutorMode(tutor.settings, ctx) !== 'ai') return;
    const msg = sanitizeMessage(input.value, tutor.settings.maxMessageChars);
    if (!msg.ok) {
      notice = t.invalid;
      return draw();
    }
    const logBase = { module_id: ctx.module, item_id: ctx.ref };
    if (!quota().allowed) {
      notice = t.limitDevice;
      logEvent('tutor_message', { ...logBase, payload: { kind: ctx.kind, step: ctx.step ?? null, status: STATUS.LIMIT_DEVICE, tokens: null } });
      return draw();
    }
    waiting = true;
    notice = null;
    draw();
    const res = await send({
      module: ctx.module,
      kind: ctx.kind,
      ref: ctx.ref,
      twin: Boolean(ctx.twin),
      step: ctx.step ?? null,
      errorType: ctx.errorType ?? null,
      hintLevel: ctx.hintLevel ?? 0,
      history: history.slice(-tutor.settings.historyTurns * 2),
      message: msg.text,
    });
    waiting = false;
    // pindah halaman saat menunggu → balasan untuk halaman lama dibuang
    if (keyOf(getTutorContext()) !== keyOf(ctx)) return draw();
    const status = Object.values(STATUS).includes(res.status) ? res.status : STATUS.UNAVAILABLE;
    if ((status === STATUS.OK || status === STATUS.GUARDED) && typeof res.reply === 'string') {
      store.update((s) => (s.tutor = consumeQuota(s.tutor, status, now())));
      history.push({ role: 'user', content: msg.text }, { role: 'assistant', content: res.reply });
      last = { question: msg.text, reply: res.reply };
      input.value = '';
    } else {
      notice = t[STATUS_MESSAGE[status] ?? 'unavailable'];
    }
    logEvent('tutor_message', { ...logBase, payload: { kind: ctx.kind, step: ctx.step ?? null, status, tokens: Number.isInteger(res.tokens) ? res.tokens : null } });
    draw();
  }

  function setOpen(value) {
    open = value;
    const ctx = getTutorContext();
    if (open && ctx) logEvent('tutor_open', { module_id: ctx.module, item_id: ctx.ref, payload: { kind: ctx.kind, step: ctx.step ?? null } });
    draw();
    if (open && tutorMode(tutor.settings, ctx) === 'ai') input.focus();
    if (!open) fab.focus();
  }

  function draw() {
    const ctx = getTutorContext();
    const mode = tutorMode(tutor.settings, ctx);
    resetFor(mode ? ctx : null);
    if (!mode) open = false; // halaman tanpa Tanya Nalls (tes, penilai, …) menutup panel
    const body = doc.body;
    body?.classList.toggle('tutor-on', Boolean(mode));
    body?.classList.toggle('tutor-navbar', Boolean(doc.querySelector('#app .navbar')));
    fab.hidden = !mode || open;
    fab.setAttribute('aria-expanded', String(open && Boolean(mode)));
    panel.hidden = !mode || !open;
    if (!mode || !open) return;

    const head = h('div', { class: 'tutor-head' },
      h('strong', {}, t.open),
      h('button', { type: 'button', class: 'small link', onClick: () => setOpen(false) }, t.close));
    if (mode === 'mandiri') return fill(panel, head, h('p', {}, t.mandiriRest));

    const q = quota();
    const sendBtn = h('button', { type: 'button', class: 'primary', disabled: waiting, onClick: submit }, t.send);
    fill(
      panel,
      head,
      last
        ? h('div', { class: 'tutor-turn' },
            h('p', { class: 'tutor-question' }, h('strong', {}, 'Kamu: '), last.question),
            h('p', { class: 'tutor-reply', 'aria-live': 'polite' }, h('strong', {}, 'Nalls: '), last.reply),
            h('p', { class: 'note ml-note tutor-label' }, t.aiLabel))
        : h('p', { class: 'note ml-note' }, t.intro),
      waiting ? h('p', { class: 'note ml-note', 'aria-live': 'polite' }, t.waiting) : null,
      notice ? feedbackBox('info', null, notice) : null,
      h('div', { class: 'tutor-form' }, input, sendBtn),
      h('p', { class: 'note ml-note' }, t.remaining.replace('{n}', q.remaining)),
    );
  }

  fab.addEventListener('click', () => setOpen(true));
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  });
  const unsubscribe = onTutorContext(() => draw());
  draw();
  const destroy = () => {
    unsubscribe();
    fab.remove();
    panel.remove();
  };
  return { fab, panel, refresh: draw, submit, open: () => setOpen(true), close: () => setOpen(false), destroy };
}

/**
 * Panel "Tanya Nalls" (F18, fitur pendukung) di layar soal 4 langkah, fase terbimbing M3–M4.
 *
 * - Terbuka hanya jika siswa mengetuk tombolnya; satu pertanyaan & satu balasan terlihat.
 * - Jatah harian per perangkat (tutor.json → settings.dailyPerDevice) dihitung di
 *   penyimpanan perangkat. Ini pembatasan SEDERHANA: bisa dilewati (hapus data browser,
 *   mode penyamaran, perangkat lain). Batas yang sesungguhnya tetap batas akun Groq Free.
 * - Isi percakapan hanya ada di memori panel (hilang saat pindah soal); yang disimpan &
 *   dicatat hanya jumlah dan status.
 */
import { h, fill } from './dom.js';
import { feedbackBox } from './question.js';
import { STATUS, STATUS_MESSAGE, TUTOR_STEPS, sanitizeMessage, quotaStatus, consumeQuota } from '../engine/tutorPolicy.js';
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

/**
 * tutor     isi tutor.json
 * moduleId  'M3' | 'M4'
 * context() → { item, step (1–4), errorType, hintLevel } keadaan soal saat ini
 * store     penyimpanan perangkat (src/data/store.js) — hanya { date, count }
 * send      pengirim (bisa diganti di tes)
 */
export function tutorPanel({ tutor, moduleId, context, store, send = sendTutorRequest, now = () => new Date() }) {
  const t = tutor.messages;
  const limit = tutor.settings.dailyPerDevice;
  const root = h('section', { class: 'tutor', 'aria-label': t.open });
  const history = []; // { role, content } — hanya di memori
  let open = false;
  let waiting = false;
  let last = null; // { question, reply, status }
  let notice = null; // teks pesan batas/galat

  const input = h('input', {
    type: 'text',
    class: 'answer-input tutor-input',
    maxlength: String(tutor.settings.maxMessageChars),
    autocomplete: 'off',
    placeholder: t.placeholder,
    'aria-label': t.placeholder,
  });
  const quota = () => quotaStatus(store.get().tutor, limit, now());

  async function submit() {
    if (waiting) return;
    const { item, step, errorType, hintLevel } = context();
    const msg = sanitizeMessage(input.value, tutor.settings.maxMessageChars);
    if (!msg.ok) {
      notice = t.invalid;
      return draw();
    }
    if (!quota().allowed) {
      notice = t.limitDevice;
      logEvent('tutor_message', { module_id: moduleId, item_id: item.id, payload: { step, status: STATUS.LIMIT_DEVICE } });
      return draw();
    }
    waiting = true;
    notice = null;
    draw();
    const res = await send({
      module: moduleId,
      itemId: item.id,
      step: TUTOR_STEPS[step - 1],
      errorType: errorType ?? null,
      hintLevel,
      history: history.slice(-tutor.settings.historyTurns * 2),
      message: msg.text,
    });
    waiting = false;
    const status = Object.values(STATUS).includes(res.status) ? res.status : STATUS.UNAVAILABLE;
    if ((status === STATUS.OK || status === STATUS.GUARDED) && typeof res.reply === 'string') {
      store.update((s) => (s.tutor = consumeQuota(s.tutor, status, now())));
      history.push({ role: 'user', content: msg.text }, { role: 'assistant', content: res.reply });
      last = { question: msg.text, reply: res.reply };
      input.value = '';
    } else {
      notice = t[STATUS_MESSAGE[status] ?? 'unavailable'];
    }
    logEvent('tutor_message', {
      module_id: moduleId,
      item_id: item.id,
      payload: { step, status, tokens: Number.isInteger(res.tokens) ? res.tokens : null },
    });
    draw();
  }

  function draw() {
    const q = quota();
    if (!open) {
      return fill(
        root,
        h('button', {
          type: 'button',
          class: 'wide tutor-open',
          'aria-expanded': 'false',
          onClick: () => {
            open = true;
            logEvent('tutor_open', { module_id: moduleId, item_id: context().item.id, payload: { step: context().step } });
            draw();
            input.focus();
          },
        }, `${t.open} · ${t.remaining.replace('{n}', q.remaining)}`),
      );
    }
    const sendBtn = h('button', { type: 'button', class: 'primary', disabled: waiting, onClick: submit }, t.send);
    return fill(
      root,
      h('div', { class: 'tutor-head' },
        h('strong', {}, t.open),
        h('button', { type: 'button', class: 'small link', 'aria-expanded': 'true', onClick: () => ((open = false), draw()) }, t.close),
      ),
      last
        ? h('div', { class: 'tutor-turn' },
            h('p', { class: 'tutor-question' }, h('strong', {}, 'Kamu: '), last.question),
            h('p', { class: 'tutor-reply', 'aria-live': 'polite' }, h('strong', {}, 'Nalls: '), last.reply),
            h('p', { class: 'note ml-note tutor-label' }, t.aiLabel),
          )
        : h('p', { class: 'note ml-note' }, t.intro),
      waiting ? h('p', { class: 'note ml-note', 'aria-live': 'polite' }, t.waiting) : null,
      notice ? feedbackBox('info', null, notice) : null,
      h('div', { class: 'tutor-form' }, input, sendBtn),
      h('p', { class: 'note ml-note' }, t.remaining.replace('{n}', q.remaining)),
    );
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  });
  draw();
  return { el: root, submit };
}

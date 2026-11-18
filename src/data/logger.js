/**
 * Pencatat data belajar (F15).
 * Tahap ini: kejadian hanya dikumpulkan di antrean memori dengan
 * client_event_id unik, dengan bentuk sama seperti tabel di docs/api.md.
 * Pengiriman ke Supabase + antrean offline ditambahkan di tahap C15.
 */
const queue = [];

function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function push(table, row) {
  const entry = { table, row: { client_event_id: uuid(), ...row } };
  queue.push(entry);
  return entry;
}

/** → tabel step_responses */
export const logStep = (r) => push('step_responses', r);
/** → tabel hint_uses */
export const logHint = (h) => push('hint_uses', h);
/** → tabel explanations ("Jelaskan ke temanmu", F11) */
export const logExplanation = (e) => push('explanations', e);
/** → tabel diagnostic_results */
export const logDiagnostic = (d) => push('diagnostic_results', d);
/** → tabel events (navigasi: ulangi, kembali, ingat lagi, dll.) */
export const logEvent = (type, data = {}) => push('events', { type, client_time: new Date().toISOString(), ...data });

/** Untuk tes dan untuk tahap C15. */
export const pendingEvents = () => queue.slice();
export const clearEvents = () => queue.splice(0, queue.length);

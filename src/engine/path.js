/**
 * Jalur belajar: skor diagnostik (F02), titik mulai, dan status modul.
 * Sumber aturan: docs/naskah-materi.md bagian M0.
 */
import { parseNumber, nearlyEqual } from './number.js';

export const SKILLS = ['perkalian', 'pembagian', 'pecahan', 'perbandingan'];
export const MODULE_ORDER = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'];

/** Jawaban soal pilihan/isian benar? */
export function isCorrectAnswer(item, value) {
  if (item.form === 'pilihan') return value === item.answer;
  const n = parseNumber(value);
  return n !== null && nearlyEqual(n, item.answer);
}

/**
 * answers = { D1: '100', D5: '2/3', ... }
 * → { perkalian: { correct, total, fluent }, ... }
 * Satu prasyarat "lancar" jika semua soalnya benar (2 dari 2).
 */
export function scoreDiagnostic(items, answers) {
  const scores = Object.fromEntries(SKILLS.map((s) => [s, { correct: 0, total: 0, fluent: false }]));
  for (const item of items) {
    const s = scores[item.skill];
    if (!s) continue;
    s.total += 1;
    if (item.id in answers && isCorrectAnswer(item, answers[item.id])) s.correct += 1;
  }
  for (const s of Object.values(scores)) s.fluent = s.total > 0 && s.correct === s.total;
  return scores;
}

/** Prasyarat yang perlu kartu pengingat, sesuai urutan SKILLS. */
export function remindersNeeded(scores) {
  return SKILLS.filter((s) => scores[s] && !scores[s].fluent);
}

/**
 * Titik mulai:
 *  - kelas 7 → M1
 *  - kelas 8 dan perbandingan lancar → M2 (M1 boleh dilewati)
 *  - kelas 8 dan perbandingan belum lancar → M1
 */
export function startModule(grade, scores) {
  if (grade === 8 && scores?.perbandingan?.fluent) return 'M2';
  return 'M1';
}

/**
 * Status tiap modul untuk peta belajar.
 * state = { grade, diagnostic: { done, start }, progress: { M1: 'selesai', ... } }
 * available = daftar modul yang kontennya sudah ada.
 * Status: 'selesai' | 'terbuka' | 'boleh_dilewati' | 'terkunci' | 'segera'
 */
export function moduleStatuses(state, available) {
  const progress = state.progress || {};
  const statuses = {};
  const diagDone = Boolean(state.diagnostic?.done);
  const startIdx = MODULE_ORDER.indexOf(state.diagnostic?.start || 'M1');

  MODULE_ORDER.forEach((m, i) => {
    let status;
    if (m === 'M0') status = diagDone ? 'selesai' : 'terbuka';
    else if (progress[m] === 'selesai') status = 'selesai';
    else if (!diagDone) status = 'terkunci';
    else if (i < startIdx) status = 'boleh_dilewati';
    else if (i === startIdx) status = 'terbuka';
    else {
      const prev = statuses[MODULE_ORDER[i - 1]];
      status = prev === 'selesai' || prev === 'boleh_dilewati' ? 'terbuka' : 'terkunci';
    }
    if (status !== 'selesai' && m !== 'M0' && !available.includes(m)) status = 'segera';
    statuses[m] = status;
  });
  return statuses;
}

/**
 * Gerbang DS02 ("Kalau sudah paham, baru dikasih latihan soal sendiri"):
 * soal fase 'mandiri' baru terbuka setelah lulus cek pemahaman M2
 * (atau lulus cek cepat kelas VIII). state.m2.passed diisi di screens/m2.js.
 */
export function isItemLocked(item, state) {
  return item?.phase === 'mandiri' && !state?.m2?.passed;
}

/**
 * Hash yang dibuka saat modul dipilih di peta belajar.
 *  - M0: layar pembuka, atau layar hasil jika sudah selesai
 *  - M2 kelas VIII yang belum mencoba cek cepat: tawaran cek cepat (M2-00)
 *  - lainnya: layar materi pertama
 */
export function moduleEntryHash(m, state, status) {
  if (m === 'M0') return status === 'selesai' ? '#/diagnostik/99' : '#/diagnostik/intro';
  if (m === 'M2' && state?.grade === 8 && !state?.m2?.quickDone && status !== 'selesai') return '#/m2/tawar';
  return `#/modul/${m}/0`;
}

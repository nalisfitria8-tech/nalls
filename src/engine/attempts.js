/**
 * Percobaan cek M2 (cek pemahaman dan cek cepat).
 * Aturan (naskah M2-09, PRD F03):
 *  - nilai = jawaban PERTAMA tiap soal; jawaban yang sudah dikirim tidak bisa
 *    diubah lewat tombol Kembali, muat ulang, atau berpindah layar;
 *  - hasil dihitung dan dicatat SEKALI saat percobaan ditutup;
 *  - cek pemahaman yang belum lulus boleh diulang setelah siswa mengulang
 *    materi dari M2-06; urutan soal percobaan ulang diacak;
 *  - cek cepat hanya satu kali.
 * Semua fungsi bekerja pada objek keadaan biasa (lihat src/data/store.js).
 */
import { shuffled } from './identify.js';

/** Simpan jawaban pertama saja. Mengembalikan true jika baru disimpan. */
export function recordAnswer(answers, id, response, correct) {
  if (Object.hasOwn(answers, id)) return false;
  answers[id] = { response, correct };
  return true;
}

/** Indeks soal pertama yang belum dijawab (= panjang urutan jika semua sudah). */
export function firstUnanswered(order, answers) {
  const i = order.findIndex((id) => !Object.hasOwn(answers, id));
  return i === -1 ? order.length : i;
}

/** Banyak jawaban benar dan status lulus. */
export function scoreAnswers(order, answers, passScore) {
  const correct = order.filter((id) => answers[id]?.correct === true).length;
  return { correct, passed: correct >= passScore };
}

/**
 * Apa yang terjadi saat siswa membuka awal cek pemahaman:
 *  'lanjut'  — percobaan sedang berjalan; teruskan tanpa menghapus jawaban
 *  'mulai'   — boleh memulai percobaan baru
 *  'lulus'   — sudah lulus; tampilkan hasil
 *  'ulang_materi' — belum lulus dan belum mengulang materi dari M2-06
 */
export function checkEntry(cek) {
  if (cek.open) return 'lanjut';
  if (!cek.result) return 'mulai';
  if (cek.result.passed) return 'lulus';
  return cek.reviewed ? 'mulai' : 'ulang_materi';
}

/** Memulai percobaan baru. Percobaan ke-2 dst. memakai urutan acak. */
export function startAttempt(cek, ids, rnd = Math.random) {
  cek.attempt += 1;
  cek.open = true;
  cek.order = cek.attempt > 1 ? shuffled(ids, rnd) : ids.slice();
  cek.answers = {};
  cek.reviewed = false;
}

/**
 * Menutup percobaan bila semua soal sudah dijawab.
 * Mengembalikan hasil baru (untuk dicatat sekali), atau null jika
 * percobaan sudah ditutup sebelumnya / belum semua soal dijawab.
 */
export function closeAttempt(cek, passScore) {
  if (!cek.open || firstUnanswered(cek.order, cek.answers) < cek.order.length) return null;
  const { correct, passed } = scoreAnswers(cek.order, cek.answers, passScore);
  cek.open = false;
  cek.result = { attempt: cek.attempt, correct, passed };
  return cek.result;
}

/** Setelah layar materi M2 selesai: jika sedang mengulang, tandai sudah mengulang. */
export function markReviewed(cek) {
  if (!cek.open && cek.result && !cek.result.passed) {
    cek.reviewed = true;
    return true;
  }
  return false;
}

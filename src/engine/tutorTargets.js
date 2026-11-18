/**
 * Mencari halaman yang sedang dibuka siswa dari konten MILIK SERVER (bukan dari browser),
 * berdasarkan rujukan { module, kind, ref, twin }. Dengan begitu kunci jawaban untuk
 * penjaga tidak bisa dipalsukan dan teks dari browser tidak bisa menyusup ke aturan AI.
 *
 * Yang TIDAK pernah ditemukan (sengaja): soal diagnostik M0, cek pemahaman/cek cepat dan
 * "jelaskan ke temanmu" M2, soal mandiri/akhir M3–M4, tes literasi, layar penilai.
 */
import { kindAllowed, tutorAllowed } from './tutorPolicy.js';
import { generatedHints } from './feedback.js';

/** Soal kembar: konteks & jenis sama, angka lain (sama seperti twinItem di screens/solve.js). */
export function twinOf(item) {
  const t = { ...item, id: `${item.id}-K`, text: item.twin.text, table: { ...item.table, rows: item.twin.rows }, answer: item.twin.answer, twin: null, isTwin: true };
  t.hints = generatedHints(t);
  return t;
}

/**
 * contents = { M0: m0, M1: m1, ... } · settings = tutor.json → settings
 * Mengembalikan target { kind, module, title, screen | item } atau null.
 */
export function resolveTarget(contents, settings, { module, kind, ref, twin = false } = {}) {
  if (!kindAllowed(settings, module, kind) || typeof ref !== 'string') return null;
  const c = contents[module];
  if (!c) return null;
  const base = { kind, module, title: c.title };

  if (kind === 'materi') {
    const screen = (c.screens ?? []).find((s) => s.id === ref);
    return screen ? { ...base, screen } : null;
  }
  if (kind === 'pengingat') {
    for (const card of Object.values(c.reminders ?? {})) {
      const screen = card.screens.find((s) => s.id === ref);
      if (screen) return { ...base, title: card.title, screen };
    }
    return null;
  }
  if (kind === 'latihan') {
    // M0: hanya soal cek kartu pengingat (BUKAN soal diagnostik); M1: latihan
    const pool = module === 'M0' ? Object.values(c.reminders ?? {}).map((r) => r.check) : c.quiz ?? [];
    const item = pool.find((q) => q?.id === ref);
    return item ? { ...base, item } : null;
  }
  if (kind === 'identifikasi') {
    const item = (c.identify ?? []).find((q) => q.id === ref); // bukan check/quick
    return item ? { ...base, item } : null;
  }
  if (kind === 'soal') {
    const item = (c.items ?? []).find((i) => i.id === ref);
    if (!tutorAllowed(settings, module, item)) return null; // mandiri/akhir ditolak
    if (twin) return item.twin ? { ...base, item: twinOf(item) } : null;
    return { ...base, item };
  }
  return null;
}

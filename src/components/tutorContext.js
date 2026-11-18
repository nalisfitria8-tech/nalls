/**
 * Konteks halaman untuk Tanya Nalls (KP-36). Layar belajar/latihan memberi tahu apa yang
 * sedang dibuka; router mengosongkannya setiap pindah halaman, sehingga halaman yang tidak
 * memasang konteks (diagnostik, tes, penilai, peta belajar, cek M2) tidak menampilkan tombol.
 *
 * Bentuk: { module, kind, ref, twin?, phase?, step?, errorType?, hintLevel? }
 *   kind: materi | pengingat | latihan | identifikasi | soal | mandiri
 */
let current = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(current));

export const getTutorContext = () => current;

export function setTutorContext(ctx) {
  current = ctx ? { ...ctx } : null;
  notify();
}

/** Memperbarui sebagian konteks (misal langkah, petunjuk, kesalahan terakhir). */
export function updateTutorContext(patch) {
  if (!current) return;
  current = { ...current, ...patch };
  notify();
}

export const clearTutorContext = () => setTutorContext(null);

export function onTutorContext(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

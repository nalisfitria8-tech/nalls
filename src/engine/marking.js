/**
 * Tandai informasi penting (F07) — logika tanpa DOM.
 *
 * Teks soal dipecah menjadi kalimat; di dalam kalimat, angka menjadi token
 * yang bisa diketuk. Angka = digit ASCII dengan pemisah titik/koma di tengah
 * ("56.000", "06.00", "2,5"); tanda pangkat seperti "m²" bukan angka.
 * Aturan yang sama dipakai tools/check_content.py (NUMBER_RE).
 */
export const NUMBER_RE = /\d+(?:[.,]\d+)*/g;

/**
 * Memecah teks menjadi kalimat. Batas kalimat: . ? ! yang diikuti spasi atau
 * akhir teks (titik di dalam angka seperti "06.00" bukan batas).
 * → [{ index, text, parts: [{ kind: 'text'|'num', text, pos? }] }]
 *   pos = urutan angka di seluruh teks (0, 1, 2, …), dipakai sebagai kunci tanda.
 */
export function tokenize(text) {
  const sentences = text.trim().split(/(?<=[.?!])\s+/);
  let pos = 0;
  return sentences.map((raw, index) => {
    const sentence = raw.trim();
    const parts = [];
    let last = 0;
    for (const m of sentence.matchAll(NUMBER_RE)) {
      if (m.index > last) parts.push({ kind: 'text', text: sentence.slice(last, m.index) });
      parts.push({ kind: 'num', text: m[0], pos: pos++ });
      last = m.index + m[0].length;
    }
    if (last < sentence.length) parts.push({ kind: 'text', text: sentence.slice(last) });
    return { index, text: sentence, parts };
  });
}

/** Semua angka di teks, berurutan. */
export function numberTokens(text) {
  return tokenize(text).flatMap((s) => s.parts.filter((p) => p.kind === 'num').map((p) => p.text));
}

/** Tabel isian kosong 2 × 2 (baris × kolom), berisi string. */
export const emptyCells = () => [
  ['', ''],
  ['', ''],
];

/**
 * Menaruh angka di sel kosong pertama pada kolom col (0 = kolom kiri).
 * Mengembalikan { cells, row } (salinan baru), atau null jika kolom penuh.
 */
export function placeNumber(cells, col, token) {
  const row = cells.findIndex((r) => r[col] === '');
  if (row === -1) return null;
  const next = cells.map((r) => r.slice());
  next[row][col] = token;
  return { cells: next, row };
}

/** Mengosongkan sel jika isinya masih angka yang sama (tidak diubah siswa). */
export function clearCell(cells, row, col, token) {
  if (cells[row]?.[col] !== token) return cells;
  const next = cells.map((r) => r.slice());
  next[row][col] = '';
  return next;
}

/** Isi sel → bentuk jawaban Langkah 1 untuk checkStep('diketahui'): sel kosong = null. */
export const cellsToResponse = (cells) => cells.map((r) => r.map((v) => v.trim() || null));

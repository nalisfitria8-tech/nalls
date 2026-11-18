/**
 * Teks pembahasan sesuai jenis kesalahan (F09) dan petunjuk untuk soal kembar.
 * Templat: docs/naskah-materi.md, "Templat pembahasan kesalahan".
 */
import { formatNumber } from './number.js';
import { unknownPosition, resultDirection, solve, SENILAI } from './solver.js';

/** "Harga (Rp)" → "harga" */
export function quantityName(label) {
  const base = String(label).replace(/\s*\(.*?\)\s*/g, '').trim();
  return base.charAt(0).toLowerCase() + base.slice(1);
}

function cells(rows) {
  const f = (v) => (v === null ? '?' : formatNumber(v));
  const [[a1, b1], [a2, b2]] = rows;
  return { a1: f(a1), b1: f(b1), a2: f(a2), b2: f(b2) };
}

/** Bentuk hitungan dengan "?" di sel yang ditanya. */
export function formulaText(type, rows) {
  const c = cells(rows);
  return type === SENILAI ? `${c.a1}/${c.b1} = ${c.a2}/${c.b2}` : `${c.a1} × ${c.b1} = ${c.a2} × ${c.b2}`;
}

/** Baris hitungan langsung, tanpa hasil akhir: "? = 12.000 × 5 : 3" */
export function computationText(type, rows) {
  const c = cells(rows);
  const pos = unknownPosition(rows);
  if (type === SENILAI) return pos === 'b2' ? `? = ${c.b1} × ${c.a2} : ${c.a1}` : `? = ${c.a1} × ${c.b2} : ${c.b1}`;
  return pos === 'b2' ? `? = ${c.a1} × ${c.b1} : ${c.a2}` : `? = ${c.a1} × ${c.b1} : ${c.b2}`;
}

export function ruleText(type) {
  return type === SENILAI ? 'Pada senilai, hasil bagi tetap.' : 'Pada berbalik nilai, hasil kali tetap.';
}

/** Pembahasan untuk satu jenis kesalahan → { title, text, showRecall } */
export function feedbackFor(item, errorType) {
  const [colA, colB] = item.table.columns.map(quantityName);
  const rows = item.table.rows;
  const c = cells(rows);

  switch (errorType) {
    case 'ambil_data':
      return {
        title: 'Periksa data lagi',
        text: 'Ada angka yang belum tepat di tabel. Baca lagi soalnya. Tidak semua angka dipakai.',
      };
    case 'jenis':
      return {
        title: 'Periksa jenisnya',
        text: `Bayangkan ${colA} bertambah. Apakah ${colB} ikut bertambah atau berkurang?`,
        showRecall: true,
      };
    case 'rumus':
      return {
        title: 'Jenisnya sudah benar, bentuk hitungannya belum',
        text: `${ruleText(item.type)} Susun ${formulaText(item.type, rows)}.`,
      };
    case 'hitung':
      return {
        title: 'Bentuknya benar, periksa hitungannya',
        text: `Hitung pelan-pelan: ${computationText(item.type, rows)}.`,
      };
    case 'kewajaran': {
      const changed = unknownPosition(rows) === 'b2' ? `${colA} berubah dari ${c.a1} ke ${c.a2}` : `${colB} berubah dari ${c.b1} ke ${c.b2}`;
      const target = unknownPosition(rows) === 'b2' ? colB : colA;
      return {
        title: 'Apakah hasilnya masuk akal?',
        text: `${capitalize(changed)}. Jadi ${target} lebih besar atau lebih kecil? Lihat lagi arah perubahannya.`,
      };
    }
    default:
      return { title: 'Belum tepat', text: 'Coba lagi.' };
  }
}

/** Pembahasan lengkap (setelah 2 kali salah dengan petunjuk maksimum). */
export function fullSolution(item) {
  const rows = item.table.rows;
  const answer = solve(item.type, rows);
  const pos = unknownPosition(rows);
  const ref = pos === 'b2' ? rows[0][1] : rows[0][0];
  const dir = resultDirection(item.type, rows) === 'naik' ? 'lebih besar' : 'lebih kecil';
  return [
    `Jenis: ${item.type === SENILAI ? 'senilai' : 'berbalik nilai'}. ${ruleText(item.type)}`,
    `Bentuk: ${formulaText(item.type, rows)}`,
    `${computationText(item.type, rows)} = ${formatNumber(answer)}`,
    `Cek: ${formatNumber(answer)} ${dir} dari ${formatNumber(ref)}. Masuk akal.`,
  ];
}

/** Petunjuk umum untuk soal kembar (angka berbeda dari soal asli). */
export function generatedHints(item) {
  const [colA, colB] = item.table.columns.map(quantityName);
  return [
    `Jika ${colA} bertambah, ${colB} bertambah atau berkurang?`,
    ruleText(item.type),
    computationText(item.type, item.table.rows),
  ];
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

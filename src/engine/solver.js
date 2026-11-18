/**
 * Mesin hitung perbandingan senilai dan berbalik nilai.
 *
 * Tabel selalu 2 kolom × 2 baris: [[a1, b1], [a2, b2]]
 * dengan TEPAT SATU sel bernilai null di baris kedua (yang ditanya).
 *
 *   Senilai       : a1 / b1 = a2 / b2   (hasil bagi tetap)
 *   Berbalik nilai: a1 × b1 = a2 × b2   (hasil kali tetap)
 */

export const SENILAI = 'senilai';
export const BERBALIK = 'berbalik';

export function otherType(type) {
  if (type === SENILAI) return BERBALIK;
  if (type === BERBALIK) return SENILAI;
  throw new Error(`Jenis tidak dikenal: ${type}`);
}

/** Posisi sel yang ditanya: 'a2' (kolom kiri) atau 'b2' (kolom kanan). */
export function unknownPosition(rows) {
  validateRows(rows);
  return rows[1][0] === null ? 'a2' : 'b2';
}

export function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length !== 2 || rows.some((r) => !Array.isArray(r) || r.length !== 2)) {
    throw new Error('Tabel harus 2 baris × 2 kolom');
  }
  const [[a1, b1], [a2, b2]] = rows;
  for (const v of [a1, b1]) {
    if (typeof v !== 'number' || !(v > 0)) throw new Error('Baris pertama harus berisi dua angka positif');
  }
  const nulls = [a2, b2].filter((v) => v === null).length;
  if (nulls !== 1) throw new Error('Baris kedua harus punya tepat satu sel yang ditanya (null)');
  const known = a2 === null ? b2 : a2;
  if (typeof known !== 'number' || !(known > 0)) throw new Error('Nilai yang diketahui di baris kedua harus angka positif');
}

/** Menghitung nilai sel yang ditanya. */
export function solve(type, rows) {
  validateRows(rows);
  const [[a1, b1], [a2, b2]] = rows;
  const pos = unknownPosition(rows);

  if (type === SENILAI) {
    return pos === 'b2' ? (b1 * a2) / a1 : (a1 * b2) / b1;
  }
  if (type === BERBALIK) {
    return pos === 'b2' ? (a1 * b1) / a2 : (a1 * b1) / b2;
  }
  throw new Error(`Jenis tidak dikenal: ${type}`);
}

/** Hasil bila siswa memakai rumus jenis yang lain (untuk mengenali "salah rumus"). */
export function solveSwapped(type, rows) {
  return solve(otherType(type), rows);
}

/**
 * Arah perubahan hasil dibanding nilai pembandingnya pada kolom yang sama.
 * Dipakai untuk cek kewajaran (F10): 'naik' | 'turun' | 'tetap'.
 */
export function resultDirection(type, rows) {
  const answer = solve(type, rows);
  const pos = unknownPosition(rows);
  const reference = pos === 'b2' ? rows[0][1] : rows[0][0];
  if (answer > reference) return 'naik';
  if (answer < reference) return 'turun';
  return 'tetap';
}

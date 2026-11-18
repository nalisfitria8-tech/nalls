/**
 * Membaca dan menulis angka dengan format Indonesia.
 *   "12.000"   → 12000   (titik = pemisah ribuan)
 *   "26,67"    → 26.67   (koma = desimal)
 *   "1.500,5"  → 1500.5
 *   "12000"    → 12000
 *   "2.5"      → 2.5     (titik yang TIDAK diikuti tepat 3 angka dianggap desimal)
 *   "Rp20.000" → 20000
 * Mengembalikan null jika bukan angka.
 */
export function parseNumber(input) {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  if (typeof input !== 'string') return null;

  let s = input.trim().replace(/^rp\.?\s*/i, '').replace(/\s+/g, '');
  if (s === '') return null;
  if (!/^-?[\d.,]+$/.test(s)) return null;

  if (s.includes(',')) {
    // koma = desimal; titik = ribuan
    if ((s.match(/,/g) || []).length > 1) return null;
    s = s.replaceAll('.', '').replace(',', '.');
  } else if (s.includes('.')) {
    const groups = s.replace(/^-/, '').split('.');
    const isThousands = groups.length > 1 && groups.slice(1).every((g) => g.length === 3) && groups[0].length >= 1 && groups[0].length <= 3;
    if (isThousands) {
      s = s.replaceAll('.', '');
    } else if (groups.length !== 2) {
      return null;
    }
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** 12000 → "12.000", 26.666… → "26,67" */
export function formatNumber(n, maxDecimals = 2) {
  return n.toLocaleString('id-ID', { maximumFractionDigits: maxDecimals });
}

/** Membulatkan ke 2 desimal (setengah ke atas), sama dengan tools/check_content.py */
export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Dua angka dianggap sama jika selisih ≤ toleransi (default 0,01). */
export function nearlyEqual(a, b, tol = 0.01) {
  return Math.abs(a - b) <= tol;
}

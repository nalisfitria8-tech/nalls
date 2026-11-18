/**
 * Pemeriksa jawaban per langkah (F04) dan klasifikasi kesalahan (F09).
 *
 * Langkah dan bentuk jawaban siswa:
 *   diketahui : [[a1, b1], [a2, b2]]  — angka boleh string format Indonesia
 *   ditanya   : 'a2' | 'b2'           — sel yang ditanya
 *   jenis     : { arah: 'searah' | 'berlawanan', jenis: 'senilai' | 'berbalik' }
 *   bentuk    : 'hasil_bagi' | 'hasil_kali'
 *   hasil     : angka atau string ("20.000")
 *   kewajaran : 'naik' | 'turun'      — arah hasil dibanding data awal
 *
 * Jenis kesalahan (sama dengan kolom step_responses.error_type di docs/api.md):
 *   'ambil_data' | 'jenis' | 'rumus' | 'hitung' | 'kewajaran'
 */
import { parseNumber, nearlyEqual } from './number.js';
import { solve, solveSwapped, unknownPosition, resultDirection, SENILAI, BERBALIK } from './solver.js';

export const STEPS = ['diketahui', 'ditanya', 'jenis', 'bentuk', 'hasil', 'kewajaran'];

const FORM_FOR_TYPE = { [SENILAI]: 'hasil_bagi', [BERBALIK]: 'hasil_kali' };
const DIRECTION_FOR_TYPE = { [SENILAI]: 'searah', [BERBALIK]: 'berlawanan' };

function result(correct, errorType = null, extra = {}) {
  return { correct, errorType: correct ? null : errorType, ...extra };
}

function sameRows(expected, given) {
  if (!Array.isArray(given) || given.length !== 2) return false;
  const norm = (r) => (Array.isArray(r) && r.length === 2 ? r.map((v) => (v === null || v === '?' || v === '' ? null : parseNumber(v))) : null);
  const g = given.map(norm);
  if (g.some((r) => r === null)) return false;
  const eq = (x, y) => x[0] === y[0] && x[1] === y[1];
  // urutan baris boleh tertukar
  return (eq(expected[0], g[0]) && eq(expected[1], g[1])) || (eq(expected[0], g[1]) && eq(expected[1], g[0]));
}

/**
 * Memeriksa satu langkah.
 * item = { type: 'senilai'|'berbalik', table: { rows: [[a1,b1],[a2,b2]] } }
 */
export function checkStep(item, step, response) {
  const { type } = item;
  const rows = item.table.rows;

  switch (step) {
    case 'diketahui':
      return result(sameRows(rows, response), 'ambil_data');

    case 'ditanya':
      return result(response === unknownPosition(rows), 'ambil_data');

    case 'jenis': {
      const jenisOk = response?.jenis === type;
      const arahOk = response?.arah === DIRECTION_FOR_TYPE[type];
      return result(jenisOk && arahOk, 'jenis', { jenisOk, arahOk });
    }

    case 'bentuk':
      return result(response === FORM_FOR_TYPE[type], 'rumus');

    case 'hasil': {
      const value = parseNumber(response);
      if (value === null) return result(false, 'hitung', { unreadable: true });
      if (nearlyEqual(value, solve(type, rows))) return result(true);
      // Hasil sama dengan rumus jenis lain → salah rumus, bukan salah hitung
      if (nearlyEqual(value, solveSwapped(type, rows))) return result(false, 'rumus', { swapped: true });
      return result(false, 'hitung');
    }

    case 'kewajaran':
      return result(response === resultDirection(type, rows), 'kewajaran');

    default:
      throw new Error(`Langkah tidak dikenal: ${step}`);
  }
}

/**
 * Menentukan kesalahan UTAMA dari satu percobaan lengkap, dengan urutan
 * docs/architecture.md §5: ambil data → jenis → rumus → hitung → kewajaran.
 * responses = { diketahui, ditanya, jenis, bentuk, hasil, kewajaran } (boleh sebagian)
 */
export function classifyAttempt(item, responses) {
  for (const step of STEPS) {
    if (!(step in responses)) continue;
    const r = checkStep(item, step, responses[step]);
    if (!r.correct) return { step, errorType: r.errorType };
  }
  return { step: null, errorType: null };
}

/** Langkah 4 terkunci sampai Langkah 3 benar (IL02). */
export function canOpenStep4(jenisResult) {
  return Boolean(jenisResult?.correct);
}

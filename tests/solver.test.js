import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { solve, solveSwapped, unknownPosition, resultDirection } from '../src/engine/solver.js';
import { round2, nearlyEqual } from '../src/engine/number.js';

describe('solve — contoh dari naskah', () => {
  it('senilai, yang ditanya di kanan: 3 buku Rp12.000 → 5 buku', () => {
    expect(solve('senilai', [[3, 12000], [5, null]])).toBe(20000);
  });
  it('senilai, yang ditanya di kiri: 5 L cat 20 m² → ? L untuk 32 m²', () => {
    expect(solve('senilai', [[5, 20], [null, 32]])).toBe(8);
  });
  it('berbalik, yang ditanya di kanan: 6 pekerja 10 hari → 4 pekerja', () => {
    expect(solve('berbalik', [[6, 10], [4, null]])).toBe(15);
  });
  it('berbalik, yang ditanya di kiri: 40 km/jam 3 jam → ? km/jam untuk 2 jam', () => {
    expect(solve('berbalik', [[40, 3], [null, 2]])).toBe(60);
  });
  it('rumus tertukar', () => {
    expect(solveSwapped('berbalik', [[6, 10], [4, null]])).toBeCloseTo(6.67, 2);
    expect(solveSwapped('senilai', [[3, 12000], [5, null]])).toBe(7200);
  });
});

describe('validasi tabel', () => {
  it.each([
    [[[1, 2]]],
    [[[1, 2], [null, null]]],
    [[[1, 2], [3, 4]]],
    [[[0, 2], [3, null]]],
    [[[null, 2], [3, 4]]],
  ])('menolak tabel tidak sah %j', (rows) => {
    expect(() => solve('senilai', rows)).toThrow();
  });
  it('menolak jenis tidak dikenal', () => {
    expect(() => solve('lain', [[1, 2], [3, null]])).toThrow();
  });
  it('posisi yang ditanya', () => {
    expect(unknownPosition([[1, 2], [3, null]])).toBe('b2');
    expect(unknownPosition([[1, 2], [null, 3]])).toBe('a2');
  });
});

describe('resultDirection (cek kewajaran)', () => {
  it('senilai, barang bertambah → harga naik', () => {
    expect(resultDirection('senilai', [[3, 12000], [5, null]])).toBe('naik');
  });
  it('berbalik, pekerja berkurang → hari naik', () => {
    expect(resultDirection('berbalik', [[6, 10], [4, null]])).toBe('naik');
  });
  it('berbalik, pekerja bertambah → hari turun', () => {
    expect(resultDirection('berbalik', [[8, 15], [12, null]])).toBe('turun');
  });
});

// Semua soal di src/content harus punya kunci yang benar (juga dicek oleh tools/check_content.py)
describe('kunci semua soal di konten', () => {
  const dir = join(import.meta.dirname, '..', 'src', 'content');
  const items = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).items || [])
    .filter((item) => item.table); // soal 4 langkah saja (diagnostik dicek di path.test.js & Python)

  it('ada soal untuk diuji', () => {
    expect(items.length).toBeGreaterThan(0);
  });

  for (const item of items) {
    it(`${item.id}: kunci = ${item.answer}`, () => {
      expect(nearlyEqual(solve(item.type, item.table.rows), item.answer)).toBe(true);
      expect(round2(solveSwapped(item.type, item.table.rows))).toBe(item.swappedAnswer);
      if (item.twin) expect(nearlyEqual(solve(item.type, item.twin.rows), item.twin.answer)).toBe(true);
    });
  }
});

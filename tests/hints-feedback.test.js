import { describe, it, expect } from 'vitest';
import { maxHintLevel, autoHintAfterWrong, registerWrong, shouldShowSolution } from '../src/engine/hints.js';
import { feedbackFor, fullSolution, generatedHints, formulaText, computationText, quantityName } from '../src/engine/feedback.js';

describe('petunjuk bertingkat & fading (F08)', () => {
  it('tingkat maksimum per fase', () => {
    expect(['setengah', 'latihan', 'mandiri', 'akhir'].map((p) => maxHintLevel(p))).toEqual([3, 3, 2, 0]);
    expect(maxHintLevel('latihan', 2)).toBe(2);
  });

  it('kapan petunjuk muncul otomatis', () => {
    expect(autoHintAfterWrong('setengah', 1)).toBe(true);
    expect(autoHintAfterWrong('latihan', 1)).toBe(false);
    expect(autoHintAfterWrong('latihan', 2)).toBe(true);
    expect(autoHintAfterWrong('mandiri', 2)).toBe(false);
    expect(autoHintAfterWrong('akhir', 9)).toBe(false);
  });

  it('latihan: salah terus → T1, T2, T3, lalu pembahasan setelah 2 kali salah di T3', () => {
    let s = { hint: 0, wrong: 0, wrongAtMax: 0 };
    const trail = [];
    for (let i = 0; i < 7; i++) {
      s = registerWrong('latihan', s);
      trail.push([s.hint, s.showSolution]);
      if (s.showSolution) break;
    }
    expect(trail).toEqual([
      [0, false],
      [1, false],
      [2, false],
      [3, false],
      [3, false],
      [3, true],
    ]);
  });

  it('tidak ada pembahasan di fase akhir (tanpa petunjuk)', () => {
    expect(shouldShowSolution('akhir', 0, 10)).toBe(false);
  });
});

const beras = { type: 'senilai', table: { columns: ['Beras (kg)', 'Harga (Rp)'], rows: [[4, 56000], [7, null]] } };
const kecepatan = { type: 'berbalik', table: { columns: ['Kecepatan (km/jam)', 'Waktu (jam)'], rows: [[40, 3], [null, 2]] } };

describe('pembahasan per jenis kesalahan (F09)', () => {
  it('nama besaran dari judul kolom', () => {
    expect(quantityName('Harga (Rp)')).toBe('harga');
    expect(quantityName('Kecepatan (km/jam)')).toBe('kecepatan');
  });

  it('bentuk dan baris hitungan, tanpa hasil akhir', () => {
    expect(formulaText('senilai', beras.table.rows)).toBe('4/56.000 = 7/?');
    expect(computationText('senilai', beras.table.rows)).toBe('? = 56.000 × 7 : 4');
    expect(formulaText('berbalik', kecepatan.table.rows)).toBe('40 × 3 = ? × 2');
    expect(computationText('berbalik', kecepatan.table.rows)).toBe('? = 40 × 3 : 2');
  });

  it('setiap jenis kesalahan punya judul berbeda', () => {
    const titles = ['ambil_data', 'jenis', 'rumus', 'hitung', 'kewajaran'].map((e) => feedbackFor(beras, e).title);
    expect(new Set(titles).size).toBe(5);
    expect(feedbackFor(beras, 'jenis').text).toContain('beras bertambah');
    expect(feedbackFor(beras, 'jenis').showRecall).toBe(true);
    expect(feedbackFor(kecepatan, 'rumus').text).toContain('hasil kali tetap');
  });

  it('pembahasan/petunjuk tidak membocorkan jawaban akhir (kecuali pembahasan lengkap)', () => {
    for (const e of ['jenis', 'rumus', 'hitung', 'kewajaran']) {
      expect(feedbackFor(beras, e).text).not.toContain('98.000');
    }
    expect(generatedHints(beras).join(' ')).not.toContain('98.000');
    expect(fullSolution(beras).join(' ')).toContain('98.000');
  });
});

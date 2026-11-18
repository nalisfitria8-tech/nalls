import { describe, it, expect } from 'vitest';
import m3 from '../src/content/m3.json';
import { tokenize, numberTokens, emptyCells, placeNumber, clearCell, cellsToResponse } from '../src/engine/marking.js';

describe('memecah teks soal (F07)', () => {
  it('angka format Indonesia dan jam dibaca utuh; m² bukan angka', () => {
    expect(numberTokens('Harga 4 kg beras Rp56.000. Berapa harga 7 kg?')).toEqual(['4', '56.000', '7']);
    expect(numberTokens('Pak Budi berangkat pukul 06.00. Ia berjalan 3 km.')).toEqual(['06.00', '3']);
    expect(numberTokens('Dinding seluas 20 m². Berapa untuk 32 m²?')).toEqual(['20', '32']);
    expect(numberTokens('Hasilnya 2,5 kg.')).toEqual(['2,5']);
  });

  it('kalimat dipecah di . ? ! yang diikuti spasi, bukan di titik dalam angka', () => {
    const s = tokenize('Pak Budi berangkat pukul 06.00. Ia berjalan 3 km. Berapa menit untuk 5 km?');
    expect(s.map((x) => x.text)).toEqual(['Pak Budi berangkat pukul 06.00.', 'Ia berjalan 3 km.', 'Berapa menit untuk 5 km?']);
    expect(s[0].parts).toEqual([
      { kind: 'text', text: 'Pak Budi berangkat pukul ' },
      { kind: 'num', text: '06.00', pos: 0 },
      { kind: 'text', text: '.' },
    ]);
    expect(s[2].parts.find((p) => p.kind === 'num').pos).toBe(2); // urutan angka di seluruh teks
  });

  it('teks yang disusun ulang dari potongan sama dengan teks asli', () => {
    for (const item of m3.items) {
      const rebuilt = tokenize(item.text).map((s) => s.parts.map((p) => p.text).join('')).join(' ');
      expect(rebuilt).toBe(item.text);
    }
  });

  it('semua soal M3: angka di teks = angka relevan + pengecoh; pertanyaan = satu kalimat', () => {
    for (const item of m3.items) {
      const expected = [...item.marks.relevant, ...item.marks.distractors].sort();
      expect([item.id, [...numberTokens(item.text)].sort()]).toEqual([item.id, expected]);
      expect(tokenize(item.text).map((s) => s.text)).toContain(item.marks.question);
    }
  });
});

describe('menaruh angka bertanda di tabel Diketahui', () => {
  it('angka masuk ke sel kosong pertama di kolomnya; kolom penuh → null', () => {
    let cells = emptyCells();
    ({ cells } = placeNumber(cells, 0, '4'));
    ({ cells } = placeNumber(cells, 1, '56.000'));
    const third = placeNumber(cells, 0, '7');
    expect(third.row).toBe(1);
    cells = third.cells;
    expect(cells).toEqual([['4', '56.000'], ['7', '']]);
    expect(placeNumber(cells, 0, '9')).toBeNull();
  });

  it('tidak mengubah tabel asal', () => {
    const cells = emptyCells();
    placeNumber(cells, 0, '4');
    expect(cells).toEqual(emptyCells());
  });

  it('hapus tanda mengosongkan sel hanya jika isinya belum diubah siswa', () => {
    const cells = [['4', '56.000'], ['7', '']];
    expect(clearCell(cells, 1, 0, '7')).toEqual([['4', '56.000'], ['', '']]);
    expect(clearCell([['40', '56.000'], ['7', '']], 0, 0, '4')).toEqual([['40', '56.000'], ['7', '']]);
  });

  it('bentuk jawaban Langkah 1: sel kosong menjadi null', () => {
    expect(cellsToResponse([['4', ' 56.000 '], ['7', '  ']])).toEqual([['4', '56.000'], ['7', null]]);
  });
});

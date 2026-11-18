import { describe, it, expect } from 'vitest';
import { checkStep, classifyAttempt, canOpenStep4 } from '../src/engine/checker.js';

// M4-E1: 6 pekerja 10 hari, jika 4 pekerja? (berbalik nilai, kunci 15)
const pekerja = { type: 'berbalik', table: { rows: [[6, 10], [4, null]] } };
// M3-L1: 4 kg beras Rp56.000, 7 kg? (senilai, kunci 98.000)
const beras = { type: 'senilai', table: { rows: [[4, 56000], [7, null]] } };

describe('Langkah 1–2: data', () => {
  it('diketahui benar, angka boleh format Indonesia dan baris boleh tertukar', () => {
    expect(checkStep(beras, 'diketahui', [['7', '?'], ['4', '56.000']]).correct).toBe(true);
  });
  it('angka pengecoh → salah ambil data', () => {
    const r = checkStep(beras, 'diketahui', [[4, 56000], [2, null]]);
    expect(r).toMatchObject({ correct: false, errorType: 'ambil_data' });
  });
  it('ditanya', () => {
    expect(checkStep(beras, 'ditanya', 'b2').correct).toBe(true);
    expect(checkStep(beras, 'ditanya', 'a2').errorType).toBe('ambil_data');
  });
});

describe('Langkah 3: jenis (wajib, IL02)', () => {
  it('benar bila jenis dan arah cocok', () => {
    expect(checkStep(pekerja, 'jenis', { arah: 'berlawanan', jenis: 'berbalik' }).correct).toBe(true);
  });
  it('jenis salah → salah jenis', () => {
    const r = checkStep(pekerja, 'jenis', { arah: 'berlawanan', jenis: 'senilai' });
    expect(r).toMatchObject({ correct: false, errorType: 'jenis', arahOk: true, jenisOk: false });
  });
  it('arah salah → salah jenis', () => {
    expect(checkStep(beras, 'jenis', { arah: 'berlawanan', jenis: 'senilai' }).errorType).toBe('jenis');
  });
  it('Langkah 4 terkunci sampai Langkah 3 benar', () => {
    expect(canOpenStep4(checkStep(pekerja, 'jenis', { arah: 'searah', jenis: 'senilai' }))).toBe(false);
    expect(canOpenStep4(checkStep(pekerja, 'jenis', { arah: 'berlawanan', jenis: 'berbalik' }))).toBe(true);
    expect(canOpenStep4(undefined)).toBe(false);
  });
});

describe('Langkah 4: bentuk dan hasil (F09)', () => {
  it('bentuk hitungan', () => {
    expect(checkStep(beras, 'bentuk', 'hasil_bagi').correct).toBe(true);
    expect(checkStep(beras, 'bentuk', 'hasil_kali').errorType).toBe('rumus');
    expect(checkStep(pekerja, 'bentuk', 'hasil_kali').correct).toBe(true);
  });
  it('hasil benar (boleh pakai titik ribuan)', () => {
    expect(checkStep(beras, 'hasil', '98.000').correct).toBe(true);
    expect(checkStep(beras, 'hasil', 98000).correct).toBe(true);
  });
  it('hasil = rumus jenis lain → salah rumus', () => {
    expect(checkStep(beras, 'hasil', '32.000')).toMatchObject({ correct: false, errorType: 'rumus', swapped: true });
    expect(checkStep(pekerja, 'hasil', '6,67').errorType).toBe('rumus');
  });
  it('hasil lain → salah hitung', () => {
    expect(checkStep(beras, 'hasil', '96.000').errorType).toBe('hitung');
    expect(checkStep(pekerja, 'hasil', '14').errorType).toBe('hitung');
  });
  it('isian bukan angka → salah hitung (tidak terbaca)', () => {
    expect(checkStep(beras, 'hasil', 'banyak')).toMatchObject({ correct: false, errorType: 'hitung', unreadable: true });
  });
});

describe('Cek kewajaran (F10)', () => {
  it('beras bertambah → harga naik', () => {
    expect(checkStep(beras, 'kewajaran', 'naik').correct).toBe(true);
    expect(checkStep(beras, 'kewajaran', 'turun').errorType).toBe('kewajaran');
  });
  it('pekerja berkurang → hari naik', () => {
    expect(checkStep(pekerja, 'kewajaran', 'naik').correct).toBe(true);
  });
});

describe('classifyAttempt: urutan prioritas kesalahan', () => {
  const benar = {
    diketahui: [[6, 10], [4, null]],
    ditanya: 'b2',
    jenis: { arah: 'berlawanan', jenis: 'berbalik' },
    bentuk: 'hasil_kali',
    hasil: '15',
    kewajaran: 'naik',
  };
  it('semua benar', () => {
    expect(classifyAttempt(pekerja, benar)).toEqual({ step: null, errorType: null });
  });
  it('data salah didahulukan', () => {
    expect(classifyAttempt(pekerja, { ...benar, diketahui: [[6, 10], [3, null]], hasil: '1' }).errorType).toBe('ambil_data');
  });
  it('jenis salah sebelum rumus', () => {
    expect(classifyAttempt(pekerja, { ...benar, jenis: { arah: 'searah', jenis: 'senilai' }, bentuk: 'hasil_bagi' }).errorType).toBe('jenis');
  });
  it('rumus salah sebelum hitung', () => {
    expect(classifyAttempt(pekerja, { ...benar, bentuk: 'hasil_bagi', hasil: '99' }).errorType).toBe('rumus');
  });
  it('hanya hitung yang salah', () => {
    expect(classifyAttempt(pekerja, { ...benar, hasil: '16' })).toEqual({ step: 'hasil', errorType: 'hitung' });
  });
  it('langkah yang belum diisi dilewati', () => {
    expect(classifyAttempt(pekerja, { jenis: benar.jenis })).toEqual({ step: null, errorType: null });
  });
});

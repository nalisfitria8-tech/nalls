import { describe, it, expect } from 'vitest';
import m2 from '../src/content/m2.json';
import {
  checkIdentify,
  identifyFeedback,
  identifySolution,
  identifyHintLevel,
  identifyShowSolution,
  shuffled,
} from '../src/engine/identify.js';
import { scoreAnswers } from '../src/engine/attempts.js';

const I2 = m2.identify.find((i) => i.id === 'I2'); // ayam ↑ → hari ↓, berbalik

describe('periksa identifikasi jenis (M2, F03)', () => {
  it('benar jika arah dan jenis benar', () => {
    expect(checkIdentify(I2, { arah: 'berlawanan', jenis: 'berbalik' })).toMatchObject({ correct: true, errorType: null });
  });

  it('arah salah → kesalahan jenis, umpan balik meminta membayangkan', () => {
    const r = checkIdentify(I2, { arah: 'searah', jenis: 'senilai' });
    expect(r).toMatchObject({ correct: false, arahOk: false, errorType: 'jenis' });
    expect(identifyFeedback(I2, r).text).toBe('Bayangkan banyak ayam bertambah. Apa yang terjadi pada lama pakan habis?');
  });

  it('arah benar tetapi jenis salah → umpan balik menyebut jenis yang cocok', () => {
    const r = checkIdentify(I2, { arah: 'berlawanan', jenis: 'senilai' });
    const fb = identifyFeedback(I2, r);
    expect(fb.title).toBe('Arahnya sudah benar.');
    expect(fb.text).toContain('↑↓ berbalik nilai');
  });

  it('umpan balik benar dan pembahasan tidak kosong', () => {
    expect(identifyFeedback(I2, { correct: true }).text).toBe('Banyak ayam bertambah, lama pakan habis berkurang. Jadi ↑↓ berbalik nilai.');
    expect(identifySolution(I2)).toContain('(banyak pakan sama)');
  });

  it('pola bantuan: salah 1 → coba lagi, 2 → T1, 3 → T2, 4 → pembahasan', () => {
    expect([1, 2, 3].map((w) => identifyHintLevel(w, 2))).toEqual([0, 1, 2]);
    expect(identifyHintLevel(3, 1)).toBe(1); // tidak melebihi petunjuk yang ada
    expect([3, 4].map(identifyShowSolution)).toEqual([false, true]);
  });
});

describe('lulus cek dan acak urutan', () => {
  it('lulus jika benar ≥ batas lulus pada percobaan pertama', () => {
    const ids = ['C1', 'C2', 'C3', 'C4', 'C5'];
    const ans = (benar) => Object.fromEntries(ids.map((id) => [id, { correct: benar.includes(id) }]));
    expect(scoreAnswers(ids, ans(['C1', 'C2', 'C3', 'C4']), 4)).toEqual({ correct: 4, passed: true });
    expect(scoreAnswers(ids, ans(['C1', 'C2', 'C3']), 4)).toEqual({ correct: 3, passed: false });
    expect(scoreAnswers(ids, {}, 4).passed).toBe(false);
  });

  it('acak tidak mengubah isi dan tidak mengubah daftar asal', () => {
    const ids = ['C1', 'C2', 'C3', 'C4', 'C5'];
    const out = shuffled(ids, () => 0);
    expect(out).toEqual(['C2', 'C3', 'C4', 'C5', 'C1']);
    expect(ids).toEqual(['C1', 'C2', 'C3', 'C4', 'C5']);
    expect([...shuffled(ids)].sort()).toEqual(ids);
  });
});

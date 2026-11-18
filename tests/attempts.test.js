import { describe, it, expect } from 'vitest';
import { recordAnswer, firstUnanswered, scoreAnswers, checkEntry, startAttempt, closeAttempt, markReviewed } from '../src/engine/attempts.js';

const IDS = ['C1', 'C2', 'C3', 'C4', 'C5'];
const freshCek = () => ({ attempt: 0, open: false, order: null, answers: {}, result: null, reviewed: false });
const answerAll = (cek, correctIds) => cek.order.forEach((id) => recordAnswer(cek.answers, id, {}, correctIds.includes(id)));

describe('percobaan cek M2 (temuan A dan C)', () => {
  it('jawaban pertama tidak bisa ditimpa', () => {
    const a = {};
    expect(recordAnswer(a, 'C1', { jenis: 'senilai' }, false)).toBe(true);
    expect(recordAnswer(a, 'C1', { jenis: 'berbalik' }, true)).toBe(false);
    expect(a.C1).toEqual({ response: { jenis: 'senilai' }, correct: false });
  });

  it('soal pertama yang belum dijawab', () => {
    expect(firstUnanswered(IDS, {})).toBe(0);
    expect(firstUnanswered(IDS, { C1: {}, C2: {} })).toBe(2);
    expect(firstUnanswered(IDS, Object.fromEntries(IDS.map((i) => [i, {}])))).toBe(5);
  });

  it('skor hanya dari jawaban benar', () => {
    expect(scoreAnswers(IDS, { C1: { correct: true }, C2: { correct: true }, C3: { correct: true }, C4: { correct: true }, C5: { correct: false } }, 4)).toEqual({ correct: 4, passed: true });
  });

  it('alur percobaan: mulai → tutup sekali → wajib mengulang materi → percobaan acak', () => {
    const cek = freshCek();
    expect(checkEntry(cek)).toBe('mulai');
    startAttempt(cek, IDS);
    expect(cek).toMatchObject({ attempt: 1, open: true, order: IDS });
    expect(checkEntry(cek)).toBe('lanjut');

    expect(closeAttempt(cek, 4)).toBeNull(); // belum semua dijawab
    answerAll(cek, ['C1', 'C2']);
    expect(closeAttempt(cek, 4)).toEqual({ attempt: 1, correct: 2, passed: false });
    expect(closeAttempt(cek, 4)).toBeNull(); // tidak ditutup/dicatat dua kali

    expect(checkEntry(cek)).toBe('ulang_materi');
    expect(markReviewed(cek)).toBe(true);
    expect(checkEntry(cek)).toBe('mulai');
    startAttempt(cek, IDS, () => 0);
    expect(cek).toMatchObject({ attempt: 2, open: true, answers: {}, reviewed: false, order: ['C2', 'C3', 'C4', 'C5', 'C1'] });

    answerAll(cek, IDS);
    expect(closeAttempt(cek, 4)).toEqual({ attempt: 2, correct: 5, passed: true });
    expect(checkEntry(cek)).toBe('lulus');
    expect(markReviewed(cek)).toBe(false);
  });
});

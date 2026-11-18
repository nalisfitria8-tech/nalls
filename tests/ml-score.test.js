import { describe, it, expect } from 'vitest';
import test from '../src/content/ml-test.json';
import {
  emptyPhase, validStageScores, taskScore, phaseStatus, phaseSummary, nGain, nGainCategory, toCsv, detailRows, summaryRows,
} from '../src/engine/mlScore.js';

const [ML1, ML2, ML3, ML4] = test.tasks;
const full = (t) => t.stages.map((s) => s.score);
const phaseWith = (scores, extra = {}) => ({ ...emptyPhase(), startedAt: 'x', submittedAt: '2026-11-12T08:00:00Z', scores, ...extra });

describe('konten tes literasi (Tabel 2)', () => {
  it('4 soal, 4 indikator, maks. 6 per soal dan 24 total', () => {
    expect(test.tasks.map((t) => [t.id, t.indicator.name, t.maxScore])).toEqual([
      ['ML1', 'Mathematical Reasoning', 6],
      ['ML2', 'Formulating Situations Mathematically', 6],
      ['ML3', 'Employing Mathematical Concepts, Facts, and Procedures', 6],
      ['ML4', 'Interpreting, Applying, and Evaluating Mathematical Outcomes', 6],
    ]);
    expect(test.maxScore).toBe(24);
  });

  it('teks soal memuat konteks dan angka dokumen', () => {
    const flat = (t) => t.text.map((p) => (typeof p === 'string' ? p : p.list.join(' '))).join(' ');
    expect(ML1.text[1].list).toEqual(['A: 2 kg seharga Rp28.000.', 'B: 3 kg seharga Rp39.000.', 'C: 5 kg seharga Rp70.000.']);
    expect(flat(ML2)).toContain('3 gelas sirup untuk dicampurkan dengan 12 gelas air');
    expect(flat(ML3)).toContain('6 orang dalam waktu 15 hari');
    expect(flat(ML4)).toContain('waktu yang dibutuhkan adalah 32 menit');
  });
});

describe('skor per tahap rubrik', () => {
  it('nilai tahap 0..maks tahap; panjang sama dengan jumlah tahap', () => {
    expect(validStageScores(ML1, [1, 2, 1, 1, 1])).toBe(true);
    expect(validStageScores(ML1, [1, 1, 0, 1, 0])).toBe(true); // tahap 2 boleh sebagian (1 dari 2)
    expect(validStageScores(ML1, [1, 3, 1, 1, 1])).toBe(false);
    expect(validStageScores(ML1, [1, 2, 1, 1])).toBe(false);
    expect(validStageScores(ML1, [1, 2, null, 1, 1])).toBe(false);
    expect(validStageScores(ML1, [1, 1.5, 1, 1, 1])).toBe(false);
  });

  it('skor soal = jumlah tahap; belum lengkap → null', () => {
    expect(taskScore(ML3, [1, 2, 1, 1])).toBe(5);
    expect(taskScore(ML3, undefined)).toBeNull();
  });

  it('status fase: belum → mengerjakan → terkirim → dinilai', () => {
    expect(phaseStatus(test, emptyPhase())).toBe('belum');
    expect(phaseStatus(test, { ...emptyPhase(), startedAt: 'x' })).toBe('mengerjakan');
    expect(phaseStatus(test, phaseWith({ ML1: full(ML1) }))).toBe('terkirim');
    expect(phaseStatus(test, phaseWith({ ML1: full(ML1), ML2: full(ML2), ML3: full(ML3), ML4: full(ML4) }))).toBe('dinilai');
  });

  it('ringkasan: total hanya jika keempat soal sudah dinilai', () => {
    const partial = phaseSummary(test, phaseWith({ ML1: [1, 2, 1, 1, 1] }));
    expect(partial.total).toBeNull();
    expect(partial.perTask.map((t) => t.score)).toEqual([6, null, null, null]);
    const done = phaseSummary(test, phaseWith({ ML1: [1, 2, 1, 1, 1], ML2: [1, 1, 0, 1, 0, 0], ML3: [1, 2, 2, 1], ML4: [1, 0, 0, 0, 0, 0] }));
    expect(done.total).toBe(6 + 3 + 6 + 1);
    expect(done.perTask.map((t) => t.code)).toEqual(['reasoning', 'formulating', 'employing', 'interpreting']);
  });
});

describe('N-gain', () => {
  it('(akhir − awal) / (maks − awal) dan kategorinya', () => {
    expect(nGain(8, 20, 24)).toBe(0.75);
    expect(nGainCategory(0.75)).toBe('tinggi');
    expect(nGainCategory(nGain(8, 14, 24))).toBe('sedang'); // 0,375
    expect(nGainCategory(nGain(8, 10, 24))).toBe('rendah'); // 0,125
    expect(nGain(8, 6, 24)).toBe(-0.125); // turun tetap dicatat
  });

  it('tidak dihitung jika salah satu skor belum ada atau awal sudah maksimum', () => {
    expect(nGain(null, 20, 24)).toBeNull();
    expect(nGain(8, null, 24)).toBeNull();
    expect(nGain(24, 24, 24)).toBeNull();
    expect(nGainCategory(null)).toBeNull();
  });
});

describe('CSV untuk analisis', () => {
  const ml = {
    awal: phaseWith({ ML1: [1, 1, 0, 1, 0], ML2: [1, 1, 1, 0, 0, 0], ML3: [1, 0, 0, 0], ML4: [1, 0, 0, 0, 0, 0] }, { answers: { ML1: 'B; karena "murah"\n13.000/kg', ML3: '9 hari' }, progressAtSubmit: {}, scoredAt: '2026-11-12T09:00:00Z' }),
    akhir: phaseWith({ ML1: full(ML1), ML2: full(ML2), ML3: full(ML3), ML4: [1, 1, 1, 1, 0, 0] }, { progressAtSubmit: { M1: 'selesai', M2: 'selesai', M3: 'selesai', M4: 'terbuka' }, scoredAt: 'y' }),
  };
  const meta = { deviceId: 'P-ABC234', participant: 'S07', grade: 7 };

  it('rinci: satu baris per fase × soal, kolom tahap, jawaban, modul selesai', () => {
    const rows = detailRows(test, ml, meta);
    expect(rows).toHaveLength(1 + 8);
    expect(rows[0].slice(0, 6)).toEqual(['perangkat', 'kode_peserta', 'kelas', 'fase', 'soal', 'indikator']);
    const first = rows[1];
    expect(first.slice(0, 5)).toEqual(['P-ABC234', 'S07', 7, 'awal', 'ML1']);
    expect(first.slice(6, 12)).toEqual([1, 1, 0, 1, 0, '']); // 5 tahap, kolom ke-6 kosong
    expect(first[rows[0].indexOf('skor_soal')]).toBe(3);
    expect(first[rows[0].indexOf('jawaban')]).toBe('B; karena "murah"\n13.000/kg');
    const akhirML1 = rows.find((r) => r[3] === 'akhir' && r[4] === 'ML1');
    expect(akhirML1.at(-2)).toBe('M1 M2 M3');
  });

  it('fase yang belum dikirim tidak masuk CSV rinci', () => {
    expect(detailRows(test, { awal: ml.awal, akhir: emptyPhase() }, meta)).toHaveLength(1 + 4);
  });

  it('ringkasan: skor per indikator awal/akhir, total, N-gain (desimal koma)', () => {
    const [header, row] = summaryRows(test, ml, meta);
    expect(header).toContain('awal_ML1_reasoning');
    expect(header).toContain('akhir_ML4_interpreting');
    const get = (name) => row[header.indexOf(name)];
    expect(get('awal_total')).toBe(3 + 3 + 1 + 1);
    expect(get('akhir_total')).toBe(6 + 6 + 6 + 4);
    expect(get('n_gain')).toBe('0,70');
    expect(get('kategori_n_gain')).toBe('tinggi');
  });

  it('format CSV: BOM, pemisah titik koma, kutip untuk ; " dan baris baru', () => {
    const csv = toCsv(detailRows(test, ml, meta));
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('"B; karena ""murah""\n13.000/kg"');
    expect(csv.split('\r\n')[0].split(';')[0]).toBe('﻿perangkat');
  });
});

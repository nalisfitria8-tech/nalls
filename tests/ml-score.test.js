import { describe, it, expect } from 'vitest';
import test from '../src/content/ml-test.json';
import mlMcq from '../src/content/ml-mcq.json';
import {
  emptyPhase, validStageScores, taskScore, phaseStatus, phaseSummary, nGain, nGainCategory, toCsv, detailRows, summaryRows,
  mcqScore, mcqSubmitted, isLegacyCombined, mcqOrder, mcqSubmittedTime,
} from '../src/engine/mlScore.js';

const [ML1, ML2, ML3, ML4] = test.tasks;
const full = (t) => t.stages.map((s) => s.score);
/** Fase dengan uraian DAN pilihan ganda terkirim (alur baru, KP-35). */
const phaseWith = (scores, extra = {}) => ({
  ...emptyPhase(), startedAt: 'x', submittedAt: '2026-11-12T08:00:00Z', mcqSeparate: true, mcqSubmittedAt: '2026-11-12T08:05:00Z', scores, ...extra,
});
const ALL_FULL = { ML1: full(ML1), ML2: full(ML2), ML3: full(ML3), ML4: full(ML4) };
// PG1–PG4: kunci indeks 1, 2, 1, 1
const MCQ_2_BENAR = { PG1: 1, PG2: 0, PG3: 1, PG4: 3 };

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

  it('status fase: belum → mengerjakan → pg (uraian terkirim) → terkirim → dinilai', () => {
    expect(phaseStatus(test, emptyPhase())).toBe('belum');
    expect(phaseStatus(test, { ...emptyPhase(), startedAt: 'x' })).toBe('mengerjakan');
    expect(phaseStatus(test, phaseWith(ALL_FULL, { mcqSubmittedAt: null }))).toBe('pg'); // uraian dinilai, PG belum dikirim
    expect(phaseStatus(test, phaseWith({ ML1: full(ML1) }))).toBe('terkirim');
    expect(phaseStatus(test, phaseWith(ALL_FULL))).toBe('dinilai');
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

describe('pilihan ganda: rumus sama, dihitung setelah PG dikirim (KP-35)', () => {
  it('skor PG = 1 per jawaban benar (kunci tidak berubah); total = uraian + PG, maks. 28', () => {
    expect(mlMcq.map((q) => q.answer)).toEqual([1, 2, 1, 1]);
    const p = phaseWith(ALL_FULL, { mcqAnswers: MCQ_2_BENAR });
    expect(mcqScore(p)).toBe(2);
    expect(phaseSummary(test, p)).toMatchObject({ status: 'dinilai', essayTotal: 24, mcqTotal: 2, total: 26, max: 28, mcqMax: 4 });
  });

  it('uraian sudah dinilai tetapi PG belum dikirim: skor uraian ada, skor PG & total belum', () => {
    const s = phaseSummary(test, phaseWith(ALL_FULL, { mcqSubmittedAt: null, mcqAnswers: { PG1: 1 } }));
    expect(s).toMatchObject({ status: 'pg', essayTotal: 24, mcqTotal: null, total: null });
  });

  it('data alur lama (PG dijawab bersama uraian) dikenali tanpa mengubah datanya', () => {
    const legacy = { ...emptyPhase(), startedAt: 'x', submittedAt: '2026-11-12T06:51:38Z', mcqAnswers: { PG1: 1, PG2: 2 }, scores: ALL_FULL };
    delete legacy.mcqSeparate;
    delete legacy.mcqSubmittedAt;
    const copy = JSON.parse(JSON.stringify(legacy));
    expect(isLegacyCombined(legacy)).toBe(true);
    expect(mcqSubmitted(legacy)).toBe(true);
    expect(mcqSubmittedTime(legacy)).toBe('2026-11-12T06:51:38Z');
    expect(mcqOrder(legacy)).toBe('bersamaan (alur lama)');
    expect(phaseSummary(test, legacy)).toMatchObject({ status: 'dinilai', mcqTotal: 2, total: 26 });
    expect(legacy).toEqual(copy); // tidak ada yang ditulis ke data
  });

  it('data alur lama tanpa jawaban PG → PG masih harus dikerjakan', () => {
    const legacyNoPg = { ...emptyPhase(), startedAt: 'x', submittedAt: 'b' };
    expect(isLegacyCombined(legacyNoPg)).toBe(false);
    expect(phaseStatus(test, legacyNoPg)).toBe('pg');
    expect(mcqOrder({ ...legacyNoPg, mcqSubmittedAt: 'c', mcqLegacyOpen: true })).toBe('setelah uraian (opsi sempat terlihat di alur lama)');
  });

  it('alur baru: jawaban PG yang sedang diisi (belum dikirim) BUKAN data lama', () => {
    const p = phaseWith({}, { mcqSubmittedAt: null, mcqAnswers: { PG1: 0 } });
    expect(isLegacyCombined(p)).toBe(false);
    expect(mcqSubmitted(p)).toBe(false);
    expect(mcqOrder(phaseWith({}))).toBe('setelah uraian');
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
    awal: phaseWith({ ML1: [1, 1, 0, 1, 0], ML2: [1, 1, 1, 0, 0, 0], ML3: [1, 0, 0, 0], ML4: [1, 0, 0, 0, 0, 0] }, { answers: { ML1: 'B; karena "murah"\n13.000/kg', ML3: '9 hari' }, progressAtSubmit: {}, scoredAt: '2026-11-12T09:00:00Z', mcqAnswers: { PG1: 1 } }),
    akhir: phaseWith({ ML1: full(ML1), ML2: full(ML2), ML3: full(ML3), ML4: [1, 1, 1, 1, 0, 0] }, { progressAtSubmit: { M1: 'selesai', M2: 'selesai', M3: 'selesai', M4: 'terbuka' }, scoredAt: 'y', mcqAnswers: { PG1: 1, PG2: 2, PG3: 1, PG4: 1 } }),
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
    expect(akhirML1[rows[0].indexOf('modul_selesai_saat_kirim')]).toBe('M1 M2 M3');
  });

  it('rinci: kolom PG (jawaban teks opsi, skor), waktu kirim PG, dan urutan; kolom lama tidak bergeser', () => {
    const rows = detailRows(test, ml, meta);
    const h = rows[0];
    expect(h.slice(-4)).toEqual(['modul_selesai_saat_kirim', 'jawaban', 'pg_dikirim', 'urutan_pg']);
    expect(h.indexOf('skor_pg')).toBe(h.indexOf('jawaban_pg_4') + 1);
    const awal = rows[1];
    const akhir = rows.find((r) => r[3] === 'akhir');
    expect(awal.slice(h.indexOf('jawaban_pg_1'), h.indexOf('skor_pg') + 1)).toEqual(['Toko B', '', '', '', 1]);
    expect(akhir.slice(h.indexOf('jawaban_pg_1'), h.indexOf('skor_pg') + 1)).toEqual(['Toko B', '5 gelas', '9 hari', '18 menit', 4]);
    expect(awal[h.indexOf('pg_dikirim')]).toBe('2026-11-12T08:05:00Z');
    expect(awal[h.indexOf('urutan_pg')]).toBe('setelah uraian');
  });

  it('rinci: PG belum dikirim → kolom PG kosong (uraian tetap tercatat)', () => {
    const rows = detailRows(test, { awal: phaseWith({}, { mcqSubmittedAt: null, mcqAnswers: { PG1: 1 } }), akhir: emptyPhase() }, meta);
    const h = rows[0];
    expect(rows).toHaveLength(1 + 4);
    expect(rows[1].slice(h.indexOf('jawaban_pg_1'), h.indexOf('skor_pg') + 1)).toEqual(['', '', '', '', '']);
    expect(rows[1][h.indexOf('urutan_pg')]).toBe('');
  });

  it('rinci & ringkasan: data alur lama ditandai "bersamaan (alur lama)"', () => {
    const legacy = { ...ml.awal, mcqSeparate: false, mcqSubmittedAt: null };
    const rows = detailRows(test, { awal: legacy, akhir: emptyPhase() }, meta);
    expect(rows[1][rows[0].indexOf('urutan_pg')]).toBe('bersamaan (alur lama)');
    expect(rows[1][rows[0].indexOf('pg_dikirim')]).toBe(legacy.submittedAt);
    const [header, row] = summaryRows(test, { awal: legacy, akhir: ml.akhir }, meta);
    expect(row[header.indexOf('awal_urutan_pg')]).toBe('bersamaan (alur lama)');
    expect(row[header.indexOf('akhir_urutan_pg')]).toBe('setelah uraian');
  });

  it('fase yang belum dikirim tidak masuk CSV rinci', () => {
    expect(detailRows(test, { awal: ml.awal, akhir: emptyPhase() }, meta)).toHaveLength(1 + 4);
  });

  it('ringkasan: skor per indikator awal/akhir, total, N-gain (desimal koma)', () => {
    const [header, row] = summaryRows(test, ml, meta);
    expect(header).toContain('awal_ML1_reasoning');
    expect(header).toContain('akhir_ML4_interpreting');
    const get = (name) => row[header.indexOf(name)];
    expect(get('awal_pg')).toBe(1);
    expect(get('akhir_pg')).toBe(4);
    expect(get('awal_total')).toBe(3 + 3 + 1 + 1 + 1); // uraian 8 + PG 1
    expect(get('akhir_total')).toBe(6 + 6 + 6 + 4 + 4); // uraian 22 + PG 4
    expect(get('skor_maks')).toBe(28);
    expect(get('n_gain')).toBe('0,89'); // (26 − 9) / (28 − 9)
    expect(get('kategori_n_gain')).toBe('tinggi');
  });

  it('format CSV: BOM, pemisah titik koma, kutip untuk ; " dan baris baru', () => {
    const csv = toCsv(detailRows(test, ml, meta));
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('"B; karena ""murah""\n13.000/kg"');
    expect(csv.split('\r\n')[0].split(';')[0]).toBe('﻿perangkat');
  });
});


import mlMcq from '../content/ml-mcq.json';

export const PHASES = ['awal', 'akhir'];

/**
 * Satu fase tes (awal/akhir). Urutan (KP-35): uraian dikirim dulu (`submittedAt`),
 * lalu pilihan ganda di halaman terpisah (`mcqSubmittedAt`).
 *   mcqSeparate     true jika uraian dikirim dengan alur baru (PG belum pernah tampil)
 *   mcqLegacyOpen   true jika PG dikerjakan setelah uraian yang dikirim dengan alur lama
 *                   (opsi PG sudah terlihat di layar uraian)
 */
export const emptyPhase = () => ({
  answers: {},
  mcqAnswers: {},
  startedAt: null,
  submittedAt: null,
  mcqSubmittedAt: null,
  mcqSeparate: false,
  mcqLegacyOpen: false,
  progressAtSubmit: null,
  scores: {},
  scoredAt: null,
});

/**
 * Data alur lama (sebelum KP-35): uraian dan PG dikirim bersamaan. Dikenali TANPA
 * mengubah data tersimpan: uraian terkirim, ada jawaban PG, tanpa tanda alur baru.
 */
export const isLegacyCombined = (phase) =>
  Boolean(phase?.submittedAt) &&
  !phase.mcqSubmittedAt &&
  !phase.mcqSeparate &&
  !phase.mcqLegacyOpen && // PG sedang dikerjakan di halaman terpisah (data lama tanpa jawaban PG)
  mlMcq.some((q) => phase.mcqAnswers?.[q.id] !== undefined);

/** Bagian pilihan ganda sudah dikirim (alur baru) atau dianggap terkirim (alur lama). */
export const mcqSubmitted = (phase) => Boolean(phase?.mcqSubmittedAt) || isLegacyCombined(phase);

/** Waktu kirim PG (alur lama: sama dengan waktu kirim uraian). */
export const mcqSubmittedTime = (phase) =>
  phase?.mcqSubmittedAt ?? (isLegacyCombined(phase) ? phase.submittedAt : null);

/** Keterangan urutan untuk CSV. */
export function mcqOrder(phase) {
  if (isLegacyCombined(phase)) return 'bersamaan (alur lama)';
  if (!phase?.mcqSubmittedAt) return '';
  return phase.mcqLegacyOpen ? 'setelah uraian (opsi sempat terlihat di alur lama)' : 'setelah uraian';
}

/** Semua jawaban uraian sudah dinilai penuh. */
export const essaysScored = (test, phase) => test.tasks.every((t) => taskScore(t, phase?.scores?.[t.id]) !== null);

export function validStageScores(task, scores) {
  return (
    Array.isArray(scores) &&
    scores.length === task.stages.length &&
    scores.every(
      (v, i) =>
        Number.isInteger(v) &&
        v >= 0 &&
        v <= task.stages[i].score
    )
  );
}

export function taskScore(task, scores) {
  return validStageScores(task, scores)
    ? scores.reduce((a, b) => a + b, 0)
    : null;
}

/**
 * belum → mengerjakan (uraian) → pg (uraian terkirim, PG belum) → terkirim → dinilai
 * 'dinilai' = kedua bagian terkirim dan semua uraian sudah dinilai.
 */
export function phaseStatus(test, phase) {
  if (!phase?.submittedAt) {
    return phase?.startedAt ? 'mengerjakan' : 'belum';
  }
  if (!mcqSubmitted(phase)) return 'pg';
  return essaysScored(test, phase) ? 'dinilai' : 'terkirim';
}

/** Skor PG (1 per jawaban benar). Rumus tidak berubah; hanya dihitung setelah PG dikirim. */
export function mcqScore(phase) {
  if (!phase) return 0;

  return mlMcq.reduce((total, question) => {
    return total + (
      phase.mcqAnswers?.[question.id] === question.answer ? 1 : 0
    );
  }, 0);
}

export function phaseSummary(test, phase) {
  const perTask = test.tasks.map((t) => ({
    id: t.id,
    code: t.indicator.code,
    name: t.indicator.name,
    score: taskScore(t, phase?.scores?.[t.id]),
    max: t.maxScore,
  }));

  const status = phaseStatus(test, phase);

  // skor uraian bisa terlihat begitu semua uraian dinilai; total baru ada jika PG juga terkirim
  const essayTotal = phase?.submittedAt && essaysScored(test, phase)
    ? perTask.reduce((a, t) => a + t.score, 0)
    : null;

  const total = status === 'dinilai'
    ? essayTotal + mcqScore(phase)
    : null;

  const max = test.maxScore + mlMcq.length;

  return {
    status,
    total,
    max,
    essayTotal,
    mcqTotal: mcqSubmitted(phase) ? mcqScore(phase) : null,
    mcqMax: mlMcq.length,
    perTask,
  };
}

export function nGain(pre, post, max) {
  if (
    pre === null ||
    post === null ||
    pre === undefined ||
    post === undefined ||
    pre >= max
  ) {
    return null;
  }

  return (post - pre) / (max - pre);
}

export function nGainCategory(g) {
  if (g === null) return null;
  if (g >= 0.7) return 'tinggi';
  if (g >= 0.3) return 'sedang';
  return 'rendah';
}

export const isAnswered = (text) =>
  typeof text === 'string' && text.trim().length > 0;

const decimal = (x, digits = 2) =>
  x === null || x === undefined
    ? ''
    : x.toFixed(digits).replace('.', ',');

function cell(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[";\n\r]/.test(s)
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function toCsv(rows) {
  return (
    '\uFEFF' +
    rows.map((r) => r.map(cell).join(';')).join('\r\n') +
    '\r\n'
  );
}

const MAX_STAGES = 6;

export function detailRows(test, ml, meta) {
  const header = [
    'perangkat',
    'kode_peserta',
    'kelas',
    'fase',
    'soal',
    'indikator',
    ...Array.from(
      { length: MAX_STAGES },
      (_, i) => `tahap_${i + 1}`
    ),
    'skor_soal',
    'skor_maks_soal',
    'jawaban_pg_1',
    'jawaban_pg_2',
    'jawaban_pg_3',
    'jawaban_pg_4',
    'skor_pg',
    'dikirim',
    'dinilai',
    'modul_selesai_saat_kirim',
    'jawaban',
    'pg_dikirim',
    'urutan_pg',
  ];

  const rows = [header];

  for (const phaseName of PHASES) {
    const phase = ml[phaseName];
    if (!phase?.submittedAt) continue;

    const done = Object.entries(phase.progressAtSubmit || {})
      .filter(([, v]) => v === 'selesai')
      .map(([k]) => k)
      .join(' ');

    const pgDone = mcqSubmitted(phase);

    for (const task of test.tasks) {
      const scores = phase.scores?.[task.id];

      const stageCells = Array.from(
        { length: MAX_STAGES },
        (_, i) =>
          i < task.stages.length && Array.isArray(scores)
            ? scores[i] ?? ''
            : ''
      );

      rows.push([
        meta.deviceId,
        meta.participant,
        meta.grade,
        phaseName,
        task.id,
        task.indicator.name,
        ...stageCells,
        taskScore(task, scores) ?? '',
        task.maxScore,
        ...mlMcq.map((q) => {
          const answer = phase.mcqAnswers?.[q.id];
          return !pgDone || answer === undefined
            ? ''
            : q.options[answer] ?? '';
        }),
        pgDone ? mcqScore(phase) : '',
        phase.submittedAt,
        phase.scoredAt ?? '',
        done,
        phase.answers?.[task.id] ?? '',
        mcqSubmittedTime(phase) ?? '',
        mcqOrder(phase),
      ]);
    }
  }

  return rows;
}

export function summaryRows(test, ml, meta) {
  const pre = phaseSummary(test, ml.awal);
  const post = phaseSummary(test, ml.akhir);

  const max = test.maxScore + mlMcq.length;
  const g = nGain(pre.total, post.total, max);

  const header = [
    'perangkat',
    'kode_peserta',
    'kelas',
    ...test.tasks.flatMap((t) => [
      `awal_${t.id}_${t.indicator.code}`,
      `akhir_${t.id}_${t.indicator.code}`,
    ]),
    'awal_pg',
    'akhir_pg',
    'awal_total',
    'akhir_total',
    'skor_maks',
    'n_gain',
    'kategori_n_gain',
    'awal_urutan_pg',
    'akhir_urutan_pg',
  ];

  const row = [
    meta.deviceId,
    meta.participant,
    meta.grade,
    ...test.tasks.flatMap((t, i) => [
      pre.perTask[i].score ?? '',
      post.perTask[i].score ?? '',
    ]),
    pre.mcqTotal ?? '',
    post.mcqTotal ?? '',
    pre.total ?? '',
    post.total ?? '',
    max,
    decimal(g),
    nGainCategory(g) ?? '',
    mcqOrder(ml.awal),
    mcqOrder(ml.akhir),
  ];

  return [header, row];
}

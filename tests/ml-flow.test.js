
// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import test from '../src/content/ml-test.json';
import { store } from '../src/data/store.js';
import { pendingEvents, clearEvents } from '../src/data/logger.js';
import mlMcq from '../src/content/ml-mcq.json';
import {
  mlIntroScreen, mlTaskScreen, mlSubmitScreen, mlResultScreen, mlGraderHome, mlGradeScreen, mlEntries, newDeviceId,
  mlMcqIntroScreen, mlMcqScreen, mlMcqSubmitScreen,
} from '../src/screens/mlTest.js';
import { homeScreen } from '../src/screens/home.js';
import { detailRows } from '../src/engine/mlScore.js';

const $ = (root, sel) => root.querySelector(sel);
const $$ = (root, sel) => [...root.querySelectorAll(sel)];
const buttonByText = (root, text) => $$(root, 'button').find((b) => b.textContent.trim() === text);

function ctx(extra = {}) {
  const calls = [];
  return { calls, test, store, go: (h) => calls.push(h), ...extra };
}

function mount(nodes) {
  const root = document.createElement('div');
  root.append(...nodes);
  return root;
}

const pickScore = (root, i, v) => {
  const option = $$($$(root, '.ml-stage')[i], 'label.ml-score-option')
    .find((l) => l.textContent.trim().startsWith(String(v)));
  option.click();
};

const checkedScores = (root) => $$(root, '.ml-stage').map((st) => {
  const r = $(st, 'input[type=radio]:checked');
  return r ? Number(r.value) : null;
});

const type = (area, value) => {
  area.value = value;
  area.dispatchEvent(new Event('input'));
};

/** Memilih opsi ke-`choice` (0 = A) pada PG nomor `index` (klik label, seperti mengetuk). */
function pickMcq(phase, index, choice, c = ctx()) {
  const root = mount(mlMcqScreen({ ...c, phase, index }));
  $$(root, 'label.ml-mcq-option')[choice].click();
  return root;
}

/** Mengirim uraian saja (bagian 1). */
function takeEssays(phase, answers = [
  'B, karena 13.000/kg paling murah',
  '3/12 = x/20',
  '6 × 15 = 10 × x, x = 9 hari',
  '18 menit, 32 salah',
]) {
  buttonByText(mount(mlIntroScreen({ ...ctx(), phase })), 'Mulai').click();
  answers.forEach((a, i) => {
    type($(mount(mlTaskScreen({ ...ctx(), phase, index: i })), 'textarea'), a);
  });
  const review = mount(mlSubmitScreen({ ...ctx(), phase }));
  buttonByText(review, 'Kirim jawaban').click();
  buttonByText(review, 'Ya, kirim').click();
}

/** Mengirim pilihan ganda (bagian 2). Bawaan: semua opsi A (semua salah; kunci 1, 2, 1, 1). */
function takeMcq(phase, choices = [0, 0, 0, 0]) {
  choices.forEach((ch, i) => ch !== null && pickMcq(phase, i, ch));
  const review = mount(mlMcqSubmitScreen({ ...ctx(), phase }));
  buttonByText(review, 'Kirim pilihan ganda').click();
  buttonByText(review, 'Ya, kirim').click();
}

/** Tes lengkap: uraian lalu pilihan ganda. */
function takeTest(phase, answers, choices) {
  takeEssays(phase, answers);
  takeMcq(phase, choices);
}

const OPTION_TEXTS = mlMcq.flatMap((q) => q.options);

function grade(phase, index, values) {
  const c = ctx();
  const root = mount(mlGradeScreen({ ...c, phase, index }));
  values.forEach((v, i) => pickScore(root, i, v));
  buttonByText(root, 'Simpan nilai').click();
  return c.calls;
}

const FULL = test.tasks.map((t) => t.stages.map((s) => s.score));

beforeEach(() => {
  store.reset();
  store.update((s) => (s.grade = 7));
  clearEvents();
});

describe('siswa mengerjakan tes awal', () => {
  it('pengantar → Mulai: mencatat waktu mulai dan kode perangkat', () => {
    const c = ctx();
    const root = mount(mlIntroScreen({ ...c, phase: 'awal' }));
    expect(root.textContent).toContain('Tes ini berisi 4 soal cerita');
    buttonByText(root, 'Mulai').click();
    expect(c.calls).toEqual(['#/tes-ml/awal/0']);
    expect(store.get().ml.awal.startedAt).toBeTruthy();
    expect(store.get().ml.deviceId).toMatch(/^P-[A-Z2-9]{6}$/);
    expect(pendingEvents().map((e) => e.row.type)).toEqual(['ml_start']);
  });

  it('satu soal per layar, teks soal lengkap, kotak jawaban bebas; draf tersimpan', () => {
    buttonByText(mount(mlIntroScreen({ ...ctx(), phase: 'awal' })), 'Mulai').click();
    const root = mount(mlTaskScreen({ ...ctx(), phase: 'awal', index: 0 }));
    expect($(root, '.progress').textContent).toBe('Soal 1/4');
    expect($$(root, '.ml-list li').map((li) => li.textContent)).toEqual([
      'A: 2 kg seharga Rp28.000.',
      'B: 3 kg seharga Rp39.000.',
      'C: 5 kg seharga Rp70.000.',
    ]);
    expect(root.textContent).not.toContain('Mathematical Reasoning');
    type($(root, 'textarea'), 'Kemasan B');
    expect(store.get().ml.awal.answers.ML1).toBe('Kemasan B');
    expect($(mount(mlTaskScreen({ ...ctx(), phase: 'awal', index: 0 })), 'textarea').value).toBe('Kemasan B');
  });

  it('navigasi: Kembali/Lanjut, soal terakhir → periksa jawaban', () => {
    buttonByText(mount(mlIntroScreen({ ...ctx(), phase: 'awal' })), 'Mulai').click();
    const c = ctx();
    const r0 = mount(mlTaskScreen({ ...c, phase: 'awal', index: 0 }));
    buttonByText(r0, 'Lanjut').click();
    buttonByText(r0, 'Kembali').click();
    const r3 = mount(mlTaskScreen({ ...c, phase: 'awal', index: 3 }));
    buttonByText(r3, 'Periksa jawaban').click();
    expect(c.calls).toEqual([
      '#/tes-ml/awal/1',
      '#/tes-ml/awal',
      '#/tes-ml/awal/kirim',
    ]);
  });

  it('periksa: menandai soal kosong; kirim perlu konfirmasi', () => {
    buttonByText(mount(mlIntroScreen({ ...ctx(), phase: 'awal' })), 'Mulai').click();
    type($(mount(mlTaskScreen({ ...ctx(), phase: 'awal', index: 0 })), 'textarea'), 'B');
    const c = ctx();
    const root = mount(mlSubmitScreen({ ...c, phase: 'awal' }));

    expect(root.textContent).toContain('Uraian nomor 2, 3, 4 belum diisi.');
    expect(root.textContent).not.toContain('Pilihan ganda nomor');

    buttonByText(root, 'Kirim jawaban').click();
    expect(root.textContent).toContain('Setelah dikirim, jawaban uraian tidak bisa diubah');
    buttonByText(root, 'Batal').click();
    expect(store.get().ml.awal.submittedAt).toBeNull();

    buttonByText(root, 'Kirim jawaban').click();
    buttonByText(root, 'Ya, kirim').click();
    expect(store.get().ml.awal).toMatchObject({ submittedAt: expect.any(String), mcqSeparate: true, mcqSubmittedAt: null });
    expect(c.calls).toEqual(['#/tes-ml/awal/pg']); // langsung ke bagian pilihan ganda

    const ev = pendingEvents().find((e) => e.row.type === 'ml_submit').row;
    expect(ev).toMatchObject({
      module_id: 'ML',
      payload: { phase: 'awal', part: 'uraian', answered: 1, answers: { ML1: 'B' } },
    });
  });

  it('semua soal kosong: tidak bisa dikirim', () => {
    buttonByText(mount(mlIntroScreen({ ...ctx(), phase: 'awal' })), 'Mulai').click();
    type($(mount(mlTaskScreen({ ...ctx(), phase: 'awal', index: 0 })), 'textarea'), '   ');
    const root = mount(mlSubmitScreen({ ...ctx(), phase: 'awal' }));
    expect(root.textContent).toContain('Belum ada jawaban yang tersimpan');
    expect(buttonByText(root, 'Kirim jawaban')).toBeUndefined();
    expect(store.get().ml.awal.submittedAt).toBeNull();
  });

  it('setelah uraian dikirim: uraian terkunci, siswa diarahkan ke pilihan ganda', () => {
    takeEssays('awal');
    for (const nodes of [
      mlTaskScreen({ ...ctx(), phase: 'awal', index: 0 }),
      mlSubmitScreen({ ...ctx(), phase: 'awal' }),
      mlIntroScreen({ ...ctx(), phase: 'awal' }),
      mlResultScreen({ ...ctx(), phase: 'awal' }), // hasil belum boleh tampil
    ]) {
      const r = mount(nodes);
      expect($(r, 'textarea')).toBeNull();
      expect(r.textContent).toContain('Sekarang kerjakan 4 soal pilihan ganda');
    }
  });

  it('setelah kedua bagian dikirim: uraian dan PG tidak bisa dibuka/diubah lagi', () => {
    takeTest('awal');
    const screens = [
      mlTaskScreen({ ...ctx(), phase: 'awal', index: 0 }),
      mlSubmitScreen({ ...ctx(), phase: 'awal' }),
      mlIntroScreen({ ...ctx(), phase: 'awal' }),
      mlMcqIntroScreen({ ...ctx(), phase: 'awal' }),
      mlMcqScreen({ ...ctx(), phase: 'awal', index: 0 }),
      mlMcqSubmitScreen({ ...ctx(), phase: 'awal' }),
    ];
    for (const nodes of screens) {
      const r = mount(nodes);
      expect($(r, 'textarea')).toBeNull();
      expect($(r, 'label.ml-mcq-option')).toBeNull();
      expect(r.textContent).toContain('Jawabanmu sudah terkirim');
    }
  });

  it('kemajuan modul saat mengirim dicatat', () => {
    store.update((s) => (s.progress = { M1: 'selesai' }));
    takeTest('awal');
    expect(store.get().ml.awal.progressAtSubmit).toEqual({ M1: 'selesai' });
  });
});

describe('pilihan ganda di halaman terpisah, setelah uraian (KP-35)', () => {
  it('opsi PG TIDAK pernah tampil sebelum uraian dikirim (layar uraian, periksa, maupun alamat PG langsung)', () => {
    buttonByText(mount(mlIntroScreen({ ...ctx(), phase: 'awal' })), 'Mulai').click();
    const screens = [
      ...test.tasks.map((_, i) => mlTaskScreen({ ...ctx(), phase: 'awal', index: i })),
      mlSubmitScreen({ ...ctx(), phase: 'awal' }),
      mlMcqIntroScreen({ ...ctx(), phase: 'awal' }),
      ...mlMcq.map((_, i) => mlMcqScreen({ ...ctx(), phase: 'awal', index: i })),
      mlMcqSubmitScreen({ ...ctx(), phase: 'awal' }),
    ];
    for (const nodes of screens) {
      const r = mount(nodes);
      expect($(r, 'label.ml-mcq-option')).toBeNull();
      expect(r.textContent).not.toContain('Pilihan ganda');
      for (const opt of OPTION_TEXTS.filter((o) => !/^\d+ (gelas|hari|menit)$/.test(o))) expect(r.textContent).not.toContain(opt);
      for (const opt of ['4 gelas', '25 hari', '16 menit', '20 menit']) expect(r.textContent).not.toContain(opt);
      for (const q of mlMcq) expect(r.textContent).not.toContain(q.question);
    }
    expect(store.get().ml.awal.mcqAnswers).toEqual({});
  });

  it('satu soal PG per layar, opsi A–D, pilihan tersimpan dan bisa diubah', () => {
    takeEssays('awal');
    expect(mount(mlMcqIntroScreen({ ...ctx(), phase: 'awal' })).textContent).toContain('Jawaban uraianmu sudah terkirim');
    const root = mount(mlMcqScreen({ ...ctx(), phase: 'awal', index: 0 }));
    expect($(root, '.progress').textContent).toBe('Pilihan ganda 1/4');
    expect(root.textContent).toContain(mlMcq[0].question);
    expect($$(root, 'label.ml-mcq-option').map((l) => l.textContent)).toEqual(['A. Toko A', 'B. Toko B', 'C. Toko C', 'D. Semua sama']);
    expect(root.textContent).not.toContain(mlMcq[1].question); // satu soal per layar
    $$(root, 'label.ml-mcq-option')[2].click();
    expect(store.get().ml.awal.mcqAnswers).toEqual({ PG1: 2 });
    $$(root, 'label.ml-mcq-option')[1].click();
    expect(store.get().ml.awal.mcqAnswers).toEqual({ PG1: 1 });
    const again = mount(mlMcqScreen({ ...ctx(), phase: 'awal', index: 0 }));
    expect($$(again, 'input[type=radio]').map((i) => i.checked)).toEqual([false, true, false, false]);
  });

  it('navigasi PG: Kembali/Lanjut, nomor terakhir → periksa', () => {
    takeEssays('awal');
    const c = ctx();
    buttonByText(mount(mlMcqScreen({ ...c, phase: 'awal', index: 0 })), 'Kembali').click();
    buttonByText(mount(mlMcqScreen({ ...c, phase: 'awal', index: 0 })), 'Lanjut').click();
    buttonByText(mount(mlMcqScreen({ ...c, phase: 'awal', index: 3 })), 'Periksa jawaban').click();
    expect(c.calls).toEqual(['#/tes-ml/awal/pg', '#/tes-ml/awal/pg/1', '#/tes-ml/awal/pg/kirim']);
  });

  it('kirim PG: boleh belum lengkap (dengan peringatan); semua kosong → tidak bisa', () => {
    takeEssays('awal');
    let root = mount(mlMcqSubmitScreen({ ...ctx(), phase: 'awal' }));
    expect(root.textContent).toContain('Belum ada pilihan yang dipilih');
    expect(buttonByText(root, 'Kirim pilihan ganda')).toBeUndefined();

    pickMcq('awal', 0, 1);
    const c = ctx();
    root = mount(mlMcqSubmitScreen({ ...c, phase: 'awal' }));
    expect(root.textContent).toContain('Pilihan ganda nomor 2, 3, 4 belum dipilih.');
    buttonByText(root, 'Kirim pilihan ganda').click();
    buttonByText(root, 'Ya, kirim').click();
    expect(store.get().ml.awal).toMatchObject({ mcqSubmittedAt: expect.any(String), mcqAnswers: { PG1: 1 }, mcqLegacyOpen: false });
    expect(c.calls).toEqual(['#/tes-ml/awal/hasil']);
    const ev = pendingEvents().filter((e) => e.row.type === 'ml_submit').at(-1).row;
    expect(ev.payload).toEqual({ phase: 'awal', part: 'pg', answered: 1, mcqAnswers: { PG1: 1 } });
  });

  it('kunci PG hanya ditampilkan setelah tes AKHIR', () => {
    takeTest('awal', undefined, [1, 2, 1, 1]);
    const awal = mount(mlResultScreen({ ...ctx(), phase: 'awal' }));
    expect(awal.textContent).toContain('Kunci jawaban tidak ditampilkan');
    expect(awal.textContent).not.toContain('Jawaban benar:');
    takeTest('akhir', undefined, [1, 0, 1, 1]);
    const akhir = mount(mlResultScreen({ ...ctx(), phase: 'akhir' }));
    expect(akhir.textContent).toContain('Skor pilihan ganda: 3 dari 4');
    expect(akhir.textContent).toContain('Jawaban benar: 5 gelas');
  });

  it('peta belajar & penilai: uraian terkirim, PG belum', () => {
    takeEssays('awal');
    const home = mount(homeScreen({ state: store.get(), titles: {}, available: [], go: () => {}, onReset: () => {}, tests: mlEntries(test, store.get().ml) }));
    const btn = (label) => $$(home, 'button.module').find((b) => b.textContent.startsWith(label));
    expect(btn('Tes awal').textContent).toContain('Lanjutkan pilihan ganda');
    expect(btn('Tes akhir').disabled).toBe(true);
    const grader = mount(mlGraderHome(ctx()));
    expect(grader.textContent).toContain('Uraian terkirim, pilihan ganda belum');
    expect(grader.textContent).toContain('Pilihan ganda: belum dikirim siswa. Uraian sudah bisa dinilai.');
    const awalButtons = $$($$(grader, '.ml-phase')[0], 'button.choice');
    expect(awalButtons).toHaveLength(4);
    expect(awalButtons.every((b) => !b.disabled)).toBe(true); // uraian tes awal sudah bisa dinilai
  });

  it('uraian dinilai sebelum PG dikirim → waktu penilaian tetap tercatat, total menunggu PG', () => {
    takeEssays('awal');
    FULL.forEach((v, i) => grade('awal', i, v));
    expect(store.get().ml.awal.scoredAt).toBeTruthy();
    expect(mount(mlGraderHome(ctx())).textContent).not.toContain('24/28');
    takeMcq('awal', [1, 2, 1, 1]);
    expect(mount(mlGraderHome(ctx())).textContent).toContain('Tes awal · Sudah dinilai · 28/28');
  });
});

describe('tes akhir', () => {
  it('terkunci sampai uraian DAN pilihan ganda tes awal dikirim', () => {
    const c = ctx();
    const root = mount(mlIntroScreen({ ...c, phase: 'akhir' }));
    expect(root.textContent).toContain('Kerjakan tes awal dulu');
    expect(buttonByText(root, 'Mulai')).toBeUndefined();
    takeEssays('awal');
    expect(buttonByText(mount(mlIntroScreen({ ...ctx(), phase: 'akhir' })), 'Mulai')).toBeUndefined();
    takeMcq('awal');
    expect(buttonByText(mount(mlIntroScreen({ ...ctx(), phase: 'akhir' })), 'Mulai')).toBeDefined();
  });

  it('jawaban tes akhir terpisah dari tes awal', () => {
    takeTest('awal', ['awal-1', '', '', '']);
    takeTest('akhir', ['akhir-1', '', '', '']);
    expect(store.get().ml.awal.answers.ML1).toBe('awal-1');
    expect(store.get().ml.akhir.answers.ML1).toBe('akhir-1');
  });
});

describe('penilai mengisi skor per tahap rubrik', () => {
  it('belum dikirim → tidak bisa dinilai', () => {
    const root = mount(mlGradeScreen({ ...ctx(), phase: 'awal', index: 0 }));
    expect(root.textContent).toContain('Tes awal belum dikirim siswa');
    expect($$(mount(mlGraderHome(ctx())), 'button.choice').every((b) => b.disabled)).toBe(true);
  });

  it('menampilkan soal, jawaban siswa, dan tiap tahap dengan pilihan 0..maks tahap', () => {
    takeTest('awal');
    const root = mount(mlGradeScreen({ ...ctx(), phase: 'awal', index: 0 }));
    expect($(root, '.ml-student-answer').textContent).toBe('B, karena 13.000/kg paling murah');
    const stages = $$(root, '.ml-stage');
    expect(stages).toHaveLength(5);
    expect(stages.map((s) => $$(s, 'input[type=radio]').map((b) => b.value).join(','))).toEqual([
      '0,1', '0,1,2', '0,1', '0,1', '0,1',
    ]);
    expect(new Set(stages.map((s) => $(s, 'input').name)).size).toBe(5);
    expect($$(root, 'label.ml-score-option')).toHaveLength(11);
    expect(stages[1].textContent).toContain('Tahap 2 (maks. 2): Menghitung harga per kg kemasan A dan B');
  });

  it('Simpan aktif setelah semua tahap diisi; skor & kejadian tercatat; lanjut ke soal berikut', () => {
    takeTest('awal');
    const c = ctx();
    const root = mount(mlGradeScreen({ ...c, phase: 'awal', index: 0 }));
    expect(buttonByText(root, 'Simpan nilai').disabled).toBe(true);
    expect(root.textContent).toContain('Skor soal 1: — / 6 (0 dari 5 tahap dinilai)');
    pickScore(root, 0, 1);
    expect(checkedScores(root)).toEqual([1, null, null, null, null]);
    expect(root.textContent).toContain('(1 dari 5 tahap dinilai)');
    expect(buttonByText(root, 'Simpan nilai').disabled).toBe(true);
    pickScore(root, 0, 0);
    expect(checkedScores(root)).toEqual([0, null, null, null, null]);
    [1, 1, 0, 1, 1].forEach((v, i) => pickScore(root, i, v));
    expect(checkedScores(root)).toEqual([1, 1, 0, 1, 1]);
    expect(root.textContent).toContain('Skor soal 1: 4 / 6');
    expect(buttonByText(root, 'Simpan nilai').disabled).toBe(false);
    buttonByText(root, 'Simpan nilai').click();
    expect(store.get().ml.awal.scores.ML1).toEqual([1, 1, 0, 1, 1]);
    expect(c.calls).toEqual(['#/tes-ml/penilai/awal/1']);
    expect(pendingEvents().find((e) => e.row.type === 'ml_score').row).toMatchObject({
      item_id: 'ML1',
      payload: { phase: 'awal', scores: [1, 1, 0, 1, 1], total: 4 },
    });
    expect(store.get().ml.awal.scoredAt).toBeNull();
  });

  it('nilai tersimpan tampil lagi saat dibuka ulang dan bisa diubah', () => {
    takeTest('awal');
    takeTest('akhir');
    grade('awal', 1, [1, 0, 1, 1, 0, 1]);
    grade('akhir', 1, [1, 1, 1, 1, 1, 1]);
    const again = mount(mlGradeScreen({ ...ctx(), phase: 'awal', index: 1 }));
    expect(checkedScores(again)).toEqual([1, 0, 1, 1, 0, 1]);
    expect(again.textContent).toContain('Skor soal 2: 4 / 6');
    expect(buttonByText(again, 'Simpan nilai').disabled).toBe(false);
    expect(checkedScores(mount(mlGradeScreen({ ...ctx(), phase: 'akhir', index: 1 })))).toEqual([1, 1, 1, 1, 1, 1]);
    grade('awal', 1, [1, 1, 1, 1, 1, 1]);
    expect(store.get().ml.awal.scores.ML2).toEqual([1, 1, 1, 1, 1, 1]);
    expect(store.get().ml.akhir.scores.ML2).toEqual([1, 1, 1, 1, 1, 1]);
    expect(store.get().ml.awal.answers.ML1).toBe('B, karena 13.000/kg paling murah');
  });

  it('keempat soal dinilai → waktu penilaian tercatat; soal terakhir kembali ke daftar', () => {
    takeTest('awal');
    FULL.forEach((v, i) => grade('awal', i, v));
    expect(store.get().ml.awal.scoredAt).toBeTruthy();
    expect(grade('awal', 3, FULL[3])).toEqual(['#/tes-ml/penilai']);
  });

  it('kode peserta disimpan (bukan nama)', () => {
    const root = mount(mlGraderHome(ctx()));
    type($(root, 'input'), ' S07 ');
    expect(store.get().ml.participant).toBe('S07');
  });
});

describe('hasil untuk siswa', () => {
  it('sebelum dinilai: pesan menunggu', () => {
    takeTest('awal');
    expect(mount(mlResultScreen({ ...ctx(), phase: 'awal' })).textContent)
      .toContain('Skor keseluruhan akan muncul setelah jawaban esai dinilai guru.');
  });

  it('setelah dinilai: skor total & per kemampuan, tanpa kunci jawaban/rubrik', () => {
    takeTest('awal');
    [[1, 2, 1, 1, 1], [1, 1, 1, 1, 0, 0], [1, 2, 0, 1], [1, 0, 0, 0, 0, 0]]
      .forEach((v, i) => grade('awal', i, v));

    const root = mount(mlResultScreen({ ...ctx(), phase: 'awal' }));
    expect(root.textContent).toContain('Skor sementara/keseluruhan: 15 dari 28.');
    expect($$(root, '.ml-score-table tbody tr').map((tr) => tr.textContent)).toEqual([
      '1Mathematical Reasoning6/6',
      '2Formulating Situations Mathematically4/6',
      '3Employing Mathematical Concepts, Facts, and Procedures4/6',
      '4Interpreting, Applying, and Evaluating Mathematical Outcomes1/6',
    ]);
    for (const task of test.tasks) {
      for (const st of task.stages) {
        expect(root.textContent).not.toContain(st.description);
      }
    }
    expect(root.textContent).not.toContain('Rp13.000/kg');
  });

  it('awal & akhir sudah dinilai: perbandingan skor dan N-gain di layar penilai', () => {
    takeTest('awal');
    [[1, 0, 0, 1, 0], [1, 1, 0, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0, 0, 0]]
      .forEach((v, i) => grade('awal', i, v));

    takeTest('akhir');
    [[1, 2, 1, 1, 1], [1, 1, 1, 1, 1, 0], [1, 2, 2, 1], [1, 1, 1, 1, 0, 0]]
      .forEach((v, i) => grade('akhir', i, v));

    expect(mount(mlResultScreen({ ...ctx(), phase: 'akhir' })).textContent)
      .toContain('Tes awal: 6 · Tes akhir: 21 (dari 28).');
    expect(mount(mlGraderHome(ctx())).textContent)
      .toContain('N-gain: 0,68 (sedang)');
  });
});

describe('unduh CSV dan peta belajar', () => {
  it('tombol unduh membuat CSV rinci & ringkasan dengan kode perangkat dan kode peserta', () => {
    takeTest('awal');
    FULL.forEach((v, i) => grade('awal', i, v));
    store.update((s) => (s.ml.participant = 'S07'));

    const files = [];
    const root = mount(mlGraderHome(ctx({
      download: (name, text) => files.push([name, text]),
    })));

    buttonByText(root, 'Unduh CSV rinci').click();
    buttonByText(root, 'Unduh CSV ringkasan').click();

    const id = store.get().ml.deviceId;
    expect(files.map(([n]) => n)).toEqual([
      `nalls-tes-literasi-rinci-${id}.csv`,
      `nalls-tes-literasi-ringkasan-${id}.csv`,
    ]);
    expect(files[0][1].split('\r\n')[1]).toContain(
      `${id};S07;7;awal;ML1;Mathematical Reasoning;1;2;1;1;1;;6;6;`
    );
    expect(files[1][1]).toContain(';24;;28;;');
  });

  it('peta belajar menampilkan tes awal/akhir beserta statusnya dan tautan penilai', () => {
    const show = () => mount(homeScreen({
      state: store.get(),
      titles: {},
      available: [],
      go: () => {},
      onReset: () => {},
      tests: mlEntries(test, store.get().ml),
    }));

    let root = show();
    expect(root.textContent).toContain('Kerjakan Tes awal sebelum mulai belajar.');
    const statusOf = (r, label) =>
      $$(r, 'button.module').find((b) => b.textContent.startsWith(label));

    expect(statusOf(root, 'Tes awal').textContent).toContain('Mulai');
    expect(statusOf(root, 'Tes akhir').disabled).toBe(true);
    expect(buttonByText(root, 'Penilaian tes (guru/peneliti)')).toBeDefined();

    takeTest('awal');
    FULL.forEach((v, i) => grade('awal', i, v));
    root = show();

    expect(statusOf(root, 'Tes awal').textContent).toContain('Skor 24/28');
    expect(statusOf(root, 'Tes akhir').disabled).toBe(false);
    expect(root.textContent).not.toContain('Kerjakan Tes awal sebelum');
  });

  it('kode perangkat acak tanpa huruf mirip', () => {
    expect(newDeviceId(() => 0)).toBe('P-AAAAAA');
    expect(newDeviceId()).toMatch(/^P-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$/);
  });
});

describe('muat ulang halaman: draf dan nilai tetap ada', () => {
  function memoryStorage() {
    const data = new Map();
    return {
      getItem: (k) => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => data.set(k, String(v)),
      removeItem: (k) => data.delete(k),
    };
  }

  async function freshStore() {
    vi.resetModules();
    return (await import('../src/data/store.js')).store;
  }

  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('draf jawaban, status kirim, dan skor terbaca lagi', async () => {
    const before = await freshStore();
    buttonByText(mount(mlIntroScreen({ ...ctx({ store: before }), phase: 'awal' })), 'Mulai').click();
    type($(mount(mlTaskScreen({ ...ctx({ store: before }), phase: 'awal', index: 1 })), 'textarea'), 'draf soal 2');

    const after = await freshStore();
    expect($(mount(mlTaskScreen({ ...ctx({ store: after }), phase: 'awal', index: 1 })), 'textarea').value)
      .toBe('draf soal 2');
    expect(after.get().ml.deviceId).toBe(before.get().ml.deviceId);
  });

  it('dua tab: tab lama tidak menimpa jawaban yang diketik di tab lain', async () => {
    const studentTab = await freshStore();
    const graderTab = await freshStore();
    graderTab.get();

    buttonByText(mount(mlIntroScreen({ ...ctx({ store: studentTab }), phase: 'awal' })), 'Mulai').click();

    test.tasks.forEach((t, i) => {
      type(
        $(mount(mlTaskScreen({ ...ctx({ store: studentTab }), phase: 'awal', index: i })), 'textarea'),
        `jawaban ${i + 1}`
      );
    });

    const review = mount(mlSubmitScreen({ ...ctx({ store: studentTab }), phase: 'awal' }));
    buttonByText(review, 'Kirim jawaban').click();
    buttonByText(review, 'Ya, kirim').click();

    type($(mount(mlGraderHome({ ...ctx({ store: graderTab }) })), 'input'), 'S07');

    const fresh = await freshStore();
    expect(fresh.get().ml.awal.answers).toEqual({
      ML1: 'jawaban 1',
      ML2: 'jawaban 2',
      ML3: 'jawaban 3',
      ML4: 'jawaban 4',
    });
    expect(fresh.get().ml.participant).toBe('S07');

    const gradeRoot = mount(mlGradeScreen({
      ...ctx({ store: graderTab }),
      phase: 'awal',
      index: 2,
    }));
    expect($(gradeRoot, '.ml-student-answer').textContent).toBe('jawaban 3');
  });

  it('data uji coba lama (tes terkirim) tetap terbaca apa adanya', async () => {
    const old = {
      grade: 7,
      progress: { M1: 'selesai' },
      ml: {
        deviceId: 'P-2YMDBM',
        participant: 'P01',
        awal: {
          answers: { ML1: 'lama' },
          startedAt: 'a',
          submittedAt: 'b',
          progressAtSubmit: {},
          scores: {},
          scoredAt: null,
        },
      },
    };

    localStorage.setItem('mathsave:v1', JSON.stringify(old));
    const s = await freshStore();

    expect(s.get().ml).toMatchObject({
      deviceId: 'P-2YMDBM',
      participant: 'P01',
      awal: {
        answers: { ML1: 'lama' },
        submittedAt: 'b',
      },
    });

    expect($(mount(mlGradeScreen({
      ...ctx({ store: s }),
      phase: 'awal',
      index: 0,
    })), '.ml-student-answer').textContent).toBe('lama');
  });

  // Data uji coba ALUR LAMA: uraian + PG dikirim bersamaan (sebelum KP-35).
  const legacyRecord = () => ({
    grade: 7,
    progress: { M1: 'selesai' },
    ml: {
      deviceId: 'P-LAMA01',
      participant: 'P01',
      awal: {
        answers: { ML1: 'jawaban lama 1', ML2: 'jawaban lama 2' },
        mcqAnswers: { PG1: 1, PG2: 0, PG3: 1 },
        startedAt: '2026-11-12T06:49:40.722Z',
        submittedAt: '2026-11-12T06:51:38.636Z',
        progressAtSubmit: {},
        scores: { ML1: [1, 2, 1, 1, 1] },
        scoredAt: null,
      },
    },
  });

  it('data alur lama (PG sudah dijawab): tetap terkirim, tidak dibuka ulang, skor PG & CSV "bersamaan (alur lama)"', async () => {
    localStorage.setItem('mathsave:v1', JSON.stringify(legacyRecord()));
    const before = localStorage.getItem('mathsave:v1');
    const s = await freshStore();
    const c = ctx({ store: s });

    // siswa: langsung ke hasil, tidak diminta mengerjakan PG lagi
    expect(mount(mlIntroScreen({ ...c, phase: 'awal' })).textContent).toContain('Jawabanmu sudah terkirim');
    expect($(mount(mlMcqScreen({ ...c, phase: 'awal', index: 3 })), 'label.ml-mcq-option')).toBeNull();
    // tes akhir terbuka
    expect(mlEntries(test, s.get().ml)[1].enabled).toBe(true);
    // penilai: skor PG otomatis 2 (PG1 & PG3 benar), ditandai alur lama
    const grader = mount(mlGraderHome(c));
    expect(grader.textContent).toContain('Skor pilihan ganda otomatis: 2/4 (alur lama: dikerjakan bersamaan dengan uraian)');
    // CSV: jawaban uraian & PG lengkap, urutan ditandai
    const rows = detailRows(test, s.get().ml, { deviceId: 'P-LAMA01', participant: 'P01', grade: 7 });
    const h = rows[0];
    expect(rows[1][h.indexOf('jawaban')]).toBe('jawaban lama 1');
    expect(rows[1].slice(h.indexOf('jawaban_pg_1'), h.indexOf('skor_pg') + 1)).toEqual(['Toko B', '3 gelas', '9 hari', '', 2]);
    expect(rows[1][h.indexOf('urutan_pg')]).toBe('bersamaan (alur lama)');
    expect(rows[1][h.indexOf('pg_dikirim')]).toBe('2026-11-12T06:51:38.636Z');
    // membaca & membuka layar tidak mengubah data tersimpan
    expect(localStorage.getItem('mathsave:v1')).toBe(before);
    // menilai uraian hanya menambah skor; jawaban & pilihan lama tetap
    FULL.slice(1).forEach((v, i) => {
      const root = mount(mlGradeScreen({ ...c, phase: 'awal', index: i + 1 }));
      v.forEach((val, j) => pickScore(root, j, val));
      buttonByText(root, 'Simpan nilai').click();
    });
    const after = JSON.parse(localStorage.getItem('mathsave:v1')).ml.awal;
    expect(after.answers).toEqual(legacyRecord().ml.awal.answers);
    expect(after.mcqAnswers).toEqual(legacyRecord().ml.awal.mcqAnswers);
    expect(after.submittedAt).toBe(legacyRecord().ml.awal.submittedAt);
    expect(mount(mlGraderHome(c)).textContent).toContain('Tes awal · Sudah dinilai · 26/28');
  });

  it('data alur lama TANPA jawaban PG: uraian tetap terkirim, siswa diminta mengerjakan PG; CSV menandai opsi sempat terlihat', async () => {
    const rec = legacyRecord();
    rec.ml.awal.mcqAnswers = {};
    localStorage.setItem('mathsave:v1', JSON.stringify(rec));
    const s = await freshStore();
    const c = ctx({ store: s });
    expect(mount(mlIntroScreen({ ...c, phase: 'awal' })).textContent).toContain('Sekarang kerjakan 4 soal pilihan ganda');
    expect(mlEntries(test, s.get().ml)[1].enabled).toBe(false);
    $$(mount(mlMcqScreen({ ...c, phase: 'awal', index: 0 })), 'label.ml-mcq-option')[1].click();
    // satu pilihan sudah diisi tetapi BELUM dikirim → masih bagian PG, bukan "terkirim bersamaan"
    expect(mlEntries(test, s.get().ml)[0].status).toBe('pg');
    expect($$(mount(mlMcqScreen({ ...c, phase: 'awal', index: 1 })), 'label.ml-mcq-option')).toHaveLength(4);
    const review = mount(mlMcqSubmitScreen({ ...c, phase: 'awal' }));
    buttonByText(review, 'Kirim pilihan ganda').click();
    buttonByText(review, 'Ya, kirim').click();
    const saved = s.get().ml.awal;
    expect(saved).toMatchObject({ mcqLegacyOpen: true, submittedAt: rec.ml.awal.submittedAt, answers: rec.ml.awal.answers });
    const rows = detailRows(test, s.get().ml, { deviceId: 'x', participant: '', grade: 7 });
    expect(rows[1][rows[0].indexOf('urutan_pg')]).toBe('setelah uraian (opsi sempat terlihat di alur lama)');
  });

  it('data lama tanpa bagian tes tetap terbaca', async () => {
    localStorage.setItem('mathsave:v1', JSON.stringify({
      grade: 8,
      progress: { M1: 'selesai' },
    }));

    const s = await freshStore();
    expect(s.get().ml.awal).toMatchObject({
      answers: {},
      submittedAt: null,
    });
    expect(s.get().progress).toEqual({ M1: 'selesai' });
  });
});


// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import test from '../src/content/ml-test.json';
import { store } from '../src/data/store.js';
import { pendingEvents, clearEvents } from '../src/data/logger.js';
import {
  mlIntroScreen, mlTaskScreen, mlSubmitScreen, mlResultScreen, mlGraderHome, mlGradeScreen, mlEntries, newDeviceId,
} from '../src/screens/mlTest.js';
import { homeScreen } from '../src/screens/home.js';

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

function takeTest(
  phase,
  answers = [
    'B, karena 13.000/kg paling murah',
    '3/12 = x/20',
    '6 × 15 = 10 × x, x = 9 hari',
    '18 menit, 32 salah',
  ]
) {
  buttonByText(mount(mlIntroScreen({ ...ctx(), phase })), 'Mulai').click();
  answers.forEach((a, i) => {
    type($(mount(mlTaskScreen({ ...ctx(), phase, index: i })), 'textarea'), a);
  });

  const review = mount(mlSubmitScreen({ ...ctx(), phase }));
  buttonByText(review, 'Kirim jawaban').click();
  buttonByText(review, 'Ya, kirim').click();
}

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

    expect(root.textContent).toContain('Esai nomor 2, 3, 4 belum diisi.');
    expect(root.textContent).toContain('Pilihan ganda nomor 1, 2, 3, 4 belum dipilih.');

    buttonByText(root, 'Kirim jawaban').click();
    expect(root.textContent).toContain('Setelah dikirim, jawaban tidak bisa diubah');
    buttonByText(root, 'Batal').click();
    expect(store.get().ml.awal.submittedAt).toBeNull();

    buttonByText(root, 'Kirim jawaban').click();
    buttonByText(root, 'Ya, kirim').click();
    expect(store.get().ml.awal.submittedAt).toBeTruthy();
    expect(c.calls).toEqual(['#/tes-ml/awal/hasil']);

    const ev = pendingEvents().find((e) => e.row.type === 'ml_submit').row;
    expect(ev).toMatchObject({
      module_id: 'ML',
      payload: { phase: 'awal', answers: { ML1: 'B' } },
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

  it('setelah dikirim: soal tidak bisa dibuka/diubah lagi', () => {
    takeTest('awal');
    const again = mount(mlTaskScreen({ ...ctx(), phase: 'awal', index: 0 }));
    expect($(again, 'textarea')).toBeNull();
    expect(again.textContent).toContain('Jawabanmu sudah terkirim');
    expect(mount(mlSubmitScreen({ ...ctx(), phase: 'awal' })).textContent).toContain('Jawabanmu sudah terkirim');
    expect(mount(mlIntroScreen({ ...ctx(), phase: 'awal' })).textContent).toContain('Jawabanmu sudah terkirim');
  });

  it('kemajuan modul saat mengirim dicatat', () => {
    store.update((s) => (s.progress = { M1: 'selesai' }));
    takeTest('awal');
    expect(store.get().ml.awal.progressAtSubmit).toEqual({ M1: 'selesai' });
  });
});

describe('tes akhir', () => {
  it('terkunci sampai tes awal dikirim', () => {
    const c = ctx();
    const root = mount(mlIntroScreen({ ...c, phase: 'akhir' }));
    expect(root.textContent).toContain('Kerjakan tes awal dulu');
    expect(buttonByText(root, 'Mulai')).toBeUndefined();
    takeTest('awal');
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

/**
 * Tes Mathematical Literacy (F17): 4 soal uraian + 4 soal pilihan ganda (PG), maks. 24 + 4 = 28.
 * Urutan (KP-35): uraian dikerjakan & dikirim dulu; PG baru tampil di halaman terpisah
 * setelah uraian terkirim, agar pilihan jawaban PG tidak membantu menjawab uraian.
 *
 * Siswa:  #/tes-ml/<fase>                 pengantar
 *         #/tes-ml/<fase>/<n>             uraian ke-n (draf tersimpan otomatis)
 *         #/tes-ml/<fase>/kirim           periksa & kirim uraian (lalu terkunci)
 *         #/tes-ml/<fase>/pg              pengantar PG (hanya setelah uraian terkirim)
 *         #/tes-ml/<fase>/pg/<n>          PG ke-n, satu soal per layar
 *         #/tes-ml/<fase>/pg/kirim        periksa & kirim PG (lalu terkunci)
 *         #/tes-ml/<fase>/hasil           hasil (kunci PG hanya setelah tes akhir)
 * Penilai: #/tes-ml/penilai[/<fase>/<n>]
 */
import { h, fill } from '../components/dom.js';
import { topBar, feedbackBox } from '../components/question.js';
import {
  PHASES, phaseSummary, taskScore, isAnswered, mcqSubmitted, essaysScored, isLegacyCombined,
  nGain, nGainCategory, toCsv, detailRows, summaryRows,
} from '../engine/mlScore.js';
import { logEvent } from '../data/logger.js';
import mlMcq from '../content/ml-mcq.json';

const STATUS_TEXT = {
  belum: 'Belum dikerjakan',
  mengerjakan: 'Sedang dikerjakan',
  pg: 'Uraian terkirim, pilihan ganda belum',
  terkirim: 'Terkirim, menunggu nilai',
  dinilai: 'Sudah dinilai',
};

/** Ke mana siswa diarahkan jika membuka layar yang sudah tidak berlaku. */
function redirectFor({ test, phase, store, go }) {
  const p = store.get().ml[phase];
  if (!p.startedAt) return mlIntroScreen({ test, phase, store, go });
  if (!p.submittedAt) return null;
  return mcqSubmitted(p) ? mlResultScreen({ test, phase, store, go }) : mlMcqIntroScreen({ test, phase, store, go });
}

export function newDeviceId(rnd = Math.random) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return 'P-' + Array.from(
    { length: 6 },
    () => alphabet[Math.floor(rnd() * alphabet.length)],
  ).join('');
}

const phaseLabel = (test, phase) => test.phases[phase];

export function mlEntries(test, ml) {
  return PHASES.map((phase) => {
    const sum = phaseSummary(test, ml?.[phase]);
    // tes akhir terbuka setelah uraian DAN pilihan ganda tes awal terkirim
    const enabled = phase === 'awal' || mcqSubmitted(ml?.awal);
    return {
      phase,
      label: phaseLabel(test, phase),
      status: sum.status,
      total: sum.total,
      max: sum.max,
      enabled,
    };
  });
}

function taskText(task) {
  return task.text.map((part) =>
    typeof part === 'string'
      ? h('p', {}, part)
      : h('ul', { class: 'ml-list' }, part.list.map((li) => h('li', {}, li))),
  );
}

// ---------------------------------------------------------------------------
// Layar siswa
// ---------------------------------------------------------------------------

export function mlIntroScreen({ test, phase, store, go }) {
  const ml = store.get().ml;

  if (phase === 'akhir' && !mcqSubmitted(ml.awal)) {
    return [
      topBar(phaseLabel(test, phase)),
      h(
        'main',
        { class: 'screen' },
        h('p', {}, 'Kerjakan tes awal dulu, ya.'),
        h('button', {
          type: 'button',
          class: 'primary wide',
          onClick: () => go('#/'),
        }, 'Ke peta belajar'),
      ),
    ];
  }

  if (ml[phase].submittedAt) return redirectFor({ test, phase, store, go });

  const started = Boolean(ml[phase].startedAt);

  return [
    topBar(phaseLabel(test, phase)),
    h(
      'main',
      { class: 'screen' },
      test.intro.map((p) => h('p', {}, p)),
      h('button', {
        type: 'button',
        class: 'primary wide',
        onClick: () => {
          store.update((s) => {
            if (!s.ml.deviceId) s.ml.deviceId = newDeviceId();
            if (!s.ml[phase].startedAt) {
              s.ml[phase].startedAt = new Date().toISOString();
            }
          });
          if (!started) {
            logEvent('ml_start', { module_id: 'ML', payload: { phase } });
          }
          go(`#/tes-ml/${phase}/0`);
        },
      }, started ? 'Lanjutkan' : 'Mulai'),
    ),
  ];
}

export function mlTaskScreen({ test, phase, index, store, go }) {
  const ml = store.get().ml;
  const redirect = redirectFor({ test, phase, store, go });
  if (redirect) return redirect;

  const task = test.tasks[index];
  const last = index === test.tasks.length - 1;

  const area = h('textarea', {
    class: 'ml-answer',
    rows: '8',
    maxlength: '2000',
    'aria-label': `Jawaban soal ${index + 1}`,
  });

  area.value = ml[phase].answers[task.id] ?? '';
  area.addEventListener('input', () => {
    store.update((s) => {
      s.ml[phase].answers[task.id] = area.value;
    });
  });

  return [
    topBar(phaseLabel(test, phase), `Soal ${index + 1}/${test.tasks.length}`),
    h(
      'main',
      { class: 'screen', 'data-task-id': task.id },
      h('div', { class: 'problem ml-problem' }, taskText(task)),
      h('label', { class: 'ml-label' }, 'Jawabanmu (tulis langkah dan alasannya):'),
      area,
      h('p', { class: 'note ml-note' }, 'Jawaban tersimpan otomatis.'),
    ),
    h(
      'nav',
      { class: 'navbar two', 'aria-label': 'Navigasi soal' },
      h('button', {
        type: 'button',
        onClick: () => go(
          index > 0 ? `#/tes-ml/${phase}/${index - 1}` : `#/tes-ml/${phase}`,
        ),
      }, 'Kembali'),
      h('button', {
        type: 'button',
        class: 'primary',
        onClick: () => go(
          last ? `#/tes-ml/${phase}/kirim` : `#/tes-ml/${phase}/${index + 1}`,
        ),
      }, last ? 'Periksa jawaban' : 'Lanjut'),
    ),
  ];
}

export function mlSubmitScreen({ test, phase, store, go }) {
  const ml = store.get().ml;
  const redirect = redirectFor({ test, phase, store, go });
  if (redirect) return redirect;

  const main = h('main', { class: 'screen' });
  const answers = ml[phase].answers;

  const emptyEssay = test.tasks
    .map((t, i) => isAnswered(answers[t.id]) ? null : i + 1)
    .filter(Boolean);

  const list = h(
    'ul',
    { class: 'module-list' },
    test.tasks.map((t, i) =>
      h(
        'li',
        {},
        h(
          'button',
          {
            type: 'button',
            class: 'module',
            onClick: () => go(`#/tes-ml/${phase}/${i}`),
          },
          h('span', {}, `Soal ${i + 1}`),
          h(
            'span',
            { class: 'status' },
            isAnswered(answers[t.id]) ? 'Sudah diisi ✓' : 'Belum diisi',
          ),
        ),
      ),
    ),
  );

  function send() {
    const state = store.get();
    const hasEssay = test.tasks.some((t) => isAnswered(state.ml[phase].answers[t.id]));
    if (!hasEssay) return draw(false);

    store.update((s) => {
      s.ml[phase].submittedAt = new Date().toISOString();
      s.ml[phase].progressAtSubmit = { ...state.progress };
      s.ml[phase].mcqSeparate = true; // alur baru: PG belum pernah tampil
    });

    logEvent('ml_submit', {
      module_id: 'ML',
      payload: {
        phase,
        part: 'uraian',
        answered: test.tasks.filter((t) => isAnswered(state.ml[phase].answers[t.id])).length,
        answers: { ...state.ml[phase].answers },
      },
    });

    go(`#/tes-ml/${phase}/pg`);
  }

  function draw(confirming) {
    const noAnswer = emptyEssay.length === test.tasks.length;

    fill(
      main,
      h('p', {}, 'Periksa lagi jawaban uraianmu. Ketuk soal untuk mengubahnya.'),
      list,
      noAnswer
        ? feedbackBox('info', null, 'Belum ada jawaban yang tersimpan. Isi jawabanmu dulu, lalu kirim.')
        : null,
      !noAnswer && emptyEssay.length
        ? feedbackBox('info', null, `Uraian nomor ${emptyEssay.join(', ')} belum diisi.`)
        : null,
      noAnswer
        ? null
        : confirming
          ? [
              h('p', {}, h('strong', {}, 'Setelah dikirim, jawaban uraian tidak bisa diubah. Lalu kamu mengerjakan 4 soal pilihan ganda. Kirim sekarang?')),
              h('button', {
                type: 'button',
                class: 'primary wide',
                onClick: send,
              }, 'Ya, kirim'),
              h('button', {
                type: 'button',
                class: 'wide',
                onClick: () => draw(false),
              }, 'Batal'),
            ]
          : h('button', {
              type: 'button',
              class: 'primary wide',
              onClick: () => draw(true),
            }, 'Kirim jawaban'),
    );
  }

  draw(false);
  return [topBar(phaseLabel(test, phase), 'Periksa uraian'), main];
}

// ---------------------------------------------------------------------------
// Pilihan ganda: hanya setelah uraian terkirim (KP-35)
// ---------------------------------------------------------------------------

/** Pengalihan khusus layar PG: belum kirim uraian → kembali ke uraian; PG terkirim → hasil. */
function mcqGuard({ test, phase, store, go }) {
  const p = store.get().ml[phase];
  if (!p.startedAt) return mlIntroScreen({ test, phase, store, go });
  if (!p.submittedAt) return mlTaskScreen({ test, phase, index: 0, store, go });
  if (mcqSubmitted(p)) return mlResultScreen({ test, phase, store, go });
  return null;
}

export function mlMcqIntroScreen({ test, phase, store, go }) {
  const guard = mcqGuard({ test, phase, store, go });
  if (guard) return guard;
  const started = Object.keys(store.get().ml[phase].mcqAnswers ?? {}).length > 0;
  return [
    topBar(phaseLabel(test, phase), 'Pilihan ganda'),
    h(
      'main',
      { class: 'screen' },
      h('p', {}, 'Jawaban uraianmu sudah terkirim. Terima kasih!'),
      h('p', {}, `Sekarang kerjakan ${mlMcq.length} soal pilihan ganda. Pilih satu jawaban di setiap soal.`),
      h('button', { type: 'button', class: 'primary wide', onClick: () => go(`#/tes-ml/${phase}/pg/0`) }, started ? 'Lanjutkan' : 'Mulai pilihan ganda'),
    ),
  ];
}

export function mlMcqScreen({ test, phase, index, store, go }) {
  const guard = mcqGuard({ test, phase, store, go });
  if (guard) return guard;

  const q = mlMcq[index];
  const last = index === mlMcq.length - 1;
  const chosen = store.get().ml[phase].mcqAnswers?.[q.id];

  const options = h(
    'div',
    { class: 'ml-mcq-options', role: 'radiogroup', 'aria-label': `Pilihan jawaban nomor ${index + 1}` },
    q.options.map((option, i) => {
      const input = h('input', { type: 'radio', name: `${phase}-${q.id}`, value: String(i) });
      input.checked = chosen === i;
      const pick = () => {
        if (!input.checked) return;
        options.querySelectorAll('input').forEach((o) => (o.checked = o === input));
        store.update((s) => {
          if (!s.ml[phase].mcqAnswers) s.ml[phase].mcqAnswers = {};
          s.ml[phase].mcqAnswers[q.id] = i;
          // uraian dari alur lama: tandai agar pilihan yang sedang diisi tidak dianggap "terkirim bersamaan"
          if (!s.ml[phase].mcqSeparate) s.ml[phase].mcqLegacyOpen = true;
        });
      };
      input.addEventListener('change', pick);
      input.addEventListener('click', pick);
      return h('label', { class: 'ml-mcq-option' }, input, h('span', {}, `${'ABCD'[i] ?? i + 1}. ${option}`));
    }),
  );

  return [
    topBar(phaseLabel(test, phase), `Pilihan ganda ${index + 1}/${mlMcq.length}`),
    h(
      'main',
      { class: 'screen', 'data-mcq-id': q.id },
      h('div', { class: 'problem ml-problem' }, h('p', {}, q.question)),
      options,
      h('p', { class: 'note ml-note' }, 'Pilihan tersimpan otomatis.'),
    ),
    h(
      'nav',
      { class: 'navbar two', 'aria-label': 'Navigasi pilihan ganda' },
      h('button', { type: 'button', onClick: () => go(index > 0 ? `#/tes-ml/${phase}/pg/${index - 1}` : `#/tes-ml/${phase}/pg`) }, 'Kembali'),
      h('button', { type: 'button', class: 'primary', onClick: () => go(last ? `#/tes-ml/${phase}/pg/kirim` : `#/tes-ml/${phase}/pg/${index + 1}`) }, last ? 'Periksa jawaban' : 'Lanjut'),
    ),
  ];
}

export function mlMcqSubmitScreen({ test, phase, store, go }) {
  const guard = mcqGuard({ test, phase, store, go });
  if (guard) return guard;

  const main = h('main', { class: 'screen' });
  const answers = store.get().ml[phase].mcqAnswers ?? {};
  const empty = mlMcq.map((q, i) => (answers[q.id] === undefined ? i + 1 : null)).filter(Boolean);
  const list = h(
    'ul',
    { class: 'module-list' },
    mlMcq.map((q, i) =>
      h('li', {}, h('button', { type: 'button', class: 'module', onClick: () => go(`#/tes-ml/${phase}/pg/${i}`) },
        h('span', {}, `Pilihan ganda ${i + 1}`),
        h('span', { class: 'status' }, answers[q.id] === undefined ? 'Belum dipilih' : 'Sudah dipilih ✓'))),
    ),
  );

  function send() {
    const p = store.get().ml[phase];
    const now = p.mcqAnswers ?? {};
    if (!mlMcq.some((q) => now[q.id] !== undefined)) return draw(false);
    store.update((s) => {
      s.ml[phase].mcqSubmittedAt = new Date().toISOString();
      // uraian dikirim dengan alur lama (opsi PG sempat tampil di layar uraian)
      if (!s.ml[phase].mcqSeparate) s.ml[phase].mcqLegacyOpen = true;
    });
    logEvent('ml_submit', {
      module_id: 'ML',
      payload: { phase, part: 'pg', answered: mlMcq.filter((q) => now[q.id] !== undefined).length, mcqAnswers: { ...now } },
    });
    go(`#/tes-ml/${phase}/hasil`);
  }

  function draw(confirming) {
    const noAnswer = empty.length === mlMcq.length;
    fill(
      main,
      h('p', {}, 'Periksa lagi pilihanmu. Ketuk nomor untuk mengubahnya.'),
      list,
      noAnswer
        ? feedbackBox('info', null, 'Belum ada pilihan yang dipilih. Pilih jawabanmu dulu, lalu kirim.')
        : empty.length
          ? feedbackBox('info', null, `Pilihan ganda nomor ${empty.join(', ')} belum dipilih.`)
          : null,
      noAnswer
        ? null
        : confirming
          ? [
              h('p', {}, h('strong', {}, 'Setelah dikirim, pilihan tidak bisa diubah. Kirim sekarang?')),
              h('button', { type: 'button', class: 'primary wide', onClick: send }, 'Ya, kirim'),
              h('button', { type: 'button', class: 'wide', onClick: () => draw(false) }, 'Batal'),
            ]
          : h('button', { type: 'button', class: 'primary wide', onClick: () => draw(true) }, 'Kirim pilihan ganda'),
    );
  }
  draw(false);
  return [topBar(phaseLabel(test, phase), 'Periksa pilihan ganda'), main];
}

export function mlResultScreen({ test, phase, store, go }) {
  const ml = store.get().ml;
  // hasil (termasuk kunci PG tes akhir) baru boleh tampil setelah kedua bagian terkirim
  if (!ml[phase].submittedAt) return mlIntroScreen({ test, phase, store, go });
  if (!mcqSubmitted(ml[phase])) return mlMcqIntroScreen({ test, phase, store, go });
  const sum = phaseSummary(test, ml[phase]);
  const pre = phaseSummary(test, ml.awal);
  const post = phaseSummary(test, ml.akhir);
  const mcqAnswers = ml[phase].mcqAnswers ?? {};

  const mcqResult = phase === 'akhir'
    ? [
        h('h2', {}, 'Hasil pilihan ganda'),
        h('p', {}, `Skor pilihan ganda: ${sum.mcqTotal ?? 0} dari ${mlMcq.length}`),
        ...mlMcq.map((q, i) => {
          const chosen = mcqAnswers[q.id];
          const correct = chosen === q.answer;
          return h(
            'section',
            { class: 'ml-mcq-result' },
            h('p', {}, h('strong', {}, `Nomor ${i + 1}. `), q.question),
            h(
              'p',
              {},
              chosen === undefined
                ? 'Belum dijawab.'
                : correct ? 'Jawaban benar.' : 'Jawaban belum tepat.',
            ),
            h('p', {}, `Jawaban benar: ${q.options[q.answer]}`),
          );
        }),
      ]
    : [
        h('p', {}, 'Jawaban pilihan ganda tes awal tersimpan. Kunci jawaban tidak ditampilkan agar tes akhir tetap adil.'),
      ];

  const body = [
    h('p', {}, 'Jawabanmu sudah terkirim. Terima kasih!'),
    ...mcqResult,
    h(
      'p',
      {},
      sum.total === null
        ? 'Skor keseluruhan akan muncul setelah jawaban esai dinilai guru.'
        : `Skor sementara/keseluruhan: ${sum.total} dari ${sum.max}.`,
    ),
    sum.status === 'dinilai'
      ? h(
          'table',
          { class: 'rel-table ml-score-table' },
          h(
            'thead',
            {},
            h('tr', {}, h('th', {}, 'Soal'), h('th', {}, 'Kemampuan'), h('th', {}, 'Skor')),
          ),
          h(
            'tbody',
            {},
            sum.perTask.map((t, i) =>
              h('tr', {}, h('td', {}, String(i + 1)), h('td', {}, t.name), h('td', {}, `${t.score}/${t.max}`)),
            ),
          ),
        )
      : null,
    pre.total !== null && post.total !== null
      ? h('p', {}, `Tes awal: ${pre.total} · Tes akhir: ${post.total} (dari ${sum.max}).`)
      : null,
  ];

  return [
    topBar(phaseLabel(test, phase), 'Hasil'),
    h('main', { class: 'screen' }, body),
    h(
      'nav',
      { class: 'navbar single' },
      h('button', {
        type: 'button',
        class: 'primary',
        onClick: () => go('#/'),
      }, 'Ke peta belajar'),
    ),
  ];
}

// ---------------------------------------------------------------------------
// Layar penilai
// ---------------------------------------------------------------------------

function defaultDownload(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function mlGraderHome({ test, store, go, download = defaultDownload }) {
  const state = store.get();
  const ml = state.ml;

  const meta = () => ({
    deviceId: store.get().ml.deviceId ?? '',
    participant: store.get().ml.participant ?? '',
    grade: store.get().grade ?? '',
  });

  const pre = phaseSummary(test, ml.awal);
  const post = phaseSummary(test, ml.akhir);
  const g = nGain(pre.total, post.total, test.maxScore + mlMcq.length);

  const code = h('input', {
    type: 'text',
    class: 'answer-input',
    maxlength: '20',
    autocomplete: 'off',
    'aria-label': 'Kode peserta',
  });

  code.value = ml.participant ?? '';
  code.addEventListener('input', () => {
    store.update((s) => {
      s.ml.participant = code.value.trim();
    });
  });

  const phaseBlock = (phase) => {
    const sum = phase === 'awal' ? pre : post;
    const submitted = Boolean(ml[phase].submittedAt);

    return h(
      'section',
      { class: 'ml-phase' },
      h(
        'h2',
        {},
        `${phaseLabel(test, phase)} · ${STATUS_TEXT[sum.status]}${sum.total !== null ? ` · ${sum.total}/${sum.max}` : ''}`,
      ),
      h(
        'div',
        { class: 'choices' },
        test.tasks.map((t, i) =>
          h(
            'button',
            {
              type: 'button',
              class: 'choice',
              disabled: !submitted,
              onClick: () => go(`#/tes-ml/penilai/${phase}/${i}`),
            },
            `Nilai esai ${i + 1}${sum.perTask[i].score !== null ? ` (${sum.perTask[i].score}/${sum.perTask[i].max})` : ''}`,
          ),
        ),
      ),
      !submitted
        ? null
        : mcqSubmitted(ml[phase])
          ? h('p', {}, `Skor pilihan ganda otomatis: ${sum.mcqTotal ?? 0}/${mlMcq.length}${isLegacyCombined(ml[phase]) ? ' (alur lama: dikerjakan bersamaan dengan uraian)' : ''}`)
          : h('p', {}, 'Pilihan ganda: belum dikirim siswa. Uraian sudah bisa dinilai.'),
    );
  };

  return [
    topBar('Penilaian tes literasi'),
    h(
      'main',
      { class: 'screen' },
      h('p', { class: 'note ml-note' }, 'Untuk guru/peneliti. Nilai jawaban esai dengan rubrik tiap tahap.'),
      h('p', {}, `Perangkat: ${ml.deviceId ?? '— (tes belum dimulai)'}`),
      h('label', { class: 'ml-label' }, 'Kode peserta (bukan nama):'),
      code,
      PHASES.map(phaseBlock),
      pre.total !== null && post.total !== null
        ? h('p', {}, `N-gain: ${g === null ? '—' : g.toFixed(2).replace('.', ',')}${g === null ? '' : ` (${nGainCategory(g)})`}`)
        : null,
      h('button', {
        type: 'button',
        class: 'wide',
        disabled: !ml.awal.submittedAt,
        onClick: () => download(
          `nalls-tes-literasi-rinci-${meta().deviceId || 'perangkat'}.csv`,
          toCsv(detailRows(test, store.get().ml, meta())),
        ),
      }, 'Unduh CSV rinci'),
      h('button', {
        type: 'button',
        class: 'wide',
        disabled: !ml.awal.submittedAt,
        onClick: () => download(
          `nalls-tes-literasi-ringkasan-${meta().deviceId || 'perangkat'}.csv`,
          toCsv(summaryRows(test, store.get().ml, meta())),
        ),
      }, 'Unduh CSV ringkasan'),
    ),
    h(
      'nav',
      { class: 'navbar single' },
      h('button', {
        type: 'button',
        class: 'primary',
        onClick: () => go('#/'),
      }, 'Ke peta belajar'),
    ),
  ];
}

export function mlGradeScreen({ test, phase, index, store, go }) {
  const ml = store.get().ml;
  const task = test.tasks[index];

  if (!ml[phase].submittedAt) {
    return [
      topBar('Penilaian tes literasi'),
      h(
        'main',
        { class: 'screen' },
        h('p', {}, `${phaseLabel(test, phase)} belum dikirim siswa.`),
        h('button', {
          type: 'button',
          class: 'primary wide',
          onClick: () => go('#/tes-ml/penilai'),
        }, 'Kembali'),
      ),
    ];
  }

  const draft = (ml[phase].scores[task.id] ?? task.stages.map(() => null)).slice();
  const answer = ml[phase].answers[task.id];
  const main = h('main', { class: 'screen', 'data-task-id': task.id });

  function save() {
    const total = taskScore(task, draft);

    store.update((s) => {
      s.ml[phase].scores[task.id] = draft.slice();
      if (essaysScored(test, s.ml[phase])) {
        s.ml[phase].scoredAt = new Date().toISOString();
      }
    });

    logEvent('ml_score', {
      module_id: 'ML',
      item_id: task.id,
      payload: { phase, scores: draft.slice(), total },
    });

    go(
      index + 1 < test.tasks.length
        ? `#/tes-ml/penilai/${phase}/${index + 1}`
        : '#/tes-ml/penilai',
    );
  }

  const totalText = h('p', { class: 'ml-task-total' });
  const saveButton = h(
    'button',
    { type: 'button', class: 'primary wide', onClick: save },
    'Simpan nilai',
  );

  function refreshTotal() {
    const total = taskScore(task, draft);
    const filled = draft.filter((v) => v !== null).length;

    totalText.textContent = total === null
      ? `Skor soal ${index + 1}: — / ${task.maxScore} (${filled} dari ${task.stages.length} tahap dinilai)`
      : `Skor soal ${index + 1}: ${total} / ${task.maxScore}`;

    saveButton.disabled = total === null;
  }

  const stageBlock = (st, i) =>
    h(
      'fieldset',
      { class: 'ml-stage' },
      h(
        'legend',
        {},
        h('strong', {}, `Tahap ${st.n} (maks. ${st.score}): `),
        st.description,
      ),
      h(
        'div',
        { class: 'ml-score-options' },
        Array.from({ length: st.score + 1 }, (_, v) => {
          const input = h('input', {
            type: 'radio',
            name: `${phase}-${task.id}-tahap-${st.n}`,
            value: String(v),
            'aria-label': `Tahap ${st.n}: skor ${v}`,
          });

          input.checked = draft[i] === v;

          const pick = () => {
            if (!input.checked) return;
            input.closest('.ml-score-options')
              ?.querySelectorAll('input')
              .forEach((o) => {
                o.checked = o === input;
              });
            draft[i] = v;
            refreshTotal();
          };

          input.addEventListener('change', pick);
          input.addEventListener('click', pick);

          return h(
            'label',
            { class: 'ml-score-option' },
            input,
            h('span', {}, String(v)),
          );
        }),
      ),
    );

  fill(
    main,
    h('p', { class: 'note ml-note' }, `${task.indicator.name}. ${task.indicator.description}`),
    h('div', { class: 'problem ml-problem' }, taskText(task)),
    h('p', {}, h('strong', {}, 'Jawaban siswa:')),
    h('div', { class: 'ml-student-answer' }, isAnswered(answer) ? answer : '(kosong)'),
    h('p', {}, h('strong', {}, 'Rubrik:')),
    task.stages.map(stageBlock),
    totalText,
    saveButton,
  );

  refreshTotal();

  return [
    topBar(`Nilai · ${phaseLabel(test, phase)}`, `Soal ${index + 1}/${test.tasks.length}`),
    main,
    h(
      'nav',
      { class: 'navbar single' },
      h('button', {
        type: 'button',
        onClick: () => go('#/tes-ml/penilai'),
      }, 'Kembali ke daftar'),
    ),
  ];
}

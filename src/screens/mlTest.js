
import { h, fill } from '../components/dom.js';
import { topBar, feedbackBox } from '../components/question.js';
import {
  PHASES, phaseStatus, phaseSummary, taskScore, isAnswered,
  nGain, nGainCategory, toCsv, detailRows, summaryRows,
} from '../engine/mlScore.js';
import { logEvent } from '../data/logger.js';
import mlMcq from '../content/ml-mcq.json';

const STATUS_TEXT = {
  belum: 'Belum dikerjakan',
  mengerjakan: 'Sedang dikerjakan',
  terkirim: 'Terkirim, menunggu nilai',
  dinilai: 'Sudah dinilai',
};

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
    const enabled = phase === 'awal' || Boolean(ml?.awal?.submittedAt);
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

  if (phase === 'akhir' && !ml.awal.submittedAt) {
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

  if (ml[phase].submittedAt) {
    return mlResultScreen({ test, phase, store, go });
  }

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

  if (ml[phase].submittedAt) {
    return mlResultScreen({ test, phase, store, go });
  }
  if (!ml[phase].startedAt) {
    return mlIntroScreen({ test, phase, store, go });
  }

  const task = test.tasks[index];
  const mcq = mlMcq[index];
  const last = index === test.tasks.length - 1;

  const mcqBlock = h(
    'section',
    { class: 'ml-mcq' },
    h('p', {}, h('strong', {}, 'Pilihan Ganda')),
    h('p', {}, mcq.question),
    h(
      'div',
      { class: 'ml-mcq-options' },
      mcq.options.map((option, i) => {
        const input = h('input', {
          type: 'radio',
          name: `${phase}-${mcq.id}`,
          value: String(i),
        });

        input.checked = ml[phase].mcqAnswers?.[mcq.id] === i;
        input.addEventListener('change', () => {
          store.update((s) => {
            if (!s.ml[phase].mcqAnswers) s.ml[phase].mcqAnswers = {};
            s.ml[phase].mcqAnswers[mcq.id] = i;
          });
        });

        return h(
          'label',
          { class: 'ml-mcq-option' },
          input,
          h('span', {}, option),
        );
      }),
    ),
  );

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
      mcqBlock,
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

  if (ml[phase].submittedAt) {
    return mlResultScreen({ test, phase, store, go });
  }
  if (!ml[phase].startedAt) {
    return mlIntroScreen({ test, phase, store, go });
  }

  const main = h('main', { class: 'screen' });
  const answers = ml[phase].answers;
  const mcqAnswers = ml[phase].mcqAnswers ?? {};

  const emptyEssay = test.tasks
    .map((t, i) => isAnswered(answers[t.id]) ? null : i + 1)
    .filter(Boolean);

  const emptyMcq = mlMcq
    .map((q, i) => mcqAnswers[q.id] === undefined ? i + 1 : null)
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
    const hasEssay = test.tasks.some(
      (t) => isAnswered(state.ml[phase].answers[t.id]),
    );
    const hasMcq = mlMcq.some(
      (q) => state.ml[phase].mcqAnswers?.[q.id] !== undefined,
    );

    if (!hasEssay && !hasMcq) return draw(false);

    store.update((s) => {
      s.ml[phase].submittedAt = new Date().toISOString();
      s.ml[phase].progressAtSubmit = { ...state.progress };
    });

    logEvent('ml_submit', {
      module_id: 'ML',
      payload: {
        phase,
        answers: { ...answers },
        mcqAnswers: { ...mcqAnswers },
      },
    });

    go(`#/tes-ml/${phase}/hasil`);
  }

  function draw(confirming) {
    const noAnswer = emptyEssay.length === test.tasks.length &&
      emptyMcq.length === mlMcq.length;

    fill(
      main,
      h('p', {}, 'Periksa lagi jawabanmu. Ketuk soal untuk mengubahnya.'),
      list,
      noAnswer
        ? feedbackBox('info', null, 'Belum ada jawaban yang tersimpan. Isi jawabanmu dulu, lalu kirim.')
        : null,
      emptyEssay.length
        ? feedbackBox('info', null, `Esai nomor ${emptyEssay.join(', ')} belum diisi.`)
        : null,
      emptyMcq.length
        ? feedbackBox('info', null, `Pilihan ganda nomor ${emptyMcq.join(', ')} belum dipilih.`)
        : null,
      noAnswer
        ? null
        : confirming
          ? [
              h('p', {}, h('strong', {}, 'Setelah dikirim, jawaban tidak bisa diubah. Kirim sekarang?')),
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
  return [topBar(phaseLabel(test, phase), 'Periksa'), main];
}

export function mlResultScreen({ test, phase, store, go }) {
  const ml = store.get().ml;
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
      submitted
        ? h('p', {}, `Skor pilihan ganda otomatis: ${sum.mcqTotal ?? 0}/${mlMcq.length}`)
        : null,
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
      if (phaseStatus(test, s.ml[phase]) === 'dinilai') {
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

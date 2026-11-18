/**
 * Bagian interaktif M2 "Senilai atau Berbalik Nilai?" (F03, F11).
 * Alur (docs/naskah-materi.md M2):
 *   kelas VIII: tawaran cek cepat (M2-00) → lulus ≥4/5 boleh ke M3
 *   layar materi M2-01..07 → latihan identifikasi I1–I5 → cek pemahaman C1–C5
 *   → lulus: jelaskan ke temanmu → penutup; belum lulus: ulang dari M2-06, cek diacak.
 * Jawaban cek disimpan per percobaan di store (engine/attempts.js): tidak bisa
 * diubah lewat tombol Kembali / muat ulang, dan hasil dicatat sekali.
 */
import { h, richText, fill } from '../components/dom.js';
import { feedbackBox, hintBox, topBar } from '../components/question.js';
import { explainView } from '../components/explain.js';
import {
  checkIdentify,
  identifyFeedback,
  identifySolution,
  identifyHintLevel,
  identifyShowSolution,
} from '../engine/identify.js';
import {
  recordAnswer,
  firstUnanswered,
  scoreAnswers,
  checkEntry,
  startAttempt,
  closeAttempt,
  markReviewed,
} from '../engine/attempts.js';
import { logStep, logHint, logEvent, logExplanation } from '../data/logger.js';

const ARAH_TEXT = { searah: 'ikut bertambah', berlawanan: 'berkurang' };
const JENIS_TEXT = { senilai: '↑↑ Senilai', berbalik: '↑↓ Berbalik nilai' };
const m2_06Index = (m2) => Math.max(m2.screens.findIndex((s) => s.id === 'M2-06'), 0);

/**
 * Satu soal identifikasi.
 * mode: 'latih' (boleh mencoba lagi, petunjuk bertingkat)
 *       'cek'   (satu kali jawab, T1 atas permintaan)
 *       'cepat' (satu kali jawab, tanpa petunjuk & tanpa umpan balik)
 * saved: jawaban yang sudah tersimpan ({ response, correct }) → soal tampil
 *        terkunci dengan jawaban itu (tidak bisa dijawab ulang).
 * onAnswered(correct, response): dipanggil sekali, pada jawaban pertama.
 */
export function identifyScreen({ item, mode, title, progress, recallCard, saved, onAnswered, onNext, nextLabel = 'Lanjut' }) {
  const container = h('div', { class: 'solve' });
  const hints = item.hints || [];
  const s = { wrong: 0, hint: 0, attempt: 0, finished: false, feedback: null, recall: false };
  const maxHint = mode === 'latih' ? hints.length : mode === 'cek' ? Math.min(1, hints.length) : 0;

  function checkFeedback(r) {
    const fb = identifyFeedback(item, r);
    return r.correct ? feedbackBox('ok', fb.title, fb.text) : feedbackBox('info', 'Belum tepat.', identifySolution(item));
  }

  /** Tampilan soal yang sudah dijawab: jawaban tersimpan + umpan balik yang sama seperti saat menjawab. */
  function savedView({ response }) {
    const yours = h('p', { class: 'saved-answer' }, `Jawabanmu: ${ARAH_TEXT[response?.arah] || '-'}, ${JENIS_TEXT[response?.jenis] || '-'}.`);
    if (mode === 'cepat') return h('div', {}, yours, h('p', { class: 'note' }, 'Jawabanmu sudah disimpan.'));
    return h('div', {}, yours, checkFeedback(checkIdentify(item, response ?? {})));
  }

  if (saved) {
    s.finished = true;
    s.feedback = savedView(saved);
  }

  function submit(response) {
    s.attempt += 1;
    const r = checkIdentify(item, response);
    logStep({
      item_id: item.id,
      attempt_no: s.attempt,
      step: 'jenis',
      response,
      is_correct: r.correct,
      error_type: r.errorType,
      hint_level_max: s.hint,
      phase: mode === 'latih' ? 'latihan' : 'cek',
    });
    if (s.attempt === 1) onAnswered?.(r.correct, response);

    if (mode === 'cepat') return onNext();

    const fb = identifyFeedback(item, r);
    if (r.correct || mode === 'cek') {
      s.finished = true;
      s.feedback = checkFeedback(r);
    } else {
      s.wrong += 1;
      s.hint = Math.max(s.hint, identifyHintLevel(s.wrong, maxHint));
      if (identifyShowSolution(s.wrong)) {
        s.finished = true;
        s.feedback = feedbackBox('info', 'Begini caranya:', identifySolution(item));
      } else {
        s.feedback = feedbackBox('err', fb.title, fb.text);
      }
    }
    draw();
  }

  function form() {
    let arah = null;
    let jenis = null;
    const btn = h('button', { type: 'button', class: 'primary wide', disabled: true }, mode === 'cepat' ? 'Simpan' : 'Periksa');
    btn.addEventListener('click', () => submit({ arah, jenis }));
    const refresh = () => (btn.disabled = !(arah && jenis));
    const group = (options, onPick, label) => {
      const buttons = options.map(([value, text, cls]) =>
        h('button', { type: 'button', role: 'radio', 'aria-checked': 'false', class: `choice ${cls || ''}`, onClick: (e) => {
          onPick(value);
          for (const b of buttons) b.setAttribute('aria-checked', String(b === e.currentTarget));
          refresh();
        } }, text),
      );
      return h('div', { class: 'choices', role: 'radiogroup', 'aria-label': label }, buttons);
    };
    return [
      h('p', {}, `Jika ${item.a} bertambah, ${item.b}…`),
      group([['searah', 'ikut bertambah'], ['berlawanan', 'berkurang']], (v) => (arah = v), 'Arah perubahan'),
      h('p', {}, 'Jadi jenisnya:'),
      group([['senilai', '↑↑ Senilai', 'senilai'], ['berbalik', '↑↓ Berbalik nilai', 'berbalik']], (v) => (jenis = v), 'Jenis perbandingan'),
      btn,
    ];
  }

  function draw() {
    fill(container,
      topBar(title, progress),
      h(
        'main',
        { class: 'screen' },
        h('div', { class: 'problem' }, richText(item.text)),
        s.finished ? null : form(),
        s.feedback,
        !s.finished && mode !== 'cepat'
          ? h('button', { type: 'button', class: 'small link', onClick: () => {
              s.recall = !s.recall;
              if (s.recall) logEvent('recall_open', { module_id: 'M2', item_id: item.id });
              draw();
            } }, 'ⓘ Ingat lagi: cara menentukan jenis')
          : null,
        s.recall && !s.finished
          ? h('div', { class: 'recall' }, recallCard.text.map(richText))
          : null,
        !s.finished && maxHint > 0
          ? hintBox({ hints, level: s.hint, max: maxHint, onMore: () => {
              s.hint += 1;
              logHint({ item_id: item.id, step: 'jenis', level: s.hint });
              draw();
            } })
          : null,
      ),
      s.finished ? h('nav', { class: 'navbar single' }, h('button', { type: 'button', class: 'primary', onClick: onNext }, nextLabel)) : null,
    );
  }

  draw();
  return [container];
}

// ---------------------------------------------------------------------------
// Halaman-halaman M2. Semua menerima { m2, store, go, finishModule, recallCard }.
// ---------------------------------------------------------------------------

/** M2-00: tawaran cek cepat untuk kelas VIII. */
export function offerScreen({ go }) {
  return [
    topBar('Senilai atau Berbalik?'),
    h(
      'main',
      { class: 'screen' },
      h('p', {}, 'Kamu sudah pernah belajar ini di kelas VII. Mau coba cek cepat 5 soal?'),
      h('p', {}, 'Jika 4 benar, kamu boleh langsung ke Modul 3.'),
      h('button', { type: 'button', class: 'primary wide', onClick: () => go('#/m2/cepat/0') }, 'Coba cek cepat'),
      h('button', { type: 'button', class: 'wide', onClick: () => go('#/modul/M2/0') }, 'Pelajari dari awal'),
    ),
  ];
}

/** Cek cepat Q1–Q5 (tanpa petunjuk, tanpa umpan balik per soal, hanya sekali). */
export function quickScreen({ m2, index, store, go, recallCard }) {
  if (store.get().m2.quickDone) return quickResult({ m2, store, go });
  const items = m2.quick;
  const answers = store.get().m2.quick.answers;
  // tidak bisa melompati soal yang belum dijawab
  const pos = Math.min(index, firstUnanswered(items.map((q) => q.id), answers));
  if (pos >= items.length) return quickResult({ m2, store, go });
  const item = items[pos];
  return identifyScreen({
    item,
    mode: 'cepat',
    title: 'Cek cepat',
    progress: `${pos + 1}/${items.length}`,
    recallCard,
    saved: answers[item.id],
    onAnswered: (ok, response) => store.update((s) => recordAnswer(s.m2.quick.answers, item.id, response, ok)),
    onNext: () => go(`#/m2/cepat/${pos + 1}`),
  });
}

function quickResult({ m2, store, go }) {
  if (!store.get().m2.quickDone) {
    // menutup cek cepat: dihitung dan dicatat satu kali
    const ids = m2.quick.map((q) => q.id);
    const { correct, passed } = scoreAnswers(ids, store.get().m2.quick.answers, m2.passScore);
    store.update((s) => {
      s.m2.quickDone = true;
      s.m2.quickScore = correct;
      if (passed) {
        s.m2.passed = true;
        s.progress.M2 = 'selesai';
      }
    });
    logEvent('check_result', { module_id: 'M2', payload: { kind: 'cepat', attempt: 1, correct, passed } });
    if (passed) logEvent('skip_module', { module_id: 'M2', payload: { module: 'M2', quick_score: correct } });
  }
  const correct = store.get().m2.quickScore;
  const passed = correct >= m2.passScore;

  return [
    topBar('Cek cepat'),
    h(
      'main',
      { class: 'screen' },
      h('p', {}, `Kamu menjawab benar ${correct} dari ${m2.quick.length} soal.`),
      passed ? h('p', {}, 'Bagus! Kamu boleh langsung ke Modul 3.') : h('p', {}, 'Kita pelajari pelan-pelan, ya.'),
      passed ? h('button', { type: 'button', class: 'primary wide', onClick: () => go('#/') }, 'Ke peta belajar') : null,
      passed
        ? h('button', { type: 'button', class: 'wide', onClick: () => go('#/modul/M2/0') }, 'Tetap pelajari Modul 2')
        : h('button', { type: 'button', class: 'primary wide', onClick: () => go('#/modul/M2/0') }, 'Mulai belajar'),
    ),
  ];
}

/** Latihan identifikasi I1–I5. */
export function practiceScreen({ m2, index, go, recallCard }) {
  const items = m2.identify;
  return identifyScreen({
    item: items[index],
    mode: 'latih',
    title: 'Latihan: senilai atau berbalik?',
    progress: `${index + 1}/${items.length}`,
    recallCard,
    onNext: () => go(index + 1 < items.length ? `#/m2/latih/${index + 1}` : '#/m2/cek/mulai'),
  });
}

/** Cek pemahaman C1–C5 (jawaban pertama dikunci; urutan diacak saat diulang). */
export function checkScreen({ m2, index, store, go, recallCard }) {
  if (index === 'mulai') return checkStart({ m2, store, go });

  const cek = store.get().m2.cek;
  if (!cek.open) return cek.result ? checkResult({ m2, store, go }) : checkStart({ m2, store, go });

  // tidak bisa melompati soal yang belum dijawab
  const pos = Math.min(index, firstUnanswered(cek.order, cek.answers));
  if (pos >= cek.order.length) return checkResult({ m2, store, go });

  const item = m2.check.find((c) => c.id === cek.order[pos]);
  return identifyScreen({
    item,
    mode: 'cek',
    title: 'Cek pemahaman',
    progress: `${pos + 1}/${cek.order.length}`,
    recallCard,
    saved: cek.answers[item.id],
    onAnswered: (ok, response) => store.update((s) => recordAnswer(s.m2.cek.answers, item.id, response, ok)),
    onNext: () => go(`#/m2/cek/${pos + 1}`),
  });
}

function checkStart({ m2, store, go }) {
  const entry = checkEntry(store.get().m2.cek);
  if (entry === 'lulus') return checkResult({ m2, store, go });
  if (entry === 'ulang_materi') {
    return [
      topBar('Cek pemahaman'),
      h(
        'main',
        { class: 'screen' },
        h('p', {}, 'Sebelum mencoba lagi, ulang dulu bagian yang tadi, ya.'),
        h('button', { type: 'button', class: 'primary wide', onClick: () => go(`#/modul/M2/${m2_06Index(m2)}`) }, 'Ulangi bagian tadi'),
      ),
    ];
  }
  if (entry === 'mulai') store.update((s) => startAttempt(s.m2.cek, m2.check.map((c) => c.id)));

  const cek = store.get().m2.cek;
  const next = firstUnanswered(cek.order, cek.answers);
  return [
    topBar('Cek pemahaman'),
    h(
      'main',
      { class: 'screen' },
      h('p', {}, `Sekarang cek pemahamanmu: ${m2.check.length} soal baru.`),
      h('p', {}, 'Jawab sekali saja tiap soal. Petunjuk pertama boleh dibuka.'),
      h('button', { type: 'button', class: 'primary wide', onClick: () => go(`#/m2/cek/${next}`) }, next > 0 ? 'Lanjutkan' : 'Mulai'),
    ),
  ];
}

function checkResult({ m2, store, go }) {
  let closed = null;
  store.update((s) => {
    closed = closeAttempt(s.m2.cek, m2.passScore);
    if (closed?.passed) s.m2.passed = true;
  });
  // dicatat hanya saat percobaan ditutup, bukan setiap kali layar hasil dibuka
  if (closed) logEvent('check_result', { module_id: 'M2', payload: { kind: 'pemahaman', ...closed } });

  const { correct, passed } = store.get().m2.cek.result;
  return [
    topBar('Cek pemahaman'),
    h(
      'main',
      { class: 'screen' },
      h('p', {}, `Kamu menjawab benar ${correct} dari ${m2.check.length} soal.`),
      passed
        ? h('p', {}, 'Bagus! Kamu sudah bisa membedakan senilai dan berbalik nilai.')
        : h('p', {}, 'Kita ulang bagian yang tadi, ya. Setelah itu coba cek lagi.'),
    ),
    h(
      'nav',
      { class: 'navbar single' },
      h(
        'button',
        { type: 'button', class: 'primary', onClick: () => go(passed ? '#/m2/jelaskan' : `#/modul/M2/${m2_06Index(m2)}`) },
        passed ? 'Lanjut' : 'Ulangi bagian tadi',
      ),
    ),
  ];
}

/** M2-10: Jelaskan ke temanmu. */
export function explainScreen({ m2, finishModule }) {
  return [
    topBar('Jelaskan ke temanmu'),
    h(
      'main',
      { class: 'screen' },
      explainView({
        spec: m2.explain,
        onDone: (result) => {
          logExplanation({ module_id: 'M2', prompt_id: m2.explain.id, ...result });
          finishModule();
        },
      }),
    ),
  ];
}

/**
 * Ke mana setelah layar materi M2 terakhir.
 * Sedang mengulang (cek belum lulus) → tandai sudah mengulang, langsung ke cek;
 * selain itu → latihan identifikasi.
 */
export function afterM2Lesson(store) {
  let reviewing = false;
  store.update((s) => {
    reviewing = markReviewed(s.m2.cek);
  });
  return reviewing ? '#/m2/cek/mulai' : '#/m2/latih/0';
}

/**
 * Gerbang DS02: soal fase mandiri dibuka setelah lulus cek pemahaman M2.
 * Dipanggil router saat siswa membuka soal mandiri sebelum lulus.
 */
export function mandiriLockedScreen({ moduleId, item, go }) {
  logEvent('gate_locked', { module_id: moduleId, item_id: item.id, payload: { gate: 'cek_m2' } });
  return [
    topBar('Latihan mandiri'),
    h(
      'main',
      { class: 'screen' },
      h('p', {}, '🔒 Latihan mandiri terbuka setelah kamu lulus cek pemahaman di Modul 2.'),
      h('p', {}, 'Di sana kamu berlatih membedakan senilai dan berbalik nilai dulu.'),
      h('button', { type: 'button', class: 'primary wide', onClick: () => go('#/modul/M2/0') }, 'Ke Modul 2'),
      h('button', { type: 'button', class: 'wide', onClick: () => go('#/') }, 'Ke peta belajar'),
    ),
  ];
}

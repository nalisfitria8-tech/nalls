/**
 * Alur penyelesaian soal 4 langkah tetap (F04):
 *   ① Diketahui → ② Ditanya → ③ Jenis (wajib) → ④ Hitung + cek kewajaran
 * Termasuk petunjuk bertingkat (F08), pembahasan per jenis kesalahan (F09),
 * cek kewajaran (F10), pembahasan lengkap + soal kembar.
 * Langkah 1 memakai fitur tandai informasi (F07): angka yang diketuk bisa
 * dimasukkan ke kolom tabel Diketahui; mengetik langsung tetap bisa.
 */
import { h, richText, fill } from '../components/dom.js';
import { relationTable } from '../components/relationTable.js';
import { markedTextView } from '../components/markedText.js';
import { feedbackBox, hintBox, topBar } from '../components/question.js';
import { checkStep, canOpenStep4 } from '../engine/checker.js';
import { unknownPosition, resultDirection, solve, SENILAI, BERBALIK } from '../engine/solver.js';
import { formulaText, feedbackFor, fullSolution, generatedHints, quantityName } from '../engine/feedback.js';
import { maxHintLevel, registerWrong } from '../engine/hints.js';
import { formatNumber, parseNumber } from '../engine/number.js';
import { emptyCells, placeNumber, clearCell, cellsToResponse } from '../engine/marking.js';
import { logStep, logHint, logEvent } from '../data/logger.js';

const STEP_NAMES = ['Diketahui', 'Ditanya', 'Jenis', 'Hitung'];

/** Bentuk soal kembar dari soal asli (konteks & jenis sama, angka lain). */
export function twinItem(item) {
  const t = { ...item, id: `${item.id}-K`, text: item.twin.text, table: { ...item.table, rows: item.twin.rows }, answer: item.twin.answer, twin: null, isTwin: true };
  t.hints = generatedHints(t);
  return t;
}

/** Keadaan awal; langkah yang "prefilled" (contoh setengah jadi) dianggap selesai. */
export function initialState(item) {
  const pre = new Set(item.prefilled || []);
  const s = {
    step: 1, hint: 0, wrong: 0, wrongAtMax: 0, attempt: 1, done: {}, feedback: null, showText: true, recall: false,
    // F07: isi tabel Diketahui dan tanda di teks soal (tetap ada saat layar digambar ulang)
    cells: emptyCells(),
    marks: { nums: {}, asks: [] }, // nums[pos] = { token, placed: { row, col } | null }
    pending: null, // pos angka yang baru ditandai dan belum diberi kolom
    markNote: null,
  };
  if (pre.has('diketahui')) s.done[1] = true;
  if (pre.has('ditanya')) s.done[2] = true;
  if (pre.has('jenis')) s.done[3] = true;
  while (s.done[s.step]) s.step += 1;
  return s;
}

export function solveScreen({ lesson, index, recallCard, go, onFinish }) {
  const items = lesson.items;
  let item = items[index];
  let s = initialState(item);
  const container = h('div', { class: 'solve' });
  const isLast = index === items.length - 1;
  const nextHash = () => (isLast ? null : `#/soal/${lesson.module}/${index + 1}`);

  const phase = () => item.phase || 'latihan';
  const max = () => maxHintLevel(phase(), item.hints?.length || 0);
  const [colA, colB] = item.table.columns;

  function log(step, response, result) {
    logStep({
      item_id: item.id,
      attempt_no: s.attempt,
      step,
      response,
      is_correct: result.correct,
      error_type: result.errorType,
      hint_level_max: s.hint,
      phase: phase(),
    });
  }

  function wrong(errorType) {
    const r = registerWrong(phase(), s, max());
    Object.assign(s, { hint: r.hint, wrong: r.wrong, wrongAtMax: r.wrongAtMax });
    if (r.showSolution) {
      s.step = 'solution';
      s.feedback = null;
    } else {
      const fb = feedbackFor(item, errorType);
      s.feedback = feedbackBox('err', fb.title, fb.text);
      if (fb.showRecall) s.recall = true;
    }
  }

  function advance() {
    s.done[s.step] = true;
    s.feedback = null;
    s.step += 1;
    while (s.done[s.step]) s.step += 1;
  }

  // ---------- Langkah 1: Diketahui + tandai (F07) ----------
  function toggleNumber(pos, token) {
    const mark = s.marks.nums[pos];
    if (mark) {
      if (mark.placed) s.cells = clearCell(s.cells, mark.placed.row, mark.placed.col, token);
      delete s.marks.nums[pos];
      if (s.pending === pos) s.pending = null;
    } else {
      s.marks.nums[pos] = { token, placed: null };
      s.pending = pos;
    }
    s.markNote = null;
    logEvent('mark_toggle', { module_id: lesson.module, item_id: item.id, payload: { token, kind: 'num', on: !mark, pos } });
    draw();
  }

  function toggleSentence(index, text) {
    const on = !s.marks.asks.includes(index);
    s.marks.asks = on ? [...s.marks.asks, index] : s.marks.asks.filter((i) => i !== index);
    logEvent('mark_toggle', { module_id: lesson.module, item_id: item.id, payload: { token: text, kind: 'ask', on, sentence: index } });
    draw();
  }

  function placePending(col) {
    const pos = s.pending;
    const mark = s.marks.nums[pos];
    const placed = placeNumber(s.cells, col, mark.token);
    if (!placed) {
      s.markNote = `Kolom ${col === 0 ? colA : colB} sudah penuh. Hapus dulu salah satu angkanya.`;
      return draw();
    }
    s.cells = placed.cells;
    mark.placed = { row: placed.row, col };
    s.pending = null;
    s.markNote = null;
    logEvent('mark_place', { module_id: lesson.module, item_id: item.id, payload: { token: mark.token, pos, column: col, row: placed.row } });
    draw();
  }

  /** Pertanyaan "angka ini masuk kolom mana?" tepat di bawah teks soal. */
  function chooser() {
    if (s.pending === null) return s.markNote ? h('p', { class: 'note' }, s.markNote) : null;
    const token = s.marks.nums[s.pending].token;
    return h(
      'div',
      { class: 'mark-chooser', role: 'group', 'aria-label': `Kolom untuk angka ${token}` },
      h('p', {}, h('strong', {}, token), ' masuk ke kolom…'),
      h('div', { class: 'choices two' },
        h('button', { type: 'button', class: 'choice center', onClick: () => placePending(0) }, colA),
        h('button', { type: 'button', class: 'choice center', onClick: () => placePending(1) }, colB),
      ),
      h('button', { type: 'button', class: 'link', onClick: () => toggleNumber(s.pending, token) }, 'Batal, hapus tanda'),
      s.markNote ? h('p', { class: 'note' }, s.markNote) : null,
    );
  }

  function step1() {
    const inputs = s.cells.map((row, r) =>
      row.map((value, c) => {
        const inp = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', class: 'cell-input', value });
        inp.value = value;
        inp.addEventListener('input', () => {
          s.cells[r][c] = inp.value;
          // angka bertanda yang ditimpa ketikan tidak lagi terhubung ke sel ini
          for (const mark of Object.values(s.marks.nums)) {
            if (mark.placed?.row === r && mark.placed?.col === c && inp.value !== mark.token) mark.placed = null;
          }
        });
        return inp;
      }),
    );
    const table = h(
      'table',
      { class: 'rel-table known-table' },
      h('caption', {}, 'Diketahui'),
      h('thead', {}, h('tr', {}, h('th', {}, colA), h('th', {}, colB))),
      h('tbody', {}, inputs.map((row, r) => h('tr', {}, row.map((inp, c) => h('td', {}, labelled(inp, `Baris ${r + 1}, ${c === 0 ? colA : colB}`)))))),
    );
    return [
      chooser(),
      h('p', {}, 'Ketuk angka yang penting dan kalimat yang ditanya. Angka bisa juga diketik. Kosongkan sel yang ditanya.'),
      table,
      checkButton(() => {
        const response = cellsToResponse(s.cells);
        const r = checkStep(item, 'diketahui', response);
        log('diketahui', response, r);
        r.correct ? advance() : wrong(r.errorType);
        draw();
      }),
    ];
  }

  // ---------- Langkah 2: Ditanya ----------
  function step2() {
    const [[a1, b1], [a2, b2]] = item.table.rows;
    const pick = (pos) => {
      const r = checkStep(item, 'ditanya', pos);
      log('ditanya', pos, r);
      r.correct ? advance() : wrong(r.errorType);
      draw();
    };
    const cell = (v, pos, label) =>
      h('td', {}, h('button', { type: 'button', class: 'cell-btn', 'aria-label': `${label}: ${v === null ? 'kosong' : formatNumber(v)}`, onClick: () => pick(pos) }, v === null ? ' ' : formatNumber(v)));
    return [
      h('p', {}, 'Ketuk sel yang ditanya di baris kedua.'),
      h(
        'table',
        { class: 'rel-table' },
        h('thead', {}, h('tr', {}, h('th', {}, colA), h('th', {}, colB))),
        h('tbody', {}, h('tr', {}, h('td', {}, formatNumber(a1)), h('td', {}, formatNumber(b1))), h('tr', {}, cell(a2, 'a2', colA), cell(b2, 'b2', colB))),
      ),
    ];
  }

  // ---------- Langkah 3: Jenis (wajib, IL02) ----------
  function step3() {
    let arah = null;
    let jenis = null;
    const btn = checkButton(() => {
      const response = { arah, jenis };
      const r = checkStep(item, 'jenis', response);
      log('jenis', response, r);
      r.correct ? advance() : wrong(r.errorType);
      draw();
    });
    btn.disabled = true;
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
      tableView(),
      h('p', {}, `Jika ${quantityName(colA)} bertambah, ${quantityName(colB)}…`),
      group([['searah', 'ikut bertambah'], ['berlawanan', 'berkurang']], (v) => (arah = v), 'Arah perubahan'),
      h('p', {}, 'Jadi jenisnya:'),
      group([[SENILAI, '↑↑ Senilai', 'senilai'], [BERBALIK, '↑↓ Berbalik nilai', 'berbalik']], (v) => (jenis = v), 'Jenis perbandingan'),
      btn,
    ];
  }

  // ---------- Langkah 4: Hitung + cek kewajaran (F10) ----------
  function step4() {
    const rows = item.table.rows;
    const ref = unknownPosition(rows) === 'b2' ? rows[0][1] : rows[0][0];
    let bentuk = null;
    let arahHasil = null;
    const field = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', class: 'answer-input', 'aria-label': 'Nilai ?' });
    const btn = checkButton(() => {
      const hasil = field.value.trim();
      const rb = checkStep(item, 'bentuk', bentuk);
      log('bentuk', bentuk, rb);
      if (!rb.correct) {
        s.attempt += 1;
        wrong(rb.errorType);
        return draw();
      }

      const rh = checkStep(item, 'hasil', hasil);
      const rk = checkStep(item, 'kewajaran', arahHasil);
      log('hasil', { value: hasil }, rh);
      log('kewajaran', arahHasil, rk);
      if (rh.correct && rk.correct) {
        s.step = 'done';
        s.feedback = null;
      } else {
        wrong(rh.correct ? 'kewajaran' : rh.errorType);
        // Jawaban berlawanan arah dengan pilihan "masuk akal"-nya sendiri
        const val = parseNumber(hasil);
        const ownDir = val === null ? null : val > ref ? 'naik' : val < ref ? 'turun' : null;
        if (s.step !== 'solution' && rk.correct && ownDir && ownDir !== arahHasil) {
          s.feedback.append(h('p', {}, `Kamu memilih "${arahHasil === 'naik' ? 'lebih besar' : 'lebih kecil'}", tetapi jawabanmu ${ownDir === 'naik' ? 'lebih besar' : 'lebih kecil'} dari ${formatNumber(ref)}.`));
        }
      }
      s.attempt += 1;
      draw();
    });
    btn.disabled = true;
    const refresh = () => (btn.disabled = !(bentuk && arahHasil && field.value.trim()));
    field.addEventListener('input', refresh);

    const radio = (options, onPick, label) => {
      const buttons = options.map(([value, text]) =>
        h('button', { type: 'button', role: 'radio', 'aria-checked': 'false', class: 'choice mono', onClick: (e) => {
          onPick(value);
          for (const b of buttons) b.setAttribute('aria-checked', String(b === e.currentTarget));
          refresh();
        } }, text),
      );
      return h('div', { class: 'choices', role: 'radiogroup', 'aria-label': label }, buttons);
    };

    return [
      tableView(),
      h('p', {}, 'Pilih bentuk hitungan:'),
      radio([['hasil_bagi', `${formulaText(SENILAI, rows)}  (hasil bagi sama)`], ['hasil_kali', `${formulaText(BERBALIK, rows)}  (hasil kali sama)`]], (v) => (bentuk = v), 'Bentuk hitungan'),
      h('label', { class: 'inline' }, '? = ', field),
      h('p', {}, h('strong', {}, 'Apakah hasilnya masuk akal? '), `Hasilnya lebih besar atau lebih kecil dari ${formatNumber(ref)}?`),
      radio([['naik', 'lebih besar'], ['turun', 'lebih kecil']], (v) => (arahHasil = v), 'Kewajaran'),
      btn,
    ];
  }

  function doneView() {
    const rows = item.table.rows;
    const answer = solve(item.type, rows);
    const ref = unknownPosition(rows) === 'b2' ? rows[0][1] : rows[0][0];
    const dir = resultDirection(item.type, rows) === 'naik' ? 'lebih besar' : 'lebih kecil';
    const solvedRows = rows.map((r) => r.map((v) => (v === null ? answer : v)));
    return [
      relationTable({ columns: [{ label: colA }, { label: colB }], rows: solvedRows }),
      feedbackBox('ok', 'Tepat!', `? = ${formatNumber(answer)}. Hasilnya ${dir} dari ${formatNumber(ref)}, masuk akal.`),
    ];
  }

  function solutionView() {
    const canTwin = item.twin && !item.isTwin;
    return [
      feedbackBox('info', 'Begini caranya:', ...fullSolution(item)),
      canTwin
        ? h('p', {}, 'Sekarang coba soal yang mirip, dengan angka lain.')
        : null,
      canTwin
        ? h('button', { type: 'button', class: 'primary wide', onClick: () => {
            item = twinItem(item);
            s = initialState(item);
            draw();
          } }, 'Coba soal kembar')
        : null,
    ];
  }

  // ---------- Bagian bersama ----------
  function tableView() {
    return relationTable({ columns: [{ label: colA }, { label: colB }], rows: item.table.rows });
  }

  function checkButton(onClick) {
    return h('button', { type: 'button', class: 'primary wide', onClick }, 'Periksa');
  }

  function stepIndicator() {
    return h(
      'ol',
      { class: 'steps', 'aria-label': 'Langkah' },
      STEP_NAMES.map((name, i) => {
        const n = i + 1;
        const finished = s.step === 'done' || s.step === 'solution' || s.done[n];
        const current = s.step === n;
        const locked = n === 4 && !canOpenStep4({ correct: Boolean(s.done[3]) }) && !finished;
        return h('li', { class: `${finished ? 'finished' : ''} ${current ? 'current' : ''}`, 'aria-current': current ? 'step' : null }, `${n} ${name}${finished ? ' ✓' : locked ? ' 🔒' : ''}`);
      }),
    );
  }

  function recallView() {
    if (!s.recall) return null;
    return h(
      'div',
      { class: 'recall', role: 'region', 'aria-label': 'Ingat lagi: cara menentukan jenis' },
      h('strong', {}, 'Ingat lagi: cara menentukan jenis'),
      recallCard.text.map(richText),
      h('button', { type: 'button', class: 'small', onClick: () => ((s.recall = false), draw()) }, 'Tutup'),
    );
  }

  function draw() {
    const inStep = typeof s.step === 'number';
    const body = s.step === 1 ? step1() : s.step === 2 ? step2() : s.step === 3 ? step3() : s.step === 4 ? step4() : s.step === 'done' ? doneView() : solutionView();
    const nextBtn = h('button', { type: 'button', class: 'primary', onClick: () => (nextHash() ? go(nextHash()) : onFinish()) }, isLast ? 'Selesai' : 'Soal berikut');

    fill(container,
      topBar(lesson.title, `Soal ${index + 1}/${items.length}${item.isTwin ? ' (kembar)' : ''}`),
      h(
        'main',
        { class: 'screen' },
        stepIndicator(),
        s.step === 1 || s.showText
          ? h('div', { class: 'problem' }, markedTextView({
              text: item.text,
              marks: s.marks,
              interactive: s.step === 1,
              onNumber: toggleNumber,
              onSentence: toggleSentence,
            }))
          : null,
        s.step !== 1 && inStep
          ? h('button', { type: 'button', class: 'small link', onClick: () => ((s.showText = !s.showText), draw()) }, s.showText ? 'Sembunyikan soal' : 'Lihat soal lagi')
          : null,
        body,
        s.feedback,
        inStep && s.step >= 3
          ? h('button', { type: 'button', class: 'small link', onClick: () => {
              s.recall = !s.recall;
              if (s.recall) logEvent('recall_open', { module_id: lesson.module, item_id: item.id });
              draw();
            } }, 'ⓘ Ingat lagi: cara menentukan jenis')
          : null,
        recallView(),
        inStep ? hintBox({ hints: item.hints || [], level: s.hint, max: max(), onMore: () => {
          s.hint += 1;
          logHint({ item_id: item.id, step: `langkah${s.step}`, level: s.hint });
          draw();
        } }) : null,
      ),
      s.step === 'done' || (s.step === 'solution' && !(item.twin && !item.isTwin))
        ? h('nav', { class: 'navbar single' }, nextBtn)
        : null,
    );
  }

  draw();
  return [container];
}

function labelled(input, label) {
  input.setAttribute('aria-label', label);
  return input;
}

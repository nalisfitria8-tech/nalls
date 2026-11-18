import { h, fill } from '../components/dom.js';
import { questionView, feedbackBox, hintBox, topBar } from '../components/question.js';
import { isCorrectAnswer } from '../engine/path.js';
import { maxHintLevel, registerWrong } from '../engine/hints.js';
import { logStep, logHint } from '../data/logger.js';

/**
 * Latihan pilihan/isian dengan umpan balik dan petunjuk bertingkat (M1).
 * Pola umpan balik: docs/naskah-materi.md "Pola umpan balik umum".
 */
export function quizScreen({ lesson, index, go, onFinish }) {
  const items = lesson.quiz;
  const item = items[index];
  const phase = item.phase || 'latihan';
  const max = maxHintLevel(phase, item.hints?.length || 0);
  const s = { hint: 0, wrong: 0, wrongAtMax: 0, solved: false, attempt: 0 };

  const main = h('main', { class: 'screen' });
  const next = h('button', { type: 'button', class: 'primary', disabled: true }, index === items.length - 1 ? 'Selesai' : 'Lanjut');
  next.addEventListener('click', () => (index === items.length - 1 ? onFinish() : go(`#/latihan/${lesson.module}/${index + 1}`)));

  let feedback = null;

  function openHint() {
    if (s.hint >= max) return;
    s.hint += 1;
    logHint({ item_id: item.id, step: 'jawaban', level: s.hint });
    draw();
  }

  function onSubmit(value) {
    s.attempt += 1;
    const ok = isCorrectAnswer(item, value);
    logStep({ item_id: item.id, attempt_no: s.attempt, step: 'hasil', response: { value }, is_correct: ok, error_type: ok ? null : 'hitung', hint_level_max: s.hint, phase });

    if (ok) {
      s.solved = true;
      feedback = feedbackBox('ok', 'Tepat!', item.why);
      next.disabled = false;
    } else {
      const r = registerWrong(phase, s, max);
      Object.assign(s, r);
      const partial = item.partial?.[value];
      if (r.showSolution) {
        s.solved = true;
        feedback = feedbackBox('info', 'Begini caranya:', `Jawabannya ${item.answer}. ${item.why || ''}`);
        next.disabled = false;
      } else {
        feedback = feedbackBox('err', partial ? null : 'Belum tepat. Coba lagi.', partial);
      }
    }
    draw();
  }

  function draw() {
    fill(main,
      questionView({ item, onSubmit, locked: s.solved }),
      feedback,
      s.solved ? null : hintBox({ hints: item.hints || [], level: s.hint, max, onMore: openHint }),
    );
  }

  draw();
  return [topBar(lesson.title, `Latihan ${index + 1}/${items.length}`), main, h('nav', { class: 'navbar single' }, next)];
}

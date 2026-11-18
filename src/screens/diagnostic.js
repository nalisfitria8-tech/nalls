import { h, richText, fill } from '../components/dom.js';
import { questionView, feedbackBox, topBar } from '../components/question.js';
import { relationTable } from '../components/relationTable.js';
import { navBar } from '../components/navBar.js';
import { isCorrectAnswer, scoreDiagnostic, remindersNeeded, startModule, SKILLS } from '../engine/path.js';
import { logDiagnostic, logEvent } from '../data/logger.js';
import { setTutorContext } from '../components/tutorContext.js';

/**
 * M0 — Cek kesiapan (F02).
 * index 'intro' | 0..n-1 (soal) | n (hasil)
 * Soal diagnostik tidak dinilai di layar (tidak menekan siswa).
 */
export function diagnosticScreen({ m0, index, store, go }) {
  const items = m0.items;
  const n = items.length;

  if (index === -1) {
    return [
      topBar(m0.title),
      h('main', { class: 'screen' }, m0.intro.map(richText)),
      h('nav', { class: 'navbar single' }, h('button', { type: 'button', class: 'primary', onClick: () => go('#/diagnostik/0') }, 'Mulai')),
    ];
  }

  if (index < n) {
    const item = items[index];
    return [
      topBar(m0.title, `${index + 1}/${n}`),
      h(
        'main',
        { class: 'screen' },
        questionView({
          item,
          submitLabel: 'Simpan',
          onSubmit: (value) => {
            store.update((s) => {
              s.diagnostic.answers[item.id] = value;
            });
            go(`#/diagnostik/${index + 1}`);
          },
        }),
        h('p', { class: 'note' }, 'Tidak ada nilai. Jawab sebisamu.'),
      ),
    ];
  }

  // Hasil
  const state = store.get();
  const scores = scoreDiagnostic(items, state.diagnostic.answers);
  const reminders = remindersNeeded(scores);
  const start = startModule(state.grade, scores);
  if (!state.diagnostic.done) {
    store.update((s) => {
      Object.assign(s.diagnostic, { done: true, scores, reminders, start });
    });
    for (const skill of SKILLS) {
      logDiagnostic({ skill, correct: scores[skill].correct, total: scores[skill].total, reminder_shown: reminders.includes(skill) });
    }
  }

  const fluent = SKILLS.filter((s) => scores[s].fluent);
  const lines = [];
  if (fluent.length) lines.push(`Kamu sudah lancar ${joinWords(fluent)}.`);
  if (reminders.length) lines.push(`Kita ingat lagi sebentar tentang ${joinWords(reminders)}, ya.`);
  else lines.push('Kita mulai belajar!');

  return [
    topBar(m0.title),
    h('main', { class: 'screen' }, h('p', {}, h('strong', {}, 'Terima kasih!')), lines.map((l) => h('p', {}, l))),
    h(
      'nav',
      { class: 'navbar single' },
      h(
        'button',
        { type: 'button', class: 'primary', onClick: () => go(reminders.length ? `#/pengingat/${reminders[0]}/0` : '#/') },
        'Lanjut',
      ),
    ),
  ];
}

/** Kartu pengingat prasyarat: layar penjelasan lalu satu soal cek. */
export function reminderScreen({ m0, skill, index, store, go }) {
  const card = m0.reminders[skill];
  const total = card.screens.length + 1;
  const base = `#/pengingat/${skill}`;
  const queue = store.get().diagnostic.reminders || [];
  const nextHash = () => {
    const next = queue[queue.indexOf(skill) + 1];
    return next ? `#/pengingat/${next}/0` : '#/';
  };

  // Tanya Nalls hanya di kartu pengingat & soal ceknya; layar diagnostik TIDAK memasang konteks
  if (index < card.screens.length) setTutorContext({ module: 'M0', kind: 'pengingat', ref: card.screens[index].id });
  else setTutorContext({ module: 'M0', kind: 'latihan', ref: card.check.id });

  if (index < card.screens.length) {
    const s = card.screens[index];
    if (index === 0) logEvent('reminder_open', { module_id: 'M0', screen_id: card.id, payload: { skill } });
    return [
      topBar(`Ingat lagi: ${card.title}`, `${index + 1}/${total}`),
      h('main', { class: 'screen' }, (s.text || []).map(richText), s.tables?.length ? h('div', { class: 'tables' }, s.tables.map(relationTable)) : null),
      navBar({
        canBack: index > 0,
        onBack: () => go(`${base}/${index - 1}`),
        onRepeat: () => go(`${base}/0`),
        onNext: () => go(`${base}/${index + 1}`),
      }),
    ];
  }

  // Soal cek: jika salah tampil pembahasan, lalu siswa tetap boleh lanjut.
  const main = h('main', { class: 'screen' });
  const next = h('button', { type: 'button', class: 'primary', disabled: true, onClick: () => {
    store.update((s) => {
      if (!s.remindersDone.includes(skill)) s.remindersDone.push(skill);
    });
    go(nextHash());
  } }, 'Lanjut');

  const q = questionView({
    item: card.check,
    onSubmit: (value) => {
      const ok = isCorrectAnswer(card.check, value);
      fill(main,
        questionView({ item: card.check, locked: true, onSubmit: () => {} }),
        ok ? feedbackBox('ok', 'Tepat!', card.check.explain) : feedbackBox('info', 'Begini caranya:', card.check.explain),
      );
      next.disabled = false;
    },
  });
  main.append(q);

  return [topBar(`Ingat lagi: ${card.title}`, `${total}/${total}`), main, h('nav', { class: 'navbar single' }, next)];
}

function joinWords(list) {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} dan ${list[list.length - 1]}`;
}

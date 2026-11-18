import { h, richText } from './dom.js';

/**
 * Satu soal pilihan atau isian (satu soal per layar, DS03).
 * item = { text, form: 'pilihan'|'isian', options? }
 * onSubmit(value) dipanggil saat tombol ditekan; value = teks pilihan atau isian.
 */
export function questionView({ item, onSubmit, submitLabel = 'Periksa', locked = false }) {
  let selected = null;
  const submit = h('button', { type: 'button', class: 'primary wide', disabled: true }, submitLabel);

  let input;
  if (item.form === 'pilihan') {
    const buttons = item.options.map((opt) =>
      h(
        'button',
        {
          type: 'button',
          role: 'radio',
          'aria-checked': 'false',
          class: 'choice',
          disabled: locked,
          onClick: (e) => {
            selected = opt;
            for (const b of buttons) b.setAttribute('aria-checked', String(b === e.currentTarget));
            submit.disabled = locked;
          },
        },
        opt,
      ),
    );
    input = h('div', { class: 'choices', role: 'radiogroup', 'aria-label': 'Pilihan jawaban' }, buttons);
  } else {
    const field = h('input', {
      type: 'text',
      inputmode: 'decimal',
      autocomplete: 'off',
      class: 'answer-input',
      'aria-label': 'Jawaban',
      disabled: locked,
    });
    field.addEventListener('input', () => {
      selected = field.value.trim() || null;
      submit.disabled = locked || selected === null;
    });
    field.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && selected !== null && !locked) onSubmit(selected);
    });
    input = field;
  }

  submit.addEventListener('click', () => {
    if (selected !== null && !locked) onSubmit(selected);
  });

  return h('div', { class: 'question' }, richText(item.text), input, submit);
}

/** Kotak umpan balik. kind: 'ok' | 'err' | 'info' */
export function feedbackBox(kind, title, ...lines) {
  return h(
    'div',
    { class: `feedback ${kind}`, role: 'status' },
    title ? h('strong', {}, title) : null,
    lines.filter(Boolean).map((l) => (l instanceof Node ? l : h('p', {}, l))),
  );
}

/** Kotak petunjuk: menampilkan T1..T(level) dan tombol untuk membuka berikutnya. */
export function hintBox({ hints, level, max, onMore }) {
  const shown = hints.slice(0, level);
  return h(
    'div',
    { class: 'hints' },
    shown.map((t, i) => h('p', { class: 'hint' }, h('strong', {}, `Petunjuk ${i + 1}: `), t)),
    max > 0
      ? h(
          'button',
          { type: 'button', class: 'small', disabled: level >= max, onClick: onMore },
          level >= max ? 'Petunjuk sudah semua' : `Petunjuk (${level + 1} dari ${max})`,
        )
      : null,
  );
}

export function topBar(title, progress) {
  return h(
    'header',
    { class: 'topbar' },
    h('h1', {}, title),
    progress ? h('span', { class: 'progress' }, progress) : null,
  );
}

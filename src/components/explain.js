import { h, fill } from './dom.js';

/**
 * "Jelaskan ke temanmu" (F11, GL04).
 * Kalimat rumpang (pilihan) + teks bebas opsional (maks. 500 karakter),
 * lalu contoh penjelasan + daftar cek diri. Tidak dinilai otomatis;
 * nilai rubrik diisi peneliti (docs/evaluasi.md §7).
 *
 * spec = { id, prompt, cloze: [teks | { key, options }], example, checklist }
 * onDone({ cloze, free_text, self_check })
 */
export function explainView({ spec, onDone }) {
  const selects = {};
  const wrap = h('div', { class: 'explain' });
  let submitted = null;

  const sentence = h(
    'p',
    { class: 'cloze' },
    spec.cloze.map((part) => {
      if (typeof part === 'string') return ` ${part} `;
      const sel = h(
        'select',
        { 'aria-label': `Pilih: ${part.options.join(' atau ')}` },
        h('option', { value: '' }, '…'),
        part.options.map((o) => h('option', { value: o }, o)),
      );
      sel.addEventListener('change', refresh);
      selects[part.key] = sel;
      return sel;
    }),
  );

  const text = h('textarea', { rows: '3', maxlength: '500', 'aria-label': 'Penjelasan dengan kata-katamu sendiri' });
  const send = h('button', { type: 'button', class: 'primary wide', disabled: true }, 'Kirim');

  function refresh() {
    send.disabled = Object.values(selects).some((s) => !s.value);
  }

  send.addEventListener('click', () => {
    submitted = {
      cloze: Object.fromEntries(Object.entries(selects).map(([k, s]) => [k, s.value])),
      free_text: text.value.trim() || null,
    };
    drawReview();
  });

  function drawReview() {
    const boxes = spec.checklist.map((label) => h('input', { type: 'checkbox', 'aria-label': label }));
    const next = h('button', { type: 'button', class: 'primary wide' }, 'Lanjut');
    next.addEventListener('click', () => onDone({ ...submitted, self_check: boxes.map((b) => b.checked) }));
    fill(wrap,
      h('p', {}, h('strong', {}, 'Penjelasanmu: '), sentenceText()),
      submitted.free_text ? h('p', { class: 'note' }, submitted.free_text) : null,
      h('div', { class: 'feedback info' }, h('strong', {}, 'Contoh penjelasan:'), h('p', {}, spec.example)),
      h('p', {}, 'Cek penjelasanmu:'),
      h('div', { class: 'checklist' }, spec.checklist.map((label, i) => h('label', { class: 'check' }, boxes[i], ` ${label}`))),
      next,
    );
  }

  function sentenceText() {
    return spec.cloze
      .map((p) => (typeof p === 'string' ? p : submitted.cloze[p.key]))
      .join(' ')
      .replace(/\s+([.,])/g, '$1');
  }

  wrap.append(
    h('p', {}, spec.prompt),
    sentence,
    h('p', { class: 'note' }, 'Tambahkan dengan kata-katamu sendiri (boleh kosong):'),
    text,
    send,
  );
  return wrap;
}

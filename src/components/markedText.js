import { h } from './dom.js';
import { tokenize } from '../engine/marking.js';

/**
 * Teks soal yang bisa ditandai (F07, design.md §6.3).
 *  - angka → tombol; ditandai = latar --mark-num + bingkai (bukan warna saja)
 *  - bagian lain kalimat → <span role="button"> yang menandai seluruh kalimat;
 *    ditandai = latar --mark-ask + garis bawah
 * interactive=false: tanda tetap terlihat, tetapi tidak bisa diketuk (Langkah 2–4).
 *
 * marks = { nums: { [pos]: { token, placed } }, asks: [indeks kalimat] }
 * onNumber(pos, token), onSentence(index, text)
 */
export function markedTextView({ text, marks, interactive = true, onNumber = () => {}, onSentence = () => {} }) {
  const sentences = tokenize(text);
  const isNum = (pos) => Object.hasOwn(marks.nums, pos);
  const isAsk = (i) => marks.asks.includes(i);

  const children = sentences.flatMap((sentence, si) => {
    const asked = isAsk(sentence.index);
    const parts = sentence.parts.map((part) => {
      if (part.kind === 'num') {
        const on = isNum(part.pos);
        return interactive
          ? h(
              'button',
              {
                type: 'button',
                class: `mark-btn num${on ? ' on' : ''}`,
                'aria-pressed': String(on),
                'aria-label': `Angka ${part.text}${on ? ', ditandai' : ''}`,
                onClick: () => onNumber(part.pos, part.text),
              },
              part.text,
            )
          : h('span', { class: `mark num${on ? ' on' : ''}` }, part.text);
      }
      if (!interactive) return part.text;
      // <span role="button">, bukan <button>: teks harus bisa pindah baris di tengah kalimat
      const words = h(
        'span',
        {
          role: 'button',
          tabindex: '0',
          class: 'mark-btn words',
          'aria-pressed': String(asked),
          'aria-label': `Kalimat: ${sentence.text}${asked ? ', ditandai sebagai yang ditanya' : ''}`,
          onClick: () => onSentence(sentence.index, sentence.text),
        },
        part.text,
      );
      words.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSentence(sentence.index, sentence.text);
        }
      });
      return words;
    });
    const span = h('span', { class: `sentence${asked ? ' ask' : ''}`, 'data-sentence': String(sentence.index) }, parts);
    return si < sentences.length - 1 ? [span, ' '] : [span];
  });

  return h('p', { class: `marked-text${interactive ? ' interactive' : ''}` }, children);
}

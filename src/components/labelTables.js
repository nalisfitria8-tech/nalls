import { h, fill } from './dom.js';
import { relationTable } from './relationTable.js';
import { feedbackBox } from './question.js';

const JENIS_TEXT = { senilai: '↑↑ Senilai', berbalik: '↑↓ Berbalik nilai' };

/**
 * Tabel berdampingan yang diberi label oleh siswa (M2-06, F03; naskah M2-06).
 * Di bawah tiap tabel: (1) ketuk jenisnya, lalu (2) "Yang tetap: hasil bagi atau hasil kali?".
 * Keterangan tabel (caption, misal "SENILAI ↑↑") baru tampil setelah jenis dipilih
 * dengan benar, agar label tidak memberi jawaban lebih dulu.
 * Salah boleh dicoba lagi; umpan balik hanya mengarahkan, tidak memberi jawaban.
 *
 * tables[i].answer = { jenis: 'senilai'|'berbalik', tetap: 'hasil bagi'|'hasil kali' }
 * interaction = { constantQuestion, constantOptions, feedback: { jenisOk, jenisErr, tetapOk, tetapErr } }
 * onCheck({ table, question: 'jenis'|'tetap', response, correct })
 */
export function labelTablesView({ tables, interaction, onCheck = () => {} }) {
  const fb = interaction.feedback;
  const columns = tables.map((table, i) => {
    const col = h('div', { class: 'label-col' });
    const st = { jenis: null, jenisOk: false, tetap: null, tetapOk: false };

    const choose = (question, value) => {
      const correct = value === table.answer[question];
      st[question] = value;
      st[`${question}Ok`] = correct;
      onCheck({ table: i, question, response: value, correct });
      draw();
    };

    const group = (question, options, label, done) =>
      h(
        'div',
        { class: 'choices', role: 'group', 'aria-label': label },
        options.map(([value, text, cls]) =>
          h(
            'button',
            {
              type: 'button',
              class: `choice center ${cls || ''}`,
              'aria-pressed': String(st[question] === value),
              disabled: done,
              onClick: () => choose(question, value),
            },
            text,
          ),
        ),
      );

    function draw() {
      fill(
        col,
        st.jenisOk ? h('p', { class: 'col-caption' }, table.caption) : null,
        relationTable({ ...table, caption: null }),
        group('jenis', [['senilai', JENIS_TEXT.senilai, 'senilai'], ['berbalik', JENIS_TEXT.berbalik, 'berbalik']], `Jenis tabel ${i + 1}`, st.jenisOk),
        st.jenis ? feedbackBox(st.jenisOk ? 'ok' : 'err', st.jenisOk ? fb.jenisOk : fb.jenisErr) : null,
        st.jenisOk ? h('p', { class: 'col-question' }, interaction.constantQuestion) : null,
        st.jenisOk ? group('tetap', interaction.constantOptions.map((o) => [o, o]), `Yang tetap pada tabel ${i + 1}`, st.tetapOk) : null,
        st.tetap ? feedbackBox(st.tetapOk ? 'ok' : 'err', st.tetapOk ? fb.tetapOk : fb.tetapErr) : null,
      );
    }

    draw();
    return col;
  });
  return h('div', { class: 'tables pair label-tables' }, columns);
}

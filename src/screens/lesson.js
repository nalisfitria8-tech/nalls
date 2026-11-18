import { h, richText } from '../components/dom.js';
import { relationTable } from '../components/relationTable.js';
import { labelTablesView } from '../components/labelTables.js';
import { navBar } from '../components/navBar.js';
import { logEvent } from '../data/logger.js';
import { setTutorContext } from '../components/tutorContext.js';

/**
 * Menampilkan satu layar materi (satu ide per layar, DS03).
 * Urutan: teks → tabel → teks sesudah tabel, agar tabel berdekatan dengan
 * kalimat yang membahasnya (EL02).
 * Layar dengan interaksi "label_tables" (M2-06): teks → pertanyaan kunci →
 * perintah → tabel, dengan tombol jenis dan "yang tetap" tepat di bawah tiap tabel.
 */
export function lessonScreen({ lesson, index, go, onFinish = () => go('#/') }) {
  const screens = lesson.screens;
  const s = screens[index];
  const base = `#/modul/${lesson.module}`;
  const isLast = index === screens.length - 1;
  const labelling = s.interaction?.type === 'label_tables' && s.tables?.length;
  setTutorContext({ module: lesson.module, kind: 'materi', ref: s.id }); // Tanya Nalls (KP-36)

  const tables = labelling
    ? labelTablesView({
        tables: s.tables,
        interaction: s.interaction,
        onCheck: (payload) => logEvent('screen_check', { module_id: lesson.module, screen_id: s.id, payload }),
      })
    : s.tables?.length
      ? h('div', { class: `tables${s.tables.length === 2 ? ' pair' : ''}` }, s.tables.map(relationTable))
      : null;

  const body = labelling
    ? [(s.text || []).map(richText), (s.after || []).map(richText), richText(s.interaction.prompt), tables]
    : [(s.text || []).map(richText), tables, (s.after || []).map(richText)];

  return [
    h(
      'header',
      { class: 'topbar' },
      h('h1', {}, lesson.title),
      h('span', { class: 'progress', 'aria-label': `Layar ${index + 1} dari ${screens.length}` }, `${index + 1}/${screens.length}`),
    ),
    // body berisi array bersarang; h() hanya meratakan satu tingkat
    h('main', { class: 'screen', 'data-screen-id': s.id }, body.flat(), s.note ? h('p', { class: 'note' }, s.note) : null),
    navBar({
      canBack: index > 0,
      onBack: () => go(`${base}/${index - 1}`),
      onRepeat: () => go(`${base}/0`),
      onNext: () => (isLast ? onFinish() : go(`${base}/${index + 1}`)),
      // M2 masih berlanjut ke latihan identifikasi (lesson.identify) setelah layar terakhir
      nextLabel: isLast && !lesson.quiz && !lesson.items && !lesson.identify ? 'Selesai' : 'Lanjut',
    }),
  ];
}

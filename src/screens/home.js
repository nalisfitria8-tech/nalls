import { h } from '../components/dom.js';
import { topBar } from '../components/question.js';
import { MODULE_ORDER, moduleStatuses, moduleEntryHash } from '../engine/path.js';

const STATUS_LABEL = {
  selesai: 'Selesai ✓',
  terbuka: 'Mulai',
  boleh_dilewati: 'Boleh dilewati',
  terkunci: 'Terkunci',
  segera: 'Segera hadir',
};

/**
 * Pilih kelas — SEMENTARA sampai login kode siswa (C5); nanti kelas diambil dari kode.
 */
export function gradeScreen({ onPick }) {
  return [
    topBar('Nalls'),
    h(
      'main',
      { class: 'screen' },
      h('p', {}, 'Kamu kelas berapa?'),
      h(
        'div',
        { class: 'choices' },
        h('button', { type: 'button', class: 'choice', onClick: () => onPick(7) }, 'Kelas VII'),
        h('button', { type: 'button', class: 'choice', onClick: () => onPick(8) }, 'Kelas VIII'),
      ),
      h('p', { class: 'note' }, 'Versi pengembangan: nanti kelas otomatis dari kode siswa.'),
    ),
  ];
}

const ML_STATUS = { belum: 'Mulai', mengerjakan: 'Lanjutkan', pg: 'Lanjutkan pilihan ganda', terkirim: 'Terkirim' };

/** Tombol tes literasi (F17). tests = hasil mlEntries() dari screens/mlTest.js */
function mlTestList(tests, go) {
  return h(
    'ul',
    { class: 'module-list' },
    tests.map((t) =>
      h(
        'li',
        {},
        h(
          'button',
          { type: 'button', class: `module ${t.status === 'dinilai' || t.status === 'terkirim' ? 'selesai' : 'terbuka'}`, disabled: !t.enabled, onClick: () => go(`#/tes-ml/${t.phase}`) },
          h('span', {}, t.label),
          h('span', { class: 'status' }, !t.enabled ? 'Setelah tes awal' : t.status === 'dinilai' ? `Skor ${t.total}/${t.max}` : ML_STATUS[t.status]),
        ),
      ),
    ),
  );
}

/** Peta belajar: modul berurutan, terbuka bertahap. tests (opsional): tes literasi awal/akhir. */
export function homeScreen({ state, titles, available, go, onReset, tests = null }) {
  const statuses = moduleStatuses(state, available);
  const pretestPending = tests && tests[0].status !== 'terkirim' && tests[0].status !== 'dinilai';
  return [
    topBar('Nalls', state.grade ? `Kelas ${state.grade === 7 ? 'VII' : 'VIII'}` : null),
    h(
      'main',
      { class: 'screen' },
      pretestPending ? h('p', { class: 'note ml-note' }, 'Kerjakan Tes awal sebelum mulai belajar.') : null,
      tests ? h('p', { class: 'section-title' }, 'Tes literasi') : null,
      tests ? mlTestList(tests, go) : null,
      h('p', { class: 'section-title' }, 'Peta belajar'),
      h(
        'ul',
        { class: 'module-list' },
        MODULE_ORDER.map((m) => {
          const status = statuses[m];
          const disabled = status === 'terkunci' || status === 'segera';
          return h(
            'li',
            {},
            h(
              'button',
              {
                type: 'button',
                class: `module ${status}`,
                disabled,
                onClick: () => go(moduleEntryHash(m, state, status)),
              },
              h('span', {}, `${m} · ${titles[m]}`),
              h('span', { class: 'status' }, STATUS_LABEL[status]),
            ),
          );
        }),
      ),
      tests ? h('button', { type: 'button', class: 'link', onClick: () => go('#/tes-ml/penilai') }, 'Penilaian tes (guru/peneliti)') : null,
      h('button', { type: 'button', class: 'small link', onClick: onReset }, 'Mulai ulang (versi pengembangan)'),
    ),
  ];
}

/** Layar penutup modul. */
export function doneScreen({ title, text, go }) {
  return [
    topBar(title),
    h('main', { class: 'screen' }, h('p', {}, h('strong', {}, 'Bagus!')), h('p', {}, text)),
    h('nav', { class: 'navbar single' }, h('button', { type: 'button', class: 'primary', onClick: () => go('#/') }, 'Ke peta belajar')),
  ];
}

import './styles/tokens.css';
import './styles/base.css';
import { homeScreen, gradeScreen, doneScreen } from './screens/home.js';
import { lessonScreen } from './screens/lesson.js';
import { diagnosticScreen, reminderScreen } from './screens/diagnostic.js';
import { quizScreen } from './screens/quiz.js';
import { solveScreen } from './screens/solve.js';
import {
  offerScreen,
  quickScreen,
  practiceScreen,
  checkScreen,
  explainScreen,
  afterM2Lesson,
  mandiriLockedScreen,
} from './screens/m2.js';
import { mlEntries, mlIntroScreen, mlTaskScreen, mlSubmitScreen, mlResultScreen, mlGraderHome, mlGradeScreen } from './screens/mlTest.js';
import { isItemLocked } from './engine/path.js';
import { PHASES } from './engine/mlScore.js';
import { store } from './data/store.js';
import { logEvent } from './data/logger.js';
import m0 from './content/m0.json';
import m1 from './content/m1.json';
import m2 from './content/m2.json';
import m3 from './content/m3.json';
import m4 from './content/m4.json';
import mlTest from './content/ml-test.json';
import { fill } from './components/dom.js';

// Modul yang kontennya sudah ada. Modul lain ditambahkan bertahap (docs/task.md bagian C).
const lessons = { M1: m1, M2: m2, M3: m3, M4: m4 };
const TITLES = {
  M0: 'Cek Kesiapan',
  M1: 'Mengingat Perbandingan',
  M2: 'Senilai atau Berbalik?',
  M3: 'Menghitung Senilai',
  M4: 'Menghitung Berbalik Nilai',
  M5: 'Soal Cerita Campuran',
  M6: 'Latihan Akhir',
};
const recallCard = m2.screens.find((s) => s.id === 'M2-07');

const app = document.getElementById('app');

function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

/**
 * Urutan dalam satu modul: layar materi → latihan (quiz) atau soal 4 langkah → penutup.
 * M2: layar materi → latihan identifikasi → cek pemahaman (ulangan: langsung ke cek).
 */
function finishLessonScreens(lesson) {
  if (lesson.identify?.length) return go(afterM2Lesson(store));
  if (lesson.quiz?.length) return go(`#/latihan/${lesson.module}/0`);
  if (lesson.items?.length) return go(`#/soal/${lesson.module}/0`);
  return finishModule(lesson);
}

function finishModule(lesson) {
  store.update((s) => {
    s.progress[lesson.module] = 'selesai';
  });
  go(`#/selesai/${lesson.module}`);
}

const clampIndex = (raw, length) => Math.min(Math.max(Number.parseInt(raw, 10) || 0, 0), length - 1);
/** Seperti clampIndex, tetapi indeks = length diizinkan (layar hasil cek). */
const clampResult = (raw, length) => Math.min(Math.max(Number.parseInt(raw, 10) || 0, 0), length);

/** Bagian interaktif M2: #/m2/tawar · cepat/n · latih/n · cek/mulai|n · jelaskan */
/**
 * Tes literasi (F17): #/tes-ml/<awal|akhir>[/<n>|/kirim|/hasil]
 *                     #/tes-ml/penilai[/<awal|akhir>/<n>]
 */
function routeMlTest(part, sub, sub2) {
  const ctx = { test: mlTest, store, go };
  const n = mlTest.tasks.length;
  if (part === 'penilai') {
    if (PHASES.includes(sub)) return mlGradeScreen({ ...ctx, phase: sub, index: clampIndex(sub2, n) });
    return mlGraderHome(ctx);
  }
  if (!PHASES.includes(part)) return null;
  const phase = part;
  if (sub === undefined || sub === '') return mlIntroScreen({ ...ctx, phase });
  if (sub === 'kirim') return mlSubmitScreen({ ...ctx, phase });
  if (sub === 'hasil') return mlResultScreen({ ...ctx, phase });
  return mlTaskScreen({ ...ctx, phase, index: clampIndex(sub, n) });
}

function routeM2(part, raw) {
  const ctx = { m2, store, go, recallCard, finishModule: () => finishModule(m2) };
  if (part === 'tawar') return offerScreen(ctx);
  if (part === 'cepat') return quickScreen({ ...ctx, index: clampResult(raw, m2.quick.length) });
  if (part === 'latih') return practiceScreen({ ...ctx, index: clampIndex(raw, m2.identify.length) });
  if (part === 'cek') return checkScreen({ ...ctx, index: raw === 'mulai' ? 'mulai' : clampResult(raw, m2.check.length) });
  if (part === 'jelaskan' && store.get().m2.passed) return explainScreen(ctx);
  return null;
}

function route() {
  const state = store.get();
  const [page, a, b, c] = location.hash.replace(/^#\/?/, '').split('/');

  if (!state.grade) {
    return gradeScreen({
      onPick: (grade) => {
        store.update((s) => {
          s.grade = grade;
        });
        // ke peta belajar dulu: Tes awal (F17) ada di atas M0, agar dikerjakan sebelum belajar (KP-29)
        go('#/');
      },
    });
  }

  if (page === 'diagnostik') {
    const index = a === 'intro' ? -1 : Math.min(Math.max(Number.parseInt(a, 10) || 0, 0), m0.items.length);
    return diagnosticScreen({ m0, index, store, go });
  }

  if (page === 'pengingat' && m0.reminders[a]) {
    const index = Math.min(Math.max(Number.parseInt(b, 10) || 0, 0), m0.reminders[a].screens.length);
    return reminderScreen({ m0, skill: a, index, store, go });
  }

  if (page === 'm2') {
    const screen = routeM2(a, b);
    if (screen) return screen;
  }

  if (page === 'tes-ml') {
    const screen = routeMlTest(a, b, c);
    if (screen) return screen;
  }

  const lesson = lessons[a];
  if (lesson) {
    if (page === 'modul' && lesson.screens?.length) {
      const index = clampIndex(b, lesson.screens.length);
      if (index === 0) logEvent('screen_view', { module_id: a, screen_id: lesson.screens[0].id });
      return lessonScreen({ lesson, index, go, onFinish: () => finishLessonScreens(lesson) });
    }
    if (page === 'latihan' && lesson.quiz?.length) {
      return quizScreen({ lesson, index: clampIndex(b, lesson.quiz.length), go, onFinish: () => finishModule(lesson) });
    }
    if (page === 'soal' && lesson.items?.length) {
      const index = clampIndex(b, lesson.items.length);
      if (isItemLocked(lesson.items[index], state)) return mandiriLockedScreen({ moduleId: a, item: lesson.items[index], go });
      return solveScreen({ lesson, index, recallCard, go, onFinish: () => finishModule(lesson) });
    }
    if (page === 'selesai') {
      return doneScreen({ title: lesson.title, text: lesson.closing || 'Modul selesai.', go });
    }
  }

  return homeScreen({
    state,
    titles: TITLES,
    available: Object.keys(lessons),
    tests: mlEntries(mlTest, state.ml),
    go,
    onReset: () => {
      if (confirm('Hapus semua kemajuan di perangkat ini?')) {
        store.reset();
        go('#/');
      }
    },
  });
}

function render() {
  fill(app, ...route());
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();

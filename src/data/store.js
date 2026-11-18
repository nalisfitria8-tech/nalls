
/**
 * Keadaan belajar siswa di perangkat ini.
 * Sementara disimpan di localStorage.
 */
import { emptyPhase } from '../engine/mlScore.js';

const KEY = 'mathsave:v1';

const empty = () => ({
  grade: null,
  diagnostic: {
    done: false,
    answers: {},
    scores: null,
    start: null,
    reminders: [],
  },
  remindersDone: [],
  progress: {},
  m2: {
    passed: false,
    quickDone: false,
    quickScore: null,
    quick: { answers: {} },
    cek: {
      attempt: 0,
      open: false,
      order: null,
      answers: {},
      result: null,
      reviewed: false,
    },
  },
  ml: {
    deviceId: null,
    participant: '',
    awal: emptyPhase(),
    akhir: emptyPhase(),
  },
});

function merge(saved) {
  const base = empty();
  const m2 = { ...base.m2, ...saved.m2 };
  m2.quick = { ...base.m2.quick, ...saved.m2?.quick };
  m2.cek = { ...base.m2.cek, ...saved.m2?.cek };

  const ml = { ...base.ml, ...saved.ml };
  ml.awal = { ...base.ml.awal, ...saved.ml?.awal };
  ml.akhir = { ...base.ml.akhir, ...saved.ml?.akhir };

  return { ...base, ...saved, m2, ml };
}

function readSaved() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? merge(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

let state = readSaved() ?? empty();

function refresh() {
  state = readSaved() ?? state;
  return state;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Penyimpanan tidak tersedia.
  }
}

export const store = {
  get: () => refresh(),

  update(fn) {
    fn(refresh());
    save();
  },

  reset() {
    state = empty();
    save();
  },
};

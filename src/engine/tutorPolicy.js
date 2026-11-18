/**
 * Aturan murni chatbot "Tanya Nalls" (F18, fitur pendukung). Dipakai bersama oleh
 * layar soal (src/components/tutor.js) dan fungsi server (netlify/functions/tutor.js).
 * Tidak ada akses jaringan atau penyimpanan di sini, sehingga semuanya bisa dites.
 *
 * Isi teks (aturan bimbingan, pesan batas, wadah RMT) ada di src/content/tutor.json.
 * Tahapan RMT belum diisi: menunggu rangkuman resmi dosen (lihat tutor.json → rmt).
 */
import { parseNumber, round2 } from './number.js';

/** Langkah alur soal 4 langkah, sesuai urutan layar. */
export const TUTOR_STEPS = ['diketahui', 'ditanya', 'jenis', 'hitung'];

/** Status satu permintaan (dicatat sebagai jumlah & status saja, bukan isi percakapan). */
export const STATUS = {
  OK: 'ok', // balasan AI diterima
  GUARDED: 'guarded', // balasan AI memuat jawaban akhir → diganti petunjuk
  LIMIT_DEVICE: 'limit_device', // jatah harian perangkat ini habis
  LIMIT_BUSY: 'limit_busy', // batas per menit layanan AI
  LIMIT_DAY: 'limit_day', // batas harian layanan AI
  UNAVAILABLE: 'unavailable', // tidak ada internet / server / layanan AI error
  DISABLED: 'disabled', // chatbot dimatikan (TUTOR_ENABLED)
  INVALID: 'invalid', // pesan kosong / terlalu panjang / data soal tidak dikenal
};

/** Kunci pesan di tutor.json → messages untuk setiap status yang bukan balasan. */
export const STATUS_MESSAGE = {
  limit_device: 'limitDevice',
  limit_busy: 'limitBusy',
  limit_day: 'limitDay',
  unavailable: 'unavailable',
  disabled: 'disabled',
  invalid: 'invalid',
};

/** Chatbot hanya untuk fase terbimbing modul tertentu (bukan mandiri, tes, atau cek). */
export function tutorAllowed(settings, moduleId, item) {
  return Boolean(item) && settings.modules.includes(moduleId) && settings.phases.includes(item.phase);
}

// ---------------------------------------------------------------------------
// Pesan siswa
// ---------------------------------------------------------------------------

/** Menyamarkan pola data pribadi yang jelas (email, nomor HP) sebelum dikirim ke layanan AI. */
export function redactPersonal(text) {
  return text
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]')
    .replace(/(?:\+?62|0)8[\d\s-]{7,14}\d/g, '[nomor]');
}

/**
 * Membersihkan pesan siswa: spasi dirapikan, data pribadi yang jelas disamarkan.
 * Mengembalikan { ok, text }; ok=false jika kosong atau lebih dari batas huruf.
 */
export function sanitizeMessage(raw, maxChars) {
  if (typeof raw !== 'string') return { ok: false, text: '' };
  const text = raw.replace(/\s+/g, ' ').trim();
  if (!text || text.length > maxChars) return { ok: false, text };
  return { ok: true, text: redactPersonal(text) };
}

// ---------------------------------------------------------------------------
// Pesan untuk layanan AI (format chat kompatibel OpenAI/Groq)
// ---------------------------------------------------------------------------

const ERROR_TEXT = {
  ambil_data: 'angka atau besaran yang diambil belum tepat',
  jenis: 'jenis perbandingan belum tepat',
  rumus: 'bentuk hitungan belum tepat',
  hitung: 'hasil hitungan belum tepat',
  kewajaran: 'cek kewajaran belum tepat',
};

function rowsText(item) {
  const [c1, c2] = item.table.columns;
  return item.table.rows.map((r) => `${c1} ${r[0] ?? '?'}, ${c2} ${r[1] ?? '?'}`).join('; ');
}

/** Data soal ringkas (rahasia untuk AI): teks, tabel, jenis, kunci, langkah, keadaan siswa. */
export function itemContext(item, { step, errorType = null, hintLevel = 0 } = {}) {
  const lines = [
    `Soal: ${item.text}`,
    `Tabel: ${rowsText(item)}`,
    `Jenis (rahasia): ${item.type === 'senilai' ? 'senilai' : 'berbalik nilai'}`,
    `Kunci jawaban (rahasia, jangan disebut): ${item.answer}`,
    `Langkah siswa sekarang: ${TUTOR_STEPS.indexOf(step) + 1} (${step})`,
    `Petunjuk yang sudah dibuka siswa: ${hintLevel}`,
  ];
  if (errorType && ERROR_TEXT[errorType]) lines.push(`Kesalahan terakhir siswa: ${ERROR_TEXT[errorType]}`);
  return lines.join('\n');
}

/** Riwayat singkat: hanya `turns` tanya-jawab terakhir, setiap isi dipotong. */
export function trimHistory(history, turns, maxChars = 300) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-turns * 2)
    .map((m) => ({ role: m.role, content: m.content.slice(0, maxChars) }));
}

/**
 * Tahapan RMT (Rigorous Mathematical Thinking) yang berlaku untuk langkah ini.
 * Isi HANYA dari rangkuman resmi dosen (tutor.json → rmt; diperiksa check_content.py).
 * Bentuk tahapan: teks, atau { nama, deskripsi?, langkah?: ['diketahui'|'ditanya'|'jenis'|'hitung'],
 * contohPertanyaan?: [...] }. Tanpa `langkah` = berlaku di semua langkah. Hanya tahapan yang
 * relevan dikirim, agar informasi untuk AI (dan balasannya) tetap ringkas.
 */
export function rmtForStep(rmt, step) {
  const all = Array.isArray(rmt?.tahapan) ? rmt.tahapan : [];
  return all
    .map((t, i) => (typeof t === 'string' ? { no: i + 1, nama: t } : { no: i + 1, ...t }))
    .filter((t) => t.nama && (!Array.isArray(t.langkah) || t.langkah.includes(step)));
}

function rmtRule(rmt, step) {
  const stages = rmtForStep(rmt, step);
  if (!stages.length) return null;
  const parts = stages.map((t) => {
    const ask = t.contohPertanyaan?.length ? ` Contoh pertanyaan: "${t.contohPertanyaan[0]}"` : '';
    return `${t.no}) ${t.nama}${t.deskripsi ? `: ${t.deskripsi}` : ''}.${ask}`;
  });
  return `Bimbing dengan tahapan RMT dari dosen (${rmt.sumber}). Untuk langkah ini: ${parts.join(' ')} Tetap satu tahap per balasan.`;
}

/**
 * Menyusun pesan untuk layanan AI.
 * tutor = isi tutor.json; rmt hanya dipakai jika tahapan resmi sudah diisi.
 */
export function buildMessages(tutor, item, { step, errorType, hintLevel, history, message }) {
  const rules = [...tutor.rules, tutor.stepFocus[step]];
  const rmt = rmtRule(tutor.rmt, step);
  if (rmt) rules.push(rmt);
  return [
    { role: 'system', content: `${rules.join('\n')}\n\n${itemContext(item, { step, errorType, hintLevel })}` },
    ...trimHistory(history, tutor.settings.historyTurns),
    { role: 'user', content: message },
  ];
}

// ---------------------------------------------------------------------------
// Penjaga balasan: tanpa jawaban akhir, singkat, teks polos
// ---------------------------------------------------------------------------

const MULTIPLIER = { ribu: 1e3, rb: 1e3, juta: 1e6, jt: 1e6 };

/** Semua angka di teks (format Indonesia, "98 ribu", pecahan "75/4", campuran "18 3/4"). */
export function numbersIn(text) {
  const found = [];
  const re = /(\d[\d.,]*)(?:\s+(\d+)\s*\/\s*(\d+)|\s*\/\s*(\d+))?(?:\s*(ribu|rb|juta|jt)\b)?/gi;
  for (const m of text.matchAll(re)) {
    const base = parseNumber(m[1].replace(/[.,]$/, ''));
    if (base === null) continue;
    let value = base;
    if (m[2] && m[3] && Number(m[3]) !== 0) value = base + Number(m[2]) / Number(m[3]); // 18 3/4
    else if (m[4] && Number(m[4]) !== 0) value = base / Number(m[4]); // 75/4
    if (m[5]) value *= MULTIPLIER[m[5].toLowerCase()];
    found.push(value);
  }
  return found;
}

const round1 = (n) => Math.round(n * 10) / 10;

/** Apakah teks memuat jawaban akhir soal (termasuk bentuk dibulatkan 1–2 desimal)? */
export function leaksAnswer(text, item) {
  const answer = item.answer;
  if (typeof answer !== 'number') return false;
  // angka yang hanya label ("Langkah 3", "petunjuk 2") bukan jawaban
  const unlabeled = text.replace(/\b(langkah|soal|tahap|petunjuk|nomor|baris|kolom)\s*(ke-?)?\s*\d+/gi, '');
  return numbersIn(unlabeled).some(
    (n) => Math.abs(n - answer) <= 0.01 || round2(n) === round2(answer) || (!Number.isInteger(answer) && n === round1(answer)),
  );
}

/** Teks polos: tanpa markdown/LaTeX, spasi dirapikan. */
export function plainText(text) {
  return text
    .replace(/\\\(|\\\)|\\\[|\\\]|\$\$?/g, '')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, ':')
    .replace(/[*_#`>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Memotong ke ±maxWords kata, sebisa mungkin di akhir kalimat. */
export function limitWords(text, maxWords) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  const cut = words.slice(0, maxWords).join(' ');
  const end = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('?'), cut.lastIndexOf('!'));
  if (end > 0 && cut.slice(0, end + 1).split(/\s+/).length >= 8) return cut.slice(0, end + 1);
  return `${cut}…`;
}

/** Petunjuk pengganti: petunjuk konten berikutnya (jika tidak memuat jawaban), atau kalimat umum per langkah. */
export function fallbackReply(tutor, item, step, hintLevel = 0) {
  const hints = item.hints ?? [];
  const next = hints[Math.min(hintLevel, hints.length - 1)];
  if (next && !leaksAnswer(next, item)) return next;
  return tutor.fallbackByStep[step];
}

/**
 * Penjaga akhir untuk balasan AI.
 * Mengembalikan { text, status }: status 'guarded' jika balasan diganti petunjuk.
 */
export function finalizeReply(raw, tutor, item, { step, hintLevel = 0 }) {
  const text = limitWords(plainText(typeof raw === 'string' ? raw : ''), tutor.settings.maxReplyWords);
  if (!text || leaksAnswer(text, item)) {
    return { text: fallbackReply(tutor, item, step, hintLevel), status: STATUS.GUARDED };
  }
  return { text, status: STATUS.OK };
}

// ---------------------------------------------------------------------------
// Jatah harian per perangkat (pembatasan sederhana di localStorage, bisa dilewati)
// ---------------------------------------------------------------------------

/** Tanggal lokal "YYYY-MM-DD". */
export function dayKey(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** usage = { date, count } dari penyimpanan perangkat; hari berganti → jatah penuh lagi. */
export function quotaStatus(usage, limit, now = new Date()) {
  const used = usage?.date === dayKey(now) ? usage.count : 0;
  return { used, remaining: Math.max(limit - used, 0), allowed: used < limit };
}

/** Jatah berkurang hanya jika siswa menerima balasan (ok / guarded), bukan saat layanan sibuk. */
export function consumeQuota(usage, status, now = new Date()) {
  const today = dayKey(now);
  const used = usage?.date === today ? usage.count : 0;
  const counts = status === STATUS.OK || status === STATUS.GUARDED;
  return { date: today, count: used + (counts ? 1 : 0) };
}

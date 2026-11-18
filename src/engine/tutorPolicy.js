/**
 * Aturan murni chatbot "Tanya Nalls" (F18, fitur pendukung). Dipakai bersama oleh
 * tombol mengambang (src/components/tutor.js) dan fungsi server (netlify/functions/tutor.js).
 * Tidak ada akses jaringan atau penyimpanan di sini, sehingga semuanya bisa dites.
 *
 * Cakupan (KP-36): halaman belajar & latihan M0–M4 menurut JENIS halaman:
 *   materi (layar materi M1–M4) · pengingat (kartu pengingat M0) · latihan (M1, cek kartu M0)
 *   identifikasi (latihan M2) · soal (soal 4 langkah M3–M4 fase terbimbing, termasuk kembar)
 * Tidak termasuk: diagnostik M0, cek pemahaman/cek cepat & "jelaskan" M2, tes, penilaian.
 * Latihan mandiri M3–M4: tombol terlihat, tanpa AI (lihat components/tutor.js).
 *
 * Isi teks (aturan bimbingan, pesan batas, wadah RMT) ada di src/content/tutor.json.
 * Tahapan RMT belum diisi: menunggu rangkuman resmi dosen (lihat tutor.json → rmt).
 */
import { parseNumber, round2 } from './number.js';

/** Langkah alur soal 4 langkah, sesuai urutan layar. */
export const TUTOR_STEPS = ['diketahui', 'ditanya', 'jenis', 'hitung'];

/** Jenis halaman yang boleh memakai AI (cakupan per modul: tutor.json → settings.scope). */
export const TUTOR_KINDS = ['materi', 'pengingat', 'latihan', 'identifikasi', 'soal'];

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

/** Jenis halaman ini boleh memakai AI di modul ini? */
export function kindAllowed(settings, moduleId, kind) {
  return Boolean(settings.scope?.[moduleId]?.includes(kind));
}

/** Soal 4 langkah: hanya fase terbimbing (bukan mandiri/akhir). */
export function tutorAllowed(settings, moduleId, item) {
  return Boolean(item) && kindAllowed(settings, moduleId, 'soal') && settings.phases.includes(item.phase);
}

/** Bentuk target (halaman yang sedang dibuka). Soal lama (objek item) dianggap jenis 'soal'. */
export const toTarget = (x) => (x && x.kind ? x : { kind: 'soal', module: null, item: x });

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
  jawaban: 'jawaban terakhir belum tepat',
};

const JENIS_TEXT = { senilai: 'senilai', berbalik: 'berbalik nilai' };
const ARAH_TEXT = { searah: 'ikut bertambah (searah)', berlawanan: 'berkurang (berlawanan arah)' };

/** Teks konten tanpa markah (**tebal**, [[senilai]]). */
const clean = (t) =>
  String(t ?? '')
    .replace(/\*\*/g, '')
    .replace(/\[\[senilai\]\]/g, 'Senilai')
    .replace(/\[\[berbalik\]\]/g, 'Berbalik nilai');

function rowsText(item) {
  const [c1, c2] = item.table.columns;
  return item.table.rows.map((r) => `${c1} ${r[0] ?? '?'}, ${c2} ${r[1] ?? '?'}`).join('; ');
}

/** Tabel layar materi; judul tabel (yang bisa memuat jawaban label) disembunyikan di layar interaktif. */
function screenTableText(t, interactive) {
  const cols = (t.columns ?? []).map((c) => (typeof c === 'string' ? c : c.label));
  const rows = (t.rows ?? []).map((r) => r.map((v) => v ?? '?').join(' | ')).join('; ');
  return `${!interactive && t.caption ? `${t.caption}: ` : ''}${cols.join(' | ')} → ${rows}`;
}

const isLabelScreen = (screen) => screen?.interaction?.type === 'label_tables';

/** Data soal 4 langkah ringkas (rahasia untuk AI): teks, tabel, jenis, kunci, langkah, keadaan siswa. */
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

/** Konteks halaman yang sedang dibuka siswa, menurut jenisnya (materi, pengingat, latihan, identifikasi, soal). */
export function targetContext(target, { step, errorType = null, hintLevel = 0 } = {}) {
  const t = toTarget(target);
  const head = [`Modul: ${t.module ?? '-'}${t.title ? ` (${clean(t.title)})` : ''}`, `Jenis halaman: ${t.kind}`];
  if (t.kind === 'soal') return [...head, itemContext(t.item, { step, errorType, hintLevel })].join('\n');

  const lines = [...head];
  if (t.kind === 'materi' || t.kind === 'pengingat') {
    const s = t.screen;
    const interactive = isLabelScreen(s);
    lines.push(`Isi layar: ${[...(s.text ?? []), ...(s.after ?? []), ...(s.note ? [s.note].flat() : [])].map(clean).join(' ')}`);
    for (const tb of s.tables ?? []) lines.push(`Tabel: ${screenTableText(tb, interactive)}`);
    if (interactive) {
      const keys = (s.tables ?? []).map((tb, i) => `tabel ${i + 1} ${JENIS_TEXT[tb.answer?.jenis] ?? '?'} (yang tetap ${tb.answer?.tetap ?? '?'})`);
      lines.push(`Di layar ini siswa sendiri memberi label jenis dan memilih yang tetap untuk tiap tabel.`);
      lines.push(`Kunci jawaban (rahasia, jangan disebut): ${keys.join('; ')}`);
    }
  } else if (t.kind === 'latihan') {
    const q = t.item;
    lines.push(`Soal latihan: ${clean(q.text)}`);
    if (Array.isArray(q.options)) lines.push(`Pilihan: ${q.options.join(' | ')}`);
    lines.push(`Kunci jawaban (rahasia, jangan disebut): ${q.answer}`);
  } else if (t.kind === 'identifikasi') {
    const q = t.item;
    lines.push(`Soal: ${clean(q.text)}`);
    lines.push(`Besaran: ${q.a} dan ${q.b}${q.condition ? ` (syarat: ${q.condition})` : ''}`);
    lines.push(`Arah (rahasia): jika ${q.a} bertambah, ${q.b} ${ARAH_TEXT[q.arah] ?? '?'}`);
    lines.push(`Kunci jawaban (rahasia, jangan disebut): ${JENIS_TEXT[q.jenis] ?? '?'}`);
  }
  lines.push(`Petunjuk yang sudah dibuka siswa: ${hintLevel}`);
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
    .filter((t) => t.nama && (!Array.isArray(t.langkah) || (step && t.langkah.includes(step))));
}

function rmtRule(rmt, step) {
  const stages = rmtForStep(rmt, step);
  if (!stages.length) return null;
  const parts = stages.map((t) => {
    const ask = t.contohPertanyaan?.length ? ` Contoh pertanyaan: "${t.contohPertanyaan[0]}"` : '';
    return `${t.no}) ${t.nama}${t.deskripsi ? `: ${t.deskripsi}` : ''}.${ask}`;
  });
  return `Bimbing dengan tahapan RMT dari dosen (${rmt.sumber}). Untuk ${step ? 'langkah' : 'halaman'} ini: ${parts.join(' ')} Tetap satu tahap per balasan.`;
}

/**
 * Menyusun pesan untuk layanan AI.
 * tutor = isi tutor.json; target = halaman yang dibuka (atau item soal 4 langkah);
 * rmt hanya dipakai jika tahapan resmi sudah diisi.
 */
export function buildMessages(tutor, target, { step, errorType, hintLevel, history, message }) {
  const t = toTarget(target);
  const focus = t.kind === 'soal' ? tutor.stepFocus[step] : tutor.kindFocus?.[t.kind];
  const rules = [...tutor.rules, focus].filter(Boolean);
  const rmt = rmtRule(tutor.rmt, t.kind === 'soal' ? step : null);
  if (rmt) rules.push(rmt);
  return [
    { role: 'system', content: `${rules.join('\n')}\n\n${targetContext(t, { step, errorType, hintLevel })}` },
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

/** Angka yang hanya label ("Langkah 3", "petunjuk 2", "tabel 1") bukan jawaban. */
const unlabel = (text) => text.replace(/\b(langkah|soal|tahap|petunjuk|nomor|baris|kolom|tabel|pilihan)\s*(ke-?)?\s*\d+/gi, '');

/** Apakah teks memuat angka jawaban (termasuk bentuk dibulatkan 1–2 desimal, "98 ribu", pecahan)? */
export function leaksNumber(text, answer) {
  if (typeof answer !== 'number') return false;
  return numbersIn(unlabel(text)).some(
    (n) => Math.abs(n - answer) <= 0.01 || round2(n) === round2(answer) || (!Number.isInteger(answer) && n === round1(answer)),
  );
}

/** Jawaban teks: perbandingan "2 : 3" (juga "2:3", "2 banding 3") atau teks pilihan yang benar. */
export function leaksText(text, answer) {
  const a = String(answer ?? '').trim();
  if (!a) return false;
  const ratio = a.match(/^(\d+)\s*:\s*(\d+)$/);
  if (ratio) return new RegExp(`(^|[^\\d])${ratio[1]}\\s*(:|∶|(ber)?banding|dibanding(kan)?)\\s*${ratio[2]}(?![\\d])`, 'i').test(text);
  const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ');
  return a.length >= 2 && norm(text).includes(norm(a));
}

/** Pasangan yang dirahasiakan: menyebut satu sisi saja, atau keduanya tanpa "atau", = membocorkan. */
export const PAIRS = {
  jenis: [/\bsenilai\b/i, /\bberbalik\b/i],
  arah: [/\b(ikut|juga)\s+bertambah\b|\bbertambah\s+juga\b|\bsearah\b/i, /\bberkurang\b|\bberlawanan\b/i],
  tetap: [/\bhasil\s+bagi\b/i, /\bhasil\s+kali\b/i],
};

export function leaksPair(text, [a, b]) {
  const hasA = a.test(text);
  const hasB = b.test(text);
  if (!hasA && !hasB) return false;
  if (hasA && hasB) return !/\batau\b/i.test(text); // "senilai atau berbalik nilai?" = pertanyaan, boleh
  return true;
}

/** Apa yang dirahasiakan di halaman ini (dan langkah ini). */
export function guardsFor(target, step) {
  const t = toTarget(target);
  const g = { numbers: [], texts: [], pairs: [] };
  if (t.kind === 'soal') {
    g.numbers.push(t.item.answer);
    if (step !== 'hitung') g.pairs.push(PAIRS.jenis); // jenis ditentukan siswa di Langkah 3
  } else if (t.kind === 'latihan') {
    const ans = t.item.answer;
    if (typeof ans === 'number') g.numbers.push(ans);
    else if (/^[\d.,]+$/.test(String(ans).trim()) && parseNumber(String(ans)) !== null) g.numbers.push(parseNumber(String(ans)));
    else g.texts.push(ans);
  } else if (t.kind === 'identifikasi') {
    g.pairs.push(PAIRS.jenis, PAIRS.arah);
  } else if (isLabelScreen(t.screen)) {
    g.pairs.push(PAIRS.jenis, PAIRS.tetap); // M2-06: siswa memberi label tiap tabel
  }
  return g;
}

/** Apakah teks membocorkan jawaban di halaman ini? (soal lama: target = item soal 4 langkah) */
export function leaksAnswer(text, target, step) {
  const g = guardsFor(target, step);
  return (
    g.numbers.some((n) => leaksNumber(text, n)) ||
    g.texts.some((a) => leaksText(text, a)) ||
    g.pairs.some((p) => leaksPair(text, p))
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

/** Petunjuk pengganti: petunjuk konten berikutnya (jika tidak membocorkan), atau kalimat umum per langkah/jenis halaman. */
export function fallbackReply(tutor, target, step, hintLevel = 0) {
  const t = toTarget(target);
  const hints = t.item?.hints ?? [];
  const next = hints[Math.min(hintLevel, hints.length - 1)];
  if (next && !leaksAnswer(clean(next), t, step)) return clean(next);
  return t.kind === 'soal' ? tutor.fallbackByStep[step] : tutor.fallbackByKind[t.kind];
}

/**
 * Penjaga akhir untuk balasan AI.
 * Mengembalikan { text, status }: status 'guarded' jika balasan diganti petunjuk.
 */
export function finalizeReply(raw, tutor, target, { step, hintLevel = 0 }) {
  const text = limitWords(plainText(typeof raw === 'string' ? raw : ''), tutor.settings.maxReplyWords);
  if (!text || leaksAnswer(text, target, step)) {
    return { text: fallbackReply(tutor, target, step, hintLevel), status: STATUS.GUARDED };
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

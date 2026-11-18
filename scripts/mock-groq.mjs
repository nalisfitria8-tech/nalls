/**
 * Groq TIRUAN untuk uji tanpa akun, tanpa kunci, tanpa internet, tanpa biaya.
 * Hanya dipakai skrip lokal (scripts/); TIDAK ada di fungsi Netlify, sehingga situs
 * yang di-deploy tidak mungkin berjalan dengan balasan tiruan.
 *
 * Perilaku (meniru format API Groq/OpenAI chat completions):
 *   - balasan pendek per langkah, diawali "[Tiruan]" agar jelas bukan AI sungguhan;
 *   - pesan yang meminta jawaban ("jawab", "hasil akhir", "lengkap") → balasan MEMBOCORKAN kunci,
 *     supaya penjaga jawaban di server ikut teruji (siswa menerima petunjuk, bukan jawaban);
 *   - kata uji "tes-ramai" → 429 per menit; "tes-habis" → 429 batas harian; "tes-galat" → 500.
 */
const STEP_REPLY = {
  diketahui: 'Coba baca soalnya lagi. Angka mana yang penting, dan besarannya apa?',
  ditanya: 'Kalimat mana yang menanyakan sesuatu? Besaran apa yang dicari?',
  jenis: 'Jika besaran pertama bertambah, besaran kedua ikut bertambah atau berkurang?',
  hitung: 'Coba susun hitungannya. Untuk jenis ini, yang tetap hasil bagi atau hasil kali?',
  // jenis halaman lain (KP-36)
  materi: 'Coba ceritakan dengan kata-katamu: apa ide utama di layar ini?',
  pengingat: 'Lihat contoh di kartu ini. Langkah pertama yang dilakukan apa?',
  latihan: 'Coba kerjakan satu langkah dulu. Bilangan apa yang bisa membagi keduanya?',
  identifikasi: 'Jika besaran pertama bertambah, besaran kedua ikut bertambah atau berkurang?',
};

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

export async function mockGroqFetch(url, init) {
  const body = JSON.parse(init.body);
  const system = body.messages[0].content;
  const last = body.messages.at(-1).content.toLowerCase();
  if (last.includes('tes-ramai')) return json(429, { error: { message: 'Rate limit reached ... tokens per minute (TPM)' } }, { 'retry-after': '20' });
  if (last.includes('tes-habis')) return json(429, { error: { message: 'Rate limit reached ... tokens per day (TPD)' } }, { 'retry-after': '3600' });
  if (last.includes('tes-galat')) return json(500, { error: { message: 'server error' } });
  const kind = (system.match(/Jenis halaman: (\w+)/) ?? [])[1] ?? 'soal';
  const step = kind === 'soal' ? (system.match(/Langkah siswa sekarang: \d \((\w+)\)/) ?? [])[1] ?? 'hitung' : kind;
  const answer = (system.match(/Kunci jawaban \(rahasia, jangan disebut\): (.+)/) ?? [])[1]?.trim();
  const content = /jawab|hasil akhir|lengkap|jenisnya/.test(last) && answer
    ? `[Tiruan] Jawabannya ${answer}.` // sengaja bocor (angka, perbandingan, atau jenis) → harus diganti penjaga
    : `[Tiruan] ${STEP_REPLY[step] ?? STEP_REPLY.hitung}`;
  return json(200, { choices: [{ message: { content } }], usage: { total_tokens: 900 } });
}

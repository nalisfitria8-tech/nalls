# Panduan Singkat: Tanya Nalls — Mode Tiruan dan Menghubungkan Groq Free

**Tanpa biaya.** Tidak perlu kartu atau data pembayaran. Jangan *upgrade* paket. Jika kuota gratis habis, Tanya Nalls hanya berhenti sementara (tombol **Petunjuk** tetap jalan).

## 1. Sekarang: Mode Tiruan (tanpa akun, tanpa kunci, tanpa internet)

| Perintah | Gunanya |
|---|---|
| `npm run tutor:tiruan` | Aplikasi + Tanya Nalls tiruan di `http://localhost:8888/#/soal/M3/2` |
| `npm run tutor:tiruan -- --host` | Sama, bisa dibuka dari HP di Wi-Fi yang sama |
| `npm run tutor:uji-tiruan` | 16 percakapan contoh otomatis + tabel laporan |
| `npm test` | Semua tes otomatis (Groq selalu tiruan di tes) |

Yang bisa dicoba di mode tiruan:
- Balasan diawali **"[Tiruan]"** — bukan AI sungguhan, hanya meniru format balasan per langkah.
- Tulis "kasih jawabannya" → tiruan sengaja membocorkan jawaban → **penjaga server menggantinya dengan petunjuk** (sama seperti nanti dengan AI sungguhan).
- Tulis `tes-ramai` → pesan "sedang ramai"; `tes-habis` → pesan "batas pemakaian hari ini"; `tes-galat` → "tidak bisa dihubungi". Jatah tidak berkurang untuk pesan-pesan ini.
- Jatah 4 pertanyaan/hari per perangkat dan tombol Petunjuk.

Mode tiruan **hanya ada di laptop** (folder `scripts/`). Fungsi server di Netlify tidak punya mode tiruan: tanpa kunci, situs menampilkan "tidak bisa dihubungi".

## 2. Nanti: menghubungkan kunci Groq (setelah akun dan izin tersedia)

Lakukan hanya jika sudah siap; tidak ada yang perlu diubah di kode.

1. **Akun Groq (gratis):** daftar di console.groq.com, lewati semua tawaran berbayar, jangan isi data pembayaran.
2. **Settings → Limits:** catat batas `openai/gpt-oss-120b` (RPM, RPD, TPM, TPD).
3. **Settings → Data Controls:** nyalakan **Zero Data Retention**.
4. **API Keys → Create API Key** (nama `nalls`); salin (hanya tampil sekali).
5. Di folder proyek buat file **`.env`** (bukan `.env.example`):
   ```
   GROQ_API_KEY=tempel-kunci-di-sini
   TUTOR_ENABLED=true
   ```
   `git status` tidak boleh menampilkan `.env`. Jangan kirim kunci lewat chat, WhatsApp, atau dokumen.
6. Uji: `npm run tutor:uji -- --maks 4` (±4 permintaan), lalu `npm run tutor:uji` (16 permintaan, jeda 9 detik agar < 8K token/menit), lalu coba sendiri `npm run tutor:lokal`.
7. Kirim ke Claude **tanpa kunci**: angka dari langkah 2 dan tabel ringkasan langkah 6 → jatah per siswa (`src/content/tutor.json`, sekarang 4/hari) disesuaikan.

## 3. Nanti: Netlify Free (setelah uji lokal)

1. Akun **Netlify Free** (tanpa kartu; batas keras 300 kredit/bulan, tidak pernah menagih; jika habis, situs berhenti sementara).
2. Unggah situs (Netlify CLI atau GitHub — GitHub butuh persetujuan push lebih dulu).
3. **Site configuration → Environment variables:** `GROQ_API_KEY` (centang *Contains secret values*), `TUTOR_ENABLED` = `true`.
4. Hemat kredit: tiap deploy produksi 15 kredit.

## 4. Jika kunci bocor

Groq console → **API Keys** → hapus kunci itu → buat baru → ganti di `.env` dan Netlify. Tidak perlu mengubah kode.

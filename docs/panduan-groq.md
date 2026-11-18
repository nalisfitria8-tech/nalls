# Panduan Singkat: Menyalakan Tanya Nalls dengan Groq Free

Untuk pemilik proyek. **Tanpa biaya**: jangan memasukkan kartu/metode pembayaran dan jangan *upgrade* paket. Jika kuota gratis habis, Tanya Nalls hanya berhenti sementara (tombol Petunjuk tetap jalan).

## A. Akun Groq (sekali, ±10 menit)

1. Daftar di **console.groq.com** (gratis). Lewati semua tawaran paket berbayar.
2. **Settings → Limits**: catat batas untuk `openai/gpt-oss-120b` (RPM, RPD, TPM, TPD). Ini batas akun Anda yang sebenarnya.
3. **Settings → Data Controls**: nyalakan **Zero Data Retention**.
4. **API Keys → Create API Key** (nama: `nalls`). Salin kuncinya (hanya tampil sekali).

## B. Simpan kunci di laptop (bukan di chat, bukan di GitHub)

1. Di folder proyek, buat file bernama **`.env`** (bukan `.env.example`), isi:
   ```
   GROQ_API_KEY=tempel-kunci-di-sini
   TUTOR_ENABLED=true
   ```
2. Periksa: `git status` **tidak** boleh menampilkan `.env` (sudah dikecualikan `.gitignore`).
3. Jangan mengirim kunci lewat chat, WhatsApp, atau dokumen tugas.

## C. Uji (tanpa Netlify)

| Perintah | Gunanya | Pemakaian kuota |
|---|---|---|
| `npm run tutor:uji -- --maks 4` | Uji singkat 4 percakapan contoh | ±4 permintaan |
| `npm run tutor:uji` | Uji lengkap 16 percakapan (jeda 9 detik agar < 8K token/menit) | ±16 permintaan, ±16–20 ribu token |
| `npm run tutor:lokal` | Aplikasi + Tanya Nalls di `http://localhost:8888/#/soal/M3/2` | 1 per pertanyaan |
| `npm run tutor:lokal -- --host` | Sama, bisa dibuka dari HP di Wi-Fi yang sama | 1 per pertanyaan |

Skrip uji mencetak tabel: status, jumlah kata, pertanyaan balik, **jawaban akhir lolos (harus 0)**, dan token per permintaan. Kunci tidak pernah dicetak.

## D. Kirim ke Claude (tanpa kunci)

- Angka batas dari **Settings → Limits** (langkah A2).
- Ringkasan tabel dari `npm run tutor:uji` (boleh disalin apa adanya).

Dari situ jatah per siswa (sekarang 4/hari, `src/content/tutor.json`) disesuaikan.

## E. Netlify (setelah uji lokal berhasil)

1. Buat akun **Netlify Free** (tanpa kartu). Paket Free punya batas keras 300 kredit/bulan dan tidak pernah menagih; jika habis, situs berhenti sementara.
2. Unggah situs lewat Netlify CLI (`npx netlify-cli deploy`) atau dari GitHub (butuh persetujuan push lebih dulu).
3. **Site configuration → Environment variables**: `GROQ_API_KEY` (centang *Contains secret values*), `TUTOR_ENABLED` = `true`.
4. Hemat kredit: setiap deploy produksi 15 kredit — deploy seperlunya.

## F. Jika kunci bocor

Groq console → **API Keys** → hapus kunci itu → buat baru → ganti di `.env` dan Netlify. Tidak perlu mengubah kode.

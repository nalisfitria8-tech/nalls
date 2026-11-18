# Daftar Tugas — Nalls

Mengikuti tahap ADDIE. Tanda: `[x]` selesai · `[ ]` belum.
**Aturan:** tahap Develop (coding) baru dimulai setelah semua tugas "Gerbang D" selesai.

## A. Analysis

- [x] Wawancara S01 (kelas IX, 05 November 2026).
- [x] Verifikasi ringkasan terhadap file asli (`PRD.md` §3.1).
- [x] Identifikasi kebutuhan dengan kode bukti (`PRD.md` §5).
- [x] Analisis IL/EL/GL (`PRD.md` §6).
- [ ] **Wawancara minimal 1 siswa lagi (S02)**, sebaiknya dengan kemampuan berbeda (pedoman: minimal 2 informan). Catat persamaan dan perbedaan dengan S01. *Status (11 Nov 2026): **tidak dilakukan** — diputuskan cukup S01 (`keputusan.md` KP-19). Semua temuan berlabel **temuan awal** dan diuji lewat uji coba.*
- [x] Lengkapi isian "Durasi dan persetujuan rekaman" di format pencatatan S01.
- [x] Samakan kutipan di bagian G file wawancara dengan transkrip bagian E.
- [x] Validasi pedoman wawancara oleh ahli dan uji keterbacaan (bagian I pedoman) — atau catat sebagai keterbatasan.

## B. Design

- [x] Draf PRD, design, architecture, api, task, README, AGENTS.
- [x] Pemeriksaan dokumentasi oleh mahasiswa/dosen.
- [x] Tetapkan target angka indikator uji bersama dosen (PRD §8).
- [x] Draf naskah materi M0–M2 (`naskah-materi.md`).
- [x] Draf kisi-kisi materi untuk dosen (`kisi-kisi-materi.md`).
- [x] Draf jejak keputusan (`keputusan.md`) dan rencana evaluasi (`evaluasi.md`).
- [x] Kirim kisi-kisi ke dosen; catat tanggapan di `keputusan.md`.
- [x] Draf naskah M3–M6 dan Pengayaan (`naskah-materi.md`).
- [x] Pemeriksaan naskah M0–M6 oleh pengembang (kebenaran konsep, konteks, bahasa).
- [x] Periksa kebenaran matematika semua soal dan kunci (oleh dosen/guru).
- [ ] Validasi ahli materi dan ahli media terhadap rancangan (draf instrumen di `evaluasi.md` §2–3).
- [x] Buat prototipe kertas/Figma 360 px untuk layar utama (masuk, M2 berdampingan, 4 langkah, pembahasan) dan coba ke 1–2 siswa.

### Gerbang D (sebelum coding)
- [ ] Dokumentasi disetujui.
- [ ] Naskah materi M0–M2 selesai dan diperiksa.
- [ ] Proyek Supabase dibuat (region Singapura), auth anonim aktif.
- [ ] Repo git dibuat (disarankan privat). `referensi/` sudah dikecualikan lewat `.gitignore`.

## C. Develop (setelah Gerbang D)

*Bahasa: JavaScript + Python (KP-20). Coding dimulai atas instruksi pengembang (KP-21).*

1. [x] Kerangka Vite + JavaScript, token CSS, layout 360 px, navigasi Kembali/Ulangi/Lanjut (F06, F16). Layar materi M2-01–M2-07 sebagai contoh. *(PWA di butir 17.)*
2. [x] `engine/solver.js` + tes; kunci semua soal di konten dicek otomatis (Vitest + `tools/check_content.py`). Konten soal baru M3 (9 soal).
3. [x] `engine/checker.js`: periksa per langkah + klasifikasi kesalahan (ambil data, jenis, rumus, hitung, kewajaran) + tes (F04, F09, F10).
4. [x] Migrasi SQL `supabase/migrations/0001_init.sql` (tabel, RLS, RPC). **Belum dijalankan** — menunggu proyek Supabase dibuat pengembang.
   - [x] Alat Python `tools/generate_codes.py` untuk membuat kode siswa (CSV).
5. [ ] Masuk dengan kode (F01). *Menunggu proyek Supabase. Sementara: pilih kelas di layar awal, kemajuan disimpan di browser (`src/data/store.js`).*
6. [x] Diagnostik 8 soal + 4 kartu pengingat + titik mulai kelas VII/VIII + peta belajar (F02). Konten M0 dan M1 (layar + 3 latihan).
7. [x] Komponen tabel hubungan (F05), dipakai di layar materi dan soal.
8. [x] Alur 4 langkah dengan Langkah 3 wajib; Langkah 4 terkunci; kartu "Ingat lagi" (F04). Layar penjelasan M3 + contoh berlangkah M3-E1.
9. [x] Petunjuk bertingkat + fading per fase; pembahasan lengkap + soal kembar (F08, F09).
10. [x] Cek kewajaran di Langkah 4 (F10).
11. [x] Modul M2 lengkap (F03) — seluruh pekerjaan tahap ini selesai dan telah diperiksa pada 11 November 2026.
    - [x] Latihan identifikasi I1–I5, cek pemahaman C1–C5, cek cepat kelas VIII Q1–Q5, "Jelaskan ke temanmu" M2-10 (`src/screens/m2.js`, rute `#/m2/...`).
    - [x] Gerbang DS02: semua soal `mandiri` (M3–M5) terkunci sampai lulus cek pemahaman atau cek cepat (KP-22, disetujui; asumsi diuji saat uji coba).
    - [x] Temuan audit A: jawaban pertama dikunci per percobaan, tersimpan di perangkat, tidak bisa diubah lewat Kembali/muat ulang/pindah layar (`src/engine/attempts.js`, KP-25).
    - [x] Temuan audit C: `check_result` dicatat sekali per percobaan, memuat nomor percobaan.
    - [x] Temuan audit B: interaksi M2-06 (ketuk jenis tiap tabel + "yang tetap") dengan kunci diperiksa `check_content.py`.
    - [x] Tes: `npm test`, `python -m pytest tools`, `check_content.py` lulus; dicoba di 360 px lewat Edge headless (termasuk muat ulang sungguhan).
    - [x] KP-23 (label pilihan arah umum) dan KP-24 (rincian interaksi M2-06) disetujui pengembang.
    - [x] Huruf judul kolom tabel 15 px → 16 px (`.rel-table th`, AGENTS §4). Diperiksa di 21 layar bertabel (M0 pengingat, M1, M2, M3 materi dan soal Langkah 1–2) pada 360 px: tidak ada tabel meluap, tidak ada judul kolom baru yang terbungkus. Dijaga tes `tests/styles.test.js`.
    - [x] Dokumen diselaraskan dengan kode: `architecture.md` (struktur nyata, router, keadaan perangkat, model konten, pemetaan ID), `api.md` §6 (JavaScript) dan §7 (kueri dengan pemetaan I/C/Q → M2), README.
    - [x] Pemetaan ID soal M2 (I1–I5, C1–C5, Q1–Q5 → M2) didokumentasikan (`architecture.md` §6.4, `api.md` §7) dan dijaga tes `tests/item-ids.test.js`. ID tidak diubah.
    - [ ] *Tidak menghalangi C11:* aturan "cek cepat hanya sekali" (KP-25) masih usulan, menunggu konfirmasi dosen (PT-05). Kode memakai aturan itu sampai ada keputusan.
    - [ ] *Bersama butir 18:* uji di HP Android nyata.
12. [ ] Tandai informasi penting (F07) — **selesai dikerjakan dan terverifikasi; menunggu persetujuan KP-26 sebelum dicentang.**
    - [x] Langkah 1 soal 4 langkah: semua angka di teks bisa diketuk → pilih kolom → masuk tabel Diketahui; ketuk ulang membatalkan; kalimat yang ditanya bisa ditandai; mengetik tetap bisa; tanda terlihat di Langkah 2–4 (`src/engine/marking.js`, `src/components/markedText.js`, `src/screens/solve.js`).
    - [x] Pengecoh yang dipakai → "salah ambil data" (pemeriksa lama, tidak diubah); isian tabel tidak hilang saat salah.
    - [x] Kejadian `mark_toggle` dan `mark_place` tercatat (`api.md` §5).
    - [x] `check_content.py`: setiap angka di teks = relevan + pengecoh, pertanyaan = satu kalimat utuh, teks tanpa markah. Semua soal M3 lolos.
    - [x] Tes: `tests/marking.test.js`, `tests/f07-flow.test.js`, pytest. Dicoba di 360 px (Edge headless): angka ≥ 48 × 48 px, area ketuk kalimat ±50 px, tanpa gulir ke samping.
    - [ ] Persetujuan KP-26 (rincian interaksi).
    - [ ] *Tidak menghalangi:* kondisi pembanding tanpa fitur untuk uji coba (PT-07); uji di HP nyata (butir 18).
13. [ ] M3, M4, M5, M6 + variasi konteks + "mirip atau beda" (F12, F13).
    - [x] **M4 Menghitung Berbalik Nilai** (12 Nov 2026): `src/content/m4.json` dari naskah M4 — layar M4-01, M4-02, contoh berlangkah M4-E1 (5 layar), contoh setengah jadi E2–E3, latihan L1–L4, mandiri M1–M3, penutup; soal kembar dari lampiran kunci (teks dilengkapi menjadi kalimat utuh seperti M3, angka/konteks tetap). Didaftarkan di `src/main.js`. Tidak ada perubahan mesin (sudah mendukung berbalik nilai). Tes `tests/m4.test.js` + router; dicoba di 360 px (7 layar materi, 9 soal).
    - [ ] M3-J dan M4-J → butir 14 (F11).
    - [ ] M5 (+ "mirip atau beda", F12), M6.
14. [ ] Jelaskan ke temanmu (F11).
15. [ ] Logger + antrean offline (F15). *Sebagian: kejadian sudah dikumpulkan di antrean memori (`src/data/logger.js`) dengan bentuk tabel `api.md`; pengiriman ke Supabase belum.*
    - [ ] **Prasyarat (dari C11):** kirim skor cek pemahaman M2 (`m2.cek.result.correct` di perangkat) ke `module_progress.check_score` (`api.md` §5).
16. [ ] Ilustrasi 2D, lalu 3D Three.js dengan fallback (F14).
17. [ ] PWA (offline, pasang ke layar utama).
18. [ ] Tes Playwright di 360 px; Lighthouse; uji di HP Android nyata (kelas bawah).
19. [ ] Tes Mathematical Literacy — tes awal & tes akhir (F17, tugas dosen; tenggat 14 Nov 2026 17.00). **Selesai dikerjakan dan diuji; siap dipakai.**
    - [x] Soal & rubrik dari Tabel 2 disalin persis ke `src/content/ml-test.json` (4 soal, 4 indikator, maks. 24); diperiksa `check_content.py`.
    - [x] Siswa: pengantar, satu soal per layar, jawaban bebas (draf tersimpan, tetap ada setelah muat ulang), periksa & kirim dengan konfirmasi, jawaban terkunci setelah kirim, hasil tanpa kunci jawaban (`src/screens/mlTest.js`).
    - [x] Penilai: kode peserta, skor per tahap rubrik (0..maks tahap), ringkasan + N-gain, unduh CSV rinci & ringkasan (`src/engine/mlScore.js`).
    - [x] Tes: `tests/ml-score.test.js`, `tests/ml-flow.test.js`, router, pytest. Dicoba di 360 px (Edge headless) termasuk muat ulang sungguhan dan unduhan CSV sungguhan.
    - [x] KP-27–KP-30 disetujui pengembang (12 Nov 2026).
    - [x] Setelah memilih kelas, siswa diarahkan ke peta belajar (bukan langsung M0) agar Tes awal dikerjakan sebelum belajar (KP-29). Panduan HP: `docs/panduan-android.md`. Uji browser seluruh alur: tanpa error konsol.
    - [x] Perbaikan (laporan uji coba: penilai melihat "(kosong)"): `store.js` selalu membaca salinan tersimpan terbaru sebelum membaca/menulis, sehingga tab lain yang terbuka lebih dulu tidak menimpa jawaban; tes tidak bisa dikirim bila keempat jawaban kosong. Tes: `ml-flow.test.js` (dua tab, kirim kosong, data lama). Uji browser dengan ketikan sungguhan + dua tab: jawaban tampil di layar penilai.
    - [x] Ganti nama MathSave → **Nalls** (KP-31): judul, metadata, dokumen, nama file CSV `nalls-tes-literasi-…`. Kunci penyimpanan `mathsave:v1` dipertahankan agar data siswa tidak hilang; fitur, materi, skor, dan database tidak berubah.
    - [x] B1 (KP-35): tes literasi = 4 uraian + 4 pilihan ganda (maks. 28). Uraian dikirim dulu, PG di halaman terpisah (opsi tidak tampil sebelumnya); tes akhir terbuka setelah kedua bagian tes awal; data alur lama dipertahankan & ditandai `urutan_pg` di CSV; `check_content.py` memvalidasi `ml-mcq.json` (kunci dihitung ulang di tes). Semua tes lulus.
    - [x] Tahap 3a–3d Nalls: chatbot **Tanya Nalls** (F18; KP-32–KP-34) — aturan murni + `tutor.json` (3a), Netlify Function dengan Groq tiruan di tes (3b), panel di soal terbimbing M3–M4 + jatah 4/hari + pesan batas (3c), dokumentasi (3d). Tanpa API key, tanpa panggilan Groq sungguhan.
    - [ ] Tahap 3e: uji dengan Groq Free sungguhan (menunggu persetujuan pengembang; cek batas akun di console, aktifkan Zero Data Retention).
    - [ ] Tahapan RMT dari dosen untuk Tanya Nalls (PT-09a) — **perlu dilengkapi**.
    - [x] Tahap 2 Nalls: tema **Dark Technology** (navy gelap, biru elektrik `#5B95FF`, ungu `#A78BFA`) lewat token (`tokens.css`, `docs/design.md` §3); hanya CSS + warna bilah browser. Audit kontras otomatis di 17 layar 360 px (pilih kelas, peta, diagnostik, materi M1/M2, latihan + umpan balik, M2, soal M3 + penanda F07, label jenis, tes awal/akhir, penilai, nilai): semua teks ≥ 4,5:1, tanpa gulir samping, tombol ≥ 48 px, tanpa animasi, tanpa error.
    - [x] Revisi tampilan: tema pink lembut + hijau tua lewat token (`tokens.css`, `docs/design.md` §3); hanya CSS + kelas judul bagian di peta belajar, logika/konten tidak berubah. Diuji 360 px dan 1280 px (tanpa gulir samping, tombol ≥ 48 px, tanpa error).
    - [x] Perbaikan layar Nilai (laporan uji coba: pilihan skor tampak sebagai "01", Simpan abu-abu): pilihan skor tiap tahap kini tombol radio asli berlabel (tetap bisa dipilih walau gaya tidak termuat), terpilih = isi biru + ✓; total & "x dari n tahap dinilai" diperbarui tanpa menggambar ulang layar; Simpan aktif setelah semua tahap dinilai. Tes `ml-flow.test.js` (pilih, ubah, simpan, buka ulang, awal & akhir). Uji browser 360 px dengan klik mouse dan sentuhan sungguhan: tes awal & akhir tersimpan dan tampil lagi saat dibuka ulang, tanpa error.
    - [ ] *Tidak menghalangi:* jawaban dosen PT-08 (skor sebagian, waktu tes akhir, kalimat soal ML4) — tetap menunggu.
    - [ ] Penyimpanan ke Supabase (tidak dibuat; KP-29).

### Temuan pemeriksaan konsistensi (11 Nov 2026) — di luar C11, belum dikerjakan

Ditemukan saat menyelaraskan dokumen dengan kode; berasal dari butir sebelumnya. Perlu keputusan pengembang sebelum diubah.

- [ ] Huruf < 16 px selain judul tabel (AGENTS §4): `.progress` 15 px, `.note` 15 px, `.tag` 15 px, `button.small` 15 px, indikator langkah `.steps` 13 px, status modul di peta belajar 14 px (`src/styles/base.css`).
- [ ] Warna di luar token `design.md` §3: `#e5e7eb` (garis tabel), `#d1d5db` (bingkai pilihan dan isian), `#fff` (teks tombol/label) di `base.css`. Usul: tambahkan token (misal `--line`, `--on-primary`) ke `design.md` dan `tokens.css`, atau ganti dengan token yang ada.
- [ ] Kejadian `nav_back` dan `nav_repeat` (indikator F06) tercantum di `api.md` §5 tetapi belum dicatat oleh tombol Kembali/Ulangi (`navBar.js`).
- [ ] Kartu "Ingat lagi" tampil sebagai kotak di bawah soal, sedangkan `design.md` §4 menyebut lembar bawah (*bottom sheet*). Di M2 kartunya juga tanpa judul dan tombol Tutup, berbeda dengan di soal 4 langkah.
- [ ] Kepala `PRD.md` masih menulis tahap "akhir Analysis → awal Design", versi 0.1.

## D. Implement

- [ ] Buat kode siswa di Supabase (tanpa nama), cetak kartu kode.
- [ ] Kumpulkan persetujuan orang tua/wali dan siswa.
- [ ] Uji coba perorangan (1–3 siswa kelas VII dan VIII), amati dan wawancara singkat.
- [ ] Uji coba kelompok kecil.

## E. Evaluate

- [ ] Ekspor data (query di `api.md` §7).
- [ ] Hitung indikator uji tiap fitur (PRD §8).
- [ ] Nilai rubrik "jelaskan ke temanmu".
- [ ] Bandingkan 3D vs 2D (F14); hapus 3D jika tidak membantu.
- [ ] Revisi rancangan berdasarkan temuan.

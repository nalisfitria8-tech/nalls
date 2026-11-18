# AGENTS.md — Aturan kerja di repo Nalls

Berlaku untuk agen AI dan pengembang. Baca `docs/PRD.md` dan `docs/design.md` sebelum mengubah apa pun.

## 1. Status proyek

- Tahap ADDIE: **Develop** (dimulai atas instruksi pengembang, KP-21). Kerjakan bertahap sesuai urutan di `docs/task.md` bagian C.
- Data wawancara baru dari **1 informan (S01)**. Perlakukan semua kebutuhan sebagai **temuan awal**; jangan menulis klaim "siswa SMP membutuhkan…" secara umum.

## 2. Aturan bukti

- Setiap fitur baru atau perubahan fitur **wajib** punya: kode bukti wawancara (K/IL/EL/GL/DS), rasional CLT, perilaku pengguna yang diharapkan, dan indikator uji. Tambahkan ke `docs/PRD.md` §7–§8.
- Fitur tanpa bukti wawancara harus diberi label *fitur pendukung* dan alasannya (seperti F01, F15).
- Kutipan siswa disalin **persis** dari bagian E `referensi/wawancara alpo.docx`. Jangan mengarang atau merapikan kutipan.
- Jangan menghapus kebutuhan N01–N20 tanpa persetujuan pemilik proyek.

## 3. Privasi

- Gunakan kode informan (S01, S02). Jangan menulis nama siswa atau nama pewawancara di kode, dokumen, commit, atau prompt.
- Jangan menyimpan nama/email/HP siswa di database.
- Jangan commit `.env.local` atau kunci `service_role` Supabase.

## 4. Aturan desain (wajib)

- Satu ide/soal/langkah per layar; soal tampil satu per satu.
- Teks ≤ ±40 kata per layar; tabel/gambar tepat di dekat teks yang membahasnya.
- Hanya token warna di `docs/design.md` §3. Warna tidak boleh menjadi satu-satunya pembeda.
- Tidak ada animasi dekoratif, perpindahan otomatis, atau penghitung waktu.
- Alur soal 4 langkah tetap; Langkah 3 (jenis perbandingan) tidak bisa dilewati.
- Petunjuk tidak pernah langsung memberi jawaban akhir.
- Three.js hanya untuk menunjukkan hubungan besaran, dimuat dinamis, selalu ada versi 2D.
- Lebar dasar 360 px; tombol ≥ 48 px; huruf ≥ 16 px.

## 5. Bahasa

- Teks aplikasi: Bahasa Indonesia sederhana, menyapa "kamu".
- Istilah tetap: senilai, berbalik nilai, diketahui, ditanya, hasil bagi, hasil kali.
- Istilah CLT tidak muncul di aplikasi.
- Dokumentasi: Bahasa Indonesia; nama variabel/fungsi kode boleh bahasa Inggris.

## 6. Kode (setelah Gerbang D)

- Bahasa: **JavaScript** (aplikasi; Vite, Vitest) dan **Python** (alat bantu di `tools/`; pytest). Jangan menambah TypeScript atau server backend tanpa keputusan baru (KP-20).
- Stack: Vite, Supabase JS v2, Three.js (dinamis). Lihat `docs/architecture.md`.
- Konten materi di `src/content/*.json`; jangan menaruh teks materi langsung di komponen.
- Setiap soal di konten harus lolos `python tools/check_content.py` (kunci dihitung ulang).
- Logika `checker.js` wajib punya tes untuk keempat jenis kesalahan.
- Sebelum menyatakan selesai: `npm test` dan `python -m pytest tools` harus lulus.
- Perubahan skema database lewat file di `supabase/migrations/` dan diperbarui di `docs/api.md`.

## 7. Definisi selesai sebuah fitur

1. Sesuai spesifikasi di `docs/PRD.md` dan sketsa di `docs/design.md`.
2. Tes lulus; dicoba di layar 360 px.
3. Kejadian yang dibutuhkan indikator uji tercatat (`docs/api.md` §5).
4. `docs/task.md` diperbarui.

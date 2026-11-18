# Rencana Evaluasi — Nalls

Rencana validasi dan uji coba untuk tahap **Implement** dan **Evaluate** ADDIE.
Status: draf. Format instrumen dapat diganti jika dosen/kampus sudah punya format baku (lihat `keputusan.md` PT-04).

> Kebutuhan desain berasal dari temuan awal satu informan (S01). Evaluasi ini juga berfungsi untuk **menguji** apakah kebutuhan tersebut berlaku pada siswa lain.

---

## 1. Tahapan

| Tahap | Kegiatan | Peserta | Luaran |
|---|---|---|---|
| 1 | Validasi ahli materi | 2–3 ahli (dosen/guru matematika) | Skor kelayakan + saran revisi |
| 2 | Validasi ahli media | 2–3 ahli | Skor kelayakan + saran revisi |
| 3 | Revisi I | Pengembang | Versi revisi + catatan di `keputusan.md` |
| 4 | Uji coba perorangan | 3 siswa (1 kelas VII, 2 kelas VIII; kemampuan berbeda) | Catatan pengamatan + wawancara singkat |
| 5 | Revisi II | Pengembang | Versi revisi |
| 6 | Uji coba kelompok kecil | 6–10 siswa | Data aplikasi + angket + wawancara |
| 7 | Analisis dan revisi akhir | Pengembang | Laporan evaluasi |

Sebelum tahap 4: persetujuan orang tua/wali dan siswa, kode siswa dibuat, perangkat diuji.

## 2. Instrumen validasi ahli materi

Skala 1–4 (1 = tidak sesuai, 4 = sangat sesuai) + kolom saran.

| No | Aspek | Butir |
|---|---|---|
| 1 | Kurikulum | Tujuan pembelajaran sesuai Capaian Pembelajaran Fase D |
| 2 | Kurikulum | Indikator sesuai tujuan pembelajaran |
| 3 | Konsep | Definisi senilai dan berbalik nilai benar |
| 4 | Konsep | Contoh dan tabel benar secara matematis |
| 5 | Konsep | Kunci jawaban dan pembahasan benar |
| 6 | Urutan | Materi berurutan dari mudah ke sulit |
| 7 | Urutan | Pembedaan senilai dan berbalik nilai dijelaskan bertahap |
| 8 | Bahasa | Kalimat singkat dan mudah dipahami siswa SMP |
| 9 | Bahasa | Istilah konsisten |
| 10 | Konteks | Soal sesuai kehidupan sehari-hari siswa |
| 11 | Literasi | Soal melatih merumuskan, menerapkan, dan menafsirkan |
| 12 | Bantuan | Petunjuk bertingkat tidak langsung memberi jawaban |
| 13 | Bantuan | Pembahasan sesuai jenis kesalahan |

## 3. Instrumen validasi ahli media

| No | Aspek | Butir |
|---|---|---|
| 1 | Tampilan | Tampilan sederhana, tidak ramai |
| 2 | Tampilan | Warna terbatas dan konsisten |
| 3 | Tampilan | Teks dan tabel/gambar berdekatan |
| 4 | Tampilan | Ukuran huruf terbaca di HP |
| 5 | Navigasi | Tombol mudah disentuh |
| 6 | Navigasi | Siswa dapat mengatur tempo (kembali, ulangi, lanjut) |
| 7 | Navigasi | Soal tampil satu per satu |
| 8 | Interaksi | Alur 4 langkah jelas |
| 9 | Interaksi | Fitur menandai informasi mudah dipakai |
| 10 | Visual | Ilustrasi 3D/2D membantu memahami hubungan besaran, bukan hiasan |
| 11 | Teknis | Aplikasi ringan dan lancar di HP Android |
| 12 | Teknis | Masuk dengan kode mudah |

**Analisis skor (usulan):** persentase kelayakan = (jumlah skor ÷ skor maksimum) × 100%.
Kategori usulan: 81–100% sangat layak · 61–80% layak · 41–60% cukup layak · ≤ 40% tidak layak. Ikuti ketentuan dosen jika berbeda.

## 4. Uji coba perorangan

**Prosedur (±45 menit per siswa)**
1. Penjelasan singkat dan persetujuan.
2. Siswa memakai aplikasi di HP: M0 → M2 (dan M3 jika waktu cukup).
3. Pengamat mencatat (tanpa membantu kecuali siswa benar-benar macet).
4. Wawancara singkat.

**Lembar pengamatan**

| Waktu | Layar | Yang dilakukan siswa | Tanda bingung (berhenti lama, bertanya, menebak) | Catatan |
|---|---|---|---|---|

**Pertanyaan wawancara singkat**
1. Bagian mana yang paling membantumu membedakan senilai dan berbalik nilai? (F03)
2. Apakah tulisannya terlalu banyak di suatu layar? Layar mana? (F16)
3. Pernahkah kamu merasa tertinggal? Apa yang kamu lakukan? (F06)
4. Apakah petunjuknya membantu? Apakah terlalu cepat memberi jawaban? (F08)
5. Apakah fitur menandai angka membantu? (F07)
6. Apakah gambar 3D membantu atau mengganggu? (F14)

## 5. Uji coba kelompok kecil

- Siswa memakai aplikasi M0–M6 dalam 2–3 pertemuan.
- Data diambil otomatis dari Supabase (`api.md` §7).
- Angket respons siswa (skala 1–4), contoh butir:
  1. Tampilan aplikasi sederhana dan mudah dibaca.
  2. Tabel membantu saya melihat hubungan dua besaran.
  3. Saya bisa mengatur kecepatan belajar sendiri.
  4. Petunjuk membantu saya tanpa langsung memberi jawaban.
  5. Saya sekarang bisa membedakan senilai dan berbalik nilai.
  6. Pembahasan jawaban salah membantu saya memperbaiki kesalahan.
  7. Saya bisa mengerjakan soal cerita dengan konteks baru.
- Wawancara 2–3 siswa terpilih.

## 6. Indikator uji per fitur

Target angka masih **sementara** (`keputusan.md` KP-15).

| Fitur | Indikator | Sumber data | Target sementara |
|---|---|---|---|
| F01 Masuk | Siswa masuk tanpa bantuan < 1 menit | Pengamatan | ≥ 90% |
| F02 Diagnostik | Durasi diagnostik; ketepatan soal cek pengingat | `diagnostic_results`, `events` | ≤ 7 menit; ≥ 70% |
| F03 Modul M2 | Lulus cek pemahaman ≤ 2 percobaan | `events` (`check_result.attempt`), `step_responses` | ≥ 80% |
| F03-b Asumsi KP-22 | Kesetaraan cek cepat dan cek pemahaman: ketepatan Langkah 3 (jenis) percobaan pertama di M3–M4 dibandingkan antara siswa yang lulus lewat cek cepat dan yang lulus lewat cek pemahaman | `events` (`check_result.kind`), `step_responses` (`step = 'jenis'`) | Selisih kecil; jika kelompok cek cepat jelas lebih rendah, KP-22 ditinjau ulang |
| F04 4 langkah | Ketepatan Langkah 3 percobaan pertama naik M3 → M5 | `step_responses` (`step = 'jenis'`) | Tren naik |
| F05 Tabel | Ketepatan soal baca hubungan dari tabel | `step_responses` | ≥ 80% |
| F06 Tempo | Pemakaian Ulangi/Kembali; rasa tertinggal | `events`; wawancara | Dideskripsikan |
| F07 Tandai | Data Diketahui benar; angka pengecoh jarang dipilih (tanda `on` pada angka yang tercatat sebagai `distractors`); pembanding tanpa fitur (PT-07) | `step_responses` (`diketahui`), `events` (`mark_toggle`, `mark_place`) | ≥ 80% |
| F08 Petunjuk | Rata-rata tingkat petunjuk turun dari fase contoh ke mandiri | `step_responses.hint_level_max` | Tren turun |
| F09 Pembahasan | Kesalahan diperbaiki pada percobaan berikutnya | `step_responses` (`attempt_no`) | ≥ 60% |
| F10 Kewajaran | Jawaban tidak wajar diperbaiki setelah cek | `step_responses` (`kewajaran`) | Dideskripsikan |
| F11 Jelaskan | Skor rubrik naik M2 → M5 | `explanations.rubric_score` | Tren naik |
| F12 Variasi konteks | Ketepatan pada konteks baru | `step_responses` (M5, M6) | ≥ 70% |
| F13 Satu per satu | Pendapat siswa dan ahli | Angket, validasi | Layak |
| F14 3D | Ketepatan identifikasi jenis: 3D vs 2D | `events` (`viz_*`), `step_responses` | Ada manfaat, atau fitur dihapus |
| F15 Data | Kejadian tercatat setelah sinkron | Sesi uji teknis | ≥ 99% |
| F16 Tampilan | Waktu muat; Lighthouse aksesibilitas | Uji teknis | < 3 dtk; ≥ 90 |
| F17 Tes literasi | Skor tes akhir − tes awal; N-gain; perubahan per indikator | CSV dari layar penilai (§9) | N-gain sedang/tinggi (sementara, KP-15) |

## 7. Rubrik "Jelaskan ke temanmu" (F11)

| Skor | Kriteria |
|---|---|
| 0 | Tidak menjawab atau jenis salah tanpa alasan |
| 1 | Jenis benar, tanpa alasan |
| 2 | Jenis benar + arah perubahan kedua besaran benar |
| 3 | Jenis benar + arah perubahan + menyebut yang tetap (hasil bagi/hasil kali) atau syaratnya |

Disarankan dua penilai menilai sebagian jawaban secara terpisah, lalu mendiskusikan perbedaannya.

## 8. Catatan metodologis

- Jumlah peserta kecil, sehingga hasil dideskripsikan (persentase, tren, kutipan), bukan diuji secara statistik inferensial.
- Bandingkan temuan uji coba dengan temuan S01. Catat dan simpan kasus yang **tidak** sesuai.
- Perubahan desain akibat evaluasi dicatat di `keputusan.md`.
- KP-22 (lulus cek cepat setara lulus cek pemahaman) adalah asumsi. Karena peserta sedikit, perbandingan F03-b dideskripsikan per siswa; catat juga siswa kelas VIII yang lulus cek cepat tetapi salah jenis di M3.

## 9. Tes Mathematical Literacy (F17)

**Tujuan:** menguji apakah Nalls membantu meningkatkan literasi matematis siswa pada materi Perbandingan Senilai dan Berbalik Nilai.

**Instrumen:** 4 soal uraian dari "Tabel 2. Soal dan Kisi-kisi Jawaban Mathematical Literacy" (dokumen tugas, 12 Nov 2026), satu soal per indikator, skor per tahap penyelesaian, maks. 6 per soal, total 24. Teks soal dan rubrik di `src/content/ml-test.json` sama persis dengan dokumen (diperiksa `check_content.py`: jumlah skor tahap = skor maksimum).

| Soal | Indikator | Konteks | Tahap (skor) |
|---|---|---|---|
| ML1 | Mathematical Reasoning | Kemasan gula A/B/C, harga per kg | 5 tahap (1, 2, 1, 1, 1) |
| ML2 | Formulating Situations Mathematically | Sirup 3 : 12 gelas air → 20 gelas air | 6 tahap (1 tiap tahap) |
| ML3 | Employing Mathematical Concepts, Facts, and Procedures | 6 orang 15 hari → 10 orang | 4 tahap (1, 2, 2, 1) |
| ML4 | Interpreting, Applying, and Evaluating Mathematical Outcomes | 6 keran 24 menit → 8 keran; menilai jawaban 32 menit | 6 tahap (1 tiap tahap) |

**Desain:** tes awal (sebelum M0) dan tes akhir (sesudah modul yang tersedia selesai) dengan soal yang sama (KP-29). Aplikasi mencatat modul yang sudah selesai saat tes dikirim (`modul_selesai_saat_kirim` di CSV) untuk memeriksa urutan.

**Prosedur:**
1. Siswa memilih kelas, lalu membuka **Tes awal** di peta belajar dan mengerjakan 4 soal (jawaban bebas, tanpa batas waktu), lalu **Kirim**.
2. Guru/peneliti membuka **Penilaian tes (guru/peneliti)** di perangkat yang sama, mengisi **kode peserta** (bukan nama), lalu menilai tiap soal per tahap rubrik.
3. Siswa belajar dengan Nalls.
4. Siswa mengerjakan **Tes akhir** (terbuka setelah tes awal dikirim); guru menilai dengan cara yang sama.
5. Guru menekan **Unduh CSV rinci** (skor tiap tahap + jawaban) dan **Unduh CSV ringkasan** (skor per indikator awal/akhir, total, N-gain). File dibuka di Excel (pemisah `;`).

**Analisis:** per siswa dan rata-rata kelompok: skor awal, skor akhir, selisih, N-gain = (akhir − awal) / (24 − awal) dengan kategori ≥ 0,7 tinggi, 0,3–< 0,7 sedang, < 0,3 rendah (Hake; KP-28), dan perubahan per indikator. Karena peserta sedikit, hasil dideskripsikan (§8).

**Keterbatasan:**
- Data hanya di perangkat siswa; jika data peramban dihapus sebelum CSV diunduh, hasil hilang. Unduh CSV setelah setiap fase dinilai.
- Layar penilai tidak dilindungi kata sandi (tanpa server tidak ada perlindungan sungguhan); guru mengawasi agar siswa tidak membukanya.
- Soal sama di tes awal dan akhir → kemungkinan efek latihan; kunci jawaban tidak pernah ditampilkan ke siswa untuk mengurangi efek ini.
- Penilaian manual oleh satu penilai; disarankan sebagian jawaban dinilai dua penilai (seperti §7).
- Soal ML4 menyebut "waktu yang diperlukan seharusnya lebih singkat" sebelum pertanyaan, sehingga sebagian tahap 6 (menafsirkan) sudah tersirat di soal. Soal tidak diubah; dicatat untuk ditinjau dosen (PT-08).


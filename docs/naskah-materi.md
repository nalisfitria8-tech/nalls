# Naskah Materi — MathSave (M0–M6 + Pengayaan)

Versi 0.2 · 11 November 2026 · Status: **draf untuk diperiksa**
Dasar: temuan awal wawancara S01 (`PRD.md`), aturan tampilan (`design.md`), keputusan di `keputusan.md`.

## Cara membaca naskah

- Setiap **layar** punya ID (misal `M2-05`). Satu layar = satu ide atau satu soal.
- **Teks** = kalimat yang tampil persis di aplikasi (≤ ±40 kata).
- **Tabel/visual** = diletakkan tepat di bawah teks.
- **Interaksi** = apa yang dilakukan siswa.
- **Umpan balik** = pesan setelah siswa menjawab.
- **Bukti** = kode wawancara yang mendasari layar itu.
- Navigasi bawah di semua layar materi: `Kembali` · `Ulangi` · `Lanjut` (F06). Tidak ditulis ulang di tiap layar.
- Angka ribuan ditulis dengan titik (12.000). Siswa boleh mengetik tanpa titik.

### Pola umpan balik umum

| Situasi | Teks |
|---|---|
| Benar | "Tepat!" + satu kalimat alasan singkat |
| Salah pertama | "Belum tepat. Coba lagi." + tombol `Petunjuk` |
| Salah kedua | Petunjuk T1 muncul otomatis |
| Salah ketiga | Petunjuk T2 muncul; jika masih salah → pembahasan singkat, lalu `Lanjut` |

Petunjuk tidak pernah memberi jawaban akhir (GL03).

---

## M0 — Cek Kesiapan (diagnostik prasyarat)

**Tujuan:** mengetahui apakah siswa lancar perkalian, pembagian, pecahan, dan perbandingan sederhana (IL03), lalu menentukan titik mulai.
**Durasi target:** ≤ 7 menit. Tanpa penghitung waktu.

### M0-00 Pembuka
- **Teks:** "Sebelum mulai, kita cek kesiapanmu dulu. Ada 8 soal pendek. Ini bukan ulangan, jadi tidak ada nilai. Kerjakan dengan tenang."
- **Interaksi:** tombol `Mulai`.
- **Bukti:** IL03, EL01.

### Soal diagnostik

Satu soal per layar. Tanpa petunjuk. Setelah menjawab, hanya tampil "Jawaban tersimpan" (tidak dinilai di layar agar tidak menekan siswa).

| ID | Prasyarat | Soal | Bentuk | Kunci | Pilihan / catatan pengecoh |
|---|---|---|---|---|---|
| D1 | Perkalian | 25 × 4 = … | Isian angka | 100 | — |
| D2 | Perkalian | 1.500 × 6 = … | Isian angka | 9.000 | 900 (lupa nol), 90.000 (kelebihan nol) dicatat sebagai pola salah |
| D3 | Pembagian | 84 : 7 = … | Isian angka | 12 | — |
| D4 | Pembagian | 36.000 : 9 = … | Isian angka | 4.000 | 400, 40.000 dicatat |
| D5 | Pecahan | Bentuk paling sederhana dari 12/18 adalah … | Pilihan | 2/3 | 6/9 (belum paling sederhana) · 3/2 (terbalik) · 4/6 |
| D6 | Pecahan | 3/4 × 20 = … | Isian angka | 15 | — |
| D7 | Perbandingan | Bentuk paling sederhana dari 6 : 9 adalah … | Pilihan | 2 : 3 | 3 : 2 (terbalik) · 1 : 3 · 3 : 4,5 |
| D8 | Perbandingan | Perbandingan kelereng Ani dan Budi 2 : 3. Kelereng Ani 10. Kelereng Budi … | Isian angka | 15 | 11 (menambah 1), 5 (salah arah) dicatat |

**Aturan hasil**
- Satu prasyarat **lancar** jika 2 dari 2 benar.
- Prasyarat yang belum lancar → kartu pengingat (M0-P*) ditampilkan sesudah diagnostik.
- **Titik mulai:**
  - Kelas VII → M1.
  - Kelas VIII dan perbandingan (D7, D8) lancar → M2 (M1 berstatus "boleh dilewati").
  - Kelas VIII dan perbandingan belum lancar → M1.

### M0-99 Hasil
- **Teks (contoh):** "Terima kasih! Kamu sudah lancar perkalian dan pembagian. Kita ingat lagi sebentar tentang pecahan, ya."
- Hanya menyebut yang perlu diingat; tidak menampilkan skor angka.
- **Bukti:** IL03, EL03.

### Kartu pengingat

Setiap kartu terdiri dari 1–2 layar + 1 soal cek. Jika soal cek salah, tampil pembahasan, lalu siswa tetap boleh lanjut (dicatat untuk peneliti).

**M0-P1 Perkalian dengan ribuan**
- **Teks:** "Kalikan angka depannya dulu, lalu tambahkan nolnya."
- **Tabel:**

  | Langkah | Contoh |
  |---|---|
  | Pisahkan nol | 1.500 × 6 → 15 × 6, nol: 2 |
  | Kalikan | 15 × 6 = 90 |
  | Tambah nol | 90 → 9.000 |
- **Soal cek:** 2.500 × 4 = … (kunci 10.000)

**M0-P2 Pembagian dengan ribuan**
- **Teks:** "Bagi angka depannya, lalu tambahkan nol yang tersisa."
- **Tabel:** 36.000 : 9 → 36 : 9 = 4 → 4.000
- **Soal cek:** 48.000 : 6 = … (kunci 8.000)

**M0-P3 Pecahan**
- Layar 1 — **Teks:** "Menyederhanakan pecahan: bagi pembilang dan penyebut dengan bilangan yang sama."
  **Tabel:** 12/18 → bagi 6 → 2/3
- Layar 2 — **Teks:** "Pecahan dikali bilangan: bagi dengan penyebut, lalu kali dengan pembilang."
  **Tabel:** 3/4 × 20 → 20 : 4 = 5 → 5 × 3 = 15
- **Soal cek:** 2/5 × 30 = … (kunci 12)

**M0-P4 Perbandingan sederhana**
- Layar 1 — **Teks:** "Perbandingan disederhanakan seperti pecahan: bagi kedua bilangan dengan bilangan yang sama."
  **Tabel:** 6 : 9 → bagi 3 → 2 : 3
- Layar 2 — **Teks:** "Jika 2 bagian = 10, maka 1 bagian = 5. Jadi 3 bagian = 15."

  | Bagian | Kelereng |
  |---|---|
  | 2 | 10 |
  | 1 | 5 |
  | 3 | 15 |
- **Soal cek:** Bentuk paling sederhana dari 8 : 12 adalah … (pilihan: **2 : 3** · 3 : 2 · 4 : 6 · 1 : 4)

---

## M1 — Mengingat Perbandingan

**Untuk:** kelas VII; kelas VIII yang belum lancar perbandingan.
**Fase petunjuk:** contoh (petunjuk tersedia).
**Bukti umum:** K01, EL02, EL04, IL03.

### M1-01
- **Teks:** "Perbandingan menunjukkan hubungan dua banyaknya benda."
- **Tabel:**

  | Kelereng merah | Kelereng biru |
  |---|---|
  | 4 | 6 |
- **Teks di bawah tabel:** "Perbandingan merah dan biru ditulis 4 : 6."

### M1-02
- **Teks:** "4 : 6 bisa disederhanakan. Bagi keduanya dengan 2."
- **Tabel:**

  | | Merah | Biru |
  |---|---|---|
  | Awal | 4 | 6 |
  | Dibagi 2 | 2 | 3 |
- **Teks:** "Jadi 4 : 6 = 2 : 3."

### M1-03 (jembatan ke M2)
- **Teks:** "Harga 1 buku Rp4.000. Lihat tabelnya."
- **Tabel:**

  | Buku | Harga (Rp) |
  |---|---|
  | 1 | 4.000 |
  | 2 | 8.000 |
  | 3 | 12.000 |
- **Teks:** "Harga 1 buku disebut **harga satuan**."
- **Bukti:** K01 (konteks barang–harga yang diingat S01), EL02.

### M1-04 Latihan (satu per layar)

| ID | Soal | Bentuk | Kunci | T1 | T2 |
|---|---|---|---|---|---|
| M1-L1 | Sederhanakan 10 : 15. | Pilihan: **2 : 3** · 3 : 2 · 1 : 5 · 5 : 10 | 2 : 3 | "Bilangan berapa yang bisa membagi 10 dan 15?" | "Bagi keduanya dengan 5." |
| M1-L2 | Di kelas ada 12 siswa putra dan 18 siswa putri. Perbandingan putra : putri adalah … | Pilihan: **2 : 3** · 3 : 2 · 12 : 30 · 6 : 9 | 2 : 3 | "Urutannya putra dulu, lalu putri." | "12 : 18, bagi keduanya dengan 6." |
| M1-L3 | Harga 1 pensil Rp3.000. Harga 4 pensil adalah … | Isian | 12.000 | "Harga 1 pensil sudah diketahui." | "Kalikan harga satuan dengan banyak pensil." |

Catatan: 6 : 9 pada M1-L2 adalah perbandingan yang benar tetapi belum paling sederhana → umpan balik: "Benar, tetapi masih bisa disederhanakan."

### M1-05 Ringkasan
- **Teks:** "Perbandingan bisa disederhanakan. Harga 1 barang disebut harga satuan. Berikutnya: membedakan dua jenis perbandingan."

---

## M2 — Senilai atau Berbalik Nilai?

**Untuk:** semua siswa (wajib). Kelas VIII mendapat tawaran cek cepat.
**Prinsip:** dijelaskan pelan-pelan, satu ide per layar, belum ada menghitung (DS02, IL01).
**Bukti umum:** K03, IL01, IL02, EL02, EL04, DS02.

### M2-00 Pembuka (kelas VIII saja: tawaran cek cepat)
- **Teks:** "Kamu sudah pernah belajar ini di kelas VII. Mau coba cek cepat 5 soal? Jika 4 benar, kamu boleh langsung ke Modul 3."
- **Interaksi:** `Coba cek cepat` · `Pelajari dari awal`.
- Hasil cek cepat < 4 → "Kita pelajari pelan-pelan, ya." → M2-01.
- Soal cek cepat: lihat bagian **Cek cepat (kelas VIII)**.

### M2-01 Dua hal yang dibandingkan
- **Teks:** "Senilai dan berbalik nilai sama-sama membandingkan dua besaran. Bedanya ada pada **arah perubahannya**."
- **Visual:** dua ikon besar: `↑↑ Senilai` dan `↑↓ Berbalik nilai`.
- **Bukti:** IL01 ("sama-sama membandingkan dua hal").

### M2-02 Senilai: buku dan harga
- **Teks:** "Harga satuan buku sama, Rp4.000. Jika buku bertambah, harga bertambah."
- **Tabel:**

  | Buku ↑ | Harga (Rp) ↑ |
  |---|---|
  | 1 | 4.000 |
  | 2 | 8.000 |
  | 4 | 16.000 |
- **Teks:** "Ini perbandingan **senilai**."
- **Visual opsional (F14):** tumpukan buku dan uang; penggeser banyak buku 1–10; tabel ikut berubah.
- **Bukti:** K01, GL01, EL02.

### M2-03 Yang tetap pada senilai
- **Teks:** "Bagi harga dengan banyak buku. Hasilnya selalu sama."
- **Tabel:**

  | Buku | Harga (Rp) | Harga : Buku |
  |---|---|---|
  | 1 | 4.000 | 4.000 |
  | 2 | 8.000 | 4.000 |
  | 4 | 16.000 | 4.000 |
- **Teks:** "Pada senilai, **hasil bagi** tetap."

### M2-04 Berbalik nilai: pekerja dan hari
- **Teks:** "Pagar yang sama dicat oleh beberapa pekerja. Jika pekerja bertambah, pagar selesai lebih cepat. Harinya berkurang."
- **Tabel:**

  | Pekerja ↑ | Hari ↓ |
  |---|---|
  | 2 | 12 |
  | 4 | 6 |
  | 6 | 4 |
- **Teks:** "Ini perbandingan **berbalik nilai**."
- **Visual opsional (F14):** balok pekerjaan tetap; penggeser pekerja 1–12; panjang balok (hari) menyesuaikan; tabel ikut berubah.
- **Bukti:** IL04 (konteks pekerja–waktu), EL02.

### M2-05 Yang tetap pada berbalik nilai
- **Teks:** "Kalikan pekerja dengan hari. Hasilnya selalu sama."
- **Tabel:**

  | Pekerja | Hari | Pekerja × Hari |
  |---|---|---|
  | 2 | 12 | 24 |
  | 4 | 6 | 24 |
  | 6 | 4 | 24 |
- **Teks:** "Pada berbalik nilai, **hasil kali** tetap."

### M2-06 Berdampingan
- **Teks:** "Bandingkan kedua tabel."
- **Tabel:** dua tabel kecil sejajar (sketsa `design.md` §6.2):

  | Buku ↑ | Harga ↑ |   | Pekerja ↑ | Hari ↓ |
  |---|---|---|---|---|
  | 2 | 8.000 | | 2 | 12 |
  | 4 | 16.000 | | 4 | 6 |
- **Teks:** "Jika yang satu bertambah, yang lain **bertambah** atau **berkurang**?"
- **Interaksi:** siswa mengetuk label di bawah tiap tabel: "Senilai" untuk kiri, "Berbalik nilai" untuk kanan.
- **Rincian interaksi (C11, KP-24):**
  - Perintah: "Ketuk jenisnya di bawah tiap tabel."
  - Keterangan "SENILAI ↑↑" / "BERBALIK ↑↓" baru muncul setelah jenis tabel itu dipilih benar.
  - Setelah jenis benar: "Yang tetap: hasil bagi atau hasil kali?" (pilihan `hasil bagi` · `hasil kali`). Kunci: kiri hasil bagi, kanan hasil kali.
  - Umpan balik: benar → "Tepat!"; jenis salah → "Belum tepat. Lihat panah kedua kolom."; yang tetap salah → "Belum tepat. Bagi dan kalikan angka satu baris. Mana yang sama?"
- **Bukti:** IL01, K03, DS02.

### M2-07 Kartu ringkas (juga menjadi isi tombol "Ingat lagi")
- **Teks:**
  1. "Tentukan dua besaran."
  2. "Bayangkan besaran pertama bertambah."
  3. "Besaran kedua ikut bertambah → **↑↑ Senilai** (hasil bagi tetap)."
  4. "Besaran kedua berkurang → **↑↓ Berbalik nilai** (hasil kali tetap)."
- **Catatan:** kartu ini dapat dibuka dari Langkah 3 di semua soal M3–M6 (EL04: "perlu penjelasan ulang terutama cara menentukan jenis").

### M2-08 Latihan identifikasi (tanpa menghitung)

Setiap soal dua langkah kecil: (a) pilih arah, (b) pilih jenis. Satu soal per layar (DS03).

| ID | Soal | Besaran A → B | Syarat yang tetap | Arah | Jenis |
|---|---|---|---|---|---|
| I1 | Mobil yang sama memakai bensin untuk perjalanan. Makin banyak bensin, makin jauh jarak tempuhnya? | Bensin → jarak | Mobil & pemakaian bensin sama | ↑↑ | Senilai |
| I2 | Persediaan pakan untuk ayam. Jika ayamnya bertambah, pakan habis dalam berapa hari? | Ayam → lama pakan habis | Banyak pakan sama | ↑↓ | Berbalik nilai |
| I3 | Jarak rumah ke kota sama. Jika kecepatan motor bertambah, waktu tempuhnya? | Kecepatan → waktu | Jarak sama | ↑↓ | Berbalik nilai |
| I4 | Membuat kue dengan resep yang sama. Jika kue yang dibuat bertambah, tepung yang dibutuhkan? | Kue → tepung | Resep sama | ↑↑ | Senilai |
| I5 | Satu kue besar dibagi rata. Jika anak yang mendapat bagian bertambah, bagian tiap anak? | Anak → bagian per anak | Kue sama | ↑↓ | Berbalik nilai |

**Teks layar (contoh I2):**
"Persediaan pakan cukup untuk beberapa ayam. Jika ayamnya bertambah, pakan habis…"
(a) `lebih cepat (hari berkurang)` · `lebih lama (hari bertambah)`
(b) `↑↑ Senilai` · `↑↓ Berbalik nilai`

*Catatan penerapan (KP-23, disetujui):* di aplikasi, pilihan (a) memakai label umum untuk semua soal: "Jika [A] bertambah, [B]…" → `ikut bertambah` · `berkurang`.

**Petunjuk (pola sama, isi menyesuaikan soal):**
- T1: pertanyaan pemantik tentang situasi nyata. Contoh I2: "Jika ayamnya lebih banyak, apakah pakan dimakan lebih banyak setiap hari?"
- T2: hubungkan ke kartu ringkas. Contoh I2: "Ayam bertambah, hari berkurang. Lihat kartu ↑↓."

**Petunjuk tiap soal** (ditambahkan saat tahap C11; T1 juga dipakai di cek pemahaman):

| ID | T1 | T2 |
|---|---|---|
| I1 | Jika bensinnya lebih banyak, mobil bisa berjalan lebih jauh atau lebih dekat? | Bensin bertambah, jarak bertambah. Lihat kartu ↑↑. |
| I2 | Jika ayamnya lebih banyak, apakah pakan dimakan lebih banyak setiap hari? | Ayam bertambah, hari berkurang. Lihat kartu ↑↓. |
| I3 | Jika motor lebih cepat, sampainya lebih cepat atau lebih lama? | Kecepatan bertambah, waktu berkurang. Lihat kartu ↑↓. |
| I4 | Jika kuenya lebih banyak, tepungnya lebih banyak atau lebih sedikit? | Kue bertambah, tepung bertambah. Lihat kartu ↑↑. |
| I5 | Jika anaknya lebih banyak, bagian tiap anak lebih besar atau lebih kecil? | Anak bertambah, bagian berkurang. Lihat kartu ↑↓. |
| C1 | Jika buku tulisnya lebih banyak, uang yang dibayar lebih banyak atau lebih sedikit? | — |
| C2 | Jika kerannya lebih banyak, bak penuh lebih cepat atau lebih lama? | — |
| C3 | Jika berjalan lebih lama, jaraknya lebih jauh atau lebih dekat? | — |
| C4 | Jika tukangnya lebih banyak, rumah selesai lebih cepat atau lebih lama? | — |
| C5 | Jika catnya lebih banyak, dinding yang dicat lebih luas atau lebih sempit? | — |

**Umpan balik:**

| Situasi | Teks |
|---|---|
| Arah benar, jenis benar | "Tepat! [A] bertambah, [B] [bertambah/berkurang]. Jadi [jenis]." |
| Arah salah | "Belum tepat. Bayangkan [A] bertambah. Apa yang terjadi pada [B]?" |
| Arah benar, jenis salah | "Arahnya sudah benar. Jika [B] [berkurang], jenisnya ↑↓ berbalik nilai." (atau sebaliknya) |

### M2-09 Cek pemahaman

5 soal baru. **Lulus jika ≥ 4 benar** pada percobaan pertama → latihan mandiri M3 terbuka (DS02). Petunjuk tersedia hanya T1. Jika belum lulus: "Kita ulang bagian yang tadi, ya." → kembali ke M2-06, lalu cek pemahaman dengan urutan soal diacak.

| ID | Soal | Arah | Jenis |
|---|---|---|---|
| C1 | Harga satuan buku tulis sama. Banyak buku tulis dan harga yang dibayar. | ↑↑ | Senilai |
| C2 | Bak mandi yang sama diisi beberapa keran yang sama besar. Banyak keran dan lama mengisi bak. | ↑↓ | Berbalik nilai |
| C3 | Orang berjalan dengan kecepatan tetap. Lama berjalan dan jarak yang ditempuh. | ↑↑ | Senilai |
| C4 | Rumah yang sama dibangun beberapa tukang. Banyak tukang dan lama membangun. | ↑↓ | Berbalik nilai |
| C5 | Cat yang sama dipakai untuk mengecat dinding. Banyak liter cat dan luas dinding yang dicat. | ↑↑ | Senilai |

### Cek cepat (kelas VIII, M2-00)

Tanpa petunjuk. Tidak memakai soal yang sama dengan I1–I5 dan C1–C5.

| ID | Soal | Arah | Jenis |
|---|---|---|---|
| Q1 | Mencetak 1.000 lembar dengan beberapa mesin fotokopi yang sama. Banyak mesin dan lama mencetak. | ↑↓ | Berbalik nilai |
| Q2 | Resep kue yang sama. Banyak telur dan banyak kue. | ↑↑ | Senilai |
| Q3 | 30 siswa dibagi rata ke beberapa kelompok. Banyak kelompok dan banyak anggota per kelompok. | ↑↓ | Berbalik nilai |
| Q4 | Tarif ojek per km sama. Jarak dan ongkos. | ↑↑ | Senilai |
| Q5 | Jarak rumah ke sekolah sama. Kecepatan sepeda dan waktu sampai sekolah. | ↑↓ | Berbalik nilai |

### M2-10 Jelaskan ke temanmu (F11)
- **Teks:** "Temanmu bertanya: 'Kenapa soal pekerja dan hari itu berbalik nilai?' Bantu dia menjawab."
- **Kalimat rumpang:** "Soal itu [senilai / berbalik nilai] karena jika [pekerja / hari] bertambah, [pekerja / hari] [bertambah / berkurang]. Yang tetap adalah [hasil bagi / hasil kali]."
- **Teks bebas (boleh kosong):** "Tambahkan dengan kata-katamu sendiri." (maks. 3 kalimat)
- **Setelah kirim — contoh penjelasan:** "Berbalik nilai. Kalau pekerjanya ditambah, pagar cepat selesai, jadi harinya berkurang. Pekerja × hari selalu 24."
- **Daftar cek diri:**
  - [ ] Aku menyebut jenisnya dengan benar.
  - [ ] Aku menyebut arah perubahan kedua besaran.
  - [ ] Aku menyebut yang tetap (hasil bagi atau hasil kali).
- **Bukti:** GL04, K02.

### M2-11 Penutup
- **Teks:** "Bagus! Kamu sudah bisa membedakan senilai dan berbalik nilai. Berikutnya kita mulai menghitung, mulai dari senilai."

---

## Aturan umum M3–M6

### Format kartu soal

Setiap soal hitung ditulis dengan format berikut:

- **Teks** — kalimat soal di layar.
- **Tandai** — angka relevan dan pengecoh untuk fitur menandai (F07). **Setiap** angka yang tertulis di teks soal harus masuk salah satunya (diperiksa `check_content.py`), dan kalimat yang ditanya harus satu kalimat utuh. Teks soal tidak memakai cetak tebal.
- **Tabel** — isi tabel Diketahui setelah Langkah 1–2 (`?` = yang ditanya).
- **L3** — arah perubahan dan jenis (Langkah 3, wajib).
- **L4** — bentuk hitungan yang benar dan pilihan pengecoh (bentuk jenis lain).
- **Kunci** — jawaban benar · **Rumus tertukar** — hasil bila memakai rumus jenis lain (dipakai mesin untuk mengenali "salah rumus", dibulatkan 2 desimal).
- **Kewajaran** — kalimat cek "Apakah hasilnya masuk akal?" (F10).
- **T1–T3** — petunjuk bertingkat (F08).

### Fase petunjuk (F08)

| Fase | Petunjuk | Keterangan |
|---|---|---|
| Contoh berlangkah | Tidak perlu; semua langkah sudah terisi | Siswa menekan `Lanjut` per langkah dan membaca alasannya |
| Contoh setengah jadi | T1–T3 muncul otomatis setelah salah | Sebagian langkah diisi siswa |
| Latihan | T1–T3 atas permintaan | 4 langkah penuh |
| Mandiri | Maksimal T2 | Terbuka setelah lulus cek M2 (DS02) |
| M6 Latihan akhir | Tidak ada | Pembahasan di akhir |

### Templat pembahasan kesalahan (F09)

Isi `[...]` diambil dari kartu soal.

| Jenis | Judul | Teks |
|---|---|---|
| Salah ambil data | "Periksa data lagi" | "Ada angka yang belum tepat di tabel. Ketuk lagi angka yang penting di soal. Tidak semua angka dipakai." |
| Salah jenis | "Periksa jenisnya" | "Bayangkan [A] bertambah. Apakah [B] ikut bertambah atau berkurang?" + tombol `Ingat lagi` |
| Salah rumus | "Jenisnya sudah benar, bentuk hitungannya belum" | Senilai: "Pada senilai, hasil bagi tetap. Susun [a₁]/[b₁] = [a₂]/?" · Berbalik: "Pada berbalik nilai, hasil kali tetap. Susun [a₁] × [b₁] = [a₂] × ?" |
| Salah hitung | "Bentuknya benar, periksa hitungannya" | Tampilkan baris hitungan cara nilai satuan dari kartu soal; tautan ke pengingat prasyarat (M0-P1/P2/P3) |

Setelah 2 kali salah dengan T3 terbuka: tampil pembahasan lengkap, lalu **soal kembar** (angka lain, konteks sama). Soal kembar ditulis pada kolom terakhir tabel kunci di Lampiran.

### Ilustrasi

M3–M6 **tidak memakai 3D** (KP-11). Visual cukup tabel dan, bila perlu, gambar 2D statis.

---

## M3 — Menghitung Perbandingan Senilai

**Untuk:** semua siswa. **Bukti umum:** GL01, IL02, EL02, EL04, IL05, GL02.

### M3-01 Dua cara
- **Teks:** "Ada dua cara menghitung senilai. Hasilnya sama."
- **Tabel:**

  | Cara | Contoh: 3 buku Rp12.000, harga 5 buku? |
  |---|---|
  | Nilai satuan | 12.000 : 3 = 4.000 → 4.000 × 5 = 20.000 |
  | Perbandingan | 3/12.000 = 5/? → ? = 12.000 × 5 : 3 = 20.000 |
- **Teks:** "Di aplikasi, kita pakai 4 langkah."

### M3-02 Empat langkah
- **Visual:** indikator langkah `① Diketahui ② Ditanya ③ Jenis ④ Hitung`.
- **Teks:** "Langkah 3 tidak boleh dilewati. Jenisnya menentukan cara menghitung."
- **Bukti:** IL02.

### M3-E1 Contoh berlangkah (semua terisi)
- **Teks:** "Bu Sari membeli 3 buku seharga Rp12.000. Berapa harga 5 buku yang sama?"
- **Layar ①:** angka 3, 12.000, 5 tertanda kuning; tabel terisi. Teks: "Angka yang penting dipindah ke tabel."
- **Layar ②:** sel `?` pada harga 5 buku. Teks: "Yang ditanya: harga 5 buku."
- **Layar ③:** "Buku bertambah (3 → 5). Harga satuan sama, jadi harga bertambah. ↑↑ **Senilai**."
- **Layar ④:** "Senilai → hasil bagi tetap. 3/12.000 = 5/? → ? = 12.000 × 5 : 3 = 20.000."
- **Layar cek:** "Buku bertambah, harga bertambah. 20.000 lebih besar dari 12.000. Masuk akal ✔"

### M3-E2 Contoh setengah jadi (siswa mengisi Langkah 4)
- **Teks:** "Mobil memakai 2 liter bensin untuk 30 km. Berapa km dengan 5 liter?"
- **Langkah 1–3 terisi:** tabel Bensin (L) | Jarak (km): 2 | 30 ; 5 | ? · ↑↑ Senilai.
- **L4:** benar `2/30 = 5/?` · pengecoh `2 × 30 = 5 × ?`
- **Kunci:** 75 · **Rumus tertukar:** 12
- **T1:** "Bensin lebih banyak, jaraknya lebih jauh atau lebih dekat?" · **T2:** "Senilai: hasil bagi tetap. 1 liter = 30 : 2 km." · **T3:** "1 liter = 15 km. Jadi 5 liter = 15 × 5."

### M3-E3 Contoh setengah jadi (siswa mengisi Langkah 3 dan 4)
- **Teks:** "Untuk 40 kue diperlukan 2 kg tepung. Berapa kue dari 3 kg tepung?"
- **Tabel:** Tepung (kg) | Kue: 2 | 40 ; 3 | ?
- **L3:** tepung ↑ → kue ↑ → Senilai
- **L4:** benar `2/40 = 3/?` · pengecoh `2 × 40 = 3 × ?`
- **Kunci:** 60 · **Rumus tertukar:** 26,67
- **T1:** "Tepung lebih banyak, kuenya lebih banyak atau lebih sedikit?" · **T2:** "1 kg tepung = 40 : 2 kue." · **T3:** "1 kg = 20 kue. Jadi 3 kg = 20 × 3."

### M3-L Latihan (4 langkah penuh, petunjuk atas permintaan)

**M3-L1**
- **Teks:** "Harga 4 kg beras Rp56.000. Berapa harga 7 kg beras yang sama?"
- **Tandai:** 4, 56.000, 7 · pengecoh: —
- **Tabel:** Beras (kg) | Harga (Rp): 4 | 56.000 ; 7 | ?
- **L3:** beras ↑ → harga ↑ → Senilai
- **L4:** `4/56.000 = 7/?` · pengecoh `4 × 56.000 = 7 × ?`
- **Kunci:** 98.000 · **Rumus tertukar:** 32.000
- **Kewajaran:** "Beras bertambah, harga per kg sama → harga bertambah. 98.000 > 56.000?"
- **T1:** "Jika berasnya lebih banyak, harganya lebih mahal atau lebih murah?" · **T2:** "Cari harga 1 kg dulu." · **T3:** "56.000 : 4 = 14.000. Lalu 14.000 × 7."

**M3-L2** (yang ditanya di kolom kiri)
- **Teks:** "Untuk 12 kue diperlukan 3 gelas tepung. Berapa gelas tepung untuk 20 kue?"
- **Tandai:** 12, 3, 20
- **Tabel:** Kue | Tepung (gelas): 12 | 3 ; 20 | ?
- **L3:** kue ↑ → tepung ↑ → Senilai
- **L4:** `12/3 = 20/?` · pengecoh `12 × 3 = 20 × ?`
- **Kunci:** 5 · **Rumus tertukar:** 1,8
- **Kewajaran:** "Kue bertambah → tepung bertambah. 5 > 3?"
- **T1:** "Kue lebih banyak, tepungnya lebih banyak atau lebih sedikit?" · **T2:** "Berapa kue dari 1 gelas tepung?" · **T3:** "12 : 3 = 4 kue per gelas. 20 kue perlu 20 : 4 gelas."

**M3-L3**
- **Teks:** "Tarif ojek per km sama. Ongkos 4 km Rp10.000. Berapa ongkos 10 km?"
- **Tandai:** 4, 10.000, 10
- **Tabel:** Jarak (km) | Ongkos (Rp): 4 | 10.000 ; 10 | ?
- **L3:** jarak ↑ → ongkos ↑ → Senilai
- **L4:** `4/10.000 = 10/?` · pengecoh `4 × 10.000 = 10 × ?`
- **Kunci:** 25.000 · **Rumus tertukar:** 4.000
- **Kewajaran:** "Jarak lebih jauh, tarif per km sama → ongkos bertambah."
- **T1:** "Jarak lebih jauh, ongkos lebih mahal atau lebih murah?" · **T2:** "Cari ongkos 1 km." · **T3:** "10.000 : 4 = 2.500. Lalu 2.500 × 10."

**M3-L4** (soal cerita pendek dengan pengecoh)
- **Teks:** "Pak Budi berangkat pukul 06.00. Ia berjalan dengan kecepatan tetap dan menempuh 3 km dalam 45 menit. Berapa menit untuk menempuh 5 km?"
- **Tandai:** 3, 45, 5 · **pengecoh:** 06.00
- **Tabel:** Jarak (km) | Waktu (menit): 3 | 45 ; 5 | ?
- **L3:** jarak ↑ → waktu ↑ (kecepatan tetap) → Senilai
- **L4:** `3/45 = 5/?` · pengecoh `3 × 45 = 5 × ?`
- **Kunci:** 75 · **Rumus tertukar:** 27
- **Kewajaran:** "Jarak lebih jauh, kecepatan sama → waktu lebih lama. 75 > 45?"
- **T1:** "Apakah pukul 06.00 dipakai untuk menghitung?" · **T2:** "Berapa menit untuk 1 km?" · **T3:** "45 : 3 = 15 menit per km. Lalu 15 × 5."

### M3-J Jelaskan ke temanmu
- **Teks:** "Temanmu menghitung harga 7 kg beras dengan 4 × 56.000 : 7. Bantu dia."
- **Kalimat rumpang:** "Soal beras itu [senilai / berbalik nilai], jadi yang tetap adalah [hasil bagi / hasil kali]. Caranya: cari harga [1 kg / 7 kg] dulu, lalu [kalikan / bagi]."
- **Daftar cek:** jenis benar · menyebut yang tetap · urutan cara benar.

### M3-M Latihan mandiri (maks. T2)

| ID | Teks | Tabel | Pengecoh | Kunci | Rumus tertukar | T1 | T2 |
|---|---|---|---|---|---|---|---|
| M3-M1 | Harga 6 pensil Rp15.000. Berapa harga 10 pensil yang sama? | Pensil \| Harga: 6 \| 15.000 ; 10 \| ? | — | 25.000 | 9.000 | "Pensil lebih banyak, harganya?" | "Cari harga 1 pensil." |
| M3-M2 | 5 liter cat cukup untuk dinding seluas 20 m². Berapa liter cat untuk dinding 32 m²? | Cat (L) \| Luas (m²): 5 \| 20 ; ? \| 32 | — | 8 | 3,13 | "Dinding lebih luas, catnya?" | "1 liter cat untuk berapa m²?" |
| M3-M3 | Mesin mencetak 120 lembar dalam 4 menit. Mesin dibeli tahun 2020. Berapa menit untuk 300 lembar? | Lembar \| Menit: 120 \| 4 ; 300 \| ? | 2020 | 10 | 1,6 | "Apakah tahun 2020 dipakai?" | "Berapa lembar per menit?" |

### M3-99 Penutup
- **Teks:** "Kamu sudah bisa menghitung senilai. Ingat: senilai → hasil bagi tetap. Berikutnya: berbalik nilai."

---

## M4 — Menghitung Perbandingan Berbalik Nilai

**Untuk:** semua siswa. **Bukti umum:** IL01, IL04, GL01, IL05, GL02.

### M4-01 Dua cara
- **Teks:** "Berbalik nilai juga punya dua cara. Kuncinya: hasil kali tetap."
- **Tabel:**

  | Cara | Contoh: 6 pekerja 10 hari, jika 4 pekerja? |
  |---|---|
  | Nilai satuan | Total pekerjaan 6 × 10 = 60 hari-orang → 60 : 4 = 15 hari |
  | Perbandingan | 6 × 10 = 4 × ? → ? = 60 : 4 = 15 |
- **Teks:** "Hati-hati: jangan dihitung seperti senilai."

### M4-02 Apa itu "hari-orang"?
- **Teks:** "60 hari-orang artinya pekerjaan itu sama dengan 1 orang bekerja 60 hari."
- **Tabel:**

  | Pekerja | Hari | Pekerja × Hari |
  |---|---|---|
  | 1 | 60 | 60 |
  | 6 | 10 | 60 |
  | 4 | 15 | 60 |
- **Bukti:** IL04 (hubungan pekerja–waktu), EL02.

### M4-E1 Contoh berlangkah
- **Teks:** "6 pekerja menyelesaikan pagar dalam 10 hari. Berapa hari jika dikerjakan 4 pekerja?"
- **Layar ①:** tabel Pekerja | Hari: 6 | 10 ; 4 | ?
- **Layar ②:** "Yang ditanya: hari jika 4 pekerja."
- **Layar ③:** "Pekerja berkurang (6 → 4), pagar lebih lama selesai. Hari bertambah. Arahnya berlawanan: ↑↓ **Berbalik nilai**."
- **Layar ④:** "Berbalik nilai → hasil kali tetap. 6 × 10 = 4 × ? → ? = 60 : 4 = 15."
- **Layar cek:** "Pekerja lebih sedikit, waktunya lebih lama. 15 > 10. Masuk akal ✔"
- **Catatan:** contoh ini sengaja memakai besaran yang **berkurang**, agar siswa melihat bahwa berbalik nilai juga berlaku saat besaran pertama berkurang.

### M4-E2 Contoh setengah jadi (siswa mengisi Langkah 4)
- **Teks:** "Pakan cukup untuk 20 ayam selama 15 hari. Jika ayamnya 25, berapa hari pakan habis?"
- **Langkah 1–3 terisi:** Ayam | Hari: 20 | 15 ; 25 | ? · ↑↓ Berbalik nilai.
- **L4:** benar `20 × 15 = 25 × ?` · pengecoh `20/15 = 25/?`
- **Kunci:** 12 · **Rumus tertukar:** 18,75
- **T1:** "Ayam lebih banyak, pakan habis lebih cepat atau lebih lama?" · **T2:** "Hasil kali tetap: 20 × 15 = ?" · **T3:** "20 × 15 = 300. Lalu 300 : 25."

### M4-E3 Contoh setengah jadi (siswa mengisi Langkah 3 dan 4)
- **Teks:** "Dengan kecepatan 60 km/jam, perjalanan ditempuh 3 jam. Berapa jam jika kecepatannya 90 km/jam?"
- **Tabel:** Kecepatan (km/jam) | Waktu (jam): 60 | 3 ; 90 | ?
- **L3:** kecepatan ↑ → waktu ↓ → Berbalik nilai
- **L4:** `60 × 3 = 90 × ?` · pengecoh `60/3 = 90/?`
- **Kunci:** 2 · **Rumus tertukar:** 4,5
- **T1:** "Lebih cepat, sampainya lebih cepat atau lebih lama?" · **T2:** "Kecepatan × waktu = jarak, selalu sama." · **T3:** "60 × 3 = 180. Lalu 180 : 90."

### M4-L Latihan

**M4-L1**
- **Teks:** "Suatu pekerjaan selesai dalam 15 hari oleh 8 orang. Jika dikerjakan 12 orang, berapa hari selesai?"
- **Tandai:** 15, 8, 12
- **Tabel:** Orang | Hari: 8 | 15 ; 12 | ?
- **L3:** orang ↑ → hari ↓ → Berbalik nilai
- **L4:** `8 × 15 = 12 × ?` · pengecoh `8/15 = 12/?`
- **Kunci:** 10 · **Rumus tertukar:** 22,5
- **Kewajaran:** "Orang bertambah → lebih cepat selesai. 10 < 15?"
- **T1:** "Lebih banyak orang, lebih cepat atau lebih lama?" · **T2:** "Hitung total pekerjaan: orang × hari." · **T3:** "8 × 15 = 120. Lalu 120 : 12."

**M4-L2** (yang ditanya di kolom kiri)
- **Teks:** "Dengan kecepatan 40 km/jam, Dika sampai dalam 3 jam. Agar sampai dalam 2 jam, berapa kecepatannya?"
- **Tandai:** 40, 3, 2
- **Tabel:** Kecepatan (km/jam) | Waktu (jam): 40 | 3 ; ? | 2
- **L3:** waktu ↓ → kecepatan ↑ → Berbalik nilai
- **L4:** `40 × 3 = ? × 2` · pengecoh `40/3 = ?/2`
- **Kunci:** 60 · **Rumus tertukar:** 26,67
- **Kewajaran:** "Ingin lebih cepat sampai → kecepatan harus lebih besar. 60 > 40?"
- **T1:** "Supaya sampai lebih cepat, motornya harus lebih cepat atau lebih lambat?" · **T2:** "Kecepatan × waktu tetap." · **T3:** "40 × 3 = 120. Lalu 120 : 2."

**M4-L3**
- **Teks:** "Satu kue dibagi rata ke 6 anak, masing-masing 4 potong. Jika kue yang sama dibagi ke 8 anak, berapa potong tiap anak?"
- **Tandai:** 6, 4, 8
- **Tabel:** Anak | Potong per anak: 6 | 4 ; 8 | ?
- **L3:** anak ↑ → potong per anak ↓ → Berbalik nilai
- **L4:** `6 × 4 = 8 × ?` · pengecoh `6/4 = 8/?`
- **Kunci:** 3 · **Rumus tertukar:** 5,33
- **Kewajaran:** "Anak lebih banyak → bagian tiap anak lebih sedikit. 3 < 4?"
- **T1:** "Anak lebih banyak, bagian tiap anak lebih banyak atau sedikit?" · **T2:** "Berapa potong seluruhnya?" · **T3:** "6 × 4 = 24 potong. Lalu 24 : 8."

**M4-L4** (soal cerita pendek dengan pengecoh)
- **Teks:** "Bak mandi berisi 600 liter diisi 3 keran yang sama besar dalam 40 menit. Berapa menit jika memakai 4 keran yang sama?"
- **Tandai:** 3, 40, 4 · **pengecoh:** 600
- **Tabel:** Keran | Menit: 3 | 40 ; 4 | ?
- **L3:** keran ↑ → menit ↓ → Berbalik nilai
- **L4:** `3 × 40 = 4 × ?` · pengecoh `3/40 = 4/?`
- **Kunci:** 30 · **Rumus tertukar:** 53,33
- **Kewajaran:** "Keran lebih banyak → lebih cepat penuh. 30 < 40?"
- **T1:** "Apakah 600 liter perlu untuk menghitung? Baknya tetap sama." · **T2:** "Keran × menit tetap." · **T3:** "3 × 40 = 120. Lalu 120 : 4."

### M4-J Jelaskan ke temanmu
- **Teks:** "Temanmu menjawab soal keran: 40 × 4 : 3 = 53 menit. Kenapa itu tidak masuk akal?"
- **Kalimat rumpang:** "Keran [bertambah / berkurang], jadi waktunya seharusnya [lebih cepat / lebih lama]. Soal ini [senilai / berbalik nilai], jadi yang tetap adalah [hasil bagi / hasil kali]."
- **Daftar cek:** menyebut arah yang benar · jenis benar · menyebut yang tetap.
- **Bukti:** GL04, GL02.

### M4-M Latihan mandiri (maks. T2)

| ID | Teks | Tabel | Pengecoh | Kunci | Rumus tertukar | T1 | T2 |
|---|---|---|---|---|---|---|---|
| M4-M1 | Rumah selesai dibangun 12 tukang dalam 18 hari. Jika hanya 9 tukang, berapa hari? | Tukang \| Hari: 12 \| 18 ; 9 \| ? | — | 24 | 13,5 | "Tukang berkurang, waktunya?" | "Tukang × hari tetap." |
| M4-M2 | Siswa satu sekolah naik 6 bus, tiap bus 40 siswa. Jika memakai 8 bus, berapa siswa tiap bus? | Bus \| Siswa per bus: 6 \| 40 ; 8 \| ? | — | 30 | 53,33 | "Bus lebih banyak, isi tiap bus?" | "Hitung semua siswa dulu." |
| M4-M3 | 5 mesin fotokopi yang sama mencetak pesanan dalam 36 menit. Harga sewa mesin Rp50.000. Berapa menit jika 4 mesin? | Mesin \| Menit: 5 \| 36 ; 4 \| ? | 50.000 | 45 | 28,8 | "Apakah harga sewa dipakai?" | "Mesin × menit tetap." |

### M4-99 Penutup
- **Teks:** "Kamu sudah bisa menghitung berbalik nilai. Ingat: berbalik nilai → hasil kali tetap. Berikutnya: soal cerita campuran."

---

## M5 — Soal Cerita Campuran

**Untuk:** semua siswa; bagian B (bertahap) untuk kelas VIII (kelas VII boleh mencoba).
**Fase:** latihan → mandiri. **Fitur utama:** tandai informasi (F07), variasi konteks dan "mirip atau beda" (F12).
**Bukti umum:** IL04, EL05, GL05, EL04.

### M5-01 Pembuka
- **Teks:** "Soal cerita bisa panjang. Tidak semua angka dipakai. Tandai angka yang penting dan bagian yang ditanya."
- **Visual:** contoh kalimat dengan dua warna penanda (angka & pertanyaan).
- **Bukti:** EL05 (strategi S01 menandai angka lalu mencari yang ditanya).

### Layar "Mirip atau beda?" (sebelum soal S2–S6)
- **Teks:** "Soal sebelumnya: [konteks] ([jenis]). Soal ini: [konteks baru]. Menurutmu caranya mirip atau beda?"
- **Pilihan:** `Mirip` · `Beda` · `Belum tahu`.
- Tidak dinilai saat itu; setelah Langkah 3 benar, tampil: "Ternyata [mirip/beda]: soal ini [jenis]."
- **Bukti:** GL05.

### M5-A Soal campuran (semua siswa)

Satu soal per layar. Jenis sengaja diacak agar siswa harus menentukan jenis di setiap soal.

**M5-S1** · senilai
- **Teks:** "Untuk lomba 17 Agustus, panitia yang terdiri dari 15 orang membeli air mineral. Harga 4 dus Rp96.000. Mereka perlu 9 dus. Berapa harga 9 dus?"
- **Tandai:** 4, 96.000, 9 · **pengecoh:** 17, 15
- **Tabel:** Dus | Harga (Rp): 4 | 96.000 ; 9 | ?
- **L4:** `4/96.000 = 9/?` · **Kunci:** 216.000 · **Rumus tertukar:** 42.666,67
- **T1:** "Angka mana yang tentang dus dan harga?" · **T2:** "Dus bertambah, harga? Cari harga 1 dus." · **T3:** "96.000 : 4 = 24.000. Lalu 24.000 × 9."

**M5-S2** · berbalik nilai
- **Teks:** "Bu Rina menyiapkan nasi kotak untuk acara pukul 10.00. Jika dikerjakan 5 orang, selesai dalam 6 jam. Jika hanya 3 orang, berapa jam?"
- **Tandai:** 5, 6, 3 · **pengecoh:** 10.00
- **Tabel:** Orang | Jam: 5 | 6 ; 3 | ?
- **L4:** `5 × 6 = 3 × ?` · **Kunci:** 10 · **Rumus tertukar:** 3,6
- **Mirip atau beda (vs S1):** beda
- **T1:** "Orang berkurang, selesainya lebih cepat atau lebih lama?" · **T2:** "Orang × jam tetap." · **T3:** "5 × 6 = 30. Lalu 30 : 3."

**M5-S3** · senilai
- **Teks:** "Resep es teh: 250 gram gula untuk 10 gelas. Harga gula Rp16.000 per kg. Berapa gram gula untuk 24 gelas?"
- **Tandai:** 250, 10, 24 · **pengecoh:** 16.000
- **Tabel:** Gelas | Gula (gram): 10 | 250 ; 24 | ?
- **L4:** `10/250 = 24/?` · **Kunci:** 600 · **Rumus tertukar:** 104,17
- **Mirip atau beda (vs S2):** beda
- **T1:** "Apakah harga gula dipakai?" · **T2:** "Berapa gram gula untuk 1 gelas?" · **T3:** "250 : 10 = 25. Lalu 25 × 24."

**M5-S4** · berbalik nilai
- **Teks:** "Dika naik motor ke rumah nenek dengan kecepatan 45 km/jam dan sampai dalam 2 jam. Uang bensinnya Rp20.000. Jika kecepatannya 30 km/jam, berapa jam?"
- **Tandai:** 45, 2, 30 · **pengecoh:** 20.000
- **Tabel:** Kecepatan | Jam: 45 | 2 ; 30 | ?
- **L4:** `45 × 2 = 30 × ?` · **Kunci:** 3 · **Rumus tertukar:** 1,33
- **Mirip atau beda (vs S3):** beda
- **T1:** "Lebih lambat, sampainya lebih cepat atau lebih lama?" · **T2:** "Kecepatan × waktu = jarak, tetap." · **T3:** "45 × 2 = 90. Lalu 90 : 30."

**M5-S5** · senilai
- **Teks:** "Kereta melaju dengan kecepatan tetap. Dalam 2 jam kereta menempuh 160 km. Berapa km dalam 5 jam?"
- **Tandai:** 2, 160, 5
- **Tabel:** Jam | Jarak (km): 2 | 160 ; 5 | ?
- **L4:** `2/160 = 5/?` · **Kunci:** 400 · **Rumus tertukar:** 64
- **Mirip atau beda (vs S4):** beda — keduanya tentang kecepatan dan waktu, tetapi di sini kecepatan **tetap** dan yang dibandingkan waktu–jarak.
- **T1:** "Yang tetap di soal ini kecepatan atau jaraknya?" · **T2:** "Waktu lebih lama, jarak lebih jauh." · **T3:** "160 : 2 = 80 km per jam. Lalu 80 × 5."

**M5-S6** · berbalik nilai (ada satu langkah tambahan sederhana)
- **Teks:** "Persediaan rumput cukup untuk 12 kambing selama 10 hari. Pak Tani membeli 3 kambing lagi. Berapa hari rumput itu habis?"
- **Tandai:** 12, 10, 3
- **Tabel:** Kambing | Hari: 12 | 10 ; 15 | ?
- **Catatan Langkah 1:** siswa harus menulis 15 (12 + 3), bukan 3. Jika menulis 3 → umpan balik "salah ambil data": "Kambingnya sekarang ada berapa semuanya?"
- **L4:** `12 × 10 = 15 × ?` · **Kunci:** 8 · **Rumus tertukar:** 12,5
- **Mirip atau beda (vs S5):** beda
- **T1:** "Berapa kambing sekarang?" · **T2:** "Kambing bertambah, rumput habis lebih cepat." · **T3:** "12 × 10 = 120. Lalu 120 : 15."

### M5-B Soal bertahap (kelas VIII)

Soal dipecah menjadi **Bagian A** (menyiapkan data, satu isian) dan **Bagian B** (4 langkah biasa). Cara ini menjaga alur 4 langkah tetap sama.

**M5-B1**
- **Teks:** "Persediaan makanan cukup untuk 30 sapi selama 20 hari. Setelah 5 hari, datang 15 sapi lagi. Berapa hari lagi sisa makanan habis?"
- **Bagian A:** "Setelah 5 hari, sisa makanan cukup untuk 30 sapi selama ___ hari." (kunci 15) · "Sekarang ada ___ sapi." (kunci 45)
- **Bagian B tabel:** Sapi | Hari: 30 | 15 ; 45 | ?
- **L3:** sapi ↑ → hari ↓ → Berbalik nilai
- **L4:** `30 × 15 = 45 × ?` · **Kunci:** 10 · **Rumus tertukar:** 22,5
- **T1:** "Setelah 5 hari, makanan tinggal untuk berapa hari?" · **T2:** "Hitung dengan sisa hari, bukan 20." · **T3:** "30 × 15 = 450. Lalu 450 : 45."

**M5-B2**
- **Teks:** "Proyek direncanakan selesai 30 hari oleh 12 pekerja. Setelah 10 hari, proyek berhenti 10 hari. Berapa pekerja **tambahan** agar selesai tepat waktu?"
- **Bagian A:** "Sisa pekerjaan = pekerjaan 12 pekerja selama ___ hari." (20) · "Sisa waktu = ___ hari." (10)
- **Bagian B tabel:** Hari | Pekerja: 20 | 12 ; 10 | ?
- **L3:** hari ↓ → pekerja ↑ → Berbalik nilai
- **L4:** `20 × 12 = 10 × ?` · **Kunci pekerja:** 24 · **Rumus tertukar:** 6
- **Langkah akhir:** "Tambahan pekerja = 24 − 12 = ___" (kunci 12). Jika siswa menjawab 24 → "Itu jumlah semua pekerja. Yang ditanya **tambahan**-nya."
- **T1:** "Berapa hari yang tersisa untuk bekerja?" · **T2:** "Waktu lebih sedikit, pekerja harus lebih banyak." · **T3:** "12 × 20 = 240. Lalu 240 : 10."

### M5-J Jelaskan ke temanmu
- **Teks:** "Temanmu bingung: soal kereta (S5) dan soal motor (S4) sama-sama tentang kecepatan, tapi jenisnya beda. Jelaskan kenapa."
- **Kalimat rumpang:** "Di soal motor, yang tetap adalah [jarak / kecepatan], jadi [senilai / berbalik nilai]. Di soal kereta, yang tetap adalah [jarak / kecepatan], jadi [senilai / berbalik nilai]."
- **Daftar cek:** menyebut yang tetap di tiap soal · jenis benar keduanya.
- **Bukti:** GL04, GL05.

### M5-99 Penutup
- **Teks:** "Kamu sudah mencoba banyak konteks. Berikutnya latihan akhir tanpa petunjuk."

---

## M6 — Latihan Akhir

**Untuk:** semua siswa; A9 hanya kelas VIII.
**Aturan:** tanpa petunjuk, tanpa umpan balik per soal (hanya "Jawaban tersimpan"). Alur 4 langkah tetap dipakai untuk soal hitung. Pembahasan semua soal tampil **di akhir**, satu per layar.
**Bukti:** DS02 (latihan mandiri setelah paham), GL05, DS03.

| ID | Soal | Bentuk | Jenis | Kunci | Rumus tertukar |
|---|---|---|---|---|---|
| A1 | 100 seragam dijahit oleh beberapa penjahit. Banyak penjahit dan lama menjahit. | Identifikasi | Berbalik nilai | — | — |
| A2 | Harga tiket sama. Banyak tiket dan total harga. | Identifikasi | Senilai | — | — |
| A3 | Harga 5 kg jeruk Rp60.000. Berapa harga 8 kg? | 4 langkah | Senilai | 96.000 | 37.500 |
| A4 | 10 orang menanam padi di sawah selama 6 hari. Berapa hari jika 15 orang? | 4 langkah | Berbalik nilai | 4 | 9 |
| A5 | Motor menempuh 120 km dengan 3 liter bensin. Berapa liter untuk 200 km? | 4 langkah | Senilai | 5 | 1,8 |
| A6 | Beras cukup untuk 40 santri selama 12 hari. Datang 8 santri lagi. Berapa hari beras habis? | 4 langkah | Berbalik nilai | 10 | 14,4 |
| A7 | Dengan kecepatan 50 km/jam, perjalanan ditempuh 4 jam. Agar ditempuh 5 jam, berapa kecepatannya? | 4 langkah | Berbalik nilai | 40 | 62,5 |
| A8 | Doni menulis: "4 kg gula Rp60.000, jadi 6 kg = 4 × 60.000 : 6 = Rp40.000." Apakah masuk akal? Berapa yang benar? | Kewajaran + isian | Senilai | Tidak masuk akal; 90.000 | — |
| A9 (VIII) | Pekerjaan direncanakan 20 hari oleh 15 orang. Setelah 8 hari, 5 orang pindah ke proyek lain. Berapa hari **total** pekerjaan selesai? | Bertahap | Berbalik nilai | 26 | — |

**Pembahasan A9:** sisa pekerjaan = 15 orang × 12 hari = 180 hari-orang; sisa 10 orang → 180 : 10 = 18 hari; total = 8 + 18 = 26 hari.

**Pembahasan A8:** gula bertambah (4 → 6 kg), harga seharusnya bertambah, bukan turun menjadi 40.000. Doni memakai cara berbalik nilai. Benar: 60.000 : 4 × 6 = 90.000.

### M6-99 Ringkasan akhir
- **Teks:** "Selesai! Kamu menjawab benar [n] dari [m] soal." + daftar singkat: "Yang sudah kuat: … · Yang perlu diulang: …" (berdasarkan jenis kesalahan terbanyak, dengan tautan ke modul terkait).
- Skor ditampilkan di sini saja, tanpa peringkat (EL03).
- Tombol: `Ulangi modul yang disarankan` · `Coba Pengayaan` · `Selesai`.

---

## Pengayaan — Bukan Keduanya dan *y* = *k* × *x*

**Status:** opsional (KP-17). Disarankan untuk kelas VIII; kelas VII boleh membuka setelah M6.
**Prinsip:** sederhana, konteks sehari-hari, tabel; satu grafik titik **statis**; tanpa istilah "fungsi" formal.
**Petunjuk:** T1–T2 atas permintaan.

### P-01 Sama-sama bertambah, pasti senilai?
- **Teks:** "Tarif parkir: 1 jam Rp3.000, 2 jam Rp5.000, 3 jam Rp7.000. Jam bertambah, tarif bertambah. Apakah ini senilai?"
- **Interaksi:** `Ya` · `Tidak` · `Belum tahu` (tidak dinilai, hanya memancing).

### P-02 Cek yang tetap
- **Teks:** "Cek hasil bagi dan hasil kalinya."
- **Tabel:**

  | Jam | Tarif (Rp) | Tarif : Jam | Jam × Tarif |
  |---|---|---|---|
  | 1 | 3.000 | 3.000 | 3.000 |
  | 2 | 5.000 | 2.500 | 10.000 |
  | 3 | 7.000 | 2.333 | 21.000 |
- **Teks:** "Hasil bagi tidak tetap. Hasil kali juga tidak tetap. Jadi **bukan keduanya**."

### P-03 Aturan lengkap
- **Teks:**
  - "Hasil bagi tetap → senilai."
  - "Hasil kali tetap → berbalik nilai."
  - "Tidak ada yang tetap → bukan keduanya."
  - "Arah perubahan membantu menebak. Tabel memastikan."

### P-04 Latihan: pilih jenisnya

| ID | Tabel | Kunci | Alasan |
|---|---|---|---|
| P-L1 | Bensin (L) → Jarak (km): 1 → 15, 2 → 30, 3 → 45 | Senilai | 15 : 1 = 30 : 2 = 45 : 3 = 15 |
| P-L2 | Pekerja → Hari: 1 → 36, 2 → 18, 3 → 12 | Berbalik nilai | 1 × 36 = 2 × 18 = 3 × 12 = 36 |
| P-L3 | Ojek online (km) → Ongkos (Rp): 1 → 10.000, 2 → 13.000, 3 → 16.000 | Bukan keduanya | 10.000; 6.500; 5.333 tidak tetap; hasil kali juga tidak tetap |

- **T1:** "Hitung hasil bagi setiap baris." · **T2:** "Jika hasil bagi tidak tetap, coba hasil kali."

### P-05 Senilai sebagai *y* = *k* × *x*
- **Teks:** "Pada senilai, hasil bagi yang tetap disebut *k*. Maka y = k × x."
- **Tabel:**

  | Buku (x) | Harga (y) | k = y : x |
  |---|---|---|
  | 1 | 4.000 | 4.000 |
  | 2 | 8.000 | 4.000 |
  | 3 | 12.000 | 4.000 |
- **Teks:** "Jadi harga = 4.000 × banyak buku."

### P-06 Grafik titik (statis)
- **Teks:** "Jika digambar, titik-titik senilai berada pada satu garis lurus yang melewati titik 0."
- **Visual:** grafik SVG statis: sumbu x (buku 0–4), sumbu y (harga 0–16.000), titik (1; 4.000), (2; 8.000), (3; 12.000), (4; 16.000), garis putus-putus melalui (0; 0). Tanpa animasi.
- **Teks kecil:** "Pada berbalik nilai, yang tetap adalah x × y = k."

### P-07 Latihan *y* = *k* × *x*

| ID | Soal | Kunci |
|---|---|---|
| P-L4 | Harga = 4.000 × banyak buku. Berapa harga 7 buku? | 28.000 |
| P-L5 | Tabel bensin P-L1: berapa nilai *k*? | 15 |
| P-L6 | Dari P-L1 (y = 15 × x), berapa km dengan 6 liter? | 90 |

- **T1:** "k adalah hasil bagi y : x." · **T2:** "Kalikan k dengan x."

---

## Lampiran — pemeriksaan kunci

| Item | Pemeriksaan |
|---|---|
| D2 | 15 × 6 = 90 → 9.000 ✔ |
| D4 | 36 : 9 = 4 → 4.000 ✔ |
| D5 | 12/18 : 6/6 = 2/3 ✔ |
| D6 | 20 : 4 × 3 = 15 ✔ |
| D8 | 10 : 2 × 3 = 15 ✔ |
| P1 cek | 25 × 4 = 100 → 10.000 ✔ |
| P2 cek | 48 : 6 = 8 → 8.000 ✔ |
| P3 cek | 30 : 5 × 2 = 12 ✔ |
| M2-03 | 4.000/1 = 8.000/2 = 16.000/4 = 4.000 ✔ |
| M2-05 | 2 × 12 = 4 × 6 = 6 × 4 = 24 ✔ |

### Kunci M3–M5 dan soal kembar

Soal kembar dipakai setelah siswa 2 kali salah dengan T3 terbuka (F08). Konteks dan jenis sama, angka berbeda.

| ID | Pemeriksaan kunci | Soal kembar | Kunci kembar |
|---|---|---|---|
| M3-E2 | 30 : 2 × 5 = 75 ✔ | 3 liter bensin untuk 36 km. Berapa km dengan 5 liter? | 60 |
| M3-E3 | 40 : 2 × 3 = 60 ✔ | 3 kg tepung untuk 45 kue. Berapa kue dari 5 kg? | 75 |
| M3-L1 | 56.000 : 4 × 7 = 98.000 ✔ | 3 kg beras Rp42.000. Harga 5 kg? | 70.000 |
| M3-L2 | 3 × 20 : 12 = 5 ✔ | 15 kue perlu 3 gelas tepung. Untuk 30 kue? | 6 |
| M3-L3 | 10.000 : 4 × 10 = 25.000 ✔ | Ongkos 5 km Rp12.500. Ongkos 8 km? | 20.000 |
| M3-L4 | 45 : 3 × 5 = 75 ✔ | Berangkat pukul 06.30; 2 km dalam 30 menit. Berapa menit untuk 6 km? | 90 |
| M3-M1 | 15.000 : 6 × 10 = 25.000 ✔ | — (mandiri, tanpa T3) | — |
| M3-M2 | 5 × 32 : 20 = 8 ✔ | — | — |
| M3-M3 | 4 × 300 : 120 = 10 ✔ | — | — |
| M4-E2 | 20 × 15 : 25 = 12 ✔ | Pakan untuk 30 ayam selama 12 hari. Jika 40 ayam? | 9 |
| M4-E3 | 60 × 3 : 90 = 2 ✔ | 50 km/jam ditempuh 6 jam. Jika 75 km/jam? | 4 |
| M4-L1 | 8 × 15 : 12 = 10 ✔ | 10 orang selesai 12 hari. Jika 15 orang? | 8 |
| M4-L2 | 40 × 3 : 2 = 60 ✔ | 30 km/jam sampai dalam 4 jam. Agar 3 jam, kecepatannya? | 40 |
| M4-L3 | 6 × 4 : 8 = 3 ✔ | Kue dibagi ke 3 anak, masing-masing 8 potong. Jika 6 anak? | 4 |
| M4-L4 | 3 × 40 : 4 = 30 ✔ | Bak 500 liter diisi 2 keran dalam 60 menit. Jika 3 keran? | 40 |
| M4-M1 | 12 × 18 : 9 = 24 ✔ | — | — |
| M4-M2 | 6 × 40 : 8 = 30 ✔ | — | — |
| M4-M3 | 5 × 36 : 4 = 45 ✔ | — | — |
| M5-S1 | 96.000 : 4 × 9 = 216.000 ✔ | Panitia 12 orang; 3 dus Rp75.000. Harga 8 dus? | 200.000 |
| M5-S2 | 5 × 6 : 3 = 10 ✔ | Acara pukul 09.00; 4 orang selesai 6 jam. Jika 3 orang? | 8 |
| M5-S3 | 250 : 10 × 24 = 600 ✔ | 200 gram gula untuk 8 gelas; harga gula Rp15.000/kg. Untuk 20 gelas? | 500 |
| M5-S4 | 45 × 2 : 30 = 3 ✔ | 40 km/jam sampai dalam 3 jam; bensin Rp25.000. Jika 60 km/jam? | 2 |
| M5-S5 | 160 : 2 × 5 = 400 ✔ | Kecepatan tetap: 180 km dalam 3 jam. Berapa km dalam 5 jam? | 300 |
| M5-S6 | 12 × 10 : 15 = 8 ✔ | Rumput untuk 10 kambing selama 12 hari; dibeli 5 kambing lagi. Berapa hari? | 8 |
| M5-B1 | 30 × 15 : 45 = 10 ✔ | Makanan untuk 20 sapi selama 18 hari; setelah 3 hari datang 5 sapi. Berapa hari lagi? | 12 (20 × 15 : 25) |
| M5-B2 | 12 × 20 : 10 = 24; 24 − 12 = 12 ✔ | 10 pekerja, rencana 24 hari; setelah 6 hari berhenti 6 hari. Tambahan pekerja? | 5 (10 × 18 : 12 = 15; 15 − 10) |

### Kunci M6 dan Pengayaan

| ID | Pemeriksaan |
|---|---|
| A3 | 60.000 : 5 × 8 = 96.000 ✔ |
| A4 | 10 × 6 : 15 = 4 ✔ |
| A5 | 3 × 200 : 120 = 5 ✔ |
| A6 | 40 × 12 : 48 = 10 ✔ |
| A7 | 50 × 4 : 5 = 40 ✔ |
| A8 | 60.000 : 4 × 6 = 90.000 ✔ |
| A9 | 15 × 12 = 180; 180 : 10 = 18; 8 + 18 = 26 ✔ |
| P-02 | 3.000/1, 5.000/2, 7.000/3 tidak sama; 3.000, 10.000, 21.000 tidak sama ✔ |
| P-L3 | 10.000; 6.500; 5.333 tidak sama; 10.000, 26.000, 48.000 tidak sama ✔ |
| P-L4 | 4.000 × 7 = 28.000 ✔ |
| P-L6 | 15 × 6 = 90 ✔ |

Semua kunci di atas juga akan diperiksa otomatis oleh skrip Python (`tools/check_content.py`) setelah konten diubah ke JSON.

## Hal yang perlu diputuskan

1. Apakah istilah "harga satuan" sudah tepat untuk siswa kelas VII di sekolah sasaran?
2. Apakah konteks pada I1–I5, C1–C5, dan Q1–Q5 sesuai dengan lingkungan siswa?
3. Batas lulus cek pemahaman M2 (≥ 4 dari 5) dan cek cepat kelas VIII.
4. ~~Soal "bukan keduanya"~~ — sudah diputuskan: masuk Pengayaan (KP-17).

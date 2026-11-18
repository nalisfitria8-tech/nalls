# Rancangan Desain — Nalls

Dokumen ini menjelaskan tampilan, alur layar, struktur materi, dan contoh isi. Semua keputusan merujuk ke fitur di `PRD.md` (F01–F16) dan kode bukti wawancara S01 (temuan awal).

---

## 1. Prinsip desain

| Prinsip | Aturan konkret | Bukti |
|---|---|---|
| Satu fokus per layar | Satu ide, satu soal, atau satu langkah per layar. | DS03, IL02 |
| Sedikit teks | Maksimal ±40 kata per layar materi; kalimat ≤ 15 kata. | EL02, EL03, DS03 |
| Tabel lebih dulu | Hubungan besaran selalu ditunjukkan dengan tabel. | EL02, DS01 |
| Teks dan tabel berdekatan | Tabel/gambar langsung di bawah kalimat yang membahasnya, tanpa menggulir. | EL02 (split-attention) |
| Warna terbatas | 1 warna utama + 2 warna jenis + 2 warna status (lihat §3). | EL03 |
| Tanpa animasi dekoratif | Hanya perubahan yang dipicu siswa (geser, ketuk). Tidak ada transisi berlebihan. | EL03, DS03 |
| Siswa yang mengatur tempo | Tidak ada perpindahan otomatis dan tidak ada penghitung waktu. | EL01, EL04 |
| Mudah ke sulit | Urutan contoh → setengah jadi → latihan → soal cerita. | EL04, IL04 |

## 2. Gaya bahasa

- Bahasa Indonesia baku yang ramah, menyapa "kamu".
- Kata kerja di awal: "Ketuk angka…", "Pilih jenis…".
- Istilah konsisten: **senilai**, **berbalik nilai**, **diketahui**, **ditanya**, **hasil bagi**, **hasil kali**. Hindari sinonim ("sebanding", "berbanding terbalik") kecuali sekali sebagai pengenalan.
- Istilah CLT (intrinsic/extraneous/germane) **tidak pernah** muncul di aplikasi.
- Umpan balik tidak menghakimi: "Belum tepat. Coba lihat arah perubahannya." bukan "Salah!".

## 3. Token visual

| Token | Nilai | Pemakaian |
|---|---|---|
| `--bg` | `#0B1226` (navy gelap) | Latar halaman, bilah navigasi bawah |
| `--card` | `#131C3A` (navy) | Bilah atas, kartu, tombol, kotak isian |
| `--surface` | `#131C3A` (navy) | Kotak soal, tabel, petunjuk |
| `--surface-2` | `#1C2852` (navy terang) | Kepala tabel, pilihan terpilih, label status |
| `--accent` | `#2E3D6B` | Garis kartu dan pemisah. **Bukan untuk teks** (dekoratif) |
| `--text` | `#E6EAF5` | Teks utama |
| `--muted` | `#A9B4D0` | Teks bantu, garis kotak isian |
| `--primary` | `#5B95FF` (biru elektrik) | Tombol utama, tautan, garis pilihan, langkah aktif |
| `--on-primary` | `#0B1226` | Teks di atas biru elektrik |
| `--violet` | `#A78BFA` (ungu) | Garis aksen bilah atas (gradien biru→ungu, statis) dan judul bagian |
| `--violet-text` | `#C4B5FD` | Teks ungu (label kelas/kemajuan di bilah atas) |
| `--senilai` | `#5EEAD4` (toska terang) | Latar label **Senilai** ↑↑ |
| `--berbalik` | `#FDBA74` (oranye terang) | Latar label **Berbalik nilai** ↑↓ |
| `--on-tag` | `#0B1226` | Teks di atas label jenis dan penanda F07 |
| `--ok` | `#4ADE80` | Umpan balik benar, status selesai |
| `--err` | `#F87171` | Umpan balik belum tepat |
| `--mark-num` | `#FEF08A` (kuning muda) | Penanda angka (F07) |
| `--mark-ask` | `#BFDBFE` (biru muda) | Penanda pertanyaan (F07) |

- **Tema Dark Technology** (Tahap 2 rencana Nalls, 18 Nov 2026; menggantikan tema pink 12 Nov). Tanpa animasi, kilau, atau bayangan bercahaya; gradien hanya pada garis bawah bilah atas dan tidak bergerak.
- Kontras teks (semua ≥ 4,5:1): `--text` di `--bg` 15,46:1, di `--card` 13,91:1, di `--surface-2` 11,83:1 · `--muted` di `--card` 8,07:1, di `--surface-2` 6,87:1 · `--primary` sebagai teks di `--card` 5,73:1, di `--surface-2` 4,87:1 · `--on-primary` di `--primary` 6,37:1 · `--violet-text` di `--card` 9,06:1 · `--ok` di `--card` 9,6:1 · `--err` di `--card` 6,05:1 · `--on-tag` di `--senilai` 12,58:1, di `--berbalik` 11,03:1, di `--mark-num` 15,99:1, di `--mark-ask` 13,09:1.
- Warna label jenis dan umpan balik dibuat lebih terang agar terbaca di latar gelap; maknanya tetap (toska = senilai, oranye = berbalik nilai).
- Warna **tidak pernah** menjadi satu-satunya pembeda: Senilai/Berbalik selalu disertai label teks dan ikon panah; status selalu disertai kata ("Tepat", "Belum tepat").
- Huruf: font sistem (tanpa unduh font). Isi 16–18 px, judul 20–22 px, angka tabel 18 px.
- Ruang: kelipatan 8 px. Tombol minimal tinggi 48 px, jarak antartombol ≥ 8 px.
- Satu tema saja (gelap); tidak ada pilihan mode terang/gelap, agar variasi tampilan yang perlu diuji tetap sedikit.

## 4. Komponen

| Komponen | Keterangan | Fitur |
|---|---|---|
| **Bilah atas** | Judul modul singkat + indikator kemajuan ("3/8"). | F06 |
| **Bilah navigasi bawah** | `Kembali` · `Ulangi` · `Lanjut` (tetap di bawah, mudah dijangkau jempol). | F06 |
| **Tabel hubungan** | 2 kolom, 2–4 baris, panah ↑/↓ di sisi kolom, sel `?` untuk yang ditanya. | F05 |
| **Indikator langkah** | `① Diketahui ② Ditanya ③ Jenis ④ Hitung`; langkah 4 berikon gembok sampai langkah 3 benar. | F04 |
| **Teks soal bertanda** | Kata/angka dapat diketuk; warna penanda dari token. | F07 |
| **Tombol Petunjuk** | Menampilkan T1 → T2 → T3; menunjukkan "Petunjuk 1 dari 3". | F08 |
| **Kartu pembahasan** | Judul jenis kesalahan + 1–2 kalimat + tabel soal itu. | F09 |
| **Kartu cek kewajaran** | Dua pilihan arah + syarat. | F10 |
| **Kartu "Ingat lagi"** | Ringkasan cara menentukan jenis (lembar bawah/bottom sheet). | F04, EL04 |
| **Kotak penjelasan** | Kalimat rumpang + teks bebas ≤ 3 kalimat. | F11 |
| **Panel 3D** | Kanvas 3D + penggeser; tombol "Sembunyikan gambar". | F14 |

## 5. Alur layar

```
[Pembuka] → [Masuk: kode siswa] → [Pilih kelas VII/VIII*] → [M0 Diagnostik 8 soal]
      → [Hasil diagnostik + pengingat (hanya yang perlu)]
      → [Peta belajar] → M1 → M2 → M3 → M4 → M5 → M6 → [Selesai + ringkasan]

* Kelas sudah tersimpan pada kode siswa; layar ini hanya konfirmasi.
```

Peta belajar menampilkan modul berurutan. Modul berikut terbuka setelah modul sebelumnya selesai. Siswa kelas VIII yang lancar di diagnostik melihat M1 sebagai "boleh dilewati".

### 5.1 Alur di dalam modul (M3–M5)

```
Penjelasan singkat (1–3 layar)
  → Contoh berlangkah (semua langkah terisi, siswa menekan Lanjut per langkah)
  → Contoh setengah jadi (Langkah 3 dan/atau 4 diisi siswa)
  → Latihan (4 langkah penuh, petunjuk atas permintaan)
  → Jelaskan ke temanmu (F11)
  → Latihan mandiri (petunjuk maks. T2)
```

### 5.2 Alur satu soal (F04, F08, F09, F10)

```
Soal (tandai angka & pertanyaan)
  → ① Diketahui (tabel terisi dari tanda) → periksa
  → ② Ditanya (sel ? di tabel) → periksa
  → ③ Jenis + alasan ── salah ──> umpan balik "salah jenis" + T1 → coba lagi
        │ benar
  → ④ Bentuk hitungan ── salah ──> "salah rumus" → coba lagi
     → Hasil ── salah ──> "salah hitung" → coba lagi
        │ benar                (setelah 2× salah dengan T3: pembahasan + soal kembar)
  → Cek kewajaran → [Soal berikut] (didahului "Mirip atau beda?" bila F12 aktif)
```

## 6. Sketsa layar (lebar 360 px)

### 6.1 Masuk

```
┌──────────────────────────────┐
│            Nalls             │
│                              │
│  Masukkan kode siswa         │
│  ┌────────────────────────┐  │
│  │ M7A-K3P9               │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │         Masuk          │  │
│  └────────────────────────┘  │
│  Kode diberikan oleh guru.   │
└──────────────────────────────┘
```

### 6.2 M2 — perbandingan berdampingan

```
┌──────────────────────────────┐
│ Senilai atau Berbalik?   6/7 │
├──────────────────────────────┤
│ Bandingkan kedua tabel.      │
│ Jika yang satu bertambah,    │
│ yang lain bertambah atau     │
│ berkurang?                   │
│ Ketuk jenisnya di bawah tiap │
│ tabel.                       │
│ (SENILAI ↑↑)    (BERBALIK ↑↓)│  ← muncul setelah jenis benar
│ ┌──────┬─────┐ ┌──────┬────┐ │
│ │Buku ↑│Hrg ↑│ │Pkrj ↑│Hr ↓│ │
│ │ 2    │ 8rb │ │ 2    │ 12 │ │
│ │ 4    │16rb │ │ 4    │  6 │ │
│ └──────┴─────┘ └──────┴────┘ │
│ [↑↑ Senilai ]  [↑↑ Senilai ] │
│ [↑↓ Berbalik]  [↑↓ Berbalik] │
│ Yang tetap:    Yang tetap:   │  ← muncul setelah jenis benar
│ hasil bagi     hasil bagi    │
│ atau hasil     atau hasil    │
│ kali?          kali?         │
│ [hasil bagi]   [hasil bagi]  │
│ [hasil kali]   [hasil kali]  │
├──────────────────────────────┤
│ [Kembali] [Ulangi]  [Lanjut] │
└──────────────────────────────┘
```

Salah boleh dicoba lagi; umpan balik hanya mengarahkan (misal "Lihat panah kedua kolom."). `Lanjut` tidak dikunci (F06). Keputusan: KP-24.

### 6.3 Soal — Langkah 1 (tandai)

```
┌──────────────────────────────┐
│ Soal 2/5   ①──②──③──④🔒      │
├──────────────────────────────┤
│ Bu Sari membeli [3] buku     │
│ seharga Rp[12.000]. Ia punya │
│ [2] anak. Berapa harga [5]   │
│ buku?   ← kalimat diketuk:   │
│           latar biru + garis │
│ ┌──────────────────────────┐ │
│ │ 12.000 masuk ke kolom…   │ │  ← muncul setelah angka diketuk
│ │ [ Buku ]   [ Harga ]     │ │
│ │ Batal, hapus tanda       │ │
│ └──────────────────────────┘ │
│ Ketuk angka yang penting dan │
│ kalimat yang ditanya. Angka  │
│ bisa juga diketik. Kosongkan │
│ sel yang ditanya.            │
│ Diketahui                    │
│ ┌──────────┬──────────┐      │
│ │ Buku     │ Harga    │      │
│ │ [3     ] │ [12.000] │      │
│ │ [5     ] │ [      ] │      │
│ └──────────┴──────────┘      │
│ [         Periksa          ] │
│ [Petunjuk]                   │
└──────────────────────────────┘
```
(Angka "2 anak" adalah pengecoh.) Semua angka bisa diketuk, termasuk pengecoh, agar tidak memberi jawaban. Angka belum ditandai: kotak bergaris putus-putus; ditandai: latar `--mark-num` + garis tegas. Kalimat ditanya: latar `--mark-ask` + garis bawah. Tanda tetap terlihat di Langkah 2–4. Keputusan: KP-26.

### 6.4 Soal — Langkah 3 (jenis, wajib)

```
┌──────────────────────────────┐
│ Soal 2/5   ①──②──③──④🔒      │
├──────────────────────────────┤
│ ┌──────────┬──────────┐      │
│ │ Buku  ↑  │ Harga ?  │      │
│ │ 3        │ 12.000   │      │
│ │ 5        │ ?        │      │
│ └──────────┴──────────┘      │
│ Buku bertambah. Harga…       │
│ ( ) bertambah   ( ) berkurang│
│                              │
│ Jadi jenisnya:               │
│ [ ↑↑ Senilai ] [ ↑↓ Berbalik]│
│                              │
│ ⓘ Ingat lagi: cara menentukan│
│   jenis                      │
├──────────────────────────────┤
│ [Petunjuk]          [Periksa]│
└──────────────────────────────┘
```

### 6.5 Soal — Langkah 4 dan cek kewajaran

```
┌──────────────────────────────┐
│ Soal 2/5   ①──②──③──④        │
├──────────────────────────────┤
│ Senilai: hasil bagi sama.    │
│ Pilih bentuk hitungan:       │
│ (•) 3/12.000 = 5/?           │
│ ( ) 3 × 12.000 = 5 × ?       │
│                              │
│ ? = [ 20000 ]                │
├──────────────────────────────┤
│ Apakah hasilnya masuk akal?  │
│ Buku bertambah (3→5), harga  │
│ satuan sama, maka harga      │
│ (•) bertambah ( ) berkurang  │
│ 20.000 lebih besar dari      │
│ 12.000? (•) Ya  ( ) Tidak    │
├──────────────────────────────┤
│ [Petunjuk]          [Periksa]│
└──────────────────────────────┘
```

### 6.6 Pembahasan (contoh salah rumus)

```
┌──────────────────────────────┐
│ Belum tepat: bentuk hitungan │
├──────────────────────────────┤
│ Jenisnya sudah benar:        │
│ senilai.                     │
│ Pada senilai, hasil bagi     │
│ tetap, bukan hasil kali.     │
│ ┌──────┬────────┬────────┐   │
│ │ Buku │ Harga  │ Harga÷ │   │
│ │ 3    │ 12.000 │ 4.000  │   │
│ │ 5    │ ?      │ 4.000  │   │
│ └──────┴────────┴────────┘   │
├──────────────────────────────┤
│                  [Coba lagi] │
└──────────────────────────────┘
```

### 6.6b Tes literasi (F17)

- Peta belajar: bagian **Tes literasi** (Tes awal · Tes akhir) di atas peta modul; status `Mulai` / `Lanjutkan` / `Terkirim` / `Skor x/24`; tes akhir terbuka setelah tes awal dikirim. Tautan **Penilaian tes (guru/peneliti)** di bawah.
- Soal: bilah atas "Tes awal · Soal 1/4"; teks soal di kartu; daftar pilihan (A/B/C) sebagai butir; kotak jawaban besar; navigasi `Kembali` · `Lanjut` (soal terakhir: `Periksa jawaban`). Tanpa penghitung waktu.
- Periksa & kirim: daftar soal dengan status "Sudah diisi ✓/Belum diisi"; `Kirim jawaban` → konfirmasi `Ya, kirim` / `Batal`.
- Hasil siswa: skor total dan tabel Soal · Kemampuan · Skor; tanpa kunci jawaban.
- Penilai: soal, jawaban siswa, tiap tahap rubrik dengan tombol skor `0 … maks`; `Simpan nilai` aktif setelah semua tahap diisi.

### 6.7 Jelaskan ke temanmu

```
┌──────────────────────────────┐
│ Jelaskan ke temanmu          │
├──────────────────────────────┤
│ Temanmu bertanya: "Kenapa    │
│ soal pekerja ini berbalik    │
│ nilai?"                      │
│                              │
│ Soal ini [berbalik nilai ▾]  │
│ karena jika [pekerja ▾]      │
│ bertambah, [hari ▾]          │
│ [berkurang ▾].               │
│                              │
│ Tambahkan dengan kata-kata-  │
│ mu sendiri (boleh kosong):   │
│ ┌────────────────────────┐   │
│ │                        │   │
│ └────────────────────────┘   │
├──────────────────────────────┤
│                     [Kirim]  │
└──────────────────────────────┘
```

## 7. Peran Three.js (F14)

**Aturan:** 3D hanya dipakai jika menunjukkan **hubungan besaran**, bukan hiasan (EL03, DS03).

| Ilustrasi | Hubungan yang ditunjukkan | Interaksi | Tempat |
|---|---|---|---|
| Tumpukan barang & uang | Senilai: banyak barang ↑ → tinggi tumpukan uang ↑ dengan kenaikan yang sama per barang | Penggeser "banyak barang" 1–10; tabel di bawah ikut berubah | M2, layar senilai |
| Balok pekerjaan tetap | Berbalik nilai: lebar (pekerja) × panjang (hari) = luas/volume tetap | Penggeser "pekerja" 1–12; panjang balok menyesuaikan; tabel ikut berubah | M2, layar berbalik nilai |

Batasan:
- Tidak berputar atau bergerak sendiri; kamera tetap (tanpa geser-putar bebas agar tidak mengganggu).
- Warna mengikuti token `--senilai` / `--berbalik` dan abu-abu.
- Label angka ditulis di tabel (bukan teks 3D) agar mudah dibaca.
- Dimuat hanya saat layar itu dibuka; tidak ada di layar lain.
- Versi 2D (SVG batang/persegi panjang) dipakai bila WebGL tidak ada, perangkat lemah, atau siswa menekan "Sembunyikan gambar".
- Akan diuji (PRD F14); jika tidak membantu, dihapus.

## 8. Contoh isi materi

### M1 — Mengingat perbandingan
- Layar 1: "Perbandingan membandingkan dua besaran." Tabel: kelereng merah 2, biru 4 → 2 : 4 = 1 : 2.
- Layar 2: menyederhanakan perbandingan (pakai FPB).
- Layar 3: membaca perbandingan dari tabel.

### M2 — Senilai atau Berbalik Nilai? (urutan layar)
1. Senilai: buku–harga (harga satuan Rp4.000). Tabel 1→4.000, 2→8.000, 4→16.000. "Buku bertambah, harga bertambah."
2. Hal yang tetap: harga ÷ buku = 4.000 (hasil bagi tetap). [3D opsional: tumpukan]
3. Berbalik nilai: pekerja–hari mengecat pagar yang sama. Tabel 2→12, 4→6, 6→4. "Pekerja bertambah, hari berkurang."
4. Hal yang tetap: pekerja × hari = 24 (hasil kali tetap). [3D opsional: balok]
5. Berdampingan (sketsa §6.2) + pertanyaan kunci; siswa mengetuk jenis tiap tabel lalu menjawab yang tetap.
6. Kartu ringkas: "↑↑ Senilai = hasil bagi tetap · ↑↓ Berbalik nilai = hasil kali tetap".
7. Latihan identifikasi (tanpa hitung), contoh:
   - Bensin dan jarak tempuh mobil → senilai.
   - Banyak ayam dan lama pakan habis → berbalik nilai.
   - Kecepatan dan waktu tempuh jarak yang sama → berbalik nilai.
   - Banyak kue dan tepung yang dibutuhkan → senilai.
   - Banyak anak dan bagian kue per anak (kue sama) → berbalik nilai.
8. Cek pemahaman (5 soal baru, lulus ≥ 4).
9. Jelaskan ke temanmu.

### Contoh soal (kunci jawaban sudah diperiksa)

| Modul | Soal | Jenis | Hitungan | Jawaban |
|---|---|---|---|---|
| M3 | 3 buku Rp12.000. Harga 5 buku? | Senilai | 12.000 ÷ 3 × 5 | Rp20.000 |
| M3 | Mobil 2 liter bensin menempuh 30 km. Dengan 5 liter? | Senilai | 30 ÷ 2 × 5 | 75 km |
| M3 | 2 kg tepung untuk 40 kue. 3 kg tepung untuk berapa kue? | Senilai | 40 ÷ 2 × 3 | 60 kue |
| M4 | 6 pekerja selesai 10 hari. Jika 4 pekerja? | Berbalik nilai | 6 × 10 ÷ 4 | 15 hari |
| M4 | Pakan cukup untuk 20 ayam selama 15 hari. Jika 25 ayam? | Berbalik nilai | 20 × 15 ÷ 25 | 12 hari |
| M4 | Kecepatan 60 km/jam, waktu 3 jam. Jika 90 km/jam? | Berbalik nilai | 60 × 3 ÷ 90 | 2 jam |

### Contoh petunjuk bertingkat (soal pekerja)
- T1: "Jika pekerjanya lebih sedikit, pagar selesai lebih cepat atau lebih lama?"
- T2: "Ini berbalik nilai. Pekerja × hari selalu sama."
- T3: "6 × 10 = 4 × ?"

## 9. Kenyamanan Android

- Lebar dasar 360 px, satu kolom, tanpa gulir samping.
- Tombol utama di bagian bawah (jangkauan jempol), tinggi ≥ 48 px.
- Isian angka memakai `inputmode="numeric"` (keyboard angka muncul).
- Angka ribuan ditampilkan dengan titik (12.000), siswa boleh mengetik tanpa titik.
- Tanpa font eksternal; ilustrasi 2D berupa SVG; 3D dimuat terpisah.
- Bisa dipasang ke layar utama (PWA) dan materi tetap terbuka saat sinyal hilang.

# MathSave

Aplikasi web pembelajaran **Perbandingan Senilai dan Berbalik Nilai** untuk siswa SMP, nyaman dipakai di HP Android.

- **Pengguna:** siswa kelas VII (belajar pertama) dan kelas VIII (mengulang dan memperdalam).
- **Tujuan:** meningkatkan *Mathematical Literacy* — merumuskan situasi sehari-hari, menghitung, dan memeriksa kewajaran jawaban.
- **Dasar desain:** *Cognitive Load Theory*, berdasarkan wawancara siswa (temuan awal, 1 informan: S01).
- **Model pengembangan:** ADDIE — saat ini tahap **Develop** (bertahap sesuai `docs/task.md` bagian C). Sudah ada: diagnostik M0, M1, M2, M3, M4 (tanpa "jelaskan ke temanmu" M3-J/M4-J). Belum: login kode siswa dan pengiriman data ke Supabase (proyek Supabase belum dibuat).

## Ciri utama

- Diagnostik prasyarat singkat untuk menentukan titik mulai.
- Modul khusus **"Senilai atau Berbalik Nilai?"** yang dijelaskan pelan-pelan.
- Alur soal 4 langkah tetap: **Diketahui → Ditanya → Tentukan jenis → Hitung**.
- Tabel untuk melihat hubungan besaran; teks sedikit; satu soal per layar.
- Petunjuk bertingkat (bukan langsung jawaban) dan pembahasan sesuai jenis kesalahan.
- Siswa mengatur tempo: Kembali, Ulangi, Lanjut.
- Tes Mathematical Literacy (tes awal & tes akhir, 4 soal, rubrik per tahap) dengan layar penilai dan unduhan CSV untuk menguji efektivitas aplikasi (`docs/evaluasi.md` §9).

## Dokumentasi

| File | Isi |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Kebutuhan siswa, bukti wawancara, analisis IL/EL/GL, spesifikasi fitur |
| [docs/design.md](docs/design.md) | Alur layar, sketsa, token visual, struktur materi, peran Three.js |
| [docs/architecture.md](docs/architecture.md) | Teknologi, struktur folder, login, offline, keamanan |
| [docs/api.md](docs/api.md) | Tabel Supabase, RLS, fungsi RPC, data yang dicatat |
| [docs/task.md](docs/task.md) | Daftar tugas per tahap ADDIE |
| [docs/naskah-materi.md](docs/naskah-materi.md) | Naskah isi tiap layar (M0–M6 dan Pengayaan), soal, petunjuk, umpan balik |
| [docs/kisi-kisi-materi.md](docs/kisi-kisi-materi.md) | Kisi-kisi, ringkasan materi, dan contoh soal untuk ditelaah dosen |
| [docs/keputusan.md](docs/keputusan.md) | Jejak keputusan ADDIE dan pertanyaan terbuka |
| [docs/evaluasi.md](docs/evaluasi.md) | Rencana validasi ahli, uji coba, indikator, rubrik |
| [AGENTS.md](AGENTS.md) | Aturan untuk agen AI/pengembang yang bekerja di repo ini |

## Teknologi

- **JavaScript:** Vite (aplikasi web), Vitest (tes). Three.js nanti, hanya untuk ilustrasi hubungan besaran.
- **Python:** alat bantu peneliti di `tools/` (pemeriksa kunci soal, pembuat kode siswa), diuji dengan pytest.
- **Supabase** (database, login kode siswa) · **Netlify** (hosting).

## Menjalankan (komputer pengembang)

Butuh Node.js 20+ dan Python 3.10+.

```bash
npm install                 # sekali saja
npm run dev                 # buka alamat yang muncul (http://localhost:5173)
npm test                    # tes JavaScript
python -m pip install -r tools/requirements.txt   # sekali saja
python -m pytest tools      # tes Python
python tools/check_content.py                    # cek kunci semua soal
```

**Untuk uji coba di kelas (tes literasi):** lihat [docs/panduan-android.md](docs/panduan-android.md).

**Mencoba di HP Android:** sambungkan HP dan laptop ke Wi-Fi yang sama, jalankan `npm run dev`, lalu buka alamat **Network** yang muncul (misal `http://192.168.1.5:5173`) di Chrome HP.

## Struktur folder

```
src/          aplikasi web (JavaScript)
  main.js     titik masuk + router
  screens/    layar (peta belajar, diagnostik, materi, M2, soal 4 langkah)
  components/ potongan tampilan (tabel, petunjuk, navigasi, dll.)
  engine/     mesin hitung, pemeriksa jawaban, aturan jalur belajar
  data/       keadaan belajar di perangkat & antrean data
  content/    materi & soal dalam JSON
  styles/     token warna dan gaya
tests/        tes JavaScript
tools/        alat Python + tesnya
supabase/     skrip database
docs/         dokumentasi
```

Rincian: [docs/architecture.md](docs/architecture.md) §3.

## Privasi

Siswa hanya diidentifikasi dengan kode (misalnya S01 di dokumen, kode acak di aplikasi). Nama siswa tidak disimpan di repo atau database.

# Arsitektur — MathSave

Status: **tahap Develop** (diperbarui 11 November 2026, setelah C11). Dokumen ini menjelaskan kode yang **sudah ada**; bagian yang belum dibangun ditandai *rencana* beserta nomor tugasnya di `task.md` bagian C.

## 1. Gambaran umum

```
 HP Android (browser Chrome)                Layanan online gratis
┌──────────────────────────────┐        ┌────────────────────────┐
│ MathSave (web statis)        │        │ Netlify (hosting web)  │
│  • Tampilan & alur belajar   │◄───────┤  file HTML/JS/CSS      │
│  • Konten materi (JSON)      │        └────────────────────────┘
│  • Pemeriksa jawaban lokal   │        ┌────────────────────────┐
│  • Keadaan belajar (lokal)   │─ ─ ─ ─►│ Supabase (rencana)     │
│  • Antrean data              │  HTTPS │  • Auth anonim         │
│  • Three.js (rencana)        │        │  • Postgres + RLS      │
└──────────────────────────────┘        │  • Fungsi RPC          │
                                        │  • Ekspor CSV          │
 Peneliti ─── dashboard Supabase ──────►└────────────────────────┘
```

- **Netlify** meng-hosting halaman web statis (`netlify.toml`: `npm run build`, folder `dist`, Node 22). Vercel sebagai cadangan.
- **Supabase** untuk login kode siswa dan penyimpanan data belajar. **Belum tersambung**: proyek Supabase belum dibuat (KP-21). Skema sudah ditulis di `supabase/migrations/0001_init.sql` tetapi belum dijalankan. Tidak ada server backend sendiri (KP-20).
- **Konten materi disimpan di aplikasi** (file JSON), bukan di database: ringan, tetap jalan saat offline, dan perubahan tercatat (KP-12).

### Keadaan saat ini vs rencana

| Bagian | Sekarang | Rencana |
|---|---|---|
| Identitas siswa | Pilih kelas VII/VIII di layar awal | Masuk dengan kode siswa (F01, C5) |
| Keadaan belajar | `localStorage` perangkat (`src/data/store.js`) | Dipulihkan juga dari Supabase lewat `get_my_state()` (C5, C15) |
| Data penelitian | Antrean di memori (`src/data/logger.js`), hilang saat halaman ditutup | Antrean IndexedDB + kirim berkelompok ke Supabase (C15) |
| Offline | Belum ada service worker | PWA (C17) |
| Ilustrasi | Tabel 2D saja | Three.js dimuat dinamis di M2 + versi 2D (F14, C16) |

## 2. Pilihan teknologi

| Bagian | Pilihan | Status | Alasan |
|---|---|---|---|
| Bahasa aplikasi | JavaScript (modul ES), tanpa TypeScript | Dipakai | Syarat pengembang (KP-20). |
| Build | Vite 7 | Dipakai | Ringan, cepat, hasil statis cocok untuk Netlify. |
| UI | JavaScript murni + pembantu kecil `h()` / `fill()` (`src/components/dom.js`), tanpa framework | Dipakai (diputuskan di C1) | Ukuran unduhan kecil untuk HP Android; mudah dibaca. |
| Navigasi | Router hash sederhana di `src/main.js` (§4) | Dipakai | Tanpa pustaka; tombol Kembali browser tetap berfungsi. |
| Gaya | CSS biasa dengan variabel (`src/styles/tokens.css` dari `design.md` §3) | Dipakai | Tanpa pustaka CSS besar. |
| Alat bantu | Python 3 + pytest (`tools/`) | Dipakai | Pemeriksa kunci konten, pembuat kode siswa (KP-20). Tidak di-deploy. |
| Tes | Vitest + happy-dom (logika dan layar JS), pytest (alat Python) | Dipakai | Pemeriksa jawaban dan klasifikasi kesalahan wajib teruji. |
| Tes layar 360 px | Playwright | Rencana (C18) | Sementara diperiksa manual dengan browser *headless*. |
| Data | `@supabase/supabase-js` v2 | Rencana (C5, C15) | Belum dipasang di `package.json`. |
| Offline | Service worker (vite-plugin-pwa) + IndexedDB untuk antrean | Rencana (C15, C17) | Materi tetap terbuka; data dikirim saat online. |
| 3D | Three.js, di-*import* dinamis hanya di M2 | Rencana (C16) | Tidak membebani halaman lain. |

Dependensi yang terpasang saat ini (semua `devDependencies`): `vite`, `vitest`, `happy-dom`. Aplikasi belum memakai pustaka luar saat dijalankan.

Target ukuran: unduhan awal (tanpa Three.js) ≤ 150 KB gzip. Build saat ini ±19 KB gzip (JS) + ±2 KB (CSS).

## 3. Struktur folder

```
mathsave/
├─ README.md, AGENTS.md
├─ index.html            halaman tunggal; memuat src/main.js
├─ netlify.toml          perintah build Netlify
├─ docs/                 dokumentasi (PRD, design, architecture, api, task, naskah, kisi-kisi, keputusan, evaluasi)
├─ referensi/            file wawancara (tidak di-deploy, dikecualikan dari git)
├─ src/
│  ├─ main.js            titik masuk + router hash (§4)
│  ├─ screens/
│  │  ├─ home.js         pilih kelas (sementara), peta belajar, layar penutup modul
│  │  ├─ diagnostic.js   M0: diagnostik 8 soal, hasil, kartu pengingat (F02)
│  │  ├─ lesson.js       layar materi satu ide per layar; interaksi label tabel M2-06 (F03, F06)
│  │  ├─ quiz.js         latihan pilihan/isian M1
│  │  ├─ m2.js           M2: tawaran & cek cepat kelas VIII, latihan identifikasi, cek pemahaman,
│  │  │                  jelaskan ke temanmu, layar gerbang latihan mandiri (F03, F11, DS02)
│  │  ├─ mlTest.js       tes literasi awal/akhir: pengantar, soal, kirim, hasil, layar penilai, unduh CSV (F17)
│  │  └─ solve.js        alur soal 4 langkah (Langkah 1 dengan tandai F07), petunjuk, pembahasan, soal kembar,
│  │                     cek kewajaran (F04, F07–F10)
│  ├─ components/
│  │  ├─ dom.js          h() membuat elemen, fill() mengganti isi, richText() markah konten
│  │  ├─ relationTable.js tabel hubungan dua besaran (F05)
│  │  ├─ labelTables.js  tabel berdampingan yang diberi label siswa (M2-06, KP-24)
│  │  ├─ markedText.js   teks soal yang angka dan kalimatnya bisa ditandai (F07, KP-26)
│  │  ├─ question.js     soal pilihan/isian, kotak umpan balik, kotak petunjuk, bilah atas
│  │  ├─ explain.js      "Jelaskan ke temanmu": kalimat rumpang + teks bebas + daftar cek (F11)
│  │  └─ navBar.js       Kembali · Ulangi · Lanjut (F06)
│  ├─ engine/            logika murni tanpa DOM (diuji Vitest)
│  │  ├─ number.js       membaca/menulis angka format Indonesia (12.000; 26,67)
│  │  ├─ solver.js       menghitung kunci senilai/berbalik dan hasil "rumus tertukar"
│  │  ├─ checker.js      memeriksa jawaban per langkah + klasifikasi kesalahan (F04, F09, F10)
│  │  ├─ feedback.js     teks pembahasan per jenis kesalahan, petunjuk soal kembar (F09)
│  │  ├─ hints.js        tingkat petunjuk & fading per fase (F08)
│  │  ├─ identify.js     soal identifikasi jenis tanpa menghitung (M2)
│  │  ├─ attempts.js     percobaan cek M2: kunci jawaban pertama, tutup & catat sekali (KP-25)
│  │  ├─ mlScore.js      tes literasi: skor per tahap rubrik, ringkasan fase, N-gain, CSV (F17)
│  │  ├─ marking.js      F07: memecah teks soal jadi kalimat & angka, menaruh angka di tabel Diketahui
│  │  └─ path.js         skor diagnostik, titik mulai, status modul, gerbang mandiri (F02, DS02)
│  ├─ data/
│  │  ├─ store.js        keadaan belajar di localStorage (sementara sampai C5/C15)
│  │  └─ logger.js       antrean kejadian di memori, bentuk sama dengan tabel api.md (F15, sebagian)
│  ├─ content/           m0.json, m1.json, m2.json, m3.json, m4.json (M5, M6 dan Pengayaan: rencana C13);
│  │                     ml-test.json (tes literasi, F17)
│  └─ styles/            tokens.css (warna, ukuran), base.css (tata letak, komponen)
├─ tests/                Vitest: engine, alur layar, router, gaya (*.test.js)
├─ tools/
│  ├─ check_content.py   memeriksa semua soal JSON (kunci dihitung ulang)
│  ├─ generate_codes.py  membuat kode siswa (CSV untuk Supabase)
│  ├─ requirements.txt
│  └─ tests/             pytest
└─ supabase/
   └─ migrations/
      └─ 0001_init.sql   tabel, RLS, fungsi RPC (belum dijalankan)
```

*Rencana, belum ada:* `public/` (ikon, manifest PWA — C17), `src/data/supabase.js` dan `src/data/auth.js` (C5), `src/three/` (C16).

## 4. Navigasi (router hash)

`src/main.js` membaca `location.hash` dan menampilkan satu layar. Selama kelas belum dipilih, semua alamat menampilkan layar pilih kelas.

| Alamat | Layar |
|---|---|
| `#/` | Peta belajar |
| `#/diagnostik/intro`, `#/diagnostik/<n>` | Diagnostik M0 (soal ke-n; n = jumlah soal → hasil) |
| `#/pengingat/<prasyarat>/<n>` | Kartu pengingat prasyarat |
| `#/modul/<M>/<n>` | Layar materi ke-n modul M |
| `#/latihan/<M>/<n>` | Latihan pilihan/isian (M1) |
| `#/soal/<M>/<n>` | Soal 4 langkah; soal fase `mandiri` diganti layar gerbang jika cek M2 belum lulus |
| `#/selesai/<M>` | Penutup modul |
| `#/m2/tawar` | Tawaran cek cepat (kelas VIII, M2-00) |
| `#/m2/cepat/<n>` | Cek cepat Q1–Q5; n = 5 → hasil |
| `#/m2/latih/<n>` | Latihan identifikasi I1–I5 |
| `#/m2/cek/mulai`, `#/m2/cek/<n>` | Cek pemahaman C1–C5; n = 5 → hasil |
| `#/m2/jelaskan` | Jelaskan ke temanmu M2-10 (hanya setelah lulus cek) |
| `#/tes-ml/<awal\|akhir>` | Tes literasi: pengantar; `/<n>` soal ke-n; `/kirim` periksa & kirim; `/hasil` skor siswa (F17) |
| `#/tes-ml/penilai`, `#/tes-ml/penilai/<awal\|akhir>/<n>` | Layar penilai: kode peserta, status, N-gain, unduh CSV; isi skor per tahap |

Urutan M2: layar M2-01…07 → latihan → cek pemahaman → (lulus) jelaskan → penutup; (belum lulus) ulang dari M2-06 → cek lagi dengan urutan acak. Kelas VIII yang membuka M2 dari peta belajar mendapat tawaran cek cepat lebih dulu.

## 5. Keadaan belajar di perangkat (`src/data/store.js`)

Disimpan di `localStorage` dengan kunci `mathsave:v1`. Jika penyimpanan diblokir browser, aplikasi tetap jalan (keadaan hilang saat halaman ditutup). Data lama dibaca dengan penggabungan bertingkat, sehingga perubahan bentuk tidak merusak kemajuan siswa. Setiap `store.get()`/`store.update()` membaca ulang salinan tersimpan terbaru, agar tab/jendela lain yang terbuka lebih dulu tidak menimpa data (misal jawaban tes) dengan keadaan lamanya.

| Kunci | Isi |
|---|---|
| `grade` | 7 atau 8 |
| `diagnostic` | jawaban, skor per prasyarat, titik mulai, pengingat yang perlu |
| `progress` | status per modul, misal `{ "M1": "selesai" }` |
| `m2.passed` | lulus cek pemahaman **atau** cek cepat → gerbang latihan mandiri terbuka (KP-22) |
| `m2.quickDone`, `m2.quickScore`, `m2.quick.answers` | cek cepat (sekali; KP-25, usulan) |
| `m2.cek` | percobaan cek pemahaman: `attempt`, `open`, `order`, `answers` (jawaban pertama, dikunci), `result`, `reviewed` (KP-25) |
| `ml.deviceId`, `ml.participant` | kode acak perangkat (`P-XXXXXX`) dan kode peserta dari penilai (bukan nama) |
| `ml.awal`, `ml.akhir` | tes literasi: `answers` (draf/terkirim), `startedAt`, `submittedAt`, `progressAtSubmit`, `scores` (per tahap), `scoredAt` (F17) |

Skor cek pemahaman (`m2.cek.result.correct`) nanti dikirim ke `module_progress.check_score` (wajib sebelum/bersama C15).

## 6. Model konten

Konten berupa JSON per modul di `src/content/`. Semua soal wajib lolos `python tools/check_content.py` (kunci dihitung ulang, ID tidak ganda).

### 6.1 Layar materi (`screens`)

```json
{
  "id": "M2-06",
  "text": ["Bandingkan kedua tabel."],
  "tables": [
    { "caption": "SENILAI ↑↑",
      "columns": [{ "label": "Buku", "arrow": "↑" }, { "label": "Harga", "arrow": "↑" }],
      "rows": [[2, 8000], [4, 16000]],
      "answer": { "jenis": "senilai", "tetap": "hasil bagi" } }
  ],
  "after": ["Jika yang satu bertambah, yang lain **bertambah** atau **berkurang**?"],
  "interaction": { "type": "label_tables", "prompt": "…", "constantQuestion": "…", "constantOptions": ["hasil bagi", "hasil kali"], "feedback": { "…": "…" } },
  "evidence": ["IL01", "K03", "DS02"]
}
```

`tables[].check` (`quotient`/`product`) menandai kolom ke-3 yang harus sama dengan hasil bagi/hasil kali; `interaction` dan `tables[].answer` hanya untuk layar berinteraksi (M2-06).

### 6.2 Soal 4 langkah (`items`, M3 dst.)

```json
{
  "id": "M3-L1",
  "phase": "latihan",
  "type": "senilai",
  "context": "barang-harga",
  "text": "Harga 4 kg beras Rp56.000. Berapa harga 7 kg beras yang sama?",
  "marks": { "relevant": ["4", "56.000", "7"], "distractors": [], "question": "Berapa harga 7 kg beras yang sama?" },
  "table": { "columns": ["Beras (kg)", "Harga (Rp)"], "rows": [[4, 56000], [7, null]] },
  "answer": 98000,
  "swappedAnswer": 32000,
  "hints": ["…", "…", "…"],
  "twin": { "text": "Harga 3 kg beras Rp42.000. …", "rows": [[3, 42000], [5, null]], "answer": 70000 }
}
```

- `phase`: `contoh` · `setengah` · `latihan` · `mandiri` · `akhir` (menentukan batas petunjuk, F08, dan gerbang DS02).
- `prefilled` (opsional, contoh setengah jadi): langkah yang sudah terisi, misal `["diketahui", "ditanya"]`.
- `marks` (wajib, F07): `relevant` + `distractors` = **semua** angka di `text` (angka = digit dengan pemisah titik/koma di tengah, misal `56.000`, `06.00`; `m²` bukan angka), dan `question` = satu kalimat utuh dari `text`. Aturan pemecah sama di `src/engine/marking.js` dan `tools/check_content.py`. `text` tidak memakai markah `**`/`[[ ]]` karena ditampilkan sebagai teks bertanda.
- `answer` disimpan, tetapi `check_content.py` (dan tes Vitest dengan `solver.js`) menghitung ulang untuk memastikan kunci benar.
- Soal kembar (F09) ditulis manual di `twin`, bukan dibangkitkan acak, agar isinya bisa diperiksa dosen.

### 6.3 Soal lain

| Jenis | Tempat | Bentuk |
|---|---|---|
| Diagnostik & cek pengingat | `m0.json` `items`, `reminders.<prasyarat>.check` | `{ id, skill, form: "pilihan"\|"isian", text, options?, answer, calc? }` |
| Latihan M1 | `m1.json` `quiz` | sama dengan di atas |
| Identifikasi jenis M2 | `m2.json` `identify`, `check`, `quick` | `{ id, text, a, b, condition, arah: "searah"\|"berlawanan", jenis: "senilai"\|"berbalik", hints }` + `passScore` |
| Jelaskan ke temanmu | `m2.json` `explain` | `{ id, prompt, cloze, expected, example, checklist }` |

### 6.4 Pemetaan ID soal ke modul

Sebagian besar ID diawali kode modul (`M1-L1`, `M3-L1`, `M0-P1-C`). **Dua kelompok tidak**; ID ini sengaja tidak diubah untuk saat ini:

| ID | Modul | Bagian | Tercatat di |
|---|---|---|---|
| `D1`–`D8` | M0 | Soal diagnostik | `diagnostic_results` (per prasyarat, bukan per soal) |
| `I1`–`I5` | **M2** | Latihan identifikasi (M2-08), `phase = 'latihan'` | `step_responses`, `hint_uses` (`step = 'jenis'`) |
| `C1`–`C5` | **M2** | Cek pemahaman (M2-09), `phase = 'cek'` | `step_responses`, `hint_uses` |
| `Q1`–`Q5` | **M2** | Cek cepat kelas VIII (M2-00), `phase = 'cek'` | `step_responses` |

Saat mengolah data, modul diturunkan dengan aturan: ID cocok `^[ICQ][0-9]+$` → `M2`; selain itu bagian sebelum `-` pertama. Contoh kueri ada di `api.md` §7.

## 7. Logika pemeriksaan (F04, F09)

Untuk tabel `a1 → b1`, `a2 → ?`:

- Senilai: `? = b1 × a2 / a1`
- Berbalik nilai: `? = a1 × b1 / a2`

Klasifikasi kesalahan berurutan (`src/engine/checker.js`):
1. Data tabel tidak sesuai → **salah ambil data**.
2. Langkah 3 salah → **salah jenis**.
3. Langkah 3 benar, bentuk hitungan salah, **atau** hasil = rumus jenis lain → **salah rumus**.
4. Jenis & bentuk benar, hasil salah → **salah hitung**.

Toleransi: hasil dibandingkan sebagai bilangan (titik ribuan diabaikan; desimal koma/titik diterima).

## 8. Login dengan kode siswa (F01) — *rencana, C5*

1. Peneliti membuat baris `students` (kode, kelas) di dashboard Supabase.
2. Aplikasi memanggil `signInAnonymously()` → mendapat `auth.uid()`.
3. Aplikasi memanggil RPC `claim_student_code(kode)` → mengikat `auth.uid()` ke siswa (tabel `student_devices`). Satu siswa boleh beberapa perangkat.
4. Semua tabel data memakai RLS: siswa hanya bisa menulis/membaca baris miliknya.
5. Sesi tersimpan di perangkat; siswa tidak perlu memasukkan kode lagi kecuali keluar.

Sampai langkah ini selesai, kelas dipilih di layar awal (versi pengembangan). Detail tabel dan fungsi: `api.md`.

## 9. Offline dan sinkronisasi (F15) — *sebagian*

- **Sudah:** setiap kejadian (jawaban per langkah, petunjuk, navigasi, hasil cek) dibuat dengan `client_event_id` (UUID) dan bentuk baris sama dengan tabel `api.md`, lalu masuk antrean di memori.
- **Rencana (C15):** antrean disimpan di IndexedDB lalu dikirim berkelompok; `client_event_id` unik di database sehingga pengiriman ulang tidak membuat data ganda.
- **Rencana (C17):** materi dan soal ikut ter-*cache* oleh service worker.
- Login pertama tetap butuh internet.

## 10. Keamanan dan privasi

- Tidak ada nama siswa di database maupun di repo; hanya kode dan kelas.
- Kode acak 8 karakter (tanpa huruf mirip seperti O/0, I/1).
- Kunci `anon` Supabase boleh ada di aplikasi; kunci `service_role` **tidak boleh** ada di repo atau aplikasi.
- Folder `referensi/` tidak ikut di-deploy dan dikecualikan dari git lewat `.gitignore` (transkrip memuat data pribadi).
- Persetujuan orang tua/wali dan siswa dikumpulkan di luar aplikasi sebelum uji coba.

## 11. Keputusan yang masih terbuka

| Keputusan | Pilihan | Status |
|---|---|---|
| UI tanpa framework vs Preact | Tanpa framework (JavaScript murni) | Diputuskan saat C1 |
| Region Supabase | Singapura (terdekat) | Saat membuat proyek Supabase |
| Repo publik atau privat | Disarankan privat selama penelitian | Sebelum commit pertama (repo git belum dibuat) |

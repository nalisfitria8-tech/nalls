# PRD — Nalls

**Product Requirements Document**
Materi: Perbandingan Senilai dan Berbalik Nilai
Tahap ADDIE: akhir *Analysis* → awal *Design*
Versi dokumen: 0.1 (draf untuk diperiksa) · 11 November 2026

> **Status data:** Semua kebutuhan di dokumen ini berasal dari **1 informan (S01)**. Pedoman wawancara mensyaratkan **minimal 2 siswa**. Karena itu, semua kebutuhan ditandai sebagai **temuan awal**, bukan kebutuhan seluruh siswa SMP. Pengembang memutuskan wawancara cukup S01 (`keputusan.md` KP-19); kebutuhan dikonfirmasi melalui validasi ahli dan uji coba (`evaluasi.md`).

---

## 1. Ringkasan produk

Nalls adalah aplikasi web responsif (nyaman dipakai di HP Android) untuk membantu siswa memahami **Perbandingan Senilai dan Berbalik Nilai**. Rancangan mengikuti **Cognitive Load Theory (CLT)**: materi dipecah kecil, tampil satu per satu, tabel diletakkan dekat teks, petunjuk diberikan bertahap, dan siswa mengatur tempo belajarnya sendiri.

Tujuan pembelajaran utama adalah **Mathematical Literacy**: siswa mampu
1. **merumuskan** situasi sehari-hari menjadi masalah perbandingan (Diketahui, Ditanya, jenis perbandingan),
2. **menggunakan** prosedur matematika untuk menghitung,
3. **menafsirkan** hasil kembali ke situasi nyata (cek kewajaran).

## 2. Pengguna

| Kelompok | Keterangan | Titik mulai |
|---|---|---|
| Siswa kelas VII | Belajar materi ini untuk pertama kali | Ditentukan diagnostik prasyarat; biasanya mulai Modul 1 |
| Siswa kelas VIII | Mengulang dan memperdalam materi kelas VII | Ditentukan diagnostik; boleh melewati Modul 1. Modul 2 wajib **dituntaskan** lewat salah satu jalur: lulus cek cepat (≥ 4/5, lalu boleh langsung ke Modul 3) atau mempelajari M2 sampai lulus cek pemahaman (lihat F03, KP-22) |
| Peneliti | Membuat kode siswa dan mengambil data | Lewat dashboard Supabase (tanpa halaman guru) |

**Mengapa informan kelas IX?** S01 diwawancarai karena sudah pernah mempelajari materi ini (di kelas VII), sehingga bisa mengingat kembali kesulitan dan bantuan yang dibutuhkan. Ini sesuai pedoman wawancara (informan = siswa yang sudah mengalami materi) dan arahan dosen.

**Konteks pemakaian:** HP Android layar kecil (lebar ±360 px), sinyal bisa tidak stabil, dipakai di kelas atau di rumah.

## 3. Sumber data dan verifikasi

- File asli: `referensi/wawancara alpo.docx` (nama file memakai **spasi**, bukan garis bawah).
- Informan: **S01**, kelas IX, wawancara 05 November 2026, mempelajari materi saat kelas VII.
- Kutipan di dokumen ini diambil dari **bagian E** file asli (jawaban siswa per kode pertanyaan).
- Nama siswa dan nama pewawancara **tidak** dicantumkan di repositori.

### 3.1 Perbedaan ringkasan (di prompt) dengan file asli

Dokumen ini mengikuti **file asli**. Perbedaan yang ditemukan:

| No | Bagian | Ringkasan di prompt | Isi file asli | Dampak pada desain |
|---|---|---|---|---|
| 1 | Nama file | `wawancara_alpo.docx` | `wawancara alpo.docx` (spasi) | Tidak ada; hanya penyebutan file. |
| 2 | K02 | Guru menjelaskan, memberi contoh, siswa mencatat dan latihan. | Ada tambahan: *"Kadang juga dibahas bareng-bareng."* | Ada pengalaman membahas bersama → mendukung F11 (jelaskan ke temanmu). |
| 3 | K03 | "Masih ragu menentukan jenis." | Siswa **masih ingat** soal jumlah barang dan harga; yang membingungkan adalah menentukan jenis, dan itu terjadi **"kadang"**. | Konteks barang–harga dipakai sebagai pintu masuk (F03, F06). |
| 4 | EL01 & EL04 | Digabung: tertinggal "terutama saat masuk ke soal cerita". | **EL01**: tertinggal saat "masuk ke **contoh soal berikutnya**". Bagian "soal cerita" dan "penjelasan ulang cara menentukan jenis" berasal dari **EL04**. EL04 juga menyebut *"kadang nggak ngerti langkah-langkahnya"*. | Kontrol tempo diperlukan di setiap perpindahan contoh, bukan hanya di soal cerita (F06). |
| 5 | EL05 | Strategi: menandai angka lalu mencari yang ditanya. | Ada tambahan: *"Kadang harus baca soalnya berulang kali supaya ngerti apa yang ditanyakan."* Strategi menandai muncul **setelah probing** "Bisakah kamu menandai informasi yang penting?" | Strategi menandai sebagian dipicu pertanyaan pewawancara → fitur penanda (F07) harus diuji, bukan dianggap pasti membantu. |
| 6 | GL02 | "Barang bertambah, harga juga bertambah." | Ada syarat: *"…kalau harganya sama."* (harga satuan tetap) | Cek kewajaran harus menyebut syarat "harga satuan sama" (F10). |
| 7 | GL04 | "Siswa menjadi lebih paham." | *"Kadang pas menjelaskan malah jadi lebih ngerti juga"*, terjadi *"kalau teman nanya"*. | Efek tidak selalu terjadi → F11 diuji sebagai hipotesis. |
| 8 | Bagian G file asli | — | Kutipan di tabel pencatatan (bagian G) **berbeda redaksi** dari bagian E, misalnya G-K03 *"Kadang masih bingung…"* vs E-K03 *"kadang masih suka bingung"*; G-EL04 *"Kalau terlalu cepat aku suka ketinggalan."* tidak persis sama dengan E. G juga mengodekan K03 sebagai IL. | Dokumen ini memakai **bagian E** sebagai kutipan verbatim. Disarankan menyamakan bagian G dengan transkrip. |
| 9 | Bagian G file asli | — | Isian "Durasi dan persetujuan rekaman" **masih kosong**. | Perlu dilengkapi untuk etika penelitian (lihat `task.md`). |
| 10 | Bagian A & I file asli | — | Pedoman wawancara dinyatakan **belum tervalidasi** (perlu validasi ahli dan uji keterbacaan). | Dicatat sebagai keterbatasan. |

Ringkasan lain (K01, IL01–IL05, EL02, EL03, GL01, GL03, GL05, DS01–DS03) **sesuai** dengan file asli.

### 3.2 Keterbatasan data

1. Baru 1 informan; pedoman meminta minimal 2 dan variasi kemampuan.
2. Data bersifat retrospektif (S01 mengingat pengalaman kelas VII dari posisi kelas IX).
3. Beberapa probing menawarkan pilihan jawaban (misalnya GL03: "petunjuk tahap demi tahap, contoh sejenis…"; DS01: "contoh visual, petunjuk, latihan bertahap…"; EL05: "Bisakah kamu menandai…?"). Jawaban yang mengikuti pilihan tersebut diberi bobot lebih hati-hati.
4. Pedoman wawancara belum divalidasi ahli.

---

## 4. Kutipan bukti (verbatim, bagian E)

| Kode | Kutipan S01 |
|---|---|
| K01 | "Kalau nggak salah waktu kelas 7. Awalnya dijelasin tentang perbandingan, terus dikasih contoh soal seperti harga barang sama jumlah barang. Menurut aku yang senilai lebih gampang dipahami." |
| K02 | "Biasanya guru menjelaskan di papan tulis, terus kasih contoh soal. Kami mencatat dan mengerjakan latihan di buku. Kadang juga dibahas bareng-bareng." |
| K03 | "Kalau soalnya tentang jumlah barang dan harga, aku masih ingat. Tapi kalau disuruh menentukan itu perbandingan senilai atau berbalik nilai, kadang masih suka bingung." |
| IL01 | "Yang paling susah menurut aku membedakan senilai sama berbalik nilai, soalnya sama-sama membandingkan dua hal." |
| IL02 | "Harus tahu dulu yang diketahui apa, terus ditanya apa. Setelah itu menentukan jenis perbandingannya dan baru menghitung. Kadang aku lupa menentukan jenis perbandingannya." |
| IL03 | "Harus paham perkalian, pembagian, pecahan, sama cara menghitung perbandingan. Kalau belum lancar hitung-hitungan biasanya jadi lebih lama." |
| IL04 | "Kalau soal cerita mulai susah, apalagi kalau kalimatnya panjang. Soalnya harus memahami dulu hubungan antara jumlah barang, harga, waktu, atau jumlah pekerja." |
| IL05 | "Biasanya salah menentukan rumus atau jenis perbandingannya. Kadang juga salah menghitung karena kurang teliti." |
| EL01 | "Pernah, kalau penjelasan guru terlalu cepat aku suka ketinggalan. Jadi walaupun awalnya paham, pas masuk ke contoh soal berikutnya malah bingung." |
| EL02 | "Kalau pakai tabel menurut aku lebih gampang, karena bisa langsung lihat perbandingannya. Kalau cuma tulisan panjang kadang harus baca berulang kali." |
| EL03 | "Kalau terlalu banyak tulisan atau warna yang macam-macam, aku malah susah fokus. Lebih suka tampilan yang sederhana." |
| EL04 | "Kalau gurunya menjelaskan terlalu cepat, aku suka ketinggalan dan kadang nggak ngerti langkah-langkahnya. Menurut aku lebih enak kalau dijelaskan dari contoh yang mudah dulu, baru dilanjutkan ke soal yang lebih sulit. Terus aku juga Pernah tertinggal, biasanya pas mulai masuk soal cerita. Aku perlu penjelasan ulang terutama cara menentukan jenis perbandingannya." |
| EL05 | "Biasanya aku bingung menentukan informasi mana yang penting dan mana yang nggak perlu dipakai. Kadang harus baca soalnya berulang kali supaya ngerti apa yang ditanyakan." · Setelah probing: "Bisa, biasanya aku tandai angka-angka yang ada di soal, terus aku cari bagian yang ditanyakan. Setelah itu baru mencoba mengerjakannya." |
| GL01 | "Kalau guru kasih contoh soal terus dijelaskan langkah-langkahnya, aku lebih paham. Apalagi kalau dikasih contoh yang berhubungan sama kehidupan sehari-hari." |
| GL02 | "Biasanya aku lihat lagi apakah hasilnya sesuai sama soal. Misalnya jumlah barang bertambah, berarti harganya juga harus bertambah kalau harganya sama." |
| GL03 | "Aku lebih suka dikasih petunjuk sedikit-sedikit dulu. Kalau langsung dikasih jawaban, aku malah nggak tahu cara mengerjakannya." |
| GL04 | "Pernah, biasanya kalau teman nanya. Aku coba jelasin pakai cara yang aku pahami. Kadang pas menjelaskan malah jadi lebih ngerti juga." |
| GL05 | "Aku lihat dulu apa yang diketahui dan ditanyakan. Terus aku cari tahu apakah cara mengerjakannya mirip dengan soal sebelumnya atau beda." |
| DS01 | "Menurut aku harus ada penjelasan yang gampang dimengerti, contoh soal beserta cara mengerjakannya, sama latihan soal. Kalau bisa ada gambar atau tabel juga." |
| DS02 | "Cara membedakan perbandingan senilai dan berbalik nilai harus dijelaskan pelan-pelan. Kalau sudah paham, baru dikasih latihan soal sendiri." |
| DS03 | "Jangan terlalu banyak tulisan dan animasi yang nggak penting. Terus jangan langsung muncul banyak soal sekaligus, lebih baik satu-satu saja." |

---

## 5. Kebutuhan siswa (temuan awal S01)

Setiap kebutuhan memiliki kode bukti. Tidak ada kebutuhan dari ringkasan yang dihilangkan.

| ID | Kebutuhan siswa | Kode bukti |
|---|---|---|
| N01 | Mulai dari konteks yang sudah dikenal (jumlah barang–harga) dan dari senilai yang dirasa lebih mudah. | K01, K03 |
| N02 | Pola belajar yang sudah dikenal: penjelasan → contoh soal → latihan, dengan kesempatan membahas bersama. | K02 |
| N03 | Bantuan khusus untuk membedakan senilai dan berbalik nilai, dijelaskan pelan-pelan dan bisa diulang. | K03, IL01, EL04, DS02 |
| N04 | Urutan langkah tetap (diketahui → ditanya → jenis → hitung) dan langkah menentukan jenis tidak boleh terlupa. | IL02 |
| N05 | Prasyarat lancar: perkalian, pembagian, pecahan, dan menghitung perbandingan. | IL03 |
| N06 | Bantuan memahami hubungan besaran (barang, harga, waktu, pekerja) pada soal cerita yang kalimatnya panjang. | IL04 |
| N07 | Umpan balik yang membedakan salah jenis, salah rumus, dan salah hitung karena kurang teliti. | IL05 |
| N08 | Tempo diatur siswa; bisa mengulang penjelasan, terutama saat pindah ke contoh berikutnya dan saat mulai soal cerita. | EL01, EL04 |
| N09 | Tabel sebagai penyajian utama; tulisan panjang dihindari. | EL02, DS01 |
| N10 | Tampilan sederhana: sedikit tulisan, warna terbatas, tanpa animasi yang tidak penting. | EL03, DS03 |
| N11 | Urutan materi dari contoh mudah ke soal yang lebih sulit (soal cerita). | EL04, IL04 |
| N12 | Cara memilah informasi penting pada soal cerita (menandai angka dan bagian yang ditanya). | EL05 |
| N13 | Contoh soal dengan langkah yang dijelaskan, terkait kehidupan sehari-hari. | GL01, DS01 |
| N14 | Kebiasaan memeriksa kewajaran jawaban dengan nalar (dengan syarat yang tepat, misal harga satuan sama). | GL02 |
| N15 | Petunjuk sedikit demi sedikit, bukan langsung jawaban. | GL03 |
| N16 | Kesempatan menjelaskan cara dengan kata-kata sendiri. | GL04, K02 |
| N17 | Latihan transfer: mengenali diketahui/ditanya lalu membandingkan dengan soal sebelumnya (mirip atau beda). | GL05 |
| N18 | Penjelasan yang mudah dimengerti, contoh soal beserta caranya, latihan soal, gambar atau tabel. | DS01 |
| N19 | Latihan mandiri diberikan **setelah** paham. | DS02 |
| N20 | Soal ditampilkan satu per satu. | DS03 |

---

## 6. Analisis beban kognitif

Kolom: **Bukti (kode + kutipan)** | **Interpretasi** | **Keputusan desain** | **Cara menguji fitur**.
Interpretasi bersifat sementara (1 informan).

### 6.1 Konteks (K)

| Bukti | Interpretasi | Keputusan desain | Cara menguji |
|---|---|---|---|
| K01: "…contoh soal seperti harga barang sama jumlah barang. Menurut aku yang senilai lebih gampang dipahami." | Konteks barang–harga sudah menjadi skema yang dikenal; senilai lebih mudah daripada berbalik nilai. | Contoh pertama selalu barang–harga (senilai). Berbalik nilai diperkenalkan sesudahnya. | Bandingkan ketepatan siswa pada soal senilai vs berbalik nilai di Modul 2; catat waktu per layar. |
| K02: "…guru menjelaskan di papan tulis, terus kasih contoh soal… Kadang juga dibahas bareng-bareng." | Pola penjelasan → contoh → latihan sudah familier. | Struktur setiap modul: penjelasan singkat → contoh berlangkah → latihan. Aktivitas "jelaskan ke temanmu" menggantikan pembahasan bersama. | Wawancara singkat setelah uji coba: apakah urutan terasa jelas? |
| K03: "…kalau disuruh menentukan itu perbandingan senilai atau berbalik nilai, kadang masih suka bingung." | Bahkan di kelas IX, membedakan jenis masih menjadi titik lemah. | Modul 2 wajib untuk kelas VII dan VIII. | Skor soal identifikasi jenis sebelum dan sesudah Modul 2. |

### 6.2 Intrinsic load (IL) — kerumitan materi itu sendiri

| Bukti | Interpretasi | Keputusan desain | Cara menguji |
|---|---|---|---|
| IL01: "Yang paling susah… membedakan senilai sama berbalik nilai, soalnya sama-sama membandingkan dua hal." | Kedua konsep tampak mirip di permukaan (dua besaran); pembedanya (arah perubahan) belum menjadi skema. | Modul khusus "Senilai atau Berbalik Nilai?" dengan tabel berdampingan dan satu pertanyaan kunci: *"Jika yang satu bertambah, yang lain bertambah atau berkurang?"* | 5 soal identifikasi tanpa hitung; siswa menyebut alasan. |
| IL02: "…Setelah itu menentukan jenis perbandingannya dan baru menghitung. Kadang aku lupa menentukan jenis perbandingannya." | Banyak unsur harus diproses bersamaan; langkah jenis mudah terlewat. | Alur 4 langkah tetap, satu langkah per layar. Langkah 3 (jenis) wajib diisi sebelum Langkah 4 terbuka. | Log: persentase soal di mana Langkah 3 dijawab benar pada percobaan pertama. |
| IL03: "Harus paham perkalian, pembagian, pecahan, sama cara menghitung perbandingan. Kalau belum lancar… jadi lebih lama." | Prasyarat yang lemah menambah beban saat menghitung. | Diagnostik prasyarat singkat di awal + materi pengingat per prasyarat. | Bandingkan waktu dan ketepatan Langkah 4 antara siswa yang lancar dan yang mendapat pengingat. |
| IL04: "Kalau soal cerita mulai susah, apalagi kalau kalimatnya panjang… hubungan antara jumlah barang, harga, waktu, atau jumlah pekerja." | Interaktivitas unsur naik pada soal cerita: harus membaca, memilih data, dan memahami hubungan besaran. | Urutan bertahap: soal angka/tabel → soal cerita pendek → soal cerita panjang. Data cerita dipindahkan ke tabel. | Ketepatan per tingkat kesulitan; titik di mana siswa paling sering memakai petunjuk. |
| IL05: "Biasanya salah menentukan rumus atau jenis perbandingannya. Kadang juga salah menghitung karena kurang teliti." | Ada tiga sumber kesalahan berbeda yang butuh bantuan berbeda. | Pembahasan kesalahan dibedakan: salah jenis, salah rumus, salah hitung. | Apakah siswa memperbaiki jawaban setelah membaca pembahasan yang sesuai jenis kesalahannya? |

### 6.3 Extraneous load (EL) — beban dari cara penyajian

| Bukti | Interpretasi | Keputusan desain | Cara menguji |
|---|---|---|---|
| EL01: "…kalau penjelasan guru terlalu cepat aku suka ketinggalan… pas masuk ke contoh soal berikutnya malah bingung." | Tempo dari luar (guru) tidak sesuai kecepatan siswa. | Tempo dikendalikan siswa: tombol **Lanjut**, **Kembali**, **Ulangi penjelasan**. Tidak ada perpindahan otomatis. | Log pemakaian tombol ulangi/kembali; wawancara: "Apakah kamu tertinggal?" |
| EL02: "Kalau pakai tabel… lebih gampang, karena bisa langsung lihat perbandingannya. Kalau cuma tulisan panjang kadang harus baca berulang kali." | Tabel membuat hubungan terlihat sekaligus; teks panjang memaksa membaca ulang. | Tabel hubungan dua besaran menjadi representasi utama di semua modul; teks maksimal ±40 kata per layar. | Siswa diminta membaca hubungan dari tabel ("jika… maka…"); hitung berapa kali siswa menggulir/kembali. |
| EL03: "Kalau terlalu banyak tulisan atau warna yang macam-macam, aku malah susah fokus. Lebih suka tampilan yang sederhana." | Hiasan visual dan teks berlebih memecah perhatian. | Palet terbatas (lihat `design.md`), satu fokus per layar, tanpa animasi dekoratif. | Wawancara kejelasan tampilan; checklist desain (jumlah warna, jumlah kata). |
| EL04: "…lebih enak kalau dijelaskan dari contoh yang mudah dulu… Pernah tertinggal, biasanya pas mulai masuk soal cerita. Aku perlu penjelasan ulang terutama cara menentukan jenis perbandingannya." | Lompatan kesulitan ke soal cerita terlalu besar; penjelasan jenis perlu bisa diakses ulang. | Urutan mudah → sulit; tombol **"Ingat lagi: cara menentukan jenis"** selalu tersedia di Langkah 3. | Frekuensi pemakaian tombol "Ingat lagi"; ketepatan pada soal cerita pertama. |
| EL05: "…bingung menentukan informasi mana yang penting… Kadang harus baca soalnya berulang kali…" · "…aku tandai angka-angka… terus aku cari bagian yang ditanyakan." | Mencari informasi penting di teks panjang menambah beban; siswa sudah punya strategi menandai (sebagian dipicu probing). | Fitur tandai: ketuk angka → masuk ke tabel Diketahui; ketuk kalimat tanya → menjadi Ditanya. | Amati apakah siswa menemukan data yang benar tanpa petunjuk; bandingkan dengan soal tanpa fitur tandai. |

### 6.4 Germane load (GL) — usaha yang membangun pemahaman

| Bukti | Interpretasi | Keputusan desain | Cara menguji |
|---|---|---|---|
| GL01: "Kalau guru kasih contoh soal terus dijelaskan langkah-langkahnya, aku lebih paham. Apalagi… kehidupan sehari-hari." | Contoh berlangkah (*worked example*) membantu membentuk skema. | Setiap modul dimulai dengan contoh berlangkah berkonteks sehari-hari, lalu contoh setengah jadi (*completion problem*). | Ketepatan latihan setelah contoh berlangkah. |
| GL02: "…jumlah barang bertambah, berarti harganya juga harus bertambah kalau harganya sama." | Siswa sudah memakai penalaran arah perubahan untuk mengecek jawaban. | Setelah menghitung, siswa menjawab "Apakah hasilnya masuk akal?" dengan menyebut arah perubahan dan syaratnya. | Persentase jawaban tidak wajar yang diperbaiki sendiri setelah cek kewajaran. |
| GL03: "Aku lebih suka dikasih petunjuk sedikit-sedikit dulu. Kalau langsung dikasih jawaban, aku malah nggak tahu cara mengerjakannya." | Bantuan bertahap mendukung kemandirian; jawaban langsung menghentikan proses berpikir. | Petunjuk 3 tingkat (pertanyaan pemantik → strategi → langkah sebagian), dikurangi bertahap antar fase. | Jumlah petunjuk per soal menurun dari fase contoh ke fase mandiri. |
| GL04: "…kalau teman nanya. Aku coba jelasin pakai cara yang aku pahami. Kadang pas menjelaskan malah jadi lebih ngerti juga." | Menjelaskan (*self-explanation*) membantu pemahaman, walau tidak selalu. | Aktivitas "Jelaskan ke temanmu" di akhir Modul 2–5, dengan kalimat rumpang. | Nilai rubrik penjelasan; bandingkan ketepatan soal sesudahnya. |
| GL05: "Aku lihat dulu apa yang diketahui dan ditanyakan. Terus aku cari tahu apakah cara mengerjakannya mirip dengan soal sebelumnya atau beda." | Siswa melakukan transfer dengan membandingkan struktur soal. | Latihan variasi konteks + pertanyaan "Mirip atau beda dengan soal sebelumnya?" dengan dua soal berdampingan. | Ketepatan pada konteks yang belum pernah muncul. |

### 6.5 Rekomendasi siswa (DS)

| Bukti | Interpretasi | Keputusan desain | Cara menguji |
|---|---|---|---|
| DS01: "…penjelasan yang gampang dimengerti, contoh soal beserta cara mengerjakannya, sama latihan soal. Kalau bisa ada gambar atau tabel juga." | Kebutuhan inti: penjelasan sederhana, contoh, latihan, visual. | Tiga komponen di setiap modul; tabel di semua modul; ilustrasi 3D hanya jika menunjukkan hubungan besaran. | Wawancara pascauji: komponen mana yang paling membantu. |
| DS02: "Cara membedakan… harus dijelaskan pelan-pelan. Kalau sudah paham, baru dikasih latihan soal sendiri." | Latihan mandiri dibuka setelah pemahaman tercapai. | Latihan mandiri terbuka setelah siswa lulus cek pemahaman Modul 2. | Log: siswa yang masuk latihan mandiri telah lulus cek. |
| DS03: "Jangan terlalu banyak tulisan dan animasi yang nggak penting… lebih baik satu-satu saja." | Banyak soal sekaligus dan animasi dekoratif menambah beban. | Satu soal per layar; tanpa animasi dekoratif. | Checklist desain; wawancara kejelasan. |

---

## 7. Tabel kebutuhan → kode bukti → fitur

| Kebutuhan | Kode bukti | Fitur |
|---|---|---|
| N01 | K01, K03 | F03, F06 |
| N02 | K02 | F06, F11 |
| N03 | K03, IL01, EL04, DS02 | F03, F04 (tombol "Ingat lagi") |
| N04 | IL02 | F04 |
| N05 | IL03 | F02 |
| N06 | IL04 | F05, F06, F07, F14 |
| N07 | IL05 | F09 |
| N08 | EL01, EL04 | F06 |
| N09 | EL02, DS01 | F05 |
| N10 | EL03, DS03 | F16, F14 (batasan) |
| N11 | EL04, IL04 | F06, F12 |
| N12 | EL05 | F07 |
| N13 | GL01, DS01 | F06 (contoh berlangkah) |
| N14 | GL02 | F10 |
| N15 | GL03 | F08 |
| N16 | GL04, K02 | F11 |
| N17 | GL05 | F12 |
| N18 | DS01 | F05, F06, F12, F14 |
| N19 | DS02 | F03 (cek pemahaman), F12 |
| N20 | DS03 | F13 |

F15, F17, dan F18 adalah fitur pendukung tanpa kebutuhan N dari wawancara (alasan di §8).

---

## 8. Spesifikasi fitur

Prioritas: **W** = wajib (MVP), **S** = sebaiknya, **O** = opsional.
Setiap fitur memuat: kode bukti, rasional CLT, perilaku yang diharapkan, dan indikator uji. Target angka pada indikator adalah **target sementara** untuk uji coba kecil, akan ditetapkan bersama dosen.

### F01 — Masuk dengan kode siswa · W · *fitur pendukung (bukan dari wawancara)*
- **Kode bukti:** tidak ada; kebutuhan teknis penelitian (identitas anonim, data per siswa).
- **Deskripsi:** siswa mengetik kode (misal `M7A-K3P9`). Kode dibuat peneliti di Supabase. Tidak ada nama.
- **Rasional:** masuk harus cepat agar tidak menambah beban sebelum belajar dimulai.
- **Perilaku diharapkan:** siswa masuk dalam satu layar, satu isian.
- **Indikator uji:** ≥ 90% siswa berhasil masuk tanpa bantuan dalam < 1 menit.

### F02 — Diagnostik prasyarat + pengingat · W
- **Kode bukti:** IL03.
- **Deskripsi:** 8 soal singkat (2 per prasyarat: perkalian, pembagian, pecahan, perbandingan sederhana), satu per layar, tanpa batas waktu ketat. Jika salah ≥ 1 pada satu prasyarat → tampilkan **kartu pengingat** prasyarat tersebut (1–3 layar, contoh + 1 soal cek). Hasil diagnostik juga menentukan **titik mulai**: kelas VII dan siswa yang belum lancar perbandingan mulai Modul 1; kelas VIII yang lancar boleh mulai Modul 2.
- **Rasional CLT:** mengurangi intrinsic load saat menghitung dengan memastikan elemen prasyarat sudah otomatis; siswa yang sudah lancar tidak dipaksa mengulang (menghindari *expertise reversal*).
- **Perilaku diharapkan:** siswa mengerjakan diagnostik, membaca pengingat yang relevan saja, lalu masuk modul.
- **Indikator uji:** waktu diagnostik ≤ 7 menit; siswa yang mendapat pengingat menjawab benar soal cek pengingat ≥ 70%.

### F03 — Modul "Senilai atau Berbalik Nilai?" · W
- **Kode bukti:** IL01, K03, DS02, EL04, K01.
- **Deskripsi:** dijelaskan pelan-pelan dalam layar-layar kecil:
  1. Senilai dengan barang–harga (tabel, harga satuan sama).
  2. Berbalik nilai dengan pekerja–waktu (tabel, pekerjaan sama).
  3. **Berdampingan:** dua tabel kecil sejajar + pertanyaan kunci *"Jika yang satu bertambah, yang lain bertambah atau berkurang?"* dan cek *"Yang tetap: hasil bagi atau hasil kali?"* Siswa mengetuk jenis di bawah tiap tabel, lalu menjawab yang tetap untuk tabel itu (KP-24).
  4. Latihan identifikasi **tanpa menghitung** (5 soal, satu per layar).
  5. Cek pemahaman (5 soal). Lulus jika ≥ 4 benar → latihan mandiri terbuka (DS02).
  - Kelas VIII mendapat tawaran **cek cepat** di awal; jika ≥ 4/5 benar boleh lanjut ke Modul 3, tetapi tetap bisa membuka penjelasan.
  - **Gerbang DS02:** semua soal fase *mandiri* (M3, M4, M5) terkunci sampai siswa lulus cek pemahaman M2 **atau** lulus cek cepat kelas VIII. Siswa kelas VIII yang lulus cek cepat boleh langsung membuka latihan mandiri (KP-22, disetujui; kesetaraan kedua cek diuji saat uji coba). Jika belum lulus, layar menampilkan alasan dan tombol ke Modul 2.
  - **Percobaan cek:** jawaban pertama tiap soal dikunci (tidak bisa diubah lewat Kembali/muat ulang); hasil dicatat sekali per percobaan; percobaan ulang cek pemahaman setelah mengulang dari M2-06 (KP-25).
- **Rasional CLT:** memisahkan elemen "menentukan jenis" dari "menghitung" (isolated elements) menurunkan interaktivitas unsur; perbandingan berdampingan mengurangi split-attention.
- **Perilaku diharapkan:** siswa menyebut jenis + alasan arah perubahan sebelum menghitung.
- **Indikator uji:** ketepatan identifikasi jenis naik dari awal ke akhir modul; ≥ 80% siswa lulus cek pemahaman (≤ 2 kali percobaan).
- **Data:** `step_responses` (`step = 'jenis'`, fase `latihan`/`cek`), kejadian `screen_check` (M2-06), `check_result` (memuat nomor percobaan), `skip_module`, `gate_locked` (`api.md` §5).

### F04 — Alur penyelesaian 4 langkah tetap · W
- **Kode bukti:** IL02, IL05, EL04.
- **Deskripsi:** setiap soal dikerjakan lewat 4 langkah, satu langkah per layar, dengan indikator langkah (1–2–3–4):
  1. **Diketahui** — isi tabel dari data soal (bisa dari fitur tandai F07).
  2. **Ditanya** — pilih/isi besaran yang dicari (sel `?` di tabel).
  3. **Tentukan jenis perbandingan** — pilih *Senilai* / *Berbalik nilai* + alasan (pilih arah: "bertambah–bertambah" / "bertambah–berkurang"). **Langkah ini tidak bisa dilewati**; Langkah 4 terkunci sampai Langkah 3 benar (dengan bantuan F08 jika perlu). Tombol **"Ingat lagi: cara menentukan jenis"** selalu ada.
  4. **Hitung** — pilih bentuk perhitungan (hasil bagi sama / hasil kali sama), isi angka, lalu hasil. Diakhiri cek kewajaran (F10).
- **Rasional CLT:** segmentasi mengurangi elemen yang diproses bersamaan; urutan tetap membentuk skema prosedural.
- **Perilaku diharapkan:** siswa tidak lagi melompat ke menghitung.
- **Indikator uji:** 100% soal tercatat memiliki jawaban Langkah 3 (otomatis oleh sistem); ketepatan Langkah 3 percobaan pertama naik dari Modul 3 ke Modul 5.

### F05 — Penyajian berbasis tabel · W
- **Kode bukti:** EL02, DS01, IL04.
- **Deskripsi:** tabel 2 kolom (besaran A | besaran B) × 2–4 baris, dengan panah arah perubahan di samping kolom (↑/↓). Tabel diletakkan **tepat di bawah** teks yang membahasnya (tanpa menggulir).
- **Rasional CLT:** hubungan terlihat sekaligus (mengurangi pencarian visual); teks dan tabel berdekatan menghindari split-attention.
- **Perilaku diharapkan:** siswa membaca hubungan dari tabel, bukan dari kalimat panjang.
- **Indikator uji:** siswa bisa menyatakan hubungan "jika… maka…" dari tabel (≥ 80% benar pada soal baca tabel).

### F06 — Materi bertahap + kontrol tempo · W
- **Kode bukti:** EL01, EL04, IL04, GL01, K01, K02.
- **Deskripsi:**
  - Urutan modul: M1 → M2 → M3 → M4 → M5 → M6 (lihat bagian 9).
  - Di dalam modul: contoh berlangkah → contoh setengah jadi → latihan → soal cerita pendek → soal cerita panjang.
  - Tombol **Kembali**, **Ulangi penjelasan**, **Lanjut** di setiap layar materi. Tidak ada perpindahan otomatis atau penghitung waktu.
- **Rasional CLT:** *worked example effect* dan *segmenting/learner pacing* mengurangi extraneous load; urutan mudah→sulit menjaga intrinsic load tetap terkelola.
- **Perilaku diharapkan:** siswa memakai "Ulangi" ketika bingung, bukan menebak.
- **Indikator uji:** log pemakaian Ulangi/Kembali; wawancara: siswa tidak merasa tertinggal.

### F07 — Tandai informasi penting · W
- **Kode bukti:** EL05, IL04.
- **Deskripsi:** pada soal cerita, siswa mengetuk angka (berwarna penanda angka) dan kalimat yang ditanya (penanda tanya). Angka yang ditandai muncul di tabel Diketahui untuk diberi label besaran. Bisa dibatalkan dengan ketuk ulang.
- **Rasional CLT:** memindahkan informasi dari teks panjang ke tabel mengurangi beban menyimpan data di ingatan kerja.
- **Perilaku diharapkan:** siswa menandai angka relevan, mengabaikan angka pengecoh.
- **Indikator uji:** ≥ 80% data di tabel Diketahui benar; angka pengecoh jarang dipilih. Karena strategi ini sebagian dipicu probing, bandingkan juga dengan kondisi tanpa fitur.
- **Penerapan (C12, KP-26):** di Langkah 1 setiap angka di teks soal bisa diketuk (kotak ≥ 48 px). Setelah diketuk, siswa memilih kolom tabel ("56.000 masuk ke kolom… [Beras (kg)] [Harga (Rp)]") dan angka masuk ke sel kosong pertama kolom itu. Mengetuk bagian lain sebuah kalimat menandai seluruh kalimat sebagai yang ditanya. Menandai tidak wajib: sel tetap bisa diketik. Tanda tetap terlihat (tidak bisa diketuk) di Langkah 2–4. Tanda kalimat tidak dinilai.
- **Data:** `step_responses` (`step = 'diketahui'`, `error_type = 'ambil_data'`), kejadian `mark_toggle` dan `mark_place` (`api.md` §5). Setiap angka di teks soal wajib tergolong relevan atau pengecoh (`check_content.py`), sehingga "pengecoh dipilih" bisa dihitung.
- **Belum ada:** kondisi pembanding tanpa fitur (lihat PT-07).

### F08 — Petunjuk bertingkat dan dikurangi bertahap · W
- **Kode bukti:** GL03.
- **Deskripsi:** tombol **Petunjuk** membuka satu tingkat setiap kali ditekan:
  - **T1 — pertanyaan pemantik** ("Jika pekerja ditambah, pekerjaan selesai lebih cepat atau lambat?")
  - **T2 — strategi** ("Pada berbalik nilai, hasil kali kedua besaran tetap.")
  - **T3 — langkah sebagian** ("6 × 10 = 4 × ?")
  - Jawaban akhir **tidak** ditampilkan oleh petunjuk. Setelah 2 kali salah dengan T3, tampil **pembahasan** (F09) lalu **soal kembar** dengan angka lain.
  - *Fading:* fase contoh → petunjuk muncul otomatis; fase latihan → petunjuk atas permintaan; fase mandiri → maksimal T2; uji akhir (M6) → tanpa petunjuk.
- **Rasional CLT:** bantuan sementara (*scaffolding*) dikurangi sejalan meningkatnya skema (*guidance fading*).
- **Perilaku diharapkan:** siswa mencoba dulu, meminta petunjuk seperlunya.
- **Indikator uji:** rata-rata tingkat petunjuk per soal menurun dari M3 ke M5.

### F09 — Pembahasan sesuai jenis kesalahan · W
- **Kode bukti:** IL05.
- **Deskripsi:** sistem mengenali jenis kesalahan dari jawaban per langkah:
  | Jenis | Cara mengenali | Pembahasan |
  |---|---|---|
  | Salah jenis | Langkah 3 salah | Kembali ke pertanyaan kunci arah perubahan + tabel |
  | Salah rumus | Langkah 3 benar, tetapi bentuk perhitungan di Langkah 4 salah (atau hasil sama dengan hasil rumus jenis lain) | Tunjukkan "senilai → hasil bagi sama; berbalik → hasil kali sama" pada tabel soal itu |
  | Salah hitung | Jenis dan bentuk benar, hasil salah | Tunjukkan baris hitungan; ajak periksa perkalian/pembagian; tautan ke pengingat prasyarat (F02) |
  | Salah ambil data | Tabel Diketahui tidak sesuai soal | Ajak tandai ulang angka (F07) |
- **Rasional CLT:** umpan balik yang tepat sasaran mengurangi pencarian sebab kesalahan (extraneous) dan memperbaiki skema yang salah.
- **Perilaku diharapkan:** siswa memperbaiki bagian yang salah saja.
- **Indikator uji:** ≥ 60% kesalahan diperbaiki pada percobaan berikutnya; distribusi jenis kesalahan tercatat untuk evaluasi.

### F10 — Cek kewajaran jawaban · W
- **Kode bukti:** GL02.
- **Deskripsi:** setelah Langkah 4, layar kecil: *"Apakah hasilnya masuk akal?"* Siswa memilih: "Barang bertambah → harga ___ (bertambah/berkurang)" dan "Jawabanku ___ (lebih besar/lebih kecil) dari data awal." Ditampilkan syaratnya, misal *"harga satuan sama"*, *"pekerjaan sama"*. Jika pilihan siswa bertentangan dengan jawabannya → diminta memeriksa lagi.
- **Rasional CLT:** refleksi menambah germane processing dan menghubungkan hasil ke situasi nyata (menafsirkan dalam Mathematical Literacy).
- **Perilaku diharapkan:** siswa menangkap jawaban yang arahnya salah.
- **Indikator uji:** proporsi jawaban tidak wajar yang diperbaiki setelah cek.

### F11 — Jelaskan ke temanmu · S
- **Kode bukti:** GL04, K02.
- **Deskripsi:** di akhir M2–M5: *"Temanmu bertanya: bagaimana tahu soal ini senilai atau berbalik nilai?"* Siswa melengkapi kalimat rumpang ("Soal ini ___ karena jika ___ bertambah, ___ …") atau menulis bebas maks. 3 kalimat. Lalu membandingkan dengan contoh penjelasan + daftar cek 3 poin. Teks disimpan untuk peneliti.
- **Rasional CLT:** *self-explanation* mendorong pengolahan yang membangun skema; kalimat rumpang menjaga beban menulis tetap rendah.
- **Perilaku diharapkan:** siswa menyebut arah perubahan dan hal yang tetap.
- **Indikator uji:** skor rubrik 0–3 (jenis benar, arah perubahan, hal yang tetap); tren skor M2 → M5.

### F12 — Latihan variasi konteks + bandingkan soal sebelumnya · W
- **Kode bukti:** GL05, IL04, DS02, DS01.
- **Deskripsi:** latihan dengan konteks bervariasi:
  - Senilai: barang–harga, bensin–jarak, bahan–hasil resep, waktu–jarak (kecepatan tetap).
  - Berbalik nilai: pekerja–waktu, hewan ternak–lama persediaan makanan, kecepatan–waktu tempuh, banyak anak–bagian per anak.
  Setelah menyelesaikan satu soal, muncul soal sebelumnya (ringkas) di atas soal baru: *"Mirip atau beda caranya?"* Latihan mandiri baru terbuka setelah lulus cek M2 (DS02).
- **Rasional CLT:** variabilitas contoh membantu skema yang dapat ditransfer; membandingkan struktur mendorong abstraksi.
- **Perilaku diharapkan:** siswa mengenali struktur yang sama di konteks berbeda.
- **Indikator uji:** ketepatan pada konteks baru (belum pernah dilihat) ≥ 70%.

### F13 — Soal tampil satu per satu · W
- **Kode bukti:** DS03.
- **Deskripsi:** satu soal per layar; indikator "Soal 2 dari 5". Tidak ada daftar soal panjang.
- **Rasional CLT:** mengurangi informasi yang bersaing di layar.
- **Indikator uji:** checklist desain; wawancara kejelasan.

### F14 — Ilustrasi 3D terbatas (Three.js) · O
- **Kode bukti:** DS01 ("gambar"), IL04 (hubungan besaran); dibatasi oleh EL03 dan DS03.
- **Deskripsi:** hanya 2 ilustrasi, keduanya di M2, keduanya menunjukkan **hubungan besaran**:
  1. **Senilai — tumpukan barang:** banyak kotak barang dan tinggi tumpukan uang naik bersama (penggeser jumlah barang).
  2. **Berbalik nilai — balok pekerjaan tetap:** balok dengan volume tetap; penggeser "pekerja" melebarkan balok dan "hari" otomatis memendek.
  Diam (tidak bergerak sendiri), berubah hanya saat siswa menggeser. Tabel di bawahnya ikut berubah. Jika perangkat lemah/tanpa WebGL → versi 2D (SVG). Bisa disembunyikan.
- **Rasional CLT:** visual dinamis yang dikendalikan siswa dapat memperjelas hubungan; tanpa kendali dan tanpa fungsi, visual menjadi *seductive detail*.
- **Perilaku diharapkan:** siswa menggeser dan mengamati tabel berubah.
- **Indikator uji:** bandingkan ketepatan identifikasi jenis antara kelompok/sesi dengan 3D dan versi 2D; jika tidak ada manfaat, fitur dihapus.

### F15 — Pencatatan data belajar · W · *fitur pendukung (penelitian)*
- **Kode bukti:** tidak ada; kebutuhan tahap Evaluation ADDIE.
- **Deskripsi:** mencatat jawaban per langkah, jenis kesalahan, petunjuk yang dipakai, waktu, pemakaian Ulangi/Kembali, dan teks "jelaskan ke temanmu". Antrean offline jika sinyal putus. Detail di `api.md`.
- **Indikator uji:** ≥ 99% kejadian tercatat di Supabase setelah sinkron (cek dengan sesi uji).

### F16 — Tampilan sederhana dan ramah Android · W
- **Kode bukti:** EL03, DS03, EL02.
- **Deskripsi:** lebar dasar 360 px, satu kolom, tombol ≥ 48 px, huruf ≥ 16 px, palet terbatas, ukuran unduhan awal kecil. Detail di `design.md`.
- **Indikator uji:** halaman awal termuat < 3 detik di jaringan 3G cepat; Lighthouse aksesibilitas ≥ 90.

### F17 — Tes Mathematical Literacy (tes awal & tes akhir) · W · *fitur pendukung (evaluasi), bukan dari wawancara*
- **Alasan:** tugas dosen pengampu — menguji apakah Nalls meningkatkan literasi matematis siswa (tujuan produk §1). Tidak ada kode bukti wawancara; fitur ini alat ukur, bukan bantuan belajar.
- **Sumber soal:** "Tabel 2. Soal dan Kisi-kisi Jawaban Mathematical Literacy" (dokumen tugas pengembang, 12 Nov 2026): 4 soal, 4 indikator (Mathematical Reasoning; Formulating Situations Mathematically; Employing Mathematical Concepts, Facts, and Procedures; Interpreting, Applying, and Evaluating Mathematical Outcomes), rubrik per tahap, maks. 6 per soal, total 24. Teks soal dan rubrik disalin tanpa perubahan ke `src/content/ml-test.json`.
- **Deskripsi:** soal yang sama dikerjakan sebagai **tes awal** (sebelum belajar) dan **tes akhir** (sesudah belajar). Satu soal per layar, jawaban **bebas** (siswa menulis langkah dan alasan), draf tersimpan otomatis, tanpa batas waktu. Setelah dikirim, jawaban terkunci. Guru/peneliti menilai di layar penilai: skor tiap tahap rubrik 0 sampai skor maksimum tahap itu. Siswa melihat skor total dan per kemampuan, **tanpa** kunci jawaban (agar tes akhir tetap sahih). Hasil diunduh sebagai CSV (rinci dan ringkasan + N-gain). Keputusan: KP-27–KP-30.
- **Rasional CLT:** bukan fitur belajar; dipisah dari modul agar tidak menambah beban saat belajar. Tetap mengikuti aturan tampilan: satu soal per layar, tanpa penghitung waktu, tombol ≥ 48 px. Teks soal dari dokumen dosen bisa lebih dari ±40 kata (pengecualian; tidak diubah).
- **Perilaku diharapkan:** siswa mengerjakan tes awal sebelum M0 dan tes akhir setelah menyelesaikan modul; guru menilai keempat soal tiap fase.
- **Indikator uji:** skor tes akhir > tes awal; N-gain per siswa dan rata-rata kelompok; perubahan skor per indikator (`evaluasi.md` §9).
- **Data:** di perangkat (`store.ml`) + CSV; kejadian `ml_start`, `ml_submit`, `ml_score` (`api.md` §5). Belum ada tabel Supabase (KP-29).

### F18 — Tanya Nalls (chatbot pendamping belajar) · S · *fitur pendukung, bukan dari wawancara*
- **Alasan:** permintaan pemilik proyek (rencana Nalls, 18 Nov 2026). Tidak ada kode bukti wawancara; fitur ini **tambahan** untuk Petunjuk bertingkat (F08), bukan pengganti.
- **Deskripsi:** di layar soal 4 langkah **fase terbimbing** M3–M4 (contoh, setengah, latihan) ada tombol **Tanya Nalls**. Siswa menulis pertanyaan (≤ 200 huruf); Nalls membalas satu langkah, ±40 kata, diakhiri satu pertanyaan balik, **tanpa jawaban akhir**. Tidak muncul di latihan mandiri, soal kembar, tes awal/akhir, diagnostik, atau cek M2. Jatah 4 pertanyaan per perangkat per hari (KP-33). Jika layanan AI mencapai batas atau tidak bisa dihubungi, muncul pesan yang jelas dan tombol **Petunjuk** tetap dipakai. Teknis: `architecture.md` §12; keputusan KP-32–KP-34.
- **Rasional CLT:** bantuan mengikuti langkah yang sedang dikerjakan (tidak melompat), satu langkah per balasan agar informasi baru sedikit, istilah tetap sama dengan materi, panel hanya terbuka jika diketuk. Balasan yang memuat jawaban akhir diganti petunjuk konten (penjaga di server), sehingga siswa tetap mengerjakan sendiri.
- **RMT (Rigorous Mathematical Thinking):** **perlu dilengkapi** — tahapan menunggu rangkuman resmi dosen (PT-09). Wadah `rmt.tahapan` di `src/content/tutor.json` sengaja kosong; tidak diisi sebelum ada sumbernya.
- **Perilaku diharapkan:** siswa bertanya saat macet di satu langkah, lalu kembali mengisi langkah itu sendiri.
- **Indikator uji:** pemakaian per siswa (jumlah & status), proporsi balasan yang diganti penjaga (`guarded`), proporsi batas tercapai; ketepatan langkah berikutnya setelah bertanya (`step_responses`). Lihat `evaluasi.md` §6.
- **Data:** hanya jumlah & status (`tutor_open`, `tutor_message`, `api.md` §5). **Isi percakapan tidak disimpan** di perangkat, server, maupun log.

---

## 9. Struktur materi

| Modul | Isi | Siapa | Fase petunjuk |
|---|---|---|---|
| M0 | Diagnostik prasyarat + pengingat | Semua | — |
| M1 | Mengingat perbandingan (rasio dan tabel) | Kelas VII; kelas VIII jika diagnostik perbandingan belum lancar | Contoh |
| M2 | Senilai atau Berbalik Nilai? (identifikasi, tanpa hitung) | Semua (kelas VIII boleh cek cepat) | Contoh → latihan |
| M3 | Menghitung perbandingan senilai | Semua | Contoh → latihan → mandiri |
| M4 | Menghitung perbandingan berbalik nilai | Semua | Contoh → latihan → mandiri |
| M5 | Soal cerita campuran (variasi konteks, tandai informasi) | Semua | Latihan → mandiri |
| M6 | Latihan akhir (tanpa petunjuk) | Semua | Tanpa petunjuk |
| P | Pengayaan: "bukan keduanya" dan *y* = *k* · *x* (opsional, KP-17) | Disarankan kelas VIII; kelas VII boleh | Latihan |

## 10. Di luar lingkup (versi ini)

- Halaman guru/dashboard (data diambil peneliti lewat Supabase).
- Papan peringkat, poin, lencana, suara, maskot (berisiko menambah extraneous load).
- Materi selain perbandingan senilai dan berbalik nilai (misal skala sebagai bab tersendiri).
- Login dengan email/kata sandi.

## 11. Risiko dan asumsi

| Risiko | Mitigasi |
|---|---|
| Temuan 1 informan tidak mewakili | Diakui sebagai keterbatasan (KP-19); uji coba perorangan memakai siswa dengan kemampuan berbeda dan mencatat temuan yang tidak sesuai dengan S01. |
| Kode siswa ditebak orang lain | Kode acak 8 karakter; tidak memuat nama. |
| HP lemah tidak kuat 3D | 3D opsional, dimuat hanya di M2, ada versi 2D. |
| Sinyal buruk | Konten disimpan di aplikasi; data diantrekan lalu dikirim saat online. |
| Siswa menebak di Langkah 3 | Alasan arah perubahan wajib dipilih; tebakan berulang memicu petunjuk T1. |

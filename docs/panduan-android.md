# Panduan Singkat: Menjalankan MathSave di HP Android

Untuk guru/peneliti yang menyiapkan uji coba. Aplikasi berjalan dari laptop; HP siswa membukanya lewat Wi-Fi yang sama.

## A. Siapkan laptop (sekali sebelum kelas)

1. Pastikan Node.js 20+ terpasang. Buka terminal di folder `mathsave`.
2. Jalankan:
   ```bash
   npm install        # hanya pertama kali
   npm run build
   npm run preview
   ```
3. Terminal menampilkan alamat **Network**, misalnya `http://192.168.1.5:4173`. Catat alamat itu.
4. Jika Windows menanyakan izin firewall untuk Node.js, pilih **Izinkan** pada jaringan **Pribadi**.
5. Biarkan terminal dan laptop menyala selama pelajaran. Jangan tutup terminal.

## B. Buka di HP siswa

1. Sambungkan HP ke **Wi-Fi yang sama** dengan laptop.
2. Buka **Chrome**, ketik alamat Network tadi (misal `http://192.168.1.5:4173`).
3. Pilih kelas (VII atau VIII). Peta belajar muncul.

Jika halaman tidak terbuka: periksa Wi-Fi sama, alamat benar (termasuk `:4173`), dan izin firewall.

## C. Urutan untuk tugas tes literasi

1. **Tes awal dulu**, sebelum M0 dan modul lain: ketuk **Tes awal**, kerjakan 4 soal, lalu **Kirim jawaban → Ya, kirim**.
2. Guru menilai: di peta belajar ketuk **Penilaian tes (guru/peneliti)** → isi **Kode peserta** (misal S07, **bukan nama**) → **Nilai soal 1–4**, pilih skor tiap tahap → **Simpan nilai**.
3. Siswa belajar: M0 → M1 → M2 → M3 → M4.
4. **Tes akhir**: ketuk **Tes akhir**, kerjakan, kirim. Guru menilai dengan cara yang sama.
5. Di layar penilai, ketuk **Unduh CSV rinci** dan **Unduh CSV ringkasan**. File masuk ke folder **Download** HP. Kirim file itu ke laptop (kabel, WhatsApp, atau Drive) untuk dianalisis di Excel.

## D. Hal penting

- **Satu siswa = satu HP**, dan tes awal serta tes akhir dikerjakan **di HP yang sama**. Data hanya tersimpan di HP itu (belum ada server).
- **Unduh CSV setiap selesai menilai.** Jika data Chrome dihapus atau mode penyamaran dipakai, jawaban dan nilai hilang.
- Jangan pakai mode penyamaran (incognito).
- Sebaiknya buka MathSave di **satu tab** saja. Sebelum mengirim, pastikan layar **Periksa** menunjukkan "Sudah diisi ✓"; tes tanpa satu pun jawaban tidak bisa dikirim.
- Jika satu HP dipakai bergantian: unduh CSV dulu, baru ketuk **Mulai ulang (versi pengembangan)** untuk siswa berikutnya.
- Layar penilai tidak berkata sandi. Guru membukanya sendiri, jangan oleh siswa.
- Kode perangkat (misal `P-7KQ3MX`) di CSV dipakai untuk mencocokkan tes awal dan tes akhir siswa yang sama.

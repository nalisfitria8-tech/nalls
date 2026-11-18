# Lembar Isian: Tahapan RMT dari Dosen

**Status: perlu dilengkapi.** RMT = *Rigorous Mathematical Thinking* (arahan dosen). Jangan diisi dengan tahapan karangan; isi hanya dari rangkuman resmi dosen.

## Yang diperlukan

| Isian | Keterangan |
|---|---|
| **Sumber** | Judul/jenis dokumen dosen dan tanggalnya (misal: "Rangkuman RMT, dosen pengampu, 20 Nov 2026") |
| **Tahapan** | Nama tiap tahap, **urutan** sesuai dosen |
| **Penjelasan** | 1 kalimat per tahap, dari rangkuman dosen (≤ 40 kata) |
| **Berlaku di langkah** | `diketahui`, `ditanya`, `jenis`, `hitung` — atau kosong jika berlaku di semua langkah |
| **Contoh pertanyaan pembimbing** | Opsional, jika dosen memberi contoh |
| **Cakupan** | Hanya untuk Tanya Nalls, atau juga materi/petunjuk? (yang lain perlu persetujuan karena mengubah materi) |

## Tempat penerapan

`src/content/tutor.json` → bagian `rmt`:

```json
"rmt": {
  "status": "dari dosen",
  "sumber": "<sumber resmi>",
  "catatan": "<catatan singkat>",
  "tahapan": [
    { "nama": "<tahap 1>", "deskripsi": "<penjelasan>", "langkah": ["diketahui"], "contohPertanyaan": ["<opsional>"] }
  ]
}
```

- Tanya Nalls hanya mengirim tahapan yang berlaku untuk **langkah yang sedang dikerjakan siswa**, satu tahap per balasan (menjaga informasi tetap sedikit).
- `python tools/check_content.py` menolak tahapan tanpa sumber, status yang masih "perlu dilengkapi", langkah yang tidak dikenal, atau teks > 40 kata.
- Materi, soal, kunci, dan penilaian tidak berubah.

"""Membuat kode siswa acak untuk diimpor ke tabel `students` di Supabase.

Kode tidak memuat nama siswa. Format: <awalan>-<4 karakter>, misalnya M7A-K3P9.
Huruf/angka yang mirip (O/0, I/1/L) tidak dipakai agar tidak salah ketik.

Cara pakai (dari folder utama proyek):
    python tools/generate_codes.py --kelas 7 --jumlah 30 --awalan M7A
    python tools/generate_codes.py --kelas 8 --jumlah 25 --awalan M8B --kelompok "uji-perorangan"

Hasil: file CSV di folder `kode-siswa/` (tidak di-commit) dengan kolom
code, grade, group_label — siap diimpor lewat Supabase: Table Editor → students → Insert → Import data from CSV.
Simpan daftar pasangan kode–siswa di tempat terpisah (kertas/arsip guru), BUKAN di repo.
"""

from __future__ import annotations

import argparse
import csv
import secrets
import sys
from pathlib import Path

ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # tanpa O, 0, I, 1, L
OUT_DIR = Path(__file__).resolve().parent.parent / "kode-siswa"


def make_code(prefix: str, length: int = 4) -> str:
    return f"{prefix}-" + "".join(secrets.choice(ALPHABET) for _ in range(length))


def make_codes(prefix: str, count: int, existing: set[str] | None = None) -> list[str]:
    """Membuat `count` kode unik yang belum ada di `existing`."""
    taken = set(existing or ())
    codes: list[str] = []
    while len(codes) < count:
        code = make_code(prefix)
        if code not in taken:
            taken.add(code)
            codes.append(code)
    return codes


def parse_args(argv: list[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Membuat kode siswa MathSave")
    p.add_argument("--kelas", type=int, choices=[7, 8], required=True, help="kelas siswa (7 atau 8)")
    p.add_argument("--jumlah", type=int, required=True, help="banyak kode yang dibuat")
    p.add_argument("--awalan", required=True, help="awalan kode, misal M7A (huruf besar & angka, maks. 5)")
    p.add_argument("--kelompok", default="", help="label kelompok uji coba (tanpa nama siswa)")
    args = p.parse_args(argv)
    if not (1 <= args.jumlah <= 500):
        p.error("--jumlah harus 1–500")
    if not (args.awalan.isalnum() and args.awalan.isupper() and len(args.awalan) <= 5):
        p.error("--awalan harus huruf besar/angka, maksimal 5 karakter (misal M7A)")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    OUT_DIR.mkdir(exist_ok=True)

    existing: set[str] = set()
    for f in OUT_DIR.glob("*.csv"):
        with f.open(encoding="utf-8") as fh:
            existing.update(row["code"] for row in csv.DictReader(fh))

    codes = make_codes(args.awalan, args.jumlah, existing)
    out = OUT_DIR / f"kode-{args.awalan}.csv"
    if out.exists():
        print(f"File {out.name} sudah ada. Pakai awalan lain agar tidak tertimpa.")
        return 1

    with out.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["code", "grade", "group_label"])
        for c in codes:
            w.writerow([c, args.kelas, args.kelompok])

    print(f"{len(codes)} kode dibuat → {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

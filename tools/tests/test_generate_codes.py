import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import generate_codes as gc  # noqa: E402


def test_format_kode():
    code = gc.make_code("M7A")
    prefix, body = code.split("-")
    assert prefix == "M7A"
    assert len(body) == 4
    assert all(ch in gc.ALPHABET for ch in body)


def test_tanpa_huruf_mirip():
    for ch in "O0I1L":
        assert ch not in gc.ALPHABET


def test_kode_unik_dan_tidak_bentrok():
    existing = {"M7A-AAAA"}
    codes = gc.make_codes("M7A", 200, existing)
    assert len(codes) == len(set(codes)) == 200
    assert not existing & set(codes)


def test_menulis_csv(tmp_path, monkeypatch):
    monkeypatch.setattr(gc, "OUT_DIR", tmp_path)
    assert gc.main(["--kelas", "7", "--jumlah", "5", "--awalan", "M7A"]) == 0
    lines = (tmp_path / "kode-M7A.csv").read_text(encoding="utf-8").splitlines()
    assert lines[0] == "code,grade,group_label"
    assert len(lines) == 6
    # tidak menimpa file yang sudah ada
    assert gc.main(["--kelas", "7", "--jumlah", "5", "--awalan", "M7A"]) == 1


@pytest.mark.parametrize("awalan", ["m7a", "M7-A", "TERLALUPANJANG"])
def test_awalan_tidak_sah(awalan):
    with pytest.raises(SystemExit):
        gc.parse_args(["--kelas", "7", "--jumlah", "5", "--awalan", awalan])

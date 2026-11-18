import copy
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import check_content as cc  # noqa: E402

GOOD = {
    "id": "T-1",
    "phase": "latihan",
    "type": "berbalik",
    "text": "6 pekerja selesai 10 hari. Berapa hari jika 4 pekerja?",
    "marks": {"relevant": ["6", "10", "4"], "distractors": [], "question": "Berapa hari jika 4 pekerja?"},
    "table": {"rows": [[6, 10], [4, None]]},
    "answer": 15,
    "swappedAnswer": 6.67,
    "hints": ["a", "b", "c"],
    "twin": {"rows": [[10, 12], [15, None]], "answer": 8},
}


def variant(**changes):
    item = copy.deepcopy(GOOD)
    item.update(changes)
    return item


def test_solve_sama_dengan_naskah():
    assert cc.solve("senilai", [[3, 12000], [5, None]]) == 20000
    assert cc.solve("senilai", [[5, 20], [None, 32]]) == 8
    assert cc.solve("berbalik", [[6, 10], [4, None]]) == 15
    assert cc.solve("berbalik", [[40, 3], [None, 2]]) == 60


def test_round2_setengah_ke_atas():
    assert cc.round2(3.125) == 3.13
    assert cc.round2(80 / 3) == 26.67


def test_soal_benar_lolos():
    assert cc.check_item(GOOD) == []


def test_kunci_salah_terdeteksi():
    assert any("answer" in e for e in cc.check_item(variant(answer=16)))


def test_swapped_salah_terdeteksi():
    assert any("swappedAnswer" in e for e in cc.check_item(variant(swappedAnswer=6.6)))


def test_twin_salah_terdeteksi():
    assert any("twin" in e for e in cc.check_item(variant(twin={"rows": [[10, 12], [15, None]], "answer": 9})))


def test_tabel_tidak_sah():
    assert cc.check_item(variant(table={"rows": [[6, 10], [4, 5]]}))
    assert cc.check_item(variant(table={"rows": [[6, 10]]}))


def test_petunjuk_sesuai_fase():
    assert cc.check_item(variant(hints=["a", "b"]))  # latihan butuh 3
    assert cc.check_item(variant(phase="mandiri"))  # mandiri maks 2
    assert cc.check_item(variant(phase="mandiri", hints=["a", "b"])) == []


def test_angka_tandai_harus_ada_di_teks():
    bad = variant(marks={"relevant": ["6", "10", "7"], "distractors": [], "question": ""})
    assert any("'7'" in e for e in cc.check_item(bad))


def test_tabel_layar_hasil_bagi_dan_kali():
    ok = {"id": "X", "tables": [{"check": "product", "rows": [[2, 12, 24], [4, 6, 24]]}]}
    bad = {"id": "X", "tables": [{"check": "quotient", "rows": [[2, 8000, 4000], [4, 16000, 5000]]}]}
    assert cc.check_screen_tables(ok) == []
    assert len(cc.check_screen_tables(bad)) == 1


def test_soal_pilihan_dan_isian():
    assert cc.check_question({"id": "Q", "form": "pilihan", "options": ["2 : 3", "3 : 2"], "answer": "2 : 3"}) == []
    assert cc.check_question({"id": "Q", "form": "pilihan", "options": ["3 : 2"], "answer": "2 : 3"})
    assert cc.check_question({"id": "Q", "form": "isian", "answer": 15, "calc": "3 / 4 * 20"}) == []
    assert cc.check_question({"id": "Q", "form": "isian", "answer": 16, "calc": "3 / 4 * 20"})


def test_safe_calc_menolak_kode():
    import pytest

    with pytest.raises(ValueError):
        cc.safe_calc("__import__('os')")


def test_semua_konten_proyek_benar():
    count, errors = cc.check_all()
    assert count > 0
    assert errors == []


IDENT = {"id": "I-1", "text": "Resep sama.", "a": "kue", "b": "tepung", "condition": "resep sama", "arah": "searah", "jenis": "senilai", "hints": ["a"]}


def test_identifikasi_benar_lolos():
    assert cc.check_identify(IDENT, 3) == []


def test_identifikasi_arah_dan_jenis_harus_cocok():
    bad = {**IDENT, "jenis": "berbalik"}
    assert any("tidak cocok" in e for e in cc.check_identify(bad, 3))
    assert cc.check_identify({**IDENT, "arah": "naik"}, 3)


def test_identifikasi_batas_petunjuk_dan_isian_wajib():
    assert cc.check_identify(IDENT, 0)  # cek cepat tanpa petunjuk
    assert any("'b'" in e for e in cc.check_identify({**IDENT, "b": ""}, 3))


def test_modul_identifikasi_passscore_dan_rumpang():
    data = {
        "module": "MX",
        "check": [IDENT] * 5,
        "passScore": 4,
        "explain": {"cloze": ["Soal itu", {"key": "jenis", "options": ["senilai", "berbalik nilai"]}], "expected": {"jenis": "berbalik nilai"}},
    }
    assert cc.check_identify_module(data) == []
    assert cc.check_identify_module({**data, "passScore": 6})
    bad_explain = {**data["explain"], "expected": {"jenis": "berbalik"}}
    assert any("tidak ada di pilihan" in e for e in cc.check_identify_module({**data, "explain": bad_explain}))


LABEL_SCREEN = {
    "id": "X-06",
    "interaction": {
        "type": "label_tables",
        "prompt": "Ketuk jenisnya.",
        "constantQuestion": "Yang tetap?",
        "constantOptions": ["hasil bagi", "hasil kali"],
        "feedback": {"jenisOk": "a", "jenisErr": "b", "tetapOk": "c", "tetapErr": "d"},
    },
    "tables": [
        {"columns": [{"label": "Buku", "arrow": "↑"}, {"label": "Harga", "arrow": "↑"}], "rows": [[2, 8000], [4, 16000]], "answer": {"jenis": "senilai", "tetap": "hasil bagi"}},
        {"columns": [{"label": "Pekerja", "arrow": "↑"}, {"label": "Hari", "arrow": "↓"}], "rows": [[2, 12], [4, 6]], "answer": {"jenis": "berbalik", "tetap": "hasil kali"}},
    ],
}


def test_label_tabel_benar_lolos():
    assert cc.check_label_tables(LABEL_SCREEN) == []


def test_label_tabel_kunci_salah_terdeteksi():
    bad = copy.deepcopy(LABEL_SCREEN)
    bad["tables"][0]["answer"] = {"jenis": "berbalik", "tetap": "hasil kali"}
    errors = cc.check_label_tables(bad)
    assert any("panah" in e for e in errors)
    assert any("angkanya" in e for e in errors)
    bad2 = copy.deepcopy(LABEL_SCREEN)
    bad2["tables"][1]["answer"]["tetap"] = "hasil bagi"
    assert any("yang tetap" in e for e in cc.check_label_tables(bad2))


def test_label_tabel_umpan_balik_wajib():
    bad = copy.deepcopy(LABEL_SCREEN)
    del bad["interaction"]["feedback"]["tetapErr"]
    assert any("tetapErr" in e for e in cc.check_label_tables(bad))


def test_f07_angka_di_teks_harus_tergolong():
    # angka "2" di teks tidak tercatat sebagai relevan atau pengecoh
    bad = variant(text="6 pekerja selesai 10 hari dengan 2 alat. Berapa hari jika 4 pekerja?")
    assert any("relevant + distractors" in e for e in cc.check_item(bad))
    ok = variant(
        text="6 pekerja selesai 10 hari dengan 2 alat. Berapa hari jika 4 pekerja?",
        marks={"relevant": ["6", "10", "4"], "distractors": ["2"], "question": "Berapa hari jika 4 pekerja?"},
    )
    assert cc.check_item(ok) == []


def test_f07_aturan_angka_sama_dengan_aplikasi():
    assert cc.number_tokens("Harga 4 kg Rp56.000 pukul 06.00, luas 20 m², 2,5 kg") == ["4", "56.000", "06.00", "20", "2,5"]
    assert cc.sentences("Pukul 06.00. Ia berjalan 3 km. Berapa menit?") == ["Pukul 06.00.", "Ia berjalan 3 km.", "Berapa menit?"]


def test_f07_pertanyaan_harus_kalimat_utuh():
    bad = variant(marks={"relevant": ["6", "10", "4"], "distractors": [], "question": "jika 4 pekerja?"})
    assert any("kalimat utuh" in e for e in cc.check_item(bad))


def test_f07_marks_wajib_dan_teks_tanpa_markah():
    no_marks = variant()
    del no_marks["marks"]
    assert any("marks wajib" in e for e in cc.check_item(no_marks))
    assert any("markah" in e for e in cc.check_item(variant(text="**6** pekerja selesai 10 hari. Berapa hari jika 4 pekerja?")))


ML_TEST = {
    "type": "ml_test",
    "maxScore": 6,
    "tasks": [{
        "id": "MLX",
        "indicator": {"code": "reasoning", "name": "Mathematical Reasoning", "description": "d"},
        "text": ["Soal."],
        "stages": [{"n": 1, "description": "a", "score": 2}, {"n": 2, "description": "b", "score": 4}],
        "maxScore": 6,
    }],
}


def test_ml_test_benar_lolos():
    assert cc.check_ml_test(ML_TEST) == []


def test_ml_test_jumlah_skor_tahap_harus_sama_dengan_maks():
    bad = copy.deepcopy(ML_TEST)
    bad["tasks"][0]["stages"][1]["score"] = 3
    errors = cc.check_ml_test(bad)
    assert any("jumlah skor tahap 5" in e for e in errors)
    assert any("maxScore tes" not in e for e in errors)


def test_ml_test_nomor_tahap_dan_total_tes():
    bad = copy.deepcopy(ML_TEST)
    bad["tasks"][0]["stages"][1]["n"] = 3
    assert any("nomor tahap" in e for e in cc.check_ml_test(bad))
    bad2 = copy.deepcopy(ML_TEST)
    bad2["maxScore"] = 24
    assert any("maxScore tes" in e for e in cc.check_ml_test(bad2))


def test_konten_tes_literasi_proyek():
    import json
    data = json.loads((cc.CONTENT_DIR / "ml-test.json").read_text(encoding="utf-8"))
    assert [t["id"] for t in data["tasks"]] == ["ML1", "ML2", "ML3", "ML4"]
    assert [t["maxScore"] for t in data["tasks"]] == [6, 6, 6, 6]
    assert data["maxScore"] == 24
    assert [[st["score"] for st in t["stages"]] for t in data["tasks"]] == [[1, 2, 1, 1, 1], [1] * 6, [1, 2, 2, 1], [1] * 6]


def _tutor():
    import json
    return json.loads((cc.CONTENT_DIR / "tutor.json").read_text(encoding="utf-8"))


def test_tutor_proyek_lolos():
    assert cc.check_tutor(_tutor()) == []


def test_tutor_tidak_boleh_di_fase_mandiri():
    bad = _tutor()
    bad["settings"]["phases"].append("mandiri")
    assert any("mandiri" in e for e in cc.check_tutor(bad))


def test_tutor_pesan_panjang_dan_istilah_teori():
    bad = _tutor()
    bad["messages"]["limitDay"] = "kata " * 41
    bad["fallbackByStep"]["jenis"] = "Ini untuk mengurangi beban kognitif kamu."
    errors = cc.check_tutor(bad)
    assert any("limitDay" in e and "40 kata" in e for e in errors)
    assert any("fallback.jenis" in e and "teori belajar" in e for e in errors)


def test_tutor_rmt_tanpa_sumber_ditolak():
    bad = _tutor()
    bad["rmt"]["tahapan"] = ["Tahap karangan"]
    assert any("RMT" in e for e in cc.check_tutor(bad))


# ---------------------------------------------------------------- pilihan ganda tes literasi (KP-35)
def _mcq():
    import json
    return json.loads((cc.CONTENT_DIR / "ml-mcq.json").read_text(encoding="utf-8"))


def test_ml_mcq_proyek_lolos():
    assert cc.check_ml_mcq(_mcq()) == []
    assert [q["id"] for q in _mcq()] == ["PG1", "PG2", "PG3", "PG4"]


def test_ml_mcq_kunci_dihitung_ulang_dari_angka_soal():
    """Kunci PG dihitung dari angka di teks soal, lalu dicocokkan dengan opsi pada indeks `answer`."""
    import re as _re
    nums = lambda s: [int(x.replace(".", "")) for x in _re.findall(r"\d[\d.]*\d|\d", s)]
    pg1, pg2, pg3, pg4 = _mcq()
    # PG1: harga per kg toko A, B, C → termurah
    a_harga, a_kg, b_harga, b_kg, c_harga, c_kg = nums(pg1["question"])
    per_kg = {"Toko A": a_harga / a_kg, "Toko B": b_harga / b_kg, "Toko C": c_harga / c_kg}
    assert pg1["options"][pg1["answer"]] == min(per_kg, key=per_kg.get)
    # PG2: senilai sirup : air = 3 : 12, air 20 → sirup
    sirup, air, air_baru = nums(pg2["question"])
    assert pg2["options"][pg2["answer"]] == f"{sirup * air_baru // air} gelas"
    # PG3: berbalik nilai "Enam pekerja … 15 hari … 10 orang"
    hari, pekerja_baru = nums(pg3["question"])
    assert pg3["options"][pg3["answer"]] == f"{6 * hari // pekerja_baru} hari"
    # PG4: berbalik nilai "Enam keran … 24 menit … 8 keran"
    menit, keran_baru = nums(pg4["question"])
    assert pg4["options"][pg4["answer"]] == f"{6 * menit // keran_baru} menit"


def test_ml_mcq_struktur_salah_ditolak():
    import copy as _copy
    bad = _copy.deepcopy(_mcq())
    bad[0]["answer"] = 4
    bad[1]["options"] = ["3 gelas", "4 gelas", "5 gelas"]
    bad[2]["options"][1] = bad[2]["options"][0]
    bad[3]["id"] = "X4"
    errors = cc.check_ml_mcq(bad)
    assert any("PG1" in e and "answer" in e for e in errors)
    assert any("PG2" in e and "4 opsi" in e for e in errors)
    assert any("PG3" in e and "tidak boleh sama" in e for e in errors)
    assert any("X4" in e and "PG<nomor>" in e for e in errors)
    assert cc.check_ml_mcq({"bukan": "daftar"}) == ["ml_mcq: harus berupa daftar soal yang tidak kosong"]


def test_ml_mcq_jumlah_harus_sama_dengan_uraian(tmp_path):
    import json, shutil
    for f in cc.CONTENT_DIR.glob("*.json"):
        shutil.copy(f, tmp_path / f.name)
    data = _mcq()[:3]
    (tmp_path / "ml-mcq.json").write_text(json.dumps(data), encoding="utf-8")
    _, errors = cc.check_all(tmp_path)
    assert any("jumlah soal PG (3)" in e for e in errors)


def test_skor_maksimum_tes_literasi_28():
    import json
    t = json.loads((cc.CONTENT_DIR / "ml-test.json").read_text(encoding="utf-8"))
    assert t["maxScore"] + len(_mcq()) == 28  # 24 uraian + 4 PG

"""Memeriksa semua soal di src/content/*.json.

Pemeriksaan:
- tabel 2x2 dengan tepat satu sel yang ditanya (null) di baris kedua
- kunci jawaban (answer) = hasil hitung ulang sesuai jenis
- swappedAnswer = hasil bila rumus jenis lain dipakai (dibulatkan 2 desimal)
- soal kembar (twin) punya kunci yang benar
- jumlah petunjuk: 3 untuk fase contoh/setengah/latihan, maks. 2 untuk mandiri,
  0 untuk akhir (F08)
- angka yang ditandai (marks) benar-benar ada di teks soal (F07); semua angka
  di teks (aturan sama dengan src/engine/marking.js) = relevant + distractors,
  marks.question = satu kalimat utuh, dan teks soal tanpa markah (** atau [[ ]])
  karena teks soal ditampilkan sebagai teks yang bisa ditandai
- ID soal tidak ganda
- soal identifikasi M2 (identify/check/quick): arah dan jenis konsisten
  (searah = senilai, berlawanan = berbalik), jumlah petunjuk sesuai mode
  (latihan maks. 3, cek pemahaman maks. 1, cek cepat 0), batas lulus masuk akal,
  kunci "jelaskan ke temanmu" ada di pilihan kalimat rumpang
- tes Mathematical Literacy (type "ml_test", F17): tahap rubrik bernomor 1..n,
  skor tahap bilangan bulat positif, jumlah skor tahap = maxScore soal,
  jumlah maxScore soal = maxScore tes, ID dan kode indikator tidak ganda
- layar dengan interaksi label tabel (M2-06): kunci jenis cocok dengan panah
  kolom tabel, dan "yang tetap" cocok dengan jenis (senilai = hasil bagi,
  berbalik = hasil kali)

Cara pakai (dari folder utama proyek):
    python tools/check_content.py
Keluar dengan kode 1 jika ada kesalahan.
"""

from __future__ import annotations

import json
import re
import sys
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

CONTENT_DIR = Path(__file__).resolve().parent.parent / "src" / "content"
TYPES = {"senilai", "berbalik"}
MAX_HINTS = {"contoh": 3, "setengah": 3, "latihan": 3, "mandiri": 2, "akhir": 0}
TOLERANCE = 0.01
ARAH_JENIS = {"searah": "senilai", "berlawanan": "berbalik"}
# daftar soal identifikasi M2 → maksimal petunjuk (naskah M2-08, M2-09, cek cepat)
IDENTIFY_LISTS = {"identify": 3, "check": 1, "quick": 0}
TETAP = {"senilai": "hasil bagi", "berbalik": "hasil kali"}
# sama dengan NUMBER_RE dan pemecah kalimat di src/engine/marking.js (F07)
NUMBER_RE = re.compile(r"\d+(?:[.,]\d+)*", re.ASCII)
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.?!])\s+")


def number_tokens(text: str) -> list[str]:
    return NUMBER_RE.findall(text)


def sentences(text: str) -> list[str]:
    return [s.strip() for s in SENTENCE_SPLIT_RE.split(text.strip())]


def round2(x: float) -> float:
    """Pembulatan setengah ke atas, sama dengan round2() di src/engine/number.js."""
    return float(Decimal(repr(x)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def validate_rows(rows) -> str | None:
    """Mengembalikan pesan kesalahan, atau None jika tabel sah."""
    if not (isinstance(rows, list) and len(rows) == 2 and all(isinstance(r, list) and len(r) == 2 for r in rows)):
        return "tabel harus 2 baris x 2 kolom"
    (a1, b1), (a2, b2) = rows
    if not all(isinstance(v, (int, float)) and v > 0 for v in (a1, b1)):
        return "baris pertama harus dua angka positif"
    if [a2, b2].count(None) != 1:
        return "baris kedua harus punya tepat satu sel null"
    known = b2 if a2 is None else a2
    if not (isinstance(known, (int, float)) and known > 0):
        return "nilai diketahui di baris kedua harus angka positif"
    return None


def solve(kind: str, rows) -> float:
    """Sama dengan solve() di src/engine/solver.js."""
    (a1, b1), (a2, b2) = rows
    if kind == "senilai":
        return b1 * a2 / a1 if b2 is None else a1 * b2 / b1
    if kind == "berbalik":
        return a1 * b1 / a2 if b2 is None else a1 * b1 / b2
    raise ValueError(f"jenis tidak dikenal: {kind}")


def other(kind: str) -> str:
    return "berbalik" if kind == "senilai" else "senilai"


def check_item(item: dict) -> list[str]:
    errors: list[str] = []
    iid = item.get("id", "?")

    def err(msg: str) -> None:
        errors.append(f"{iid}: {msg}")

    kind = item.get("type")
    if kind not in TYPES:
        err(f"type harus salah satu dari {sorted(TYPES)}")
        return errors

    rows = item.get("table", {}).get("rows")
    problem = validate_rows(rows)
    if problem:
        err(problem)
        return errors

    expected = solve(kind, rows)
    if abs(expected - item.get("answer", float("nan"))) > TOLERANCE:
        err(f"answer {item.get('answer')} salah, seharusnya {round2(expected)}")

    swapped = round2(solve(other(kind), rows))
    if item.get("swappedAnswer") != swapped:
        err(f"swappedAnswer {item.get('swappedAnswer')} salah, seharusnya {swapped}")

    twin = item.get("twin")
    if twin:
        tproblem = validate_rows(twin.get("rows"))
        if tproblem:
            err(f"twin: {tproblem}")
        elif abs(solve(kind, twin["rows"]) - twin.get("answer", float("nan"))) > TOLERANCE:
            err(f"twin.answer {twin.get('answer')} salah, seharusnya {round2(solve(kind, twin['rows']))}")

    phase = item.get("phase")
    hints = item.get("hints", [])
    if phase not in MAX_HINTS:
        err(f"phase tidak dikenal: {phase}")
    elif phase in ("setengah", "latihan") and len(hints) != 3:
        err(f"fase {phase} butuh tepat 3 petunjuk, ada {len(hints)}")
    elif len(hints) > MAX_HINTS[phase]:
        err(f"fase {phase} maksimal {MAX_HINTS[phase]} petunjuk, ada {len(hints)}")

    text = item.get("text", "")
    marks = item.get("marks", {})
    for token in marks.get("relevant", []) + marks.get("distractors", []):
        if token not in text:
            err(f"angka tandai '{token}' tidak ada di teks soal")
    question = marks.get("question")
    if question and question not in text:
        err("kalimat pertanyaan (marks.question) tidak ada di teks soal")

    # F07: data "angka pengecoh dipilih" hanya bisa dipercaya jika setiap angka
    # yang bisa diketuk di teks tergolong relevan atau pengecoh
    if not marks:
        err("marks wajib diisi (relevant, distractors, question) untuk fitur tandai F07")
    else:
        found = sorted(number_tokens(text))
        listed = sorted(marks.get("relevant", []) + marks.get("distractors", []))
        if found != listed:
            err(f"angka di teks {found} tidak sama dengan relevant + distractors {listed}")
        if question and question not in sentences(text):
            err(f"marks.question harus satu kalimat utuh dari teks soal, bukan '{question}'")
    if "**" in text or "[[" in text:
        err("teks soal tidak boleh memakai markah ** atau [[ ]] (ditampilkan sebagai teks bertanda F07)")

    return errors


def check_identify(item: dict, max_hints: int) -> list[str]:
    """Soal identifikasi jenis tanpa menghitung (M2)."""
    errors: list[str] = []
    iid = item.get("id", "?")
    for field in ("text", "a", "b", "condition"):
        if not (isinstance(item.get(field), str) and item[field].strip()):
            errors.append(f"{iid}: '{field}' wajib diisi")
    arah, jenis = item.get("arah"), item.get("jenis")
    if arah not in ARAH_JENIS:
        errors.append(f"{iid}: arah harus salah satu dari {sorted(ARAH_JENIS)}")
    elif jenis not in TYPES:
        errors.append(f"{iid}: jenis harus salah satu dari {sorted(TYPES)}")
    elif ARAH_JENIS[arah] != jenis:
        errors.append(f"{iid}: arah '{arah}' tidak cocok dengan jenis '{jenis}'")
    if len(item.get("hints", [])) > max_hints:
        errors.append(f"{iid}: maksimal {max_hints} petunjuk, ada {len(item['hints'])}")
    return errors


def check_identify_module(data: dict) -> list[str]:
    """Aturan tingkat modul: batas lulus dan kunci kalimat rumpang."""
    errors: list[str] = []
    name = data.get("module", "?")
    pass_score = data.get("passScore")
    for key in ("check", "quick"):
        n = len(data.get(key, []))
        if n and not (isinstance(pass_score, int) and 1 <= pass_score <= n):
            errors.append(f"{name}: passScore {pass_score} harus 1..{n} untuk '{key}'")
    explain = data.get("explain")
    if explain:
        options = {p["key"]: p["options"] for p in explain.get("cloze", []) if isinstance(p, dict)}
        expected = explain.get("expected", {})
        if set(expected) != set(options):
            errors.append(f"{name}: kunci explain.expected {sorted(expected)} ≠ isian rumpang {sorted(options)}")
        for key, value in expected.items():
            if key in options and value not in options[key]:
                errors.append(f"{name}: explain.expected.{key} '{value}' tidak ada di pilihan")
    return errors


def safe_calc(expr: str) -> float:
    """Menghitung ekspresi angka sederhana (+ - * /) tanpa eval bebas."""
    import ast
    import operator

    ops = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}

    def ev(node):
        if isinstance(node, ast.Expression):
            return ev(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in ops:
            return ops[type(node.op)](ev(node.left), ev(node.right))
        raise ValueError(f"ekspresi tidak diizinkan: {expr}")

    return ev(ast.parse(expr, mode="eval"))


def check_question(q: dict) -> list[str]:
    """Soal pilihan/isian (diagnostik, pengingat, latihan M1)."""
    errors: list[str] = []
    qid = q.get("id", "?")
    form = q.get("form")
    if form == "pilihan":
        options = q.get("options", [])
        if q.get("answer") not in options:
            errors.append(f"{qid}: kunci '{q.get('answer')}' tidak ada di pilihan")
        if len(set(options)) != len(options):
            errors.append(f"{qid}: ada pilihan ganda")
    elif form == "isian":
        if not isinstance(q.get("answer"), (int, float)):
            errors.append(f"{qid}: kunci isian harus angka")
        elif "calc" in q and abs(safe_calc(q["calc"]) - q["answer"]) > TOLERANCE:
            errors.append(f"{qid}: kunci {q['answer']} tidak sama dengan {q['calc']} = {round2(safe_calc(q['calc']))}")
    else:
        errors.append(f"{qid}: form harus 'pilihan' atau 'isian'")
    if len(q.get("hints", [])) > 3:
        errors.append(f"{qid}: petunjuk maksimal 3")
    return errors


def check_screen_tables(screen: dict) -> list[str]:
    """Tabel layar materi bertanda "check": kolom ke-3 harus = hasil bagi / hasil kali."""
    errors: list[str] = []
    for table in screen.get("tables", []):
        mode = table.get("check")
        if not mode:
            continue
        for a, b, c in table["rows"]:
            expected = b / a if mode == "quotient" else a * b
            if abs(expected - c) > TOLERANCE:
                errors.append(f"{screen.get('id')}: baris {a}, {b} → kolom ketiga {c}, seharusnya {round2(expected)}")
    return errors


def check_label_tables(screen: dict) -> list[str]:
    """Interaksi "label_tables" (M2-06): kunci tiap tabel harus sesuai isinya."""
    errors: list[str] = []
    inter = screen.get("interaction")
    if not inter or inter.get("type") != "label_tables":
        return errors
    sid = screen.get("id", "?")
    for key in ("prompt", "constantQuestion"):
        if not inter.get(key):
            errors.append(f"{sid}: interaction.{key} wajib diisi")
    for key in ("jenisOk", "jenisErr", "tetapOk", "tetapErr"):
        if not inter.get("feedback", {}).get(key):
            errors.append(f"{sid}: interaction.feedback.{key} wajib diisi")
    options = inter.get("constantOptions", [])
    tables = screen.get("tables", [])
    if not tables:
        errors.append(f"{sid}: interaksi label butuh tabel")
    for i, table in enumerate(tables, 1):
        ans = table.get("answer") or {}
        jenis, tetap = ans.get("jenis"), ans.get("tetap")
        arrows = [c.get("arrow") for c in table.get("columns", [])]
        if jenis not in TYPES:
            errors.append(f"{sid}: tabel {i} answer.jenis harus salah satu dari {sorted(TYPES)}")
            continue
        if len(arrows) == 2 and all(arrows):
            from_arrows = "senilai" if arrows[0] == arrows[1] else "berbalik"
            if from_arrows != jenis:
                errors.append(f"{sid}: tabel {i} panah {arrows} berarti {from_arrows}, bukan {jenis}")
        rows = table.get("rows", [])
        if len(rows) >= 2 and all(isinstance(v, (int, float)) and v > 0 for r in rows for v in r[:2]):
            quotients = {round(r[1] / r[0], 6) for r in rows}
            products = {round(r[0] * r[1], 6) for r in rows}
            from_rows = "senilai" if len(quotients) == 1 else "berbalik" if len(products) == 1 else None
            if from_rows != jenis:
                errors.append(f"{sid}: tabel {i} angkanya tidak menunjukkan {jenis}")
        if tetap != TETAP[jenis]:
            errors.append(f"{sid}: tabel {i} yang tetap untuk {jenis} adalah '{TETAP[jenis]}', bukan '{tetap}'")
        if tetap not in options:
            errors.append(f"{sid}: tabel {i} answer.tetap '{tetap}' tidak ada di constantOptions")
    return errors


def check_ml_test(data: dict) -> list[str]:
    """Tes literasi: rubrik per tahap harus konsisten dengan skor maksimum."""
    errors: list[str] = []
    tasks = data.get("tasks", [])
    if not tasks:
        errors.append("ml_test: tasks kosong")
    codes = [t.get("indicator", {}).get("code") for t in tasks]
    if len(set(codes)) != len(codes):
        errors.append(f"ml_test: kode indikator ganda {codes}")
    for t in tasks:
        tid = t.get("id", "?")
        ind = t.get("indicator", {})
        if not (ind.get("code") and ind.get("name") and ind.get("description")):
            errors.append(f"{tid}: indicator butuh code, name, description")
        if not t.get("text"):
            errors.append(f"{tid}: teks soal kosong")
        stages = t.get("stages", [])
        if [st.get("n") for st in stages] != list(range(1, len(stages) + 1)):
            errors.append(f"{tid}: nomor tahap harus 1..{len(stages)}")
        for st in stages:
            if not (isinstance(st.get("score"), int) and st["score"] > 0):
                errors.append(f"{tid}: skor tahap {st.get('n')} harus bilangan bulat positif")
            if not st.get("description"):
                errors.append(f"{tid}: deskripsi tahap {st.get('n')} kosong")
        total = sum(st.get("score", 0) for st in stages if isinstance(st.get("score"), int))
        if total != t.get("maxScore"):
            errors.append(f"{tid}: jumlah skor tahap {total} ≠ maxScore {t.get('maxScore')}")
    if sum(t.get("maxScore", 0) for t in tasks) != data.get("maxScore"):
        errors.append(f"ml_test: jumlah maxScore soal ≠ maxScore tes {data.get('maxScore')}")
    return errors


def check_all(content_dir: Path = CONTENT_DIR) -> tuple[int, list[str]]:
    errors: list[str] = []
    seen: set[str] = set()
    count = 0
    for path in sorted(content_dir.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            errors.append(f"{path.name}: JSON tidak sah ({e})")
            continue
        screens = list(data.get("screens", []))
        questions = list(data.get("quiz", []))
        for card in data.get("reminders", {}).values():
            screens.extend(card.get("screens", []))
            questions.append(card["check"])
        for screen in screens:
            errors.extend(check_screen_tables(screen))
            errors.extend(check_label_tables(screen))

        for item in data.get("items", []) + questions:
            count += 1
            iid = item.get("id")
            if iid in seen:
                errors.append(f"{iid}: ID ganda")
            seen.add(iid)
            errors.extend(check_question(item) if "form" in item else check_item(item))

        if data.get("type") == "ml_test":
            errors.extend(check_ml_test(data))
            for t in data.get("tasks", []):
                count += 1
                if t.get("id") in seen:
                    errors.append(f"{t.get('id')}: ID ganda")
                seen.add(t.get("id"))

        if any(key in data for key in IDENTIFY_LISTS):
            errors.extend(check_identify_module(data))
        for key, max_hints in IDENTIFY_LISTS.items():
            for item in data.get(key, []):
                count += 1
                iid = item.get("id")
                if iid in seen:
                    errors.append(f"{iid}: ID ganda")
                seen.add(iid)
                errors.extend(check_identify(item, max_hints))
    return count, errors


def main() -> int:
    count, errors = check_all()
    if errors:
        print(f"Ditemukan {len(errors)} masalah pada {count} soal:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(f"OK: {count} soal diperiksa, semua kunci benar.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

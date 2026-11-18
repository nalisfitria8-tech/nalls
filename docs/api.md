# API dan Data — MathSave

Backend = **Supabase** (Postgres + Auth anonim + RPC + Row Level Security). Tidak ada server sendiri.
Status: skema sudah ditulis di `supabase/migrations/0001_init.sql` (sama dengan SQL di bawah) tetapi **belum dijalankan**, karena proyek Supabase belum dibuat (KP-21). Aplikasi sudah membuat baris data dengan bentuk tabel ini dan menampungnya di antrean memori (§6); pengirimannya dikerjakan di C15.

---

## 1. Ringkasan data yang disimpan

Sesuai keputusan "data lengkap untuk penelitian" (tahap Evaluation ADDIE):

| Data | Tabel | Fitur |
|---|---|---|
| Kode siswa, kelas | `students` | F01 |
| Perangkat yang terikat ke kode | `student_devices` | F01 |
| Hasil diagnostik per prasyarat | `diagnostic_results` | F02 |
| Kemajuan modul | `module_progress` | F03, F06 |
| Jawaban per soal dan per langkah, jenis kesalahan, waktu | `step_responses` | F04, F09, F10 |
| Petunjuk yang dibuka | `hint_uses` | F08 |
| Teks "jelaskan ke temanmu" | `explanations` | F11 |
| Kejadian navigasi (ulangi, kembali, ingat lagi, tandai, 3D) | `events` | F06, F07, F14 |

Tidak ada kolom nama, email, atau nomor HP.

## 2. Tabel

```sql
create table students (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,          -- contoh: M7A-K3P9
  grade       smallint not null check (grade in (7, 8)),
  group_label text,                          -- opsional: kelas/kelompok uji coba, tanpa nama
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table student_devices (
  auth_uid    uuid primary key,              -- auth.uid() dari login anonim
  student_id  uuid not null references students(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table diagnostic_results (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references students(id) on delete cascade,
  client_event_id  uuid not null unique,
  skill            text not null check (skill in ('perkalian','pembagian','pecahan','perbandingan')),
  correct          smallint not null,
  total            smallint not null,
  reminder_shown   boolean not null,
  duration_ms      integer,
  created_at       timestamptz not null default now()
);

create table module_progress (
  student_id   uuid not null references students(id) on delete cascade,
  module_id    text not null,                 -- M0..M6
  status       text not null check (status in ('terkunci','terbuka','berjalan','selesai','dilewati')),
  check_score  smallint,                      -- skor cek pemahaman (M2)
  updated_at   timestamptz not null default now(),
  primary key (student_id, module_id)
);

create table step_responses (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references students(id) on delete cascade,
  client_event_id  uuid not null unique,
  item_id          text not null,             -- contoh: M3-L1; soal M2 memakai I1–I5, C1–C5, Q1–Q5 (§7)
  attempt_no       smallint not null,         -- percobaan ke- untuk soal ini
  step             text not null check (step in ('diketahui','ditanya','jenis','bentuk','hasil','kewajaran','mirip_beda')),
  response         jsonb not null,            -- isi jawaban siswa
  is_correct       boolean not null,
  error_type       text check (error_type in ('ambil_data','jenis','rumus','hitung','kewajaran')),
  hint_level_max   smallint not null default 0,  -- 0..3
  phase            text not null check (phase in ('contoh','setengah','latihan','mandiri','akhir','diagnostik','cek')),
  duration_ms      integer,
  created_at       timestamptz not null default now()
);

create table hint_uses (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references students(id) on delete cascade,
  client_event_id  uuid not null unique,
  item_id          text not null,
  step             text not null,
  level            smallint not null check (level between 1 and 3),
  created_at       timestamptz not null default now()
);

create table explanations (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references students(id) on delete cascade,
  client_event_id  uuid not null unique,
  module_id        text not null,
  prompt_id        text not null,
  cloze            jsonb not null,            -- pilihan kalimat rumpang
  free_text        text check (char_length(free_text) <= 500),
  self_check       jsonb,                     -- centang daftar cek siswa
  rubric_score     smallint,                  -- diisi peneliti (0..3)
  created_at       timestamptz not null default now()
);

create table events (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references students(id) on delete cascade,
  client_event_id  uuid not null unique,
  type             text not null,             -- lihat §5
  module_id        text,
  screen_id        text,
  item_id          text,
  payload          jsonb,
  client_time      timestamptz not null,
  created_at       timestamptz not null default now()
);
```

## 3. Keamanan baris (RLS)

```sql
-- Fungsi bantu: siswa milik perangkat yang sedang login
create function current_student_id() returns uuid
language sql stable security definer set search_path = public as $$
  select student_id from student_devices where auth_uid = auth.uid()
$$;

alter table students            enable row level security;
alter table student_devices     enable row level security;
alter table diagnostic_results  enable row level security;
alter table module_progress     enable row level security;
alter table step_responses      enable row level security;
alter table hint_uses           enable row level security;
alter table explanations        enable row level security;
alter table events              enable row level security;

-- students: hanya baca baris sendiri; tidak boleh tulis dari aplikasi
create policy own_student_read on students
  for select using (id = current_student_id());

-- Tabel data: baca & tambah baris sendiri saja (pola sama untuk tiap tabel)
create policy own_rows_insert on step_responses
  for insert with check (student_id = current_student_id());
create policy own_rows_select on step_responses
  for select using (student_id = current_student_id());
-- ulangi untuk diagnostic_results, hint_uses, explanations, events

-- module_progress: baca, tambah, ubah baris sendiri
create policy own_progress on module_progress
  for all using (student_id = current_student_id())
  with check (student_id = current_student_id());

-- explanations.rubric_score: tidak boleh diubah siswa (tanpa policy update)
-- student_devices: tidak ada policy → hanya lewat RPC claim_student_code
```

Peneliti memakai dashboard Supabase (peran `service_role` / pemilik proyek) yang melewati RLS.

## 4. Fungsi RPC

### `claim_student_code(p_code text) → json`
Mengikat perangkat (login anonim) ke kode siswa.

```sql
create function claim_student_code(p_code text) returns json
language plpgsql security definer set search_path = public as $$
declare s students;
begin
  if auth.uid() is null then
    raise exception 'BELUM_LOGIN';
  end if;
  select * into s from students
   where code = upper(trim(p_code)) and active;
  if not found then
    raise exception 'KODE_TIDAK_DITEMUKAN';
  end if;
  insert into student_devices(auth_uid, student_id)
  values (auth.uid(), s.id)
  on conflict (auth_uid) do update set student_id = excluded.student_id;
  return json_build_object('student_id', s.id, 'grade', s.grade);
end $$;
```

| Galat | Pesan ke siswa |
|---|---|
| `KODE_TIDAK_DITEMUKAN` | "Kode belum benar. Periksa lagi atau tanyakan ke guru." |
| jaringan | "Belum tersambung internet. Coba lagi." |

Catatan: perlu pembatasan percobaan (rate limit Supabase Auth untuk login anonim aktif secara bawaan) agar kode tidak mudah ditebak.

### `get_my_state() → json`
Mengembalikan kelas, hasil diagnostik terakhir, dan `module_progress` untuk memulihkan posisi belajar di perangkat lain.

## 5. Jenis kejadian (`events.type`)

| type | Kapan | payload |
|---|---|---|
| `screen_view` | layar dibuka | `{ "ms_on_prev": 5200 }` |
| `nav_back` | tombol Kembali | `{}` |
| `nav_repeat` | tombol Ulangi penjelasan | `{}` |
| `recall_open` | kartu "Ingat lagi: cara menentukan jenis" dibuka | `{}` |
| `mark_toggle` | menandai/membatalkan tanda di teks soal, Langkah 1 (F07) | angka: `{ "token": "56.000", "kind": "num", "on": true, "pos": 1 }` · kalimat: `{ "token": "Berapa harga 7 kg beras yang sama?", "kind": "ask", "on": true, "sentence": 1 }` (+ `module_id`, `item_id`). `pos` = urutan angka di teks (0, 1, …); `sentence` = urutan kalimat |
| `mark_place` | angka bertanda dimasukkan ke kolom tabel Diketahui (F07) | `{ "token": "56.000", "pos": 1, "column": 1, "row": 0 }` · `column`: 0 = kolom kiri, 1 = kolom kanan (+ `module_id`, `item_id`) |
| `reminder_open` | pengingat prasyarat dibuka | `{ "skill": "pecahan" }` |
| `viz_interact` | menggeser ilustrasi 3D/2D | `{ "mode": "3d", "value": 6 }` |
| `viz_hide` | menyembunyikan ilustrasi | `{ "mode": "3d" }` |
| `viz_fallback` | 3D diganti 2D otomatis | `{ "reason": "no_webgl" }` |
| `skip_module` | kelas VIII melewati M1/M2 (M2: lulus cek cepat) | `{ "module": "M2", "quick_score": 4 }` |
| `check_result` | percobaan cek M2 ditutup (cek pemahaman atau cek cepat kelas VIII); **sekali per percobaan**, tidak tercatat ulang saat layar hasil dibuka lagi (KP-25) | `{ "kind": "pemahaman", "attempt": 1, "correct": 4, "passed": true }` · `kind`: `pemahaman` \| `cepat` |
| `screen_check` | siswa menjawab pertanyaan di layar materi (M2-06: label jenis tabel, lalu "yang tetap") | `{ "table": 0, "question": "jenis", "response": "senilai", "correct": true }` · `question`: `jenis` \| `tetap` (+ `module_id`, `screen_id`) |
| `gate_locked` | soal mandiri dibuka sebelum lulus cek M2 (DS02) | `{ "gate": "cek_m2" }` (+ `module_id`, `item_id`) |
| `ml_start` | siswa mulai tes literasi (F17) | `{ "phase": "awal" }` · `phase`: `awal` \| `akhir` (+ `module_id: "ML"`) |
| `ml_submit` | siswa mengirim tes literasi; jawaban terkunci | `{ "phase": "awal", "answered": 4, "answers": { "ML1": "…" } }` |
| `ml_score` | penilai menyimpan skor satu soal | `{ "phase": "awal", "scores": [1, 2, 1, 1, 1], "total": 6 }` (+ `item_id`: `ML1`–`ML4`) |

**Tes literasi (F17):** jawaban dan skor saat ini **hanya** disimpan di perangkat (`localStorage`, `store.ml`) dan diunduh sebagai CSV dari layar penilai; tidak ada tabel Supabase dan tidak ada pengiriman (KP-29). Kejadian di atas masuk antrean memori seperti kejadian lain. Jika nanti perlu tabel, tambahkan lewat file baru di `supabase/migrations/`.

Soal identifikasi M2 dicatat di `step_responses` dengan `step = 'jenis'` dan `phase = 'latihan'` (I1–I5) atau `'cek'` (C1–C5, Q1–Q5); petunjuknya di `hint_uses` dengan `step = 'jenis'`.

**Belum tersambung (wajib sebelum C15):** skor cek pemahaman sudah tersimpan di perangkat (`m2.cek.result.correct`), tetapi belum dikirim ke `module_progress.check_score`. Ini harus diselesaikan sebelum/bersama C15.

## 6. Klien (JavaScript)

Aplikasi ditulis dalam **JavaScript** (modul ES, tanpa TypeScript; KP-20).

### 6.1 Sudah ada: `src/data/logger.js`

Setiap fungsi membuat satu baris dengan `client_event_id` (UUID) dan bentuk kolom sama dengan tabel di §2, lalu menaruhnya di **antrean memori**. Kolom `student_id`, `id`, dan `created_at` diisi saat pengiriman/oleh database.

```js
import { logStep, logHint, logExplanation, logDiagnostic, logEvent } from './data/logger.js';

logStep({ item_id, attempt_no, step, response, is_correct, error_type, hint_level_max, phase }); // → step_responses
logHint({ item_id, step, level });                                    // → hint_uses
logExplanation({ module_id, prompt_id, cloze, free_text, self_check }); // → explanations
logDiagnostic({ skill, correct, total, reminder_shown });             // → diagnostic_results
logEvent(type, { module_id, screen_id, item_id, payload });           // → events (client_time diisi otomatis; jenis di §5)

pendingEvents(); // salinan antrean (dipakai tes; nanti dipakai pengirim)
clearEvents();   // mengosongkan antrean
```

Antrean ini **hilang saat halaman ditutup**; belum ada yang dikirim ke Supabase.

### 6.2 Rencana (C5, C15)

```js
// src/data/supabase.js — klien @supabase/supabase-js v2 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

// src/data/auth.js (C5)
loginWithCode(code)  // → Promise<{ studentId, grade }>  (signInAnonymously + RPC claim_student_code)
getMyState()         // → Promise<object>  (RPC get_my_state)
logout()             // → Promise<void>

// src/data/logger.js (C15) — antrean dipindah ke IndexedDB lalu dikirim berkelompok
saveProgress(p)      // upsert module_progress, termasuk check_score (skor cek pemahaman M2)
flushQueue()         // → Promise<number>; dipanggil saat online & tiap 20 detik
```

Contoh pengiriman berkelompok:

```js
await supabase
  .from('step_responses')
  .upsert(batch, { onConflict: 'client_event_id', ignoreDuplicates: true });
// ON CONFLICT DO NOTHING: kiriman ulang tidak membuat data ganda
```

## 7. Ekspor data untuk peneliti

Dari SQL editor Supabase, lalu unduh CSV.

**Pemetaan ID soal ke modul.** Tabel `step_responses` dan `hint_uses` tidak punya kolom modul; modul diturunkan dari `item_id`. Sebagian besar ID diawali kode modul (`M1-L1`, `M3-L1`, `M0-P1-C`), **kecuali soal M2**:

| `item_id` | Modul | Bagian | `phase` |
|---|---|---|---|
| `I1`–`I5` | M2 | Latihan identifikasi (M2-08) | `latihan` |
| `C1`–`C5` | M2 | Cek pemahaman (M2-09) | `cek` |
| `Q1`–`Q5` | M2 | Cek cepat kelas VIII (M2-00) | `cek` |

(`D1`–`D8`, soal diagnostik M0, tidak masuk `step_responses`; hasilnya ada di `diagnostic_results` per prasyarat.) Karena itu, kueri di bawah memakai fungsi bantu `module_of`:

```sql
-- Fungsi bantu: modul dari item_id (I/C/Q = soal M2)
create or replace function module_of(item_id text) returns text
language sql immutable as $$
  select case when item_id ~ '^[ICQ][0-9]+$' then 'M2'
              else split_part(item_id, '-', 1) end
$$;

-- Distribusi jenis kesalahan per modul
select s.code, s.grade, module_of(r.item_id) as modul,
       r.error_type, count(*) as jumlah
from step_responses r join students s on s.id = r.student_id
where not r.is_correct
group by 1,2,3,4 order by 1,3;

-- Rata-rata tingkat petunjuk per fase (indikator fading F08)
select phase, round(avg(hint_level_max)::numeric, 2) as rata_petunjuk
from step_responses group by phase;

-- Ketepatan Langkah 3 percobaan pertama per modul (indikator F04)
select module_of(item_id) as modul,
       avg(case when is_correct then 1 else 0 end) as ketepatan
from step_responses where step = 'jenis' and attempt_no = 1
group by 1;

-- F03: percobaan ke berapa siswa lulus cek pemahaman M2 (indikator "≤ 2 percobaan")
select s.code, s.grade,
       min((e.payload->>'attempt')::int) filter (where (e.payload->>'passed')::boolean) as lulus_pada_percobaan,
       max((e.payload->>'attempt')::int) as jumlah_percobaan
from events e join students s on s.id = e.student_id
where e.type = 'check_result' and e.payload->>'kind' = 'pemahaman'
group by 1,2;

-- F03-b (asumsi KP-22): ketepatan jenis pertama kali di M3–M4 menurut jalur lulus M2
with jalur as (
  select student_id,
         case when bool_or(payload->>'kind' = 'cepat' and (payload->>'passed')::boolean) then 'cek cepat'
              when bool_or(payload->>'kind' = 'pemahaman' and (payload->>'passed')::boolean) then 'cek pemahaman'
         end as lulus_lewat
  from events where type = 'check_result' group by 1
)
select j.lulus_lewat, count(distinct r.student_id) as siswa,
       avg(case when r.is_correct then 1 else 0 end) as ketepatan_jenis
from step_responses r join jalur j using (student_id)
where r.step = 'jenis' and r.attempt_no = 1 and module_of(r.item_id) in ('M3','M4')
group by 1;
```

Catatan: siswa kelas VIII yang lulus cek cepat lalu tetap mempelajari M2 bisa punya kedua jenis `check_result`; kueri F03-b menggolongkannya ke "cek cepat". Karena peserta sedikit, hasil dibaca per siswa (`evaluasi.md` §8).

## 8. Konfigurasi lingkungan

| Variabel | Isi | Tempat |
|---|---|---|
| `VITE_SUPABASE_URL` | URL proyek | `.env.local` dan pengaturan Netlify |
| `VITE_SUPABASE_ANON_KEY` | kunci anon (publik) | `.env.local` dan pengaturan Netlify |

`.env.local` tidak di-commit. Kunci `service_role` tidak pernah dipakai di aplikasi.
Di dashboard Supabase: aktifkan **Anonymous sign-ins** (Authentication → Providers).

-- MathSave — skema awal database (docs/api.md)
-- Jalankan SEKALI di Supabase: SQL Editor → New query → tempel seluruh isi file → Run.
-- Tidak ada kolom nama, email, atau nomor HP siswa.

-- =====================================================================
-- 1. Tabel
-- =====================================================================

create table if not exists public.students (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code = upper(code)),
  grade       smallint not null check (grade in (7, 8)),
  group_label text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.student_devices (
  auth_uid    uuid primary key,
  student_id  uuid not null references public.students(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.diagnostic_results (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students(id) on delete cascade,
  client_event_id  uuid not null unique,
  skill            text not null check (skill in ('perkalian','pembagian','pecahan','perbandingan')),
  correct          smallint not null,
  total            smallint not null,
  reminder_shown   boolean not null,
  duration_ms      integer,
  created_at       timestamptz not null default now()
);

create table if not exists public.module_progress (
  student_id   uuid not null references public.students(id) on delete cascade,
  module_id    text not null,
  status       text not null check (status in ('terkunci','terbuka','berjalan','selesai','dilewati')),
  check_score  smallint,
  updated_at   timestamptz not null default now(),
  primary key (student_id, module_id)
);

create table if not exists public.step_responses (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students(id) on delete cascade,
  client_event_id  uuid not null unique,
  item_id          text not null,
  attempt_no       smallint not null,
  step             text not null check (step in ('diketahui','ditanya','jenis','bentuk','hasil','kewajaran','mirip_beda')),
  response         jsonb not null,
  is_correct       boolean not null,
  error_type       text check (error_type in ('ambil_data','jenis','rumus','hitung','kewajaran')),
  hint_level_max   smallint not null default 0 check (hint_level_max between 0 and 3),
  phase            text not null check (phase in ('contoh','setengah','latihan','mandiri','akhir','diagnostik','cek')),
  duration_ms      integer,
  created_at       timestamptz not null default now()
);

create table if not exists public.hint_uses (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students(id) on delete cascade,
  client_event_id  uuid not null unique,
  item_id          text not null,
  step             text not null,
  level            smallint not null check (level between 1 and 3),
  created_at       timestamptz not null default now()
);

create table if not exists public.explanations (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students(id) on delete cascade,
  client_event_id  uuid not null unique,
  module_id        text not null,
  prompt_id        text not null,
  cloze            jsonb not null,
  free_text        text check (char_length(free_text) <= 500),
  self_check       jsonb,
  rubric_score     smallint check (rubric_score between 0 and 3),
  created_at       timestamptz not null default now()
);

create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students(id) on delete cascade,
  client_event_id  uuid not null unique,
  type             text not null,
  module_id        text,
  screen_id        text,
  item_id          text,
  payload          jsonb,
  client_time      timestamptz not null,
  created_at       timestamptz not null default now()
);

create index if not exists step_responses_student_idx on public.step_responses (student_id, item_id);
create index if not exists events_student_idx on public.events (student_id, created_at);

-- =====================================================================
-- 2. Fungsi bantu: siswa milik perangkat yang sedang login
-- =====================================================================

create or replace function public.current_student_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select student_id from public.student_devices where auth_uid = auth.uid()
$$;

-- =====================================================================
-- 3. Row Level Security: siswa hanya bisa melihat/menulis datanya sendiri
-- =====================================================================

alter table public.students           enable row level security;
alter table public.student_devices    enable row level security;
alter table public.diagnostic_results enable row level security;
alter table public.module_progress    enable row level security;
alter table public.step_responses     enable row level security;
alter table public.hint_uses          enable row level security;
alter table public.explanations       enable row level security;
alter table public.events             enable row level security;

-- students: hanya baca baris sendiri; tidak bisa menulis dari aplikasi
drop policy if exists own_student_read on public.students;
create policy own_student_read on public.students
  for select to authenticated using (id = public.current_student_id());

-- student_devices: tanpa policy → hanya lewat fungsi claim_student_code

-- Tabel data yang hanya ditambah (append-only): baca & tambah milik sendiri
do $$
declare t text;
begin
  foreach t in array array['diagnostic_results','step_responses','hint_uses','events'] loop
    execute format('drop policy if exists own_insert on public.%I', t);
    execute format('drop policy if exists own_select on public.%I', t);
    execute format(
      'create policy own_insert on public.%I for insert to authenticated with check (student_id = public.current_student_id())', t);
    execute format(
      'create policy own_select on public.%I for select to authenticated using (student_id = public.current_student_id())', t);
  end loop;
end $$;

-- explanations: siswa tidak boleh mengisi nilai rubrik sendiri
drop policy if exists own_insert on public.explanations;
drop policy if exists own_select on public.explanations;
create policy own_insert on public.explanations
  for insert to authenticated
  with check (student_id = public.current_student_id() and rubric_score is null);
create policy own_select on public.explanations
  for select to authenticated using (student_id = public.current_student_id());

-- module_progress: baca, tambah, ubah milik sendiri
drop policy if exists own_progress on public.module_progress;
create policy own_progress on public.module_progress
  for all to authenticated
  using (student_id = public.current_student_id())
  with check (student_id = public.current_student_id());

-- =====================================================================
-- 4. Fungsi RPC
-- =====================================================================

-- Mengikat perangkat (login anonim) ke kode siswa
create or replace function public.claim_student_code(p_code text)
returns json
language plpgsql security definer set search_path = public
as $$
declare s public.students;
begin
  if auth.uid() is null then
    raise exception 'BELUM_LOGIN';
  end if;

  select * into s from public.students
   where code = upper(trim(p_code)) and active;
  if not found then
    raise exception 'KODE_TIDAK_DITEMUKAN';
  end if;

  insert into public.student_devices (auth_uid, student_id)
  values (auth.uid(), s.id)
  on conflict (auth_uid) do update set student_id = excluded.student_id;

  return json_build_object('student_id', s.id, 'grade', s.grade);
end
$$;

-- Memulihkan posisi belajar (kelas, kemajuan modul, hasil diagnostik)
create or replace function public.get_my_state()
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'student', (select json_build_object('id', s.id, 'grade', s.grade)
                  from public.students s where s.id = public.current_student_id()),
    'progress', coalesce((select json_agg(mp) from public.module_progress mp
                           where mp.student_id = public.current_student_id()), '[]'::json),
    'diagnostic', coalesce((select json_agg(d order by d.created_at) from public.diagnostic_results d
                             where d.student_id = public.current_student_id()), '[]'::json)
  )
$$;

revoke all on function public.claim_student_code(text) from public, anon;
revoke all on function public.get_my_state()            from public, anon;
revoke all on function public.current_student_id()      from public, anon;
grant execute on function public.claim_student_code(text) to authenticated;
grant execute on function public.get_my_state()            to authenticated;
grant execute on function public.current_student_id()      to authenticated;

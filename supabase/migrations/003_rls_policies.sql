-- ============================================================
-- REPLAY OS FINALE — Row Level Security (RLS)
-- ============================================================
-- Estrategia:
--   profiles SELECT: CENTER-WIDE (todos los del mismo centro pueden verse)
--     → permite JOINs de teacher names en getClassTemplates, getCalendarClasses, etc.
--     → el código usa getMyProfile() helper con .eq('id', user.id) para own-profile
--   Todas las demás tablas: filtro por center_id del usuario actual.
--   qr_tokens: lectura anon (para el kiosk de recepción sin login).
-- ============================================================

-- ===== PATCH: columnas faltantes en todas las tablas =====
-- Si alguna tabla ya existía antes de migration 001 (CREATE TABLE IF NOT EXISTS la saltea),
-- las columnas pueden no existir. ADD COLUMN IF NOT EXISTS es idempotente.
-- Sin FK constraint en center_id para evitar dependencia de que centers exista primero.

-- profiles
alter table profiles add column if not exists center_id  uuid;
alter table profiles add column if not exists role       text;
alter table profiles add column if not exists full_name  text;
alter table profiles add column if not exists email      text;
alter table profiles add column if not exists phone      text;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists is_active  boolean default true;
alter table profiles add column if not exists updated_at timestamptz default now();

-- tablas con center_id usadas en RLS policies
alter table disciplines       add column if not exists center_id uuid;
alter table rooms             add column if not exists center_id uuid;
alter table class_templates   add column if not exists center_id uuid;
alter table classes           add column if not exists center_id uuid;
alter table class_enrollments add column if not exists center_id uuid;
alter table holidays          add column if not exists center_id uuid;
alter table memberships       add column if not exists center_id uuid;
alter table payments          add column if not exists center_id uuid;
alter table recovery_balance  add column if not exists center_id uuid;
alter table qr_tokens         add column if not exists center_id uuid;
alter table ai_messages       add column if not exists center_id uuid;


-- Helper SECURITY DEFINER: devuelve el center_id del usuario actual
-- sin recursión en RLS de profiles.
-- Usamos plpgsql (no sql) para evitar validación de columnas en tiempo de compilación.
-- set search_path = public es obligatorio en Supabase para funciones SECURITY DEFINER.
drop function if exists get_my_center_id();
create or replace function get_my_center_id()
returns uuid
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return (select center_id from profiles where id = auth.uid());
end;
$$;


-- ===== HABILITAR RLS =====
alter table profiles         enable row level security;
alter table disciplines       enable row level security;
alter table rooms             enable row level security;
alter table class_templates   enable row level security;
alter table classes           enable row level security;
alter table class_enrollments enable row level security;
alter table attendance        enable row level security;
alter table holidays          enable row level security;
alter table memberships       enable row level security;
alter table payments          enable row level security;
alter table recovery_balance  enable row level security;
alter table qr_tokens         enable row level security;
alter table ai_messages       enable row level security;
-- centers no necesita RLS (solo lectura interna vía service role)


-- ===== PROFILES =====
-- SELECT: center-wide → el código usa getMyProfile() helper con .eq('id', user.id)
-- para lecturas del propio perfil. Permite JOINs de teacher names y listado de alumnos.
drop policy if exists "profiles_select_own"    on profiles;
drop policy if exists "profiles_select_center" on profiles;
drop policy if exists "profiles_update_own"    on profiles;
drop policy if exists "profiles_update_center" on profiles;
drop policy if exists "profiles_insert"        on profiles;

create policy "profiles_select_center"
  on profiles for select
  to authenticated
  using (center_id = get_my_center_id());

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (id = auth.uid());

-- INSERT: el trigger handle_new_user() usa SECURITY DEFINER (no necesita policy).
-- Esta policy permite que el service role inserte profiles en invitaciones.
create policy "profiles_insert"
  on profiles for insert
  to authenticated
  with check (true);


-- ===== DISCIPLINES =====
drop policy if exists "disciplines_all" on disciplines;

create policy "disciplines_all"
  on disciplines for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());


-- ===== ROOMS =====
drop policy if exists "rooms_all" on rooms;

create policy "rooms_all"
  on rooms for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());


-- ===== CLASS TEMPLATES =====
drop policy if exists "class_templates_all" on class_templates;

create policy "class_templates_all"
  on class_templates for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());


-- ===== CLASSES =====
drop policy if exists "classes_all" on classes;

create policy "classes_all"
  on classes for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());


-- ===== CLASS ENROLLMENTS =====
drop policy if exists "class_enrollments_all" on class_enrollments;

create policy "class_enrollments_all"
  on class_enrollments for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());


-- ===== ATTENDANCE =====
-- Lectura y escritura para todos los autenticados del centro.
-- Los alumnos insertan su propia asistencia; el admin/teacher puede verla.
drop policy if exists "attendance_all" on attendance;

create policy "attendance_all"
  on attendance for all
  to authenticated
  using (true)
  with check (true);


-- ===== HOLIDAYS =====
drop policy if exists "holidays_all" on holidays;

create policy "holidays_all"
  on holidays for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());


-- ===== MEMBERSHIPS =====
drop policy if exists "memberships_all" on memberships;

create policy "memberships_all"
  on memberships for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());


-- ===== PAYMENTS =====
drop policy if exists "payments_all" on payments;

create policy "payments_all"
  on payments for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());


-- ===== RECOVERY BALANCE =====
drop policy if exists "recovery_balance_all" on recovery_balance;

create policy "recovery_balance_all"
  on recovery_balance for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());


-- ===== QR TOKENS =====
-- El kiosk de recepción (/reception) NO requiere login → anon debe poder leer.
drop policy if exists "qr_tokens_select_public" on qr_tokens;
drop policy if exists "qr_tokens_manage"         on qr_tokens;

create policy "qr_tokens_select_public"
  on qr_tokens for select
  to anon, authenticated
  using (true);

create policy "qr_tokens_manage"
  on qr_tokens for insert
  to authenticated
  with check (center_id = get_my_center_id());


-- ===== AI MESSAGES =====
drop policy if exists "ai_messages_all" on ai_messages;

create policy "ai_messages_all"
  on ai_messages for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());

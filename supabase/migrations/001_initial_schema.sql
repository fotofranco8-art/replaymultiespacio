-- ============================================================
-- REPLAY OS FINALE — Schema inicial
-- Ejecutar en Supabase SQL Editor o con supabase db push
-- Todas las tablas usan CREATE TABLE IF NOT EXISTS (idempotente)
-- ============================================================

-- ===========================
-- CENTERS (multi-tenancy)
-- ===========================
create table if not exists centers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  contact_info text,
  created_at  timestamptz default now()
);

-- ===========================
-- PROFILES (extiende auth.users)
-- ===========================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  center_id   uuid references centers(id) on delete set null,
  role        text not null default 'student'
                check (role in ('admin', 'teacher', 'student', 'reception')),
  full_name   text,
  email       text,
  phone       text,
  avatar_url  text,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ===========================
-- DISCIPLINES
-- ===========================
create table if not exists disciplines (
  id          uuid primary key default gen_random_uuid(),
  center_id   uuid not null references centers(id) on delete cascade,
  name        text not null,
  color       text not null default '#A855F7',
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ===========================
-- ROOMS
-- ===========================
create table if not exists rooms (
  id          uuid primary key default gen_random_uuid(),
  center_id   uuid not null references centers(id) on delete cascade,
  name        text not null,
  capacity    integer default 20,
  description text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ===========================
-- CLASS TEMPLATES (plantillas semanales)
-- ===========================
create table if not exists class_templates (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references centers(id) on delete cascade,
  discipline_id uuid not null references disciplines(id) on delete cascade,
  teacher_id    uuid references profiles(id) on delete set null,
  day_of_week   integer not null check (day_of_week >= 0 and day_of_week <= 6),
  -- 0=domingo, 1=lunes, ..., 6=sábado (extraído con extract(dow))
  start_time    time not null,
  end_time      time not null,
  room          text,
  max_capacity  integer default 20,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- ===========================
-- CLASSES (instancias concretas de clases)
-- Nombre del FK de teacher_id: classes_teacher_id_fkey (por defecto)
-- ===========================
create table if not exists classes (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references centers(id) on delete cascade,
  template_id   uuid references class_templates(id) on delete set null,
  discipline_id uuid not null references disciplines(id) on delete cascade,
  teacher_id    uuid references profiles(id) on delete set null,
  room          text,
  scheduled_date date not null,
  start_time    time not null,
  end_time      time not null,
  is_cancelled  boolean default false,
  max_capacity  integer default 20,
  created_at    timestamptz default now(),
  -- Evitar duplicados al proyectar el mismo mes dos veces
  unique (center_id, template_id, scheduled_date)
);

-- ===========================
-- CLASS ENROLLMENTS (alumnos inscriptos en clases)
-- ===========================
create table if not exists class_enrollments (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  student_id  uuid not null references profiles(id) on delete cascade,
  center_id   uuid not null references centers(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (class_id, student_id)
);

-- ===========================
-- ATTENDANCE (registro de asistencia por QR)
-- ===========================
create table if not exists attendance (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references classes(id) on delete cascade,
  student_id    uuid not null references profiles(id) on delete cascade,
  checked_in_at timestamptz default now(),
  created_at    timestamptz default now(),
  unique (class_id, student_id)
);

-- ===========================
-- HOLIDAYS (feriados)
-- ===========================
create table if not exists holidays (
  id          uuid primary key default gen_random_uuid(),
  center_id   uuid not null references centers(id) on delete cascade,
  date        date not null,
  name        text not null,
  created_at  timestamptz default now()
);

-- ===========================
-- MEMBERSHIPS (planes de los alumnos)
-- ===========================
create table if not exists memberships (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references profiles(id) on delete cascade,
  center_id         uuid not null references centers(id) on delete cascade,
  discipline_id     uuid references disciplines(id) on delete set null,
  plan_name         text not null,
  monthly_fee       numeric not null default 0,
  classes_per_month integer not null default 4,
  status            text not null default 'active'
                      check (status in ('active', 'expired', 'suspended')),
  is_blocked        boolean default false,
  start_date        date not null default current_date,
  created_at        timestamptz default now()
);

-- ===========================
-- PAYMENTS (pagos registrados)
-- Nota: FK payments_student_id_fkey es el nombre por defecto de Postgres
-- para la FK student_id → profiles.id. Usado explícitamente en el código.
-- ===========================
create table if not exists payments (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references profiles(id) on delete cascade,
  center_id         uuid not null references centers(id) on delete cascade,
  membership_id     uuid references memberships(id) on delete set null,
  amount            numeric not null,
  method            text not null check (method in ('cash', 'transfer')),
  transfer_surcharge boolean default false,
  final_amount      numeric not null,
  notes             text,
  registered_by     uuid references profiles(id) on delete set null,
  created_at        timestamptz default now()
);

-- ===========================
-- RECOVERY BALANCE (créditos de clases recuperables)
-- UNIQUE en (student_id, center_id) para el ON CONFLICT del código
-- ===========================
create table if not exists recovery_balance (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references profiles(id) on delete cascade,
  center_id   uuid not null references centers(id) on delete cascade,
  balance     integer not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (student_id, center_id)
);

-- ===========================
-- QR TOKENS (token estático por centro para el kiosk)
-- ===========================
create table if not exists qr_tokens (
  id          uuid primary key default gen_random_uuid(),
  center_id   uuid not null references centers(id) on delete cascade,
  token       text not null unique,
  created_at  timestamptz default now()
);

-- ===========================
-- AI MESSAGES (historial del agente IA)
-- ===========================
create table if not exists ai_messages (
  id          uuid primary key default gen_random_uuid(),
  center_id   uuid not null references centers(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz default now()
);

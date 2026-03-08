-- ============================================================
-- REPLAY OS FINALE — Seed data
-- Centro por defecto + QR token inicial
-- Idempotente: usa ON CONFLICT DO NOTHING
-- ============================================================

-- Patch: columnas faltantes en centers (por si la tabla existía antes de migration 001)
alter table centers add column if not exists name         text;
alter table centers add column if not exists slug         text;
alter table centers add column if not exists address      text;
alter table centers add column if not exists contact_info text;
alter table centers add column if not exists created_at   timestamptz default now();

-- Patch: columnas faltantes en qr_tokens
alter table qr_tokens add column if not exists center_id  uuid;
alter table qr_tokens add column if not exists token      text;
alter table qr_tokens add column if not exists is_active  boolean default true;
alter table qr_tokens add column if not exists created_at timestamptz default now();

-- Centro por defecto (ID fijo para desarrollo, coincide con CENTER_ID hardcodeado en el código)
insert into centers (id, name, slug, address)
values (
  '00000000-0000-0000-0000-000000000001',
  'Replay Multiespacio',
  'replay-multiespacio',
  'Buenos Aires, Argentina'
)
on conflict (id) do nothing;


-- QR Token inicial para el kiosk de recepción
-- Este token es estático y se muestra en /reception como QR para escanear
insert into qr_tokens (center_id, token)
values (
  '00000000-0000-0000-0000-000000000001',
  'replay-checkin-2024'
)
on conflict (center_id) do update set token = 'replay-checkin-2024';


-- ============================================================
-- PRÓXIMOS PASOS (ejecutar manualmente después de este seed):
--
-- 1. Crear el primer usuario admin desde Supabase Dashboard:
--    Authentication → Users → Invite user
--    O usar la API de Supabase con service role key.
--
-- 2. Después de crear el usuario, actualizar su profile:
--    update profiles
--    set role = 'admin',
--        center_id = '00000000-0000-0000-0000-000000000001',
--        full_name = 'Tu Nombre'
--    where email = 'tu-email@ejemplo.com';
--
-- 3. Verificar que el trigger funcionó correctamente:
--    select * from profiles where email = 'tu-email@ejemplo.com';
-- ============================================================

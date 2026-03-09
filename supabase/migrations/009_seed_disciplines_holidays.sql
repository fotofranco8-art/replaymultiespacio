-- ============================================================
-- 009 — Seed: Disciplinas 2026 + Feriados 2026
-- Replay Multiespacio Artístico
-- Center ID: 00000000-0000-0000-0000-000000000001
-- ============================================================

-- ---- DISCIPLINAS --------------------------------------------
-- Elimina datos previos del centro para evitar duplicados
DELETE FROM disciplines WHERE center_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO disciplines (center_id, name, color, type, monthly_price, modality, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Canto Individual',        '#FF2D78', 'individual', 73000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Canto Dúo',               '#E879F9', 'individual', 60000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Canto Grupal',            '#A855F7', 'grupal',     50000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Canto Kids/Teens',        '#F59E0B', 'grupal',     50000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Experiencia Piano',       '#3B82F6', 'grupal',     67000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Replay Fusion',           '#06B6D4', 'grupal',     77000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Unplugged Replay',        '#10B981', 'grupal',     82000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Teatro Musical Infantil', '#F97316', 'grupal',     55000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Teatro Musical Teens',    '#8B5CF6', 'grupal',     55000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Piano Individual',        '#EF4444', 'individual', 90000, 'anual', true),
  ('00000000-0000-0000-0000-000000000001', 'Guitarra Individual',     '#84CC16', 'individual', 80000, 'anual', true);

-- ---- FERIADOS 2026 ------------------------------------------
DELETE FROM holidays WHERE center_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO holidays (center_id, date, name) VALUES
  -- Febrero
  ('00000000-0000-0000-0000-000000000001', '2026-02-16', 'Carnaval'),
  ('00000000-0000-0000-0000-000000000001', '2026-02-17', 'Carnaval — recupera el 02/06'),
  -- Marzo
  ('00000000-0000-0000-0000-000000000001', '2026-03-23', 'Día previo a Día de la Memoria'),
  ('00000000-0000-0000-0000-000000000001', '2026-03-24', 'Día Nacional de la Memoria'),
  -- Abril
  ('00000000-0000-0000-0000-000000000001', '2026-04-02', 'Día del Veterano de Malvinas'),
  ('00000000-0000-0000-0000-000000000001', '2026-04-03', 'Viernes Santo — recupera el 03/07'),
  -- Mayo
  ('00000000-0000-0000-0000-000000000001', '2026-05-01', 'Día del Trabajador'),
  ('00000000-0000-0000-0000-000000000001', '2026-05-25', 'Día de la Revolución de Mayo'),
  -- Junio
  ('00000000-0000-0000-0000-000000000001', '2026-06-15', 'Día de Güemes'),
  -- Julio
  ('00000000-0000-0000-0000-000000000001', '2026-07-09', 'Día de la Independencia'),
  ('00000000-0000-0000-0000-000000000001', '2026-07-10', 'Puente turístico — recupera el 02/10'),
  -- Agosto
  ('00000000-0000-0000-0000-000000000001', '2026-08-17', 'Paso a la Inmortalidad del Gral. San Martín'),
  -- Octubre
  ('00000000-0000-0000-0000-000000000001', '2026-10-12', 'Día del Respeto a la Diversidad Cultural'),
  -- Noviembre
  ('00000000-0000-0000-0000-000000000001', '2026-11-23', 'Día de la Soberanía Nacional'),
  -- Diciembre
  ('00000000-0000-0000-0000-000000000001', '2026-12-08', 'Inmaculada Concepción de María');

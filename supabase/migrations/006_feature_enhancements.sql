-- ===========================
-- Migration 006: Feature enhancements
-- Disciplines: type, monthly_price, max_capacity, modality, description
-- Profiles: specialties (teachers), legajo (students)
-- Payments: nullable student_id, payment_type, late_surcharge, multi_discipline_discount
-- Rooms: equipment tags
-- New table: class_template_students
-- Updated RPC: project_month (auto-enrolls template students)
-- ===========================

-- 1. disciplines: tipo, precio mensual, capacidad, modalidad, descripción
ALTER TABLE disciplines
  ADD COLUMN IF NOT EXISTS type          text    NOT NULL DEFAULT 'grupal',
  ADD COLUMN IF NOT EXISTS monthly_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_capacity  integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS modality      text    NOT NULL DEFAULT 'anual',
  ADD COLUMN IF NOT EXISTS description   text;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'disciplines_type_check'
  ) THEN
    ALTER TABLE disciplines ADD CONSTRAINT disciplines_type_check CHECK (type IN ('grupal','individual'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'disciplines_modality_check'
  ) THEN
    ALTER TABLE disciplines ADD CONSTRAINT disciplines_modality_check CHECK (modality IN ('anual','seminario'));
  END IF;
END $$;

-- 2. profiles: specialties (array de strings para profesores) y legajo (código para alumnos)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS legajo      text;

-- 3. payments: student_id nullable (para pagos de productos sin alumno)
ALTER TABLE payments ALTER COLUMN student_id DROP NOT NULL;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_type              text    NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS product_name              text,
  ADD COLUMN IF NOT EXISTS late_surcharge            boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS multi_discipline_discount boolean DEFAULT false;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_payment_type_check'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_payment_type_check
      CHECK (payment_type IN ('student','product'));
  END IF;
END $$;

-- 4. rooms: equipment tags (array de strings)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS equipment text[] DEFAULT '{}';

-- 5. class_template_students: alumnos asignados a una plantilla semanal
CREATE TABLE IF NOT EXISTS class_template_students (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid        NOT NULL REFERENCES class_templates(id) ON DELETE CASCADE,
  student_id  uuid        NOT NULL REFERENCES profiles(id)        ON DELETE CASCADE,
  center_id   uuid        NOT NULL REFERENCES centers(id)         ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(template_id, student_id)
);

-- 6. project_month actualizado: al crear una clase, auto-inscribe alumnos asignados a la plantilla
DROP FUNCTION IF EXISTS project_month(uuid, int, int);
CREATE OR REPLACE FUNCTION project_month(
  p_center_id uuid,
  p_year      int,
  p_month     int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template      record;
  v_date          date;
  v_start         date;
  v_end           date;
  v_holiday_dates date[];
  v_class_id      uuid;
BEGIN
  v_start := make_date(p_year, p_month, 1);
  v_end   := (v_start + interval '1 month' - interval '1 day')::date;

  SELECT array_agg(h.date)
    INTO v_holiday_dates
    FROM holidays h
   WHERE h.center_id = p_center_id
     AND h.date BETWEEN v_start AND v_end;

  FOR v_template IN
    SELECT *
      FROM class_templates
     WHERE center_id = p_center_id
       AND is_active  = true
  LOOP
    v_date := v_start;
    WHILE v_date <= v_end LOOP
      IF extract(dow FROM v_date)::int = v_template.day_of_week
         AND (v_holiday_dates IS NULL OR NOT (v_date = ANY(v_holiday_dates)))
      THEN
        INSERT INTO classes (
          center_id, template_id, discipline_id, teacher_id,
          room, scheduled_date, start_time, end_time, max_capacity
        )
        VALUES (
          p_center_id, v_template.id, v_template.discipline_id, v_template.teacher_id,
          v_template.room, v_date, v_template.start_time, v_template.end_time, v_template.max_capacity
        )
        ON CONFLICT ON CONSTRAINT classes_center_template_date_unique DO NOTHING
        RETURNING id INTO v_class_id;

        -- Auto-inscribir alumnos asignados a la plantilla
        IF v_class_id IS NOT NULL THEN
          INSERT INTO class_enrollments (class_id, student_id, center_id)
          SELECT v_class_id, cts.student_id, p_center_id
            FROM class_template_students cts
           WHERE cts.template_id = v_template.id
          ON CONFLICT (class_id, student_id) DO NOTHING;
        END IF;
      END IF;
      v_date := v_date + interval '1 day';
    END LOOP;
  END LOOP;
END;
$$;

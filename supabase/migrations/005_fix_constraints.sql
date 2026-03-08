-- ===========================
-- Migration 005: Fix unique constraint on classes table
-- Error 42P10: ON CONFLICT requires a matching unique/exclusion constraint.
-- The constraint was defined in 001_initial_schema.sql but may not exist
-- in databases created before that migration was applied.
-- ===========================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'classes_center_template_date_unique'
      AND conrelid = 'classes'::regclass
  ) THEN
    -- Drop the anonymous constraint first if it exists under a different name
    -- (created by "unique (center_id, template_id, scheduled_date)" inline)
    DECLARE
      v_conname text;
    BEGIN
      SELECT conname INTO v_conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_attribute a1 ON a1.attrelid = t.oid AND a1.attname = 'center_id'
        JOIN pg_attribute a2 ON a2.attrelid = t.oid AND a2.attname = 'template_id'
        JOIN pg_attribute a3 ON a3.attrelid = t.oid AND a3.attname = 'scheduled_date'
       WHERE t.relname = 'classes'
         AND c.contype = 'u'
         AND c.conkey @> ARRAY[a1.attnum, a2.attnum, a3.attnum]::smallint[]
         AND array_length(c.conkey, 1) = 3
       LIMIT 1;

      IF v_conname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE classes RENAME CONSTRAINT %I TO classes_center_template_date_unique', v_conname);
      ELSE
        ALTER TABLE classes
          ADD CONSTRAINT classes_center_template_date_unique
          UNIQUE (center_id, template_id, scheduled_date);
      END IF;
    END;
  END IF;
END
$$;

-- Re-create project_month referencing the named constraint explicitly
drop function if exists project_month(uuid, int, int);
create or replace function project_month(
  p_center_id uuid,
  p_year      int,
  p_month     int
)
returns void
language plpgsql
security definer
as $$
declare
  v_template     record;
  v_date         date;
  v_start        date;
  v_end          date;
  v_holiday_dates date[];
begin
  v_start := make_date(p_year, p_month, 1);
  v_end   := (v_start + interval '1 month' - interval '1 day')::date;

  select array_agg(h.date)
    into v_holiday_dates
    from holidays h
   where h.center_id = p_center_id
     and h.date between v_start and v_end;

  for v_template in
    select *
      from class_templates
     where center_id = p_center_id
       and is_active  = true
  loop
    v_date := v_start;

    while v_date <= v_end loop
      if extract(dow from v_date)::int = v_template.day_of_week
         and (v_holiday_dates is null or not (v_date = any(v_holiday_dates)))
      then
        insert into classes (
          center_id,
          template_id,
          discipline_id,
          teacher_id,
          room,
          scheduled_date,
          start_time,
          end_time,
          max_capacity
        )
        values (
          p_center_id,
          v_template.id,
          v_template.discipline_id,
          v_template.teacher_id,
          v_template.room,
          v_date,
          v_template.start_time,
          v_template.end_time,
          v_template.max_capacity
        )
        on conflict on constraint classes_center_template_date_unique do nothing;
      end if;

      v_date := v_date + interval '1 day';
    end loop;
  end loop;
end;
$$;

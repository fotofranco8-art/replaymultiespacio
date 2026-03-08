-- ============================================================
-- REPLAY OS FINALE — Triggers y RPCs
-- ============================================================

-- ===========================
-- TRIGGER: auto-crear profile cuando Supabase invita a un usuario
-- ===========================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, center_id, role, full_name, email, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'center_id', '')::uuid,
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'student'),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ===========================
-- RPC: project_month
-- Genera instancias de clases para un mes completo desde los templates activos.
-- Saltea feriados. Idempotente (ON CONFLICT DO NOTHING).
-- ===========================
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

  -- Recopilar fechas de feriados del centro en este mes
  select array_agg(h.date)
    into v_holiday_dates
    from holidays h
   where h.center_id = p_center_id
     and h.date between v_start and v_end;

  -- Para cada template activo del centro, generar clases del mes
  for v_template in
    select *
      from class_templates
     where center_id = p_center_id
       and is_active  = true
  loop
    v_date := v_start;

    while v_date <= v_end loop
      -- extract(dow) en PostgreSQL: 0=domingo, 1=lunes, ..., 6=sábado
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
        on conflict (center_id, template_id, scheduled_date) do nothing;
      end if;

      v_date := v_date + interval '1 day';
    end loop;
  end loop;
end;
$$;


-- ===========================
-- RPC: cancel_holiday_classes
-- Cancela todas las clases de un centro en una fecha dada.
-- Acredita 1 clase de recovery_balance a cada alumno inscripto.
-- ===========================
drop function if exists cancel_holiday_classes(uuid, date);
create or replace function cancel_holiday_classes(
  p_center_id uuid,
  p_date      date
)
returns void
language plpgsql
security definer
as $$
declare
  v_class      record;
  v_enrollment record;
begin
  -- Iterar sobre clases no canceladas de ese centro y fecha
  for v_class in
    select id
      from classes
     where center_id    = p_center_id
       and scheduled_date = p_date
       and is_cancelled   = false
  loop
    -- Marcar como cancelada
    update classes set is_cancelled = true where id = v_class.id;

    -- Acreditar recovery_balance a cada alumno inscripto
    for v_enrollment in
      select student_id
        from class_enrollments
       where class_id = v_class.id
    loop
      insert into recovery_balance (student_id, center_id, balance)
      values (v_enrollment.student_id, p_center_id, 1)
      on conflict (student_id, center_id)
      do update set
        balance    = recovery_balance.balance + 1,
        updated_at = now();
    end loop;
  end loop;
end;
$$;

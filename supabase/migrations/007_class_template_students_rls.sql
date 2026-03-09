-- ===========================
-- Migration 007: RLS para class_template_students
-- La tabla fue creada en 006 sin políticas RLS, lo que bloquea
-- silenciosamente los inserts desde el cliente autenticado.
-- ===========================

alter table class_template_students enable row level security;

drop policy if exists "class_template_students_all" on class_template_students;

create policy "class_template_students_all"
  on class_template_students for all
  to authenticated
  using     (center_id = get_my_center_id())
  with check (center_id = get_my_center_id());

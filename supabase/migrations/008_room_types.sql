-- Agregar campo type a rooms para diferenciar aulas grupales de individuales
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'grupal'
    CHECK (type IN ('grupal', 'individual'));

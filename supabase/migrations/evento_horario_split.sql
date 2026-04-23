-- Migration: split horario into horario_inicio and horario_fim
-- Replaces the free-text horario column with two structured TIME columns.

ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS horario_inicio TEXT,
  ADD COLUMN IF NOT EXISTS horario_fim    TEXT;

-- Existing rows will have NULL for both new columns (old data cannot be
-- reliably parsed from free-text format). The application now validates
-- and stores values in HH:MM format via type="time" inputs.

ALTER TABLE eventos DROP COLUMN IF EXISTS horario;
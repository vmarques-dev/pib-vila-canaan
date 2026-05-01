import { clsx, type ClassValue } from "clsx"
import { parseISO } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a date string into a Date without a timezone shift.
 * Takes the YYYY-MM-DD portion only and appends T12:00:00 so the
 * local timezone never shifts the day.
 */
export function parseLocalDate(dateStr: string): Date {
  const dateOnly = dateStr.substring(0, 10)
  return parseISO(dateOnly + 'T12:00:00')
}

/**
 * Formats the horario_inicio and horario_fim fields for display.
 * Examples: "19:00 às 21:00" | "19:00" | null
 */
export function formatHorario(
  inicio?: string | null,
  fim?: string | null
): string | null {
  if (!inicio) return null
  return fim ? `${inicio} às ${fim}` : inicio
}

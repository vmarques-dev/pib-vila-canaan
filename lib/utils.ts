import { clsx, type ClassValue } from "clsx"
import { parseISO } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte uma string de data para Date sem shift de timezone.
 * Extrai apenas a parte YYYY-MM-DD e adiciona T12:00:00 para evitar
 * que o fuso horário local desloque o dia.
 */
export function parseLocalDate(dateStr: string): Date {
  const dateOnly = dateStr.substring(0, 10)
  return parseISO(dateOnly + 'T12:00:00')
}

/**
 * Formata os campos horario_inicio e horario_fim para exibição.
 * Exemplos: "19:00 às 21:00" | "19:00" | null
 */
export function formatHorario(
  inicio?: string | null,
  fim?: string | null
): string | null {
  if (!inicio) return null
  return fim ? `${inicio} às ${fim}` : inicio
}

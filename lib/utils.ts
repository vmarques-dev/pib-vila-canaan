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

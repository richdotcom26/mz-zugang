import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-Klassen zusammenführen (Konflikte gewinnt die letzte). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Datum (Date | ISO | 'YYYY-MM-DD') als de-DE `TT.MM.JJJJ`. */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "–";
  const d = value instanceof Date ? value : new Date(value.length <= 10 ? value + "T00:00:00Z" : value);
  if (Number.isNaN(d.getTime())) return "–";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

/** Zeitstempel (Date | ISO) als de-DE `TT.MM.JJJJ, HH:MM`. */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "–";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "–";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

import { cn } from "@/lib/utils";
import type { PersonMitGruppe } from "@/lib/domain/personen";

/**
 * Status einer Person aus Sicht des Abgleichs mit der Key-Verwaltung:
 *  offen       = aktiv, noch nicht abgeglichen (Arbeitsliste)
 *  abgeglichen = aktiv und abgeglichen (Transponder bleibt aktiv)
 *  inaktiv     = Zugang soll gesperrt werden
 */
export type Status = "offen" | "abgeglichen" | "inaktiv";
export type StatusFilter = Status | "alle";

export function statusVon(p: Pick<PersonMitGruppe, "aktiv" | "abgleichKeyverwaltungAm">): Status {
  if (!p.aktiv) return "inaktiv";
  return p.abgleichKeyverwaltungAm ? "abgeglichen" : "offen";
}

export const STATUS_LABEL: Record<Status, string> = {
  offen: "Offen",
  abgeglichen: "Abgeglichen",
  inaktiv: "Inaktiv",
};

const PILL: Record<Status, string> = {
  offen: "bg-amber-100 text-amber-800",
  abgeglichen: "bg-green-100 text-green-800",
  inaktiv: "bg-red-100 text-red-700",
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        PILL[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

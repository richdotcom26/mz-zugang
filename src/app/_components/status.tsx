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

/** Filter der Kacheln oben: nach Übergabebeleg (unterschrieben ja/nein) bzw. inaktiv. */
export type BelegFilter = "alle" | "ohneBeleg" | "mitBeleg" | "inaktiv";

export function belegStandVon(
  p: Pick<PersonMitGruppe, "aktiv" | "uebergabeSignaturAm">,
): Exclude<BelegFilter, "alle"> {
  if (!p.aktiv) return "inaktiv";
  return p.uebergabeSignaturAm ? "mitBeleg" : "ohneBeleg";
}

const BELEG: Record<Exclude<BelegFilter, "alle">, { label: string; farbe: string }> = {
  ohneBeleg: { label: "Ohne Beleg", farbe: "bg-amber-100 text-amber-800" },
  mitBeleg: { label: "Mit Beleg", farbe: "bg-green-100 text-green-800" },
  inaktiv: { label: "Inaktiv", farbe: "bg-red-100 text-red-700" },
};

/** Haupt-Etikett einer Person: Stand des Übergabebelegs (bzw. inaktiv). */
export function BelegPill({
  person,
  className,
}: {
  person: Pick<PersonMitGruppe, "aktiv" | "uebergabeSignaturAm">;
  className?: string;
}) {
  const b = BELEG[belegStandVon(person)];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        b.farbe,
        className,
      )}
    >
      {b.label}
    </span>
  );
}

/** Zusatz-Badge „Abgeglichen“ (mit Key-Verwaltung), nur wenn gesetzt. */
export function AbgleichBadge({ className }: { className?: string }) {
  return (
    <span
      title="Mit Key-Verwaltung abgeglichen"
      className={cn(
        "inline-flex items-center gap-0.5 whitespace-nowrap rounded-full border border-navy/20 bg-navy/5 px-1.5 py-px text-[10px] font-medium text-navy",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
        <path d="m5 12 5 5L20 7" />
      </svg>
      Abgeglichen
    </span>
  );
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

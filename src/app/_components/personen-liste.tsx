"use client";

import { IconChevronDown, IconPlus, IconStar } from "@/components/ui/icons";
import { useErfordertName } from "@/lib/use-mein-name";
import { cn } from "@/lib/utils";
import { StatusPill, statusVon } from "./status";
import type { Gruppe } from "@/lib/db/schema";
import type { PersonMitGruppe } from "@/lib/domain/personen";

/** Personen nach Gruppe: farbig hinterlegte, einklappbare Gruppenzeilen, darunter kompakte Zeilen. */
export function PersonenListe({
  gruppen,
  alle,
  sichtbar,
  filterAktiv,
  zugeklappt,
  onToggleGruppe,
  ausgewaehltId,
  onAuswaehlen,
  onNeuInGruppe,
}: {
  gruppen: Gruppe[];
  alle: PersonMitGruppe[];
  sichtbar: PersonMitGruppe[];
  filterAktiv: boolean;
  zugeklappt: Set<number>;
  onToggleGruppe: (gruppeId: number) => void;
  ausgewaehltId: number | null;
  onAuswaehlen: (personId: number) => void;
  onNeuInGruppe: (gruppeId: number) => void;
}) {
  const { spread: sperre } = useErfordertName();

  if (gruppen.length === 0) {
    return <p className="p-4 text-sm text-muted">Noch keine Gruppen angelegt (Einstellungen).</p>;
  }

  const bloecke = gruppen
    .map((gruppe) => ({
      gruppe,
      mitglieder: sichtbar.filter((p) => p.gruppeId === gruppe.id),
      gesamt: alle.filter((p) => p.gruppeId === gruppe.id),
    }))
    .filter((b) => !filterAktiv || b.mitglieder.length > 0);

  if (bloecke.length === 0) {
    return <p className="p-4 text-sm text-muted">Keine Treffer.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      {bloecke.map(({ gruppe, mitglieder, gesamt }) => {
        // Bei aktivem Filter sind Gruppen mit Treffern immer offen.
        const zu = zugeklappt.has(gruppe.id) && !filterAktiv;
        const abgeglichen = gesamt.filter((p) => statusVon(p) === "abgeglichen").length;
        const aktive = gesamt.filter((p) => p.aktiv).length;
        return (
          <section key={gruppe.id} className="border-b border-line last:border-b-0">
            <div className="flex items-center gap-2 bg-brand-soft px-3 py-2">
              <button
                type="button"
                onClick={() => onToggleGruppe(gruppe.id)}
                aria-expanded={!zu}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <IconChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-navy transition-transform",
                    (zu || mitglieder.length === 0) && "-rotate-90",
                    mitglieder.length === 0 && "opacity-30",
                  )}
                />
                <span className="truncate text-sm font-semibold text-navy">{gruppe.name}</span>
                <span className="shrink-0 text-xs text-navy/70">
                  {gesamt.length} · {abgeglichen}/{aktive} abgeglichen
                </span>
              </button>
              <button
                type="button"
                onClick={() => onNeuInGruppe(gruppe.id)}
                title={sperre.title ?? `Person in „${gruppe.name}“ hinzufügen`}
                aria-label={`Person in ${gruppe.name} hinzufügen`}
                disabled={sperre.disabled}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-navy transition-colors hover:bg-brand/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconPlus />
              </button>
            </div>

            {zu || mitglieder.length === 0 ? null : (
              <ul>
                {mitglieder.map((p) => (
                  <li key={p.id} className="border-t border-line first:border-t-0">
                    <button
                      type="button"
                      onClick={() => onAuswaehlen(p.id)}
                      aria-current={ausgewaehltId === p.id ? "true" : undefined}
                      className={cn(
                        "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-2 text-left transition-colors sm:grid-cols-[minmax(0,1fr)_5.5rem_6.5rem]",
                        ausgewaehltId === p.id
                          ? "bg-navy/10 shadow-[inset_4px_0_0_var(--color-navy)] [&_span]:font-semibold"
                          : "hover:bg-page",
                        !p.aktiv && "text-muted",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className={cn("truncate text-sm font-medium", p.aktiv ? "text-ink" : "text-muted line-through")}>
                          {p.nachname}, {p.vorname}
                        </span>
                        {p.istHauptkontakt ? (
                          <IconStar className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Hauptkontakt" />
                        ) : null}
                      </span>
                      <span className="hidden font-mono text-xs text-muted sm:block">{p.transponderNr ?? "–"}</span>
                      <StatusPill status={statusVon(p)} className="justify-self-end" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

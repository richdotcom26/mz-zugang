"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { IconChevronLeft, IconPlus, IconSearch } from "@/components/ui/icons";
import { useErfordertName } from "@/lib/use-mein-name";
import { cn } from "@/lib/utils";
import { PersonenListe } from "./personen-liste";
import { PersonDetail } from "./person-detail";
import { PersonFormular } from "./person-formular";
import { belegStandVon, type BelegFilter } from "./status";
import type { Gruppe, Raum } from "@/lib/db/schema";
import type { PersonMitGruppe } from "@/lib/domain/personen";

type Auswahl = { art: "person"; id: number } | { art: "neu"; gruppeId: number | null } | null;

const KACHELN: { filter: BelegFilter; label: string; farbe: string }[] = [
  { filter: "alle", label: "Alle Personen", farbe: "text-navy" },
  { filter: "ohneBeleg", label: "Noch ohne Beleg", farbe: "text-amber-700" },
  { filter: "mitBeleg", label: "Mit Beleg", farbe: "text-green-700" },
  { filter: "inaktiv", label: "Inaktiv", farbe: "text-red-700" },
];

/**
 * Hauptansicht: Statuskacheln (filtern) · Werkzeugzeile · Liste nach Gruppen ·
 * Detailbereich rechts (auf dem Handy als Vollbild über der Liste).
 */
export function Portal({
  gruppen,
  raeume,
  personen,
}: {
  gruppen: Gruppe[];
  raeume: Raum[];
  personen: PersonMitGruppe[];
}) {
  const { spread: sperre } = useErfordertName();
  const [statusFilter, setStatusFilter] = useState<BelegFilter>("alle");
  const [suche, setSuche] = useState("");
  const [raumFilter, setRaumFilter] = useState("");
  const [zugeklappt, setZugeklappt] = useState<Set<number>>(() => new Set());
  const [auswahl, setAuswahl] = useState<Auswahl>(null);

  const anzahl = useMemo(() => {
    const z: Record<BelegFilter, number> = { alle: personen.length, ohneBeleg: 0, mitBeleg: 0, inaktiv: 0 };
    for (const p of personen) z[belegStandVon(p)]++;
    return z;
  }, [personen]);

  const filterAktiv = statusFilter !== "alle" || suche.trim() !== "" || raumFilter !== "";

  const sichtbar = useMemo(() => {
    const q = suche.trim().toLowerCase();
    const raumId = raumFilter ? Number(raumFilter) : null;
    return personen.filter((p) => {
      if (statusFilter !== "alle" && belegStandVon(p) !== statusFilter) return false;
      if (raumId !== null && !p.raeume.some((r) => r.id === raumId)) return false;
      if (q) {
        const text = [p.vorname, p.nachname, p.transponderNr, p.telefon, p.email, p.bemerkung]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [personen, statusFilter, suche, raumFilter]);

  const person = auswahl?.art === "person" ? personen.find((p) => p.id === auswahl.id) : undefined;
  const panelOffen = auswahl?.art === "neu" || !!person;

  function toggleGruppe(id: number) {
    setZugeklappt((alt) => {
      const neu = new Set(alt);
      if (neu.has(id)) neu.delete(id);
      else neu.add(id);
      return neu;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {KACHELN.map((k) => (
          <button
            key={k.filter}
            type="button"
            onClick={() => setStatusFilter(statusFilter === k.filter && k.filter !== "alle" ? "alle" : k.filter)}
            aria-pressed={statusFilter === k.filter}
            className={cn(
              "rounded-xl border bg-surface px-3 py-2 text-left shadow-sm transition-colors",
              statusFilter === k.filter ? "border-brand ring-2 ring-brand/25" : "border-line hover:border-brand/40",
            )}
          >
            <span className={cn("block text-2xl font-semibold leading-tight", k.farbe)}>{anzahl[k.filter]}</span>
            <span className="text-xs text-muted">{k.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
          <Input
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Name, Transponder, Telefon, E-Mail …"
            className="pl-8"
            aria-label="Suche"
          />
        </div>
        <div className="flex gap-2">
          <Select value={raumFilter} onChange={(e) => setRaumFilter(e.target.value)} className="sm:w-40" aria-label="Tür">
            <option value="">Alle Türen</option>
            {raeume.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <Button onClick={() => setAuswahl({ art: "neu", gruppeId: null })} className="shrink-0" {...sperre}>
            <IconPlus />
            Person
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <PersonenListe
          gruppen={gruppen}
          alle={personen}
          sichtbar={sichtbar}
          filterAktiv={filterAktiv}
          zugeklappt={zugeklappt}
          onToggleGruppe={toggleGruppe}
          ausgewaehltId={person?.id ?? null}
          onAuswaehlen={(id) => setAuswahl({ art: "person", id })}
          onNeuInGruppe={(gruppeId) => setAuswahl({ art: "neu", gruppeId })}
        />

        {panelOffen ? (
          <aside
            className={cn(
              // Handy: Vollbild über der Liste; Desktop: mitlaufende Spalte rechts.
              "fixed inset-0 z-40 overflow-y-auto bg-page p-4",
              "lg:sticky lg:inset-auto lg:top-4 lg:z-auto lg:max-h-[calc(100vh-2rem)] lg:rounded-xl lg:border lg:border-line lg:bg-surface lg:shadow-sm",
            )}
          >
            <button
              type="button"
              onClick={() => setAuswahl(null)}
              className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-brand lg:hidden"
            >
              <IconChevronLeft />
              Zur Liste
            </button>
  
            {auswahl?.art === "neu" ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-navy">Neue Person</h2>
                <PersonFormular
                  key={`neu-${auswahl.gruppeId ?? "x"}`}
                  gruppen={gruppen}
                  raeume={raeume}
                  vorausgewaehlteGruppeId={auswahl.gruppeId}
                  onAbbrechen={() => setAuswahl(null)}
                />
              </div>
            ) : person ? (
              <PersonDetail
                key={`${person.id}-${new Date(person.updatedAt).getTime()}`}
                person={person}
                gruppen={gruppen}
                raeume={raeume}
              />
            ) : null}
          </aside>
        ) : (
          <div className="hidden rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted lg:block">
            Person in der Liste anklicken, um Details zu sehen –<br />
            oder mit „+ Person“ jemanden neu anlegen.
          </div>
        )}
      </div>
    </div>
  );
}

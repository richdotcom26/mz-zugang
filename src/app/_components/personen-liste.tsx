"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { PersonRow } from "./person-row";
import type { Gruppe, Raum } from "@/lib/db/schema";
import type { PersonMitGruppe } from "@/lib/domain/personen";

export function PersonenListe({
  gruppen,
  raeume,
  personen,
}: {
  gruppen: Gruppe[];
  raeume: Raum[];
  personen: PersonMitGruppe[];
}) {
  const [suche, setSuche] = useState("");
  const [gruppeFilter, setGruppeFilter] = useState("");
  const [raumFilter, setRaumFilter] = useState("");

  const filterAktiv = suche.trim() !== "" || gruppeFilter !== "" || raumFilter !== "";

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    const gruppeId = gruppeFilter ? Number(gruppeFilter) : null;
    const raumId = raumFilter ? Number(raumFilter) : null;

    return personen.filter((p) => {
      if (gruppeId !== null && p.gruppeId !== gruppeId) return false;
      if (raumId !== null && !p.raeume.some((r) => r.id === raumId)) return false;
      if (q) {
        const haystack = [p.vorname, p.nachname, p.transponderNr, p.telefon, p.email, p.bemerkung]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [personen, suche, gruppeFilter, raumFilter]);

  if (gruppen.length === 0) {
    return <p className="text-sm text-muted">Noch keine Gruppen angelegt.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Input
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Suche (Name, Transponder, Telefon, E-Mail, Bemerkung) …"
          className="min-w-[16rem] flex-1"
        />
        <Select value={gruppeFilter} onChange={(e) => setGruppeFilter(e.target.value)} className="w-44">
          <option value="">Alle Gruppen</option>
          {gruppen.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
        <Select value={raumFilter} onChange={(e) => setRaumFilter(e.target.value)} className="w-44">
          <option value="">Alle Räume</option>
          {raeume.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>

      {gruppen.map((gruppe) => {
        const mitglieder = gefiltert.filter((p) => p.gruppeId === gruppe.id);
        if (filterAktiv && mitglieder.length === 0) return null;
        const abgeglichen = mitglieder.filter((p) => p.abgleichKeyverwaltungAm).length;
        return (
          <Card key={gruppe.id}>
            <CardHeader>
              <CardTitle>{gruppe.name}</CardTitle>
              <span className="text-xs text-muted">
                {mitglieder.length} {mitglieder.length === 1 ? "Person" : "Personen"} · {abgeglichen} abgeglichen
              </span>
            </CardHeader>
            <CardContent className="p-0">
              {mitglieder.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted">Noch niemand in dieser Gruppe.</p>
              ) : (
                mitglieder.map((person) => (
                  <PersonRow
                    key={`${person.id}-${new Date(person.updatedAt).getTime()}`}
                    person={person}
                    gruppen={gruppen}
                    raeume={raeume}
                  />
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

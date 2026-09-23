import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (gruppen.length === 0) {
    return <p className="text-sm text-muted">Noch keine Gruppen angelegt.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {gruppen.map((gruppe) => {
        const mitglieder = personen.filter((p) => p.gruppeId === gruppe.id);
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

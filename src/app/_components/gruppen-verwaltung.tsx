import { NeueGruppeForm } from "./neue-gruppe-form";
import type { Gruppe } from "@/lib/db/schema";

export function GruppenVerwaltung({ gruppen }: { gruppen: Gruppe[] }) {
  return (
    <div className="flex flex-col gap-2">
      {gruppen.length === 0 ? (
        <p className="text-sm text-muted">Noch keine Gruppen angelegt.</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {gruppen.map((gruppe) => (
            <li key={gruppe.id}>{gruppe.name}</li>
          ))}
        </ul>
      )}
      <NeueGruppeForm />
    </div>
  );
}

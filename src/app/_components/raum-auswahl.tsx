import type { Raum } from "@/lib/db/schema";

export function RaumAuswahl({
  raeume,
  ausgewaehlt,
  idPrefix,
}: {
  raeume: Raum[];
  ausgewaehlt?: number[];
  idPrefix: string;
}) {
  if (raeume.length === 0) {
    return <p className="text-xs text-muted">Noch keine Räume angelegt.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
      {raeume.map((raum) => (
        <label key={raum.id} className="flex items-center gap-1.5 text-sm text-ink">
          <input
            type="checkbox"
            name="raumIds"
            value={raum.id}
            defaultChecked={ausgewaehlt?.includes(raum.id)}
            id={`${idPrefix}-raum-${raum.id}`}
            className="h-4 w-4 accent-brand"
          />
          {raum.name}
        </label>
      ))}
    </div>
  );
}

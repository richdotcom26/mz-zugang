import type { Raum } from "@/lib/db/schema";

/** Raum-Häkchen als einspaltige Liste (ein Raum pro Zeile, ganze Zeile klickbar). */
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
    <div className="flex flex-col divide-y divide-line overflow-hidden rounded-lg border border-field-border bg-surface">
      {raeume.map((raum) => (
        <label
          key={raum.id}
          htmlFor={`${idPrefix}-raum-${raum.id}`}
          className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-ink transition-colors hover:bg-page has-[:checked]:bg-brand-soft/60"
        >
          <input
            type="checkbox"
            name="raumIds"
            value={raum.id}
            defaultChecked={ausgewaehlt?.includes(raum.id)}
            id={`${idPrefix}-raum-${raum.id}`}
            className="h-4 w-4 shrink-0 accent-brand"
          />
          {raum.name}
        </label>
      ))}
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import { editGruppeAction, moveGruppeAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { useErfordertName } from "@/lib/use-mein-name";
import { NeueGruppeForm } from "./neue-gruppe-form";
import type { Gruppe } from "@/lib/db/schema";

export function GruppenVerwaltung({ gruppen }: { gruppen: Gruppe[] }) {
  return (
    <div className="flex flex-col gap-2">
      {gruppen.length === 0 ? (
        <p className="text-sm text-muted">Noch keine Gruppen angelegt.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {gruppen.map((gruppe, i) => (
            <GruppeZeile
              key={`${gruppe.id}-${gruppe.name}-${gruppe.position}`}
              gruppe={gruppe}
              istErste={i === 0}
              istLetzte={i === gruppen.length - 1}
            />
          ))}
        </ul>
      )}
      <NeueGruppeForm />
    </div>
  );
}

function GruppeZeile({
  gruppe,
  istErste,
  istLetzte,
}: {
  gruppe: Gruppe;
  istErste: boolean;
  istLetzte: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(editGruppeAction, IDLE);
  const [, moveAction] = useActionState(moveGruppeAction, IDLE);
  const { gesperrt, titel, spread: sperre } = useErfordertName();

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-2 text-sm">
        <span>{gruppe.name}</span>
        <div className="flex items-center gap-1">
          <form action={moveAction}>
            <input type="hidden" name="id" value={gruppe.id} />
            <input type="hidden" name="richtung" value="up" />
            <button
              type="submit"
              disabled={istErste || gesperrt}
              title={titel ?? "Nach oben"}
              className="px-1 text-muted hover:text-brand disabled:opacity-30"
            >
              ↑
            </button>
          </form>
          <form action={moveAction}>
            <input type="hidden" name="id" value={gruppe.id} />
            <input type="hidden" name="richtung" value="down" />
            <button
              type="submit"
              disabled={istLetzte || gesperrt}
              title={titel ?? "Nach unten"}
              className="px-1 text-muted hover:text-brand disabled:opacity-30"
            >
              ↓
            </button>
          </form>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} {...sperre}>
            Bearbeiten
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1">
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={gruppe.id} />
        <Input name="name" defaultValue={gruppe.name} required autoComplete="off" className="w-56" />
        <SubmitButton size="sm" pendingText="…" {...sperre}>
          Speichern
        </SubmitButton>
        <Button size="sm" variant="outline" type="button" onClick={() => setEditing(false)}>
          Abbrechen
        </Button>
      </form>
      {state?.ok === false ? <FormMessage state={state} /> : null}
    </li>
  );
}

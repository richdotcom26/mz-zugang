"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addRaumAction, editRaumAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { useErfordertName } from "@/lib/use-mein-name";
import type { Raum } from "@/lib/db/schema";

export function RaeumeVerwaltung({ raeume }: { raeume: Raum[] }) {
  const [addState, addAction] = useActionState(addRaumAction, IDLE);
  const { spread: sperre } = useErfordertName();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (addState?.ok) formRef.current?.reset();
  }, [addState]);

  return (
    <div className="flex flex-col gap-2">
      {raeume.length === 0 ? (
        <p className="text-sm text-muted">Noch keine Räume angelegt.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {raeume.map((raum) => (
            <RaumZeile key={`${raum.id}-${raum.name}`} raum={raum} />
          ))}
        </ul>
      )}
      <form ref={formRef} action={addAction} className="flex flex-wrap items-start gap-2">
        <Input name="name" placeholder="Neuer Raum, z.B. Gemeindesaal" required autoComplete="off" className="w-56" />
        <SubmitButton size="sm" variant="outline" pendingText="Anlegen …" {...sperre}>
          Raum anlegen
        </SubmitButton>
        <FormMessage state={addState} className="basis-full" />
      </form>
    </div>
  );
}

function RaumZeile({ raum }: { raum: Raum }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(editRaumAction, IDLE);
  const { spread: sperre } = useErfordertName();

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-2 text-sm">
        <span>{raum.name}</span>
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)} {...sperre}>
          Bearbeiten
        </Button>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1">
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={raum.id} />
        <Input name="name" defaultValue={raum.name} required autoComplete="off" className="w-56" />
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

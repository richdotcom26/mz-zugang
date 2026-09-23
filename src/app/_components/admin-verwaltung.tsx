"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addAdminAction, editAdminAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import type { Admin } from "@/lib/db/schema";

export function AdminVerwaltung({ admins }: { admins: Admin[] }) {
  const [addState, addAction] = useActionState(addAdminAction, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (addState?.ok) formRef.current?.reset();
  }, [addState]);

  return (
    <div className="flex flex-col gap-2">
      {admins.length === 0 ? (
        <p className="text-sm text-muted">Noch keine Verantwortlichen angelegt.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {admins.map((admin) => (
            <AdminZeile key={admin.id} admin={admin} />
          ))}
        </ul>
      )}
      <form ref={formRef} action={addAction} className="flex flex-wrap items-start gap-2">
        <Input name="name" placeholder="Name, z.B. Rainer" required autoComplete="off" className="w-56" />
        <SubmitButton size="sm" variant="outline" pendingText="Anlegen …">
          Hinzufügen
        </SubmitButton>
        <FormMessage state={addState} className="basis-full" />
      </form>
    </div>
  );
}

function AdminZeile({ admin }: { admin: Admin }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(editAdminAction, IDLE);

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-2 text-sm">
        <span>{admin.name}</span>
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Bearbeiten
        </Button>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1">
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={admin.id} />
        <Input name="name" defaultValue={admin.name} required autoComplete="off" className="w-56" />
        <SubmitButton size="sm" pendingText="…">
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

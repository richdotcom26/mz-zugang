"use client";

import { useActionState, useRef, useState } from "react";
import { editPersonAction, deletePersonAction, toggleAbgeglichenAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { useMeinName } from "@/lib/use-mein-name";
import { formatDateTime, cn } from "@/lib/utils";
import type { Gruppe } from "@/lib/db/schema";
import type { PersonMitGruppe } from "@/lib/domain/personen";

export function PersonRow({ person, gruppen }: { person: PersonMitGruppe; gruppen: Gruppe[] }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditRow person={person} gruppen={gruppen} onDone={() => setEditing(false)} />;
  }
  return <ViewRow person={person} onEdit={() => setEditing(true)} />;
}

function ViewRow({ person, onEdit }: { person: PersonMitGruppe; onEdit: () => void }) {
  const [meinName] = useMeinName();
  const [state, formAction] = useActionState(toggleAbgeglichenAction, IDLE);
  const toggleFormRef = useRef<HTMLFormElement>(null);

  const [deleteState, deleteAction] = useActionState(deletePersonAction, IDLE);

  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-line px-3 py-2.5 last:border-b-0 sm:flex-row sm:items-start sm:gap-3",
        person.abgeglichen && "bg-brand-soft/40",
      )}
    >
      <form ref={toggleFormRef} action={formAction} className="flex shrink-0 items-center pt-0.5">
        <input type="hidden" name="id" value={person.id} />
        <input type="hidden" name="von" value={meinName} />
        <input
          type="checkbox"
          name="abgeglichen"
          value="true"
          defaultChecked={person.abgeglichen}
          onChange={() => toggleFormRef.current?.requestSubmit()}
          title="Mit Transponder-Software abgeglichen"
          className="h-4 w-4 accent-brand"
        />
      </form>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium text-ink">
            {person.vorname} {person.nachname}
          </span>
          {person.transponderNr ? (
            <span className="text-xs text-muted">Transponder {person.transponderNr}</span>
          ) : null}
        </div>
        {person.bemerkung ? <p className="text-xs text-muted">{person.bemerkung}</p> : null}
        <p className="text-[11px] text-muted">
          eingetragen{person.eingetragenVon ? ` von ${person.eingetragenVon}` : ""} ·{" "}
          {formatDateTime(person.eingetragenAm)}
          {person.abgeglichen ? (
            <>
              {" "}
              · abgeglichen{person.abgeglichenVon ? ` von ${person.abgeglichenVon}` : ""} ·{" "}
              {formatDateTime(person.abgeglichenAm)}
            </>
          ) : null}
        </p>
        {state?.ok === false ? <FormMessage state={state} className="mt-1" /> : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Bearbeiten
        </Button>
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!window.confirm(`"${person.vorname} ${person.nachname}" wirklich löschen?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={person.id} />
          <SubmitButton size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" pendingText="…">
            Löschen
          </SubmitButton>
        </form>
      </div>
      {deleteState?.ok === false ? <FormMessage state={deleteState} /> : null}
    </div>
  );
}

function EditRow({
  person,
  gruppen,
  onDone,
}: {
  person: PersonMitGruppe;
  gruppen: Gruppe[];
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(editPersonAction, IDLE);
  const errors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="grid gap-3 border-b border-line bg-brand-soft/30 px-3 py-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={person.id} />
      <Field label="Vorname" htmlFor={`vorname-${person.id}`} errors={errors?.vorname}>
        <Input id={`vorname-${person.id}`} name="vorname" defaultValue={person.vorname} required />
      </Field>
      <Field label="Nachname" htmlFor={`nachname-${person.id}`} errors={errors?.nachname}>
        <Input id={`nachname-${person.id}`} name="nachname" defaultValue={person.nachname} required />
      </Field>
      <Field label="Gruppe" htmlFor={`gruppeId-${person.id}`} errors={errors?.gruppeId}>
        <Select id={`gruppeId-${person.id}`} name="gruppeId" defaultValue={person.gruppeId} required>
          {gruppen.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Transponder-Nr." htmlFor={`transponderNr-${person.id}`} errors={errors?.transponderNr}>
        <Input id={`transponderNr-${person.id}`} name="transponderNr" defaultValue={person.transponderNr ?? ""} />
      </Field>
      <Field label="Eingetragen von" htmlFor={`eingetragenVon-${person.id}`} errors={errors?.eingetragenVon}>
        <Input
          id={`eingetragenVon-${person.id}`}
          name="eingetragenVon"
          defaultValue={person.eingetragenVon ?? ""}
        />
      </Field>
      <Field
        label="Bemerkung"
        htmlFor={`bemerkung-${person.id}`}
        className="sm:col-span-2"
        errors={errors?.bemerkung}
      >
        <Textarea id={`bemerkung-${person.id}`} name="bemerkung" defaultValue={person.bemerkung ?? ""} rows={2} />
      </Field>
      <div className="flex items-center gap-2 sm:col-span-2">
        <SubmitButton size="sm" pendingText="Speichere …">
          Speichern
        </SubmitButton>
        <Button size="sm" variant="outline" type="button" onClick={onDone}>
          Abbrechen
        </Button>
        {state?.ok === false ? <FormMessage state={state} /> : null}
      </div>
    </form>
  );
}

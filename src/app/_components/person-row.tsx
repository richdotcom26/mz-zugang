"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { editPersonAction, deletePersonAction, setAktivAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { RaumAuswahl } from "./raum-auswahl";
import { useErfordertName } from "@/lib/use-mein-name";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import type { Gruppe, Raum } from "@/lib/db/schema";
import type { PersonMitGruppe } from "@/lib/domain/personen";

export function PersonRow({
  person,
  gruppen,
  raeume,
}: {
  person: PersonMitGruppe;
  gruppen: Gruppe[];
  raeume: Raum[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditRow person={person} gruppen={gruppen} raeume={raeume} onDone={() => setEditing(false)} />;
  }
  return <ViewRow person={person} onEdit={() => setEditing(true)} />;
}

function ViewRow({ person, onEdit }: { person: PersonMitGruppe; onEdit: () => void }) {
  const { spread: sperre } = useErfordertName();

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 border-b border-line px-3 py-2.5 last:border-b-0",
        !person.aktiv && "opacity-60",
        person.aktiv && person.abgleichKeyverwaltungAm && "bg-brand-soft/40",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <span
              className={cn("h-2.5 w-2.5 shrink-0 rounded-full", person.abgleichKeyverwaltungAm ? "bg-success" : "bg-neutral-300")}
              title={
                person.abgleichKeyverwaltungAm
                  ? `Mit Key-Verwaltung abgeglichen am ${formatDate(person.abgleichKeyverwaltungAm)}`
                  : "Noch nicht mit Key-Verwaltung abgeglichen"
              }
            />
            <span className="font-medium text-ink">
              {person.vorname} {person.nachname}
            </span>
            {!person.aktiv ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                Inaktiv
              </span>
            ) : null}
            {person.transponderNr ? (
              <span className="text-xs text-muted">Transponder {person.transponderNr}</span>
            ) : null}
          </div>

          {person.telefon || person.email ? (
            <p className="text-xs text-muted">
              {[person.telefon, person.email].filter(Boolean).join(" · ")}
            </p>
          ) : null}

          {person.befristetBis ? (
            <p className="text-xs text-muted">Befristet bis {formatDate(person.befristetBis)}</p>
          ) : null}

          {person.transponderAusgabeAm || person.transponderRueckgabeAm ? (
            <p className="text-xs text-muted">
              Transponder
              {person.transponderAusgabeAm ? ` ausgegeben ${formatDate(person.transponderAusgabeAm)}` : ""}
              {person.transponderRueckgabeAm ? ` · zurückgegeben ${formatDate(person.transponderRueckgabeAm)}` : ""}
            </p>
          ) : null}

          {person.raeume.length > 0 ? (
            <p className="text-xs text-muted">Zugang zu {person.raeume.map((r) => r.name).join(", ")}</p>
          ) : null}

          {person.bemerkung ? <p className="text-xs text-muted">{person.bemerkung}</p> : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onEdit} {...sperre}>
            Bearbeiten
          </Button>
        </div>
      </div>
    </div>
  );
}

function Historie({ person }: { person: PersonMitGruppe }) {
  const [offen, setOffen] = useState(false);

  return (
    <div className="text-[11px] text-muted">
      <button type="button" onClick={() => setOffen((v) => !v)} className="underline-offset-2 hover:underline">
        {offen ? "Verlauf ausblenden" : "Verlauf anzeigen"}
      </button>
      {offen ? (
        <ul className="mt-1 flex flex-col gap-0.5">
          <li>
            Hinzugefügt am: {formatDateTime(person.eingetragenAm)}
            {person.eingetragenVon ? ` von ${person.eingetragenVon}` : ""}
          </li>
          <li>
            Abgleich mit Key-Verwaltung am:{" "}
            {person.abgleichKeyverwaltungAm ? formatDate(person.abgleichKeyverwaltungAm) : "noch nicht"}
          </li>
          <li>
            Beleg eingegangen am:{" "}
            {person.uebergabeSignaturAm ? formatDateTime(person.uebergabeSignaturAm) : "noch nicht"}
          </li>
          <li>
            Status: {person.aktiv ? "aktiv" : "inaktiv"}
            {person.aktivGeaendertAm ? ` seit ${formatDateTime(person.aktivGeaendertAm)}` : ""}
          </li>
        </ul>
      ) : null}
    </div>
  );
}

function EditRow({
  person,
  gruppen,
  raeume,
  onDone,
}: {
  person: PersonMitGruppe;
  gruppen: Gruppe[];
  raeume: Raum[];
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(editPersonAction, IDLE);
  const [aktivState, aktivAction] = useActionState(setAktivAction, IDLE);
  const [deleteState, deleteAction] = useActionState(deletePersonAction, IDLE);
  const { spread: sperre } = useErfordertName();
  const errors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <div className="border-b border-line bg-brand-soft/30 px-3 py-3 last:border-b-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink">
          {person.vorname} {person.nachname}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/beleg/${person.id}`}
            className="text-xs font-medium text-brand underline-offset-2 hover:underline"
          >
            Übergabebeleg
          </Link>
          <form action={aktivAction}>
            <input type="hidden" name="id" value={person.id} />
            <input type="hidden" name="aktiv" value={(!person.aktiv).toString()} />
            <SubmitButton size="sm" variant="ghost" pendingText="…" {...sperre}>
              {person.aktiv ? "Deaktivieren" : "Aktivieren"}
            </SubmitButton>
          </form>
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!window.confirm(`"${person.vorname} ${person.nachname}" wirklich löschen?`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={person.id} />
            <SubmitButton size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" pendingText="…" {...sperre}>
              Löschen
            </SubmitButton>
          </form>
        </div>
      </div>
      {aktivState?.ok === false ? <FormMessage state={aktivState} className="mb-2" /> : null}
      {deleteState?.ok === false ? <FormMessage state={deleteState} className="mb-2" /> : null}

      <form action={formAction} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={person.id} />
        <Field label="Vorname" htmlFor={`vorname-${person.id}`} errors={errors?.vorname}>
          <Input id={`vorname-${person.id}`} name="vorname" defaultValue={person.vorname} required />
        </Field>
        <Field label="Nachname" htmlFor={`nachname-${person.id}`} errors={errors?.nachname}>
          <Input id={`nachname-${person.id}`} name="nachname" defaultValue={person.nachname} required />
        </Field>

        <Field label="Telefon" htmlFor={`telefon-${person.id}`} errors={errors?.telefon}>
          <Input id={`telefon-${person.id}`} name="telefon" type="tel" defaultValue={person.telefon ?? ""} />
        </Field>
        <Field label="E-Mail" htmlFor={`email-${person.id}`} errors={errors?.email}>
          <Input id={`email-${person.id}`} name="email" type="email" defaultValue={person.email ?? ""} />
        </Field>

        <Field label="Gruppe" htmlFor={`gruppeId-${person.id}`} errors={errors?.gruppeId} className="sm:col-span-2">
          <Select id={`gruppeId-${person.id}`} name="gruppeId" defaultValue={person.gruppeId} required>
            {gruppen.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>

        <Trenner />

        <Field label="Transponder-Nr." htmlFor={`transponderNr-${person.id}`} errors={errors?.transponderNr}>
          <Input id={`transponderNr-${person.id}`} name="transponderNr" defaultValue={person.transponderNr ?? ""} />
        </Field>
        <Field
          label="Abgleich mit Key-Verwaltung am"
          htmlFor={`abgleichKeyverwaltungAm-${person.id}`}
          errors={errors?.abgleichKeyverwaltungAm}
        >
          <Input
            id={`abgleichKeyverwaltungAm-${person.id}`}
            name="abgleichKeyverwaltungAm"
            type="date"
            defaultValue={person.abgleichKeyverwaltungAm ?? ""}
          />
        </Field>

        <Trenner />

        <Field
          label="Transponder Ausgabe am"
          htmlFor={`transponderAusgabeAm-${person.id}`}
          errors={errors?.transponderAusgabeAm}
        >
          <Input
            id={`transponderAusgabeAm-${person.id}`}
            name="transponderAusgabeAm"
            type="date"
            defaultValue={person.transponderAusgabeAm ?? ""}
          />
        </Field>
        <Field label="Befristet bis" htmlFor={`befristetBis-${person.id}`} errors={errors?.befristetBis}>
          <Input
            id={`befristetBis-${person.id}`}
            name="befristetBis"
            type="date"
            defaultValue={person.befristetBis ?? ""}
          />
        </Field>

        <Field
          label="Transponder Rückgabe am"
          htmlFor={`transponderRueckgabeAm-${person.id}`}
          errors={errors?.transponderRueckgabeAm}
        >
          <Input
            id={`transponderRueckgabeAm-${person.id}`}
            name="transponderRueckgabeAm"
            type="date"
            defaultValue={person.transponderRueckgabeAm ?? ""}
          />
        </Field>
        <Field label="Übergabebeleg">
          <Link href={`/beleg/${person.id}`} className={buttonClasses("outline", "md", "w-full justify-center")}>
            Beleg öffnen
          </Link>
        </Field>

        <Trenner />

        <Field label="Zugang zu" className="sm:col-span-2">
          <RaumAuswahl raeume={raeume} ausgewaehlt={person.raeume.map((r) => r.id)} idPrefix={`edit-${person.id}`} />
        </Field>
        <Field
          label="Bemerkung"
          htmlFor={`bemerkung-${person.id}`}
          className="sm:col-span-2"
          errors={errors?.bemerkung}
        >
          <Textarea id={`bemerkung-${person.id}`} name="bemerkung" defaultValue={person.bemerkung ?? ""} rows={2} />
        </Field>

        <div className="sm:col-span-2">
          <Historie person={person} />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <SubmitButton size="sm" pendingText="Speichere …" {...sperre}>
            Speichern
          </SubmitButton>
          <Button size="sm" variant="outline" type="button" onClick={onDone}>
            Abbrechen
          </Button>
          <div className="flex basis-full items-center gap-1.5 sm:basis-auto sm:ml-auto">
            <label htmlFor={`eingetragenVon-${person.id}`} className="text-xs text-muted">
              Eingetragen von
            </label>
            <Input
              id={`eingetragenVon-${person.id}`}
              name="eingetragenVon"
              defaultValue={person.eingetragenVon ?? ""}
              className="h-8 flex-1 sm:w-36 sm:flex-none"
            />
          </div>
          {state?.ok === false ? <FormMessage state={state} className="basis-full" /> : null}
        </div>
      </form>
    </div>
  );
}

function Trenner() {
  return <div className="h-0.5 rounded-full bg-line sm:col-span-2" />;
}

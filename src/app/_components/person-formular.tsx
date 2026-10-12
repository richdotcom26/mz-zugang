"use client";

import { useActionState, useEffect, useRef } from "react";
import { addPersonAction, editPersonAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { useMeinName, useErfordertName } from "@/lib/use-mein-name";
import { RaumAuswahl } from "./raum-auswahl";
import { DatumFeld } from "./datum-feld";
import { GruppenHinweis, RaeumeHinweis } from "./listen-hinweise";
import type { Gruppe, Raum } from "@/lib/db/schema";
import type { PersonMitGruppe } from "@/lib/domain/personen";

/**
 * Formular „Neue Person“ (ohne `person`) bzw. „Bearbeiten“ (mit `person`) für den
 * Detailbereich. Nach erfolgreichem Bearbeiten klappt der Detailbereich über den
 * Remount-Key (`personId-updatedAt`) von selbst in die Ansicht zurück.
 */
export function PersonFormular({
  person,
  gruppen,
  raeume,
  vorausgewaehlteGruppeId,
  onAbbrechen,
}: {
  person?: PersonMitGruppe;
  gruppen: Gruppe[];
  raeume: Raum[];
  vorausgewaehlteGruppeId?: number | null;
  onAbbrechen: () => void;
}) {
  const neu = !person;
  const [state, formAction] = useActionState(neu ? addPersonAction : editPersonAction, IDLE);
  const [meinName] = useMeinName();
  const { spread: sperre } = useErfordertName();
  const formRef = useRef<HTMLFormElement>(null);
  const id = person ? `p${person.id}` : "neu";

  // Nach dem Anlegen bleibt das Formular für die nächste Person offen.
  useEffect(() => {
    if (neu && state?.ok) formRef.current?.reset();
  }, [neu, state]);

  const errors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {person ? <input type="hidden" name="id" value={person.id} /> : null}

      <Abschnitt titel="Person">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Vorname" htmlFor={`${id}-vorname`} errors={errors?.vorname}>
            <Input id={`${id}-vorname`} name="vorname" defaultValue={person?.vorname} required autoComplete="off" />
          </Field>
          <Field label="Nachname" htmlFor={`${id}-nachname`} errors={errors?.nachname}>
            <Input id={`${id}-nachname`} name="nachname" defaultValue={person?.nachname} required autoComplete="off" />
          </Field>
        </div>
        <Field label="Gruppe" htmlFor={`${id}-gruppeId`} errors={errors?.gruppeId} hint={<GruppenHinweis />}>
          <Select
            id={`${id}-gruppeId`}
            name="gruppeId"
            required
            defaultValue={person?.gruppeId ?? vorausgewaehlteGruppeId ?? ""}
          >
            <option value="" disabled>
              Bitte wählen …
            </option>
            {gruppen.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>
        <label htmlFor={`${id}-hauptkontakt`} className="flex items-center gap-2 text-sm text-ink">
          <input
            id={`${id}-hauptkontakt`}
            type="checkbox"
            name="istHauptkontakt"
            value="true"
            defaultChecked={person?.istHauptkontakt}
            className="h-4 w-4 accent-brand"
          />
          Hauptkontakt der Gruppe
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Telefon" htmlFor={`${id}-telefon`} errors={errors?.telefon}>
            <Input id={`${id}-telefon`} name="telefon" type="tel" defaultValue={person?.telefon ?? ""} autoComplete="off" />
          </Field>
          <Field label="E-Mail" htmlFor={`${id}-email`} errors={errors?.email}>
            <Input id={`${id}-email`} name="email" type="email" defaultValue={person?.email ?? ""} autoComplete="off" />
          </Field>
        </div>
      </Abschnitt>

      <Abschnitt titel="Zugang">
        <Field label="Transponder-Nr." htmlFor={`${id}-transponderNr`} errors={errors?.transponderNr}>
          <Input id={`${id}-transponderNr`} name="transponderNr" defaultValue={person?.transponderNr ?? ""} autoComplete="off" />
        </Field>
        <Field label="Räume" hint={<RaeumeHinweis />}>
          <RaumAuswahl raeume={raeume} ausgewaehlt={person?.raeume.map((r) => r.id)} idPrefix={id} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Transponder ausgegeben am" htmlFor={`${id}-ausgabe`} errors={errors?.transponderAusgabeAm}>
            <DatumFeld id={`${id}-ausgabe`} name="transponderAusgabeAm" defaultValue={person?.transponderAusgabeAm} />
          </Field>
          <Field label="Transponder zurück am" htmlFor={`${id}-rueckgabe`} errors={errors?.transponderRueckgabeAm}>
            <DatumFeld id={`${id}-rueckgabe`} name="transponderRueckgabeAm" defaultValue={person?.transponderRueckgabeAm} />
          </Field>
          <Field label="Befristet bis" htmlFor={`${id}-befristet`} errors={errors?.befristetBis}>
            <DatumFeld id={`${id}-befristet`} name="befristetBis" defaultValue={person?.befristetBis} />
          </Field>
          {person ? (
            <Field
              label="Abgeglichen am"
              htmlFor={`${id}-abgleich`}
              errors={errors?.abgleichKeyverwaltungAm}
            >
              <DatumFeld id={`${id}-abgleich`} name="abgleichKeyverwaltungAm" defaultValue={person.abgleichKeyverwaltungAm} />
            </Field>
          ) : null}
        </div>
      </Abschnitt>

      <Abschnitt titel="Sonstiges">
        <Field label="Bemerkung" htmlFor={`${id}-bemerkung`} errors={errors?.bemerkung}>
          <Textarea id={`${id}-bemerkung`} name="bemerkung" defaultValue={person?.bemerkung ?? ""} rows={2} />
        </Field>
        <Field label="Eingetragen von" htmlFor={`${id}-eingetragenVon`} errors={errors?.eingetragenVon}>
          <Input
            key={neu ? meinName : undefined}
            id={`${id}-eingetragenVon`}
            name="eingetragenVon"
            defaultValue={neu ? meinName : (person?.eingetragenVon ?? "")}
            autoComplete="off"
          />
        </Field>
      </Abschnitt>

      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton pendingText="Speichere …" {...sperre}>
          {neu ? "Person anlegen" : "Speichern"}
        </SubmitButton>
        <Button variant="outline" onClick={onAbbrechen}>
          {neu ? "Schließen" : "Abbrechen"}
        </Button>
        <FormMessage state={state} className="basis-full" />
      </div>
    </form>
  );
}

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{titel}</legend>
      {children}
    </fieldset>
  );
}

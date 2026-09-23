"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addPersonAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { useMeinName } from "@/lib/use-mein-name";
import { RaumAuswahl } from "./raum-auswahl";
import type { Gruppe, Raum } from "@/lib/db/schema";

export function NeuePersonForm({ gruppen, raeume }: { gruppen: Gruppe[]; raeume: Raum[] }) {
  const [offen, setOffen] = useState(false);
  const [state, formAction] = useActionState(addPersonAction, IDLE);
  const [meinName] = useMeinName();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const errors = state?.ok === false ? state.fieldErrors : undefined;

  if (!offen) {
    return (
      <Button onClick={() => setOffen(true)} className="self-start">
        + Person hinzufügen
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Person hinzufügen</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setOffen(false)}>
          Abbrechen
        </Button>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
          <Field label="Vorname" htmlFor="vorname" errors={errors?.vorname}>
            <Input id="vorname" name="vorname" required autoComplete="off" />
          </Field>
          <Field label="Nachname" htmlFor="nachname" errors={errors?.nachname}>
            <Input id="nachname" name="nachname" required autoComplete="off" />
          </Field>
          <Field label="Gruppe" htmlFor="gruppeId" errors={errors?.gruppeId}>
            <Select id="gruppeId" name="gruppeId" required defaultValue="">
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
          <Field label="Transponder-Nr." htmlFor="transponderNr" errors={errors?.transponderNr}>
            <Input id="transponderNr" name="transponderNr" autoComplete="off" />
          </Field>
          <Field label="Telefon" htmlFor="telefon" errors={errors?.telefon}>
            <Input id="telefon" name="telefon" type="tel" autoComplete="off" />
          </Field>
          <Field label="E-Mail" htmlFor="email" errors={errors?.email}>
            <Input id="email" name="email" type="email" autoComplete="off" />
          </Field>
          <Field label="Befristet bis" htmlFor="befristetBis" errors={errors?.befristetBis}>
            <Input id="befristetBis" name="befristetBis" type="date" />
          </Field>
          <Field label="Eingetragen von" htmlFor="eingetragenVon" errors={errors?.eingetragenVon}>
            <Input
              key={meinName}
              id="eingetragenVon"
              name="eingetragenVon"
              defaultValue={meinName}
              autoComplete="off"
            />
          </Field>
          <Field label="Transponder Ausgabe am" htmlFor="transponderAusgabeAm" errors={errors?.transponderAusgabeAm}>
            <Input id="transponderAusgabeAm" name="transponderAusgabeAm" type="date" />
          </Field>
          <Field
            label="Transponder Rückgabe am"
            htmlFor="transponderRueckgabeAm"
            errors={errors?.transponderRueckgabeAm}
          >
            <Input id="transponderRueckgabeAm" name="transponderRueckgabeAm" type="date" />
          </Field>
          <Field label="Zugang zu" className="sm:col-span-2">
            <RaumAuswahl raeume={raeume} idPrefix="neu" />
          </Field>
          <Field label="Bemerkung" htmlFor="bemerkung" className="sm:col-span-2" errors={errors?.bemerkung}>
            <Textarea id="bemerkung" name="bemerkung" rows={2} />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <SubmitButton pendingText="Speichere …">Hinzufügen</SubmitButton>
            <FormMessage state={state} className="flex-1" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

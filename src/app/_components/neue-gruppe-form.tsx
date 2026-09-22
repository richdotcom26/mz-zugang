"use client";

import { useActionState, useEffect, useRef } from "react";
import { addGruppeAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Input } from "@/components/ui/input";
import { SubmitButton, FormMessage } from "@/components/ui/form";

export function NeueGruppeForm() {
  const [state, formAction] = useActionState(addGruppeAction, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <Input
        name="name"
        placeholder="Neue Gruppe, z.B. Kirchenchor"
        required
        autoComplete="off"
        className="w-56"
        aria-invalid={state?.ok === false || undefined}
      />
      <SubmitButton size="sm" variant="outline" pendingText="Anlegen …">
        Gruppe anlegen
      </SubmitButton>
      <FormMessage state={state} className="basis-full" />
    </form>
  );
}

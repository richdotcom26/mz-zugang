"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { IDLE } from "@/lib/domain/action-state";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(login, IDLE);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Gebäudezugang</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <Field label="Portal-Passwort" htmlFor="password" errors={state?.ok === false ? state.fieldErrors?.password : undefined}>
            <Input id="password" name="password" type="password" autoFocus required />
          </Field>
          <FormMessage state={state} />
          <SubmitButton pendingText="Prüfe …" className="w-full">
            Anmelden
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

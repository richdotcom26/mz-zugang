"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createPerson,
  updatePerson,
  deletePerson,
  setAbgeglichen,
  personSchema,
} from "@/lib/domain/personen";
import { createGruppe } from "@/lib/domain/gruppen";
import { runAction, ok, parseForm, type ActionState } from "@/lib/domain/action-state";
import { DomainError } from "@/lib/domain/errors";

export async function addPersonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const input = parseForm(personSchema, formData);
    await createPerson(input);
    revalidatePath("/");
    return ok("Person hinzugefügt.");
  });
}

export async function editPersonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const id = Number(formData.get("id"));
    if (!id) throw new DomainError("VALIDATION", "Ungültige ID.");
    const input = parseForm(personSchema, formData);
    await updatePerson(id, input);
    revalidatePath("/");
    return ok("Gespeichert.");
  });
}

export async function deletePersonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const id = Number(formData.get("id"));
    if (!id) throw new DomainError("VALIDATION", "Ungültige ID.");
    await deletePerson(id);
    revalidatePath("/");
    return ok("Gelöscht.");
  });
}

export async function toggleAbgeglichenAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const id = Number(formData.get("id"));
    if (!id) throw new DomainError("VALIDATION", "Ungültige ID.");
    const abgeglichen = formData.get("abgeglichen") === "true";
    const von = String(formData.get("von") ?? "").trim() || undefined;
    await setAbgeglichen(id, abgeglichen, von);
    revalidatePath("/");
    return ok();
  });
}

const gruppeSchema = z.object({ name: z.string().trim().min(1, "Pflichtfeld") });

export async function addGruppeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { name } = parseForm(gruppeSchema, formData);
    await createGruppe(name);
    revalidatePath("/");
    return ok("Gruppe angelegt.");
  });
}

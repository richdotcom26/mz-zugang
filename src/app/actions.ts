"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createPerson,
  updatePerson,
  deletePerson,
  setAbgleichKeyverwaltung,
  setAktiv,
  setUebergabeSignatur,
  personSchema,
} from "@/lib/domain/personen";
import { createGruppe } from "@/lib/domain/gruppen";
import { createRaum, updateRaum } from "@/lib/domain/raeume";
import { createAdmin, updateAdmin } from "@/lib/domain/admins";
import { runAction, ok, parseForm, type ActionState } from "@/lib/domain/action-state";
import { DomainError } from "@/lib/domain/errors";

function parseRaumIds(formData: FormData): number[] {
  return formData
    .getAll("raumIds")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);
}

export async function addPersonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const input = parseForm(personSchema, formData);
    await createPerson(input, parseRaumIds(formData));
    revalidatePath("/");
    return ok("Person hinzugefügt.");
  });
}

export async function editPersonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const id = Number(formData.get("id"));
    if (!id) throw new DomainError("VALIDATION", "Ungültige ID.");
    const input = parseForm(personSchema, formData);
    await updatePerson(id, input, parseRaumIds(formData));
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

export async function setAbgleichKeyverwaltungAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const id = Number(formData.get("id"));
    if (!id) throw new DomainError("VALIDATION", "Ungültige ID.");
    const datum = String(formData.get("datum") ?? "").trim() || null;
    await setAbgleichKeyverwaltung(id, datum);
    revalidatePath("/");
    return ok();
  });
}

export async function setAktivAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const id = Number(formData.get("id"));
    if (!id) throw new DomainError("VALIDATION", "Ungültige ID.");
    const aktiv = formData.get("aktiv") === "true";
    await setAktiv(id, aktiv);
    revalidatePath("/");
    return ok();
  });
}

export async function setUebergabeSignaturAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const id = Number(formData.get("id"));
    if (!id) throw new DomainError("VALIDATION", "Ungültige ID.");
    const signatur = String(formData.get("signatur") ?? "").trim() || null;
    if (signatur && !signatur.startsWith("data:image/")) {
      throw new DomainError("VALIDATION", "Ungültige Unterschrift.");
    }
    await setUebergabeSignatur(id, signatur);
    revalidatePath("/");
    revalidatePath(`/beleg/${id}`);
    return ok(signatur ? "Unterschrift gespeichert." : "Unterschrift gelöscht.");
  });
}

const gruppeSchema = z.object({ name: z.string().trim().min(1, "Pflichtfeld") });

export async function addGruppeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { name } = parseForm(gruppeSchema, formData);
    await createGruppe(name);
    revalidatePath("/");
    revalidatePath("/einstellungen");
    return ok("Gruppe angelegt.");
  });
}

const raumSchema = z.object({ name: z.string().trim().min(1, "Pflichtfeld") });

export async function addRaumAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { name } = parseForm(raumSchema, formData);
    await createRaum(name);
    revalidatePath("/");
    revalidatePath("/einstellungen");
    return ok("Raum angelegt.");
  });
}

export async function editRaumAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const id = Number(formData.get("id"));
    if (!id) throw new DomainError("VALIDATION", "Ungültige ID.");
    const { name } = parseForm(raumSchema, formData);
    await updateRaum(id, name);
    revalidatePath("/");
    revalidatePath("/einstellungen");
    return ok("Raum gespeichert.");
  });
}

const adminSchema = z.object({ name: z.string().trim().min(1, "Pflichtfeld") });

export async function addAdminAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { name } = parseForm(adminSchema, formData);
    await createAdmin(name);
    revalidatePath("/");
    revalidatePath("/einstellungen");
    return ok("Angelegt.");
  });
}

export async function editAdminAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const id = Number(formData.get("id"));
    if (!id) throw new DomainError("VALIDATION", "Ungültige ID.");
    const { name } = parseForm(adminSchema, formData);
    await updateAdmin(id, name);
    revalidatePath("/");
    revalidatePath("/einstellungen");
    return ok("Gespeichert.");
  });
}

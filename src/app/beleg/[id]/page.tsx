import { notFound } from "next/navigation";
import { getPersonMitGruppeById } from "@/lib/domain/personen";
import { isDomainError } from "@/lib/domain/errors";
import { BelegAnsicht } from "./beleg-ansicht";

async function ladePersonOderNotFound(id: number) {
  try {
    return await getPersonMitGruppeById(id);
  } catch (e) {
    if (isDomainError(e) && e.code === "NOT_FOUND") notFound();
    throw e;
  }
}

export default async function BelegPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personId = Number(id);
  if (!Number.isInteger(personId)) notFound();

  const person = await ladePersonOderNotFound(personId);
  return <BelegAnsicht person={person} />;
}

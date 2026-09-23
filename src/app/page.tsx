import { listGruppen } from "@/lib/domain/gruppen";
import { listRaeume } from "@/lib/domain/raeume";
import { listAdmins } from "@/lib/domain/admins";
import { listPersonenMitGruppe } from "@/lib/domain/personen";
import { Header } from "./_components/header";
import { NeuePersonForm } from "./_components/neue-person-form";
import { PersonenListe } from "./_components/personen-liste";

export default async function PortalPage() {
  const [gruppen, raeume, admins, personen] = await Promise.all([
    listGruppen(),
    listRaeume(),
    listAdmins(),
    listPersonenMitGruppe(),
  ]);
  const abgeglichen = personen.filter((p) => p.abgleichKeyverwaltungAm).length;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <Header admins={admins} />

      <p className="text-sm text-muted">
        {personen.length} Personen erfasst · {abgeglichen} mit Key-Verwaltung abgeglichen ·{" "}
        {personen.length - abgeglichen} noch offen
      </p>

      <NeuePersonForm gruppen={gruppen} raeume={raeume} />

      <PersonenListe gruppen={gruppen} raeume={raeume} personen={personen} />
    </main>
  );
}

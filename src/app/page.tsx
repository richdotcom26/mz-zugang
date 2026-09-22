import { listGruppen } from "@/lib/domain/gruppen";
import { listPersonenMitGruppe } from "@/lib/domain/personen";
import { Header } from "./_components/header";
import { NeuePersonForm } from "./_components/neue-person-form";
import { NeueGruppeForm } from "./_components/neue-gruppe-form";
import { PersonenListe } from "./_components/personen-liste";

export default async function PortalPage() {
  const [gruppen, personen] = await Promise.all([listGruppen(), listPersonenMitGruppe()]);
  const abgeglichen = personen.filter((p) => p.abgeglichen).length;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <Header />

      <p className="text-sm text-muted">
        {personen.length} Personen erfasst · {abgeglichen} mit Transponder-Software abgeglichen ·{" "}
        {personen.length - abgeglichen} noch offen
      </p>

      <NeuePersonForm gruppen={gruppen} />

      <div>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Gruppe hinzufügen</h2>
        <NeueGruppeForm />
      </div>

      <PersonenListe gruppen={gruppen} personen={personen} />
    </main>
  );
}

import { connection } from "next/server";
import { listGruppen } from "@/lib/domain/gruppen";
import { listRaeume } from "@/lib/domain/raeume";
import { listAdmins } from "@/lib/domain/admins";
import { listPersonenMitGruppe } from "@/lib/domain/personen";
import { Header } from "./_components/header";
import { Portal } from "./_components/portal";

export default async function PortalPage() {
  await connection(); // nicht beim Build vorrendern – DB ist nur zur Laufzeit erreichbar
  const [gruppen, raeume, admins, personen] = await Promise.all([
    listGruppen(),
    listRaeume(),
    listAdmins(),
    listPersonenMitGruppe(),
  ]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-6">
      <Header admins={admins} />
      <Portal gruppen={gruppen} raeume={raeume} personen={personen} />
    </main>
  );
}

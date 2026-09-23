import Link from "next/link";
import { listGruppen } from "@/lib/domain/gruppen";
import { listRaeume } from "@/lib/domain/raeume";
import { listAdmins } from "@/lib/domain/admins";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GruppenVerwaltung } from "../_components/gruppen-verwaltung";
import { RaeumeVerwaltung } from "../_components/raeume-verwaltung";
import { AdminVerwaltung } from "../_components/admin-verwaltung";
import { Datensicherung } from "../_components/datensicherung";

export default async function EinstellungenPage() {
  const [gruppen, raeume, admins] = await Promise.all([listGruppen(), listRaeume(), listAdmins()]);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <Link href="/" className="text-sm text-brand underline-offset-2 hover:underline">
          ← Zurück zur Liste
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-navy">Einstellungen</h1>
        <p className="text-xs text-muted">Auswahllisten verwalten</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gruppen</CardTitle>
        </CardHeader>
        <CardContent>
          <GruppenVerwaltung gruppen={gruppen} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Räume</CardTitle>
        </CardHeader>
        <CardContent>
          <RaeumeVerwaltung raeume={raeume} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verantwortliche (&quot;Ich bin&quot;)</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminVerwaltung admins={admins} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datensicherung</CardTitle>
        </CardHeader>
        <CardContent>
          <Datensicherung />
        </CardContent>
      </Card>
    </main>
  );
}

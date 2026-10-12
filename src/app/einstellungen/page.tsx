import Link from "next/link";
import { connection } from "next/server";
import { listGruppen } from "@/lib/domain/gruppen";
import { listRaeume } from "@/lib/domain/raeume";
import { listAdmins } from "@/lib/domain/admins";
import { Card, CardContent } from "@/components/ui/card";
import { IconChevronLeft } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { GruppenVerwaltung } from "../_components/gruppen-verwaltung";
import { RaeumeVerwaltung } from "../_components/raeume-verwaltung";
import { AdminVerwaltung } from "../_components/admin-verwaltung";
import { Datensicherung } from "../_components/datensicherung";

const REITER = [
  { id: "gruppen", label: "Gruppen" },
  { id: "raeume", label: "Räume" },
  { id: "verantwortliche", label: "Verantwortliche" },
  { id: "sicherung", label: "Datensicherung" },
] as const;
type ReiterId = (typeof REITER)[number]["id"];

export default async function EinstellungenPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection(); // nicht beim Build vorrendern – DB ist nur zur Laufzeit erreichbar
  const { tab } = await searchParams;
  const aktiv: ReiterId = REITER.some((r) => r.id === tab) ? (tab as ReiterId) : "gruppen";
  const [gruppen, raeume, admins] = await Promise.all([listGruppen(), listRaeume(), listAdmins()]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          <IconChevronLeft />
          Zur Liste
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-navy">Einstellungen</h1>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-line" aria-label="Einstellungen">
        {REITER.map((r) => (
          <Link
            key={r.id}
            href={`/einstellungen?tab=${r.id}`}
            aria-current={aktiv === r.id ? "page" : undefined}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              aktiv === r.id ? "border-brand text-navy" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {r.label}
          </Link>
        ))}
      </nav>

      <Card>
        <CardContent>
          {aktiv === "gruppen" ? <GruppenVerwaltung gruppen={gruppen} /> : null}
          {aktiv === "raeume" ? <RaeumeVerwaltung raeume={raeume} /> : null}
          {aktiv === "verantwortliche" ? (
            <>
              <p className="mb-3 text-xs text-muted">Diese Namen stehen oben bei „Wer bist du?“ zur Auswahl.</p>
              <AdminVerwaltung admins={admins} />
            </>
          ) : null}
          {aktiv === "sicherung" ? <Datensicherung /> : null}
        </CardContent>
      </Card>
    </main>
  );
}

"use client";

import Link from "next/link";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useMeinName } from "@/lib/use-mein-name";
import { cn } from "@/lib/utils";
import type { Admin } from "@/lib/db/schema";

export function Header({ admins }: { admins: Admin[] }) {
  const [name, setName] = useMeinName();

  return (
    <header className="flex flex-col gap-2 border-b border-line pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-semibold text-navy">Markus-Zentrum Zugang</h1>
            <Link
              href="/einstellungen"
              title="Einstellungen"
              aria-label="Einstellungen"
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-brand-soft hover:text-brand"
            >
              ⚙
            </Link>
          </div>
          <p className="text-xs text-muted">Liste der Personen mit Zugang, nach Gruppe</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="flex items-center gap-2 text-xs text-muted">
            Ich bin
            <Select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn("h-8 w-44", !name && "border-brand ring-2 ring-brand/25")}
            >
              <option value="">Bitte wählen …</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.name}>
                  {admin.name}
                </option>
              ))}
            </Select>
          </label>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Abmelden
            </Button>
          </form>
        </div>
      </div>
      {!name ? (
        <p className="text-xs text-brand">
          Bitte oben auswählen, wer du bist — erst danach lassen sich Änderungen speichern.
        </p>
      ) : null}
    </header>
  );
}

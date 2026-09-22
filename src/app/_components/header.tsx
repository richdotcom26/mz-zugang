"use client";

import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMeinName } from "@/lib/use-mein-name";

export function Header() {
  const [name, setName] = useMeinName();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <div>
        <h1 className="text-lg font-semibold text-navy">Gebäudezugang</h1>
        <p className="text-xs text-muted">Liste der Personen mit Zugang, nach Gruppe</p>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-muted">
          Ich bin
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Name"
            className="h-8 w-36"
          />
        </label>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Abmelden
          </Button>
        </form>
      </div>
    </header>
  );
}

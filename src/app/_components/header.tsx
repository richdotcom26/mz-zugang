"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/app/login/actions";
import { Select } from "@/components/ui/input";
import { IconLogout, IconSettings, IconUser } from "@/components/ui/icons";
import { useMeinName } from "@/lib/use-mein-name";
import { cn } from "@/lib/utils";
import type { Admin } from "@/lib/db/schema";

const iconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft";

export function Header({ admins }: { admins: Admin[] }) {
  const [name, setName] = useMeinName();
  const [wechseln, setWechseln] = useState(false);

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h1 className="flex-1 truncate text-lg font-semibold text-navy">
          <span className="sm:hidden">MZ-Zugang</span>
          <span className="hidden sm:inline">Markus-Zentrum Zugang</span>
        </h1>
        {name && !wechseln ? (
          <button
            type="button"
            onClick={() => setWechseln(true)}
            title="Wer bist du? – ändern"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-xs font-medium text-navy transition-colors hover:bg-brand/20"
          >
            <IconUser className="h-3.5 w-3.5" />
            {name}
          </button>
        ) : null}
        <Link href="/einstellungen" className={iconButton} title="Einstellungen" aria-label="Einstellungen">
          <IconSettings />
        </Link>
        <form action={logout}>
          <button type="submit" className={iconButton} title="Abmelden" aria-label="Abmelden">
            <IconLogout />
          </button>
        </form>
      </div>

      {!name || wechseln ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3",
            name ? "border-line bg-surface" : "border-brand/40 bg-brand-soft",
          )}
        >
          <label htmlFor="ich-bin" className="text-sm font-medium text-navy">
            Wer bist du?
          </label>
          <Select
            id="ich-bin"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setWechseln(false);
            }}
            className="h-8 w-48"
          >
            <option value="">Bitte wählen …</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.name}>
                {admin.name}
              </option>
            ))}
          </Select>
          <p className="basis-full text-xs text-muted">
            Wird bei Änderungen als „Eingetragen von“ vermerkt. Ohne Auswahl lässt sich nichts speichern.
          </p>
        </div>
      ) : null}
    </header>
  );
}

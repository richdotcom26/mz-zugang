"use client";

import { useActionState, useEffect, useRef } from "react";
import { importDatenAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { buttonClasses } from "@/components/ui/button";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { useErfordertName } from "@/lib/use-mein-name";

export function Datensicherung() {
  const [state, formAction] = useActionState(importDatenAction, IDLE);
  const { spread: sperre } = useErfordertName();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm text-muted">
          Exportiert den kompletten Datenbestand (Personen, Gruppen, Räume, Verantwortliche) als
          JSON-Datei zum Aufbewahren.
        </p>
        <a href="/api/export" className={buttonClasses("outline", "md")}>
          Export herunterladen
        </a>
      </div>

      <div>
        <p className="mb-2 text-sm text-muted">
          Importiert eine zuvor exportierte Sicherung.{" "}
          <strong className="text-ink">Ersetzt dabei den kompletten aktuellen Datenbestand.</strong>
        </p>
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            if (!window.confirm("Import ersetzt alle aktuellen Daten unwiderruflich. Fortfahren?")) {
              e.preventDefault();
            }
          }}
        >
          <input
            type="file"
            name="datei"
            accept="application/json"
            required
            disabled={sperre.disabled}
            title={sperre.title}
            className="text-sm text-ink"
          />
          <SubmitButton size="sm" variant="outline" pendingText="Importiere …" {...sperre}>
            Importieren
          </SubmitButton>
        </form>
        {state ? <FormMessage state={state} className="mt-2" /> : null}
      </div>
    </div>
  );
}

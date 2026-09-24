"use client";

import { useRef, useState } from "react";
import { NeuePersonForm } from "./neue-person-form";
import { PersonenListe } from "./personen-liste";
import type { Gruppe, Raum } from "@/lib/db/schema";
import type { PersonMitGruppe } from "@/lib/domain/personen";

export function PersonenBereich({
  gruppen,
  raeume,
  personen,
}: {
  gruppen: Gruppe[];
  raeume: Raum[];
  personen: PersonMitGruppe[];
}) {
  const [offen, setOffen] = useState(false);
  const [vorausgewaehlteGruppeId, setVorausgewaehlteGruppeId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function neuePersonInGruppe(gruppeId: number) {
    setVorausgewaehlteGruppeId(gruppeId);
    setOffen(true);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div ref={formRef}>
        <NeuePersonForm
          gruppen={gruppen}
          raeume={raeume}
          offen={offen}
          onOffenChange={setOffen}
          vorausgewaehlteGruppeId={vorausgewaehlteGruppeId}
        />
      </div>

      <PersonenListe
        gruppen={gruppen}
        raeume={raeume}
        personen={personen}
        onPersonHinzufuegen={neuePersonInGruppe}
      />
    </>
  );
}

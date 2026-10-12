"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { deletePersonAction, setAbgleichAction, setAktivAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Button, buttonClasses } from "@/components/ui/button";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { IconCheck, IconStar } from "@/components/ui/icons";
import { useErfordertName } from "@/lib/use-mein-name";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PersonFormular } from "./person-formular";
import { StatusPill, statusVon } from "./status";
import type { Gruppe, Raum } from "@/lib/db/schema";
import type { PersonMitGruppe } from "@/lib/domain/personen";

/** Detailbereich einer Person: Ansicht mit Schnellaktionen, „Bearbeiten“ schaltet aufs Formular. */
export function PersonDetail({
  person,
  gruppen,
  raeume,
}: {
  person: PersonMitGruppe;
  gruppen: Gruppe[];
  raeume: Raum[];
}) {
  const [bearbeiten, setBearbeiten] = useState(false);
  const status = statusVon(person);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-navy">
            {person.vorname} {person.nachname}
          </h2>
          <StatusPill status={status} />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          {person.gruppeName}
          {person.istHauptkontakt ? (
            <>
              <span>·</span>
              <IconStar className="h-3.5 w-3.5 text-amber-500" />
              Hauptkontakt
            </>
          ) : null}
        </p>
      </div>

      {bearbeiten ? (
        <PersonFormular
          person={person}
          gruppen={gruppen}
          raeume={raeume}
          onAbbrechen={() => setBearbeiten(false)}
        />
      ) : (
        <Ansicht person={person} onBearbeiten={() => setBearbeiten(true)} />
      )}
    </div>
  );
}

function Ansicht({ person, onBearbeiten }: { person: PersonMitGruppe; onBearbeiten: () => void }) {
  const { spread: sperre } = useErfordertName();
  const [abgleichState, abgleichAction] = useActionState(setAbgleichAction, IDLE);
  const status = statusVon(person);

  return (
    <>
      {status === "offen" ? (
        <form action={abgleichAction}>
          <input type="hidden" name="id" value={person.id} />
          <input type="hidden" name="abgeglichen" value="true" />
          <SubmitButton className="w-full" pendingText="Speichere …" {...sperre}>
            <IconCheck />
            Heute abgleichen
          </SubmitButton>
        </form>
      ) : null}
      {abgleichState?.ok === false ? <FormMessage state={abgleichState} /> : null}

      <Abschnitt titel="Zugang">
        <Zeile label="Transponder" wert={person.transponderNr ?? "noch keiner"} mono={!!person.transponderNr} />
        <Zeile label="Räume" wert={person.raeume.map((r) => r.name).join(", ") || "–"} />
        <Zeile label="Ausgegeben am" wert={formatDate(person.transponderAusgabeAm) || "–"} />
        {person.transponderRueckgabeAm ? (
          <Zeile label="Zurück am" wert={formatDate(person.transponderRueckgabeAm)} />
        ) : null}
        <Zeile label="Befristet bis" wert={formatDate(person.befristetBis) || "–"} />
        <Zeile
          label="Abgeglichen am"
          wert={
            person.abgleichKeyverwaltungAm ? (
              <span className="flex items-center justify-end gap-2">
                {formatDate(person.abgleichKeyverwaltungAm)}
                <form action={abgleichAction}>
                  <input type="hidden" name="id" value={person.id} />
                  <input type="hidden" name="abgeglichen" value="false" />
                  <button
                    type="submit"
                    className="text-xs text-muted underline-offset-2 hover:text-brand hover:underline disabled:cursor-not-allowed"
                    {...sperre}
                  >
                    zurücknehmen
                  </button>
                </form>
              </span>
            ) : (
              "noch nicht"
            )
          }
        />
      </Abschnitt>

      <Abschnitt titel="Kontakt">
        <Zeile label="Telefon" wert={person.telefon ? <a href={`tel:${person.telefon}`} className="text-brand hover:underline">{person.telefon}</a> : "–"} />
        <Zeile label="E-Mail" wert={person.email ? <a href={`mailto:${person.email}`} className="text-brand hover:underline">{person.email}</a> : "–"} />
      </Abschnitt>

      {person.bemerkung ? (
        <Abschnitt titel="Bemerkung">
          <p className="whitespace-pre-line text-sm text-ink">{person.bemerkung}</p>
        </Abschnitt>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onBearbeiten} {...sperre}>
          Bearbeiten
        </Button>
        <Link href={`/beleg/${person.id}`} className={buttonClasses("outline", "md")}>
          Übergabebeleg
        </Link>
      </div>

      <Verlauf person={person} />
      <Verwaltung person={person} />
    </>
  );
}

function Verlauf({ person }: { person: PersonMitGruppe }) {
  return (
    <details className="group rounded-lg border border-line bg-page/60 px-3 py-2 text-xs text-muted">
      <summary className="cursor-pointer select-none font-medium text-ink">Verlauf</summary>
      <ul className="mt-2 flex flex-col gap-1">
        <li>
          Eingetragen: {formatDateTime(person.eingetragenAm)}
          {person.eingetragenVon ? ` von ${person.eingetragenVon}` : ""}
        </li>
        <li>Abgeglichen: {person.abgleichKeyverwaltungAm ? formatDate(person.abgleichKeyverwaltungAm) : "noch nicht"}</li>
        <li>Beleg unterschrieben: {person.uebergabeSignaturAm ? formatDateTime(person.uebergabeSignaturAm) : "noch nicht"}</li>
        <li>
          Status: {person.aktiv ? "aktiv" : "inaktiv"}
          {person.aktivGeaendertAm ? ` seit ${formatDateTime(person.aktivGeaendertAm)}` : ""}
        </li>
      </ul>
    </details>
  );
}

function Verwaltung({ person }: { person: PersonMitGruppe }) {
  const { spread: sperre } = useErfordertName();
  const [aktivState, aktivAction] = useActionState(setAktivAction, IDLE);
  const [deleteState, deleteAction] = useActionState(deletePersonAction, IDLE);

  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <form action={aktivAction}>
          <input type="hidden" name="id" value={person.id} />
          <input type="hidden" name="aktiv" value={(!person.aktiv).toString()} />
          <SubmitButton size="sm" variant="ghost" pendingText="…" {...sperre}>
            {person.aktiv ? "Deaktivieren (Zugang sperren)" : "Wieder aktivieren"}
          </SubmitButton>
        </form>
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!window.confirm(`„${person.vorname} ${person.nachname}“ wirklich löschen?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={person.id} />
          <SubmitButton size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" pendingText="…" {...sperre}>
            Löschen
          </SubmitButton>
        </form>
      </div>
      {aktivState?.ok === false ? <FormMessage state={aktivState} /> : null}
      {deleteState?.ok === false ? <FormMessage state={deleteState} /> : null}
    </div>
  );
}

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col">
      <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{titel}</h3>
      <div className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface px-3">{children}</div>
    </section>
  );
}

function Zeile({ label, wert, mono }: { label: string; wert: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm">
      <span className="shrink-0 text-muted">{label}</span>
      <span className={mono ? "text-right font-mono text-ink" : "text-right text-ink"}>{wert}</span>
    </div>
  );
}

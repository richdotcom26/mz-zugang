"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { setUebergabeSignaturAction } from "@/app/actions";
import { IDLE } from "@/lib/domain/action-state";
import { Button } from "@/components/ui/button";
import { SubmitButton, FormMessage } from "@/components/ui/form";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { PersonBeleg } from "@/lib/domain/personen";

export function BelegAnsicht({ person }: { person: PersonBeleg }) {
  const [neuUnterschreiben, setNeuUnterschreiben] = useState(false);
  const zeigtPad = !person.uebergabeSignatur || neuUnterschreiben;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/" className="text-sm text-brand underline-offset-2 hover:underline">
          ← Zurück zur Liste
        </Link>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          Drucken
        </Button>
      </div>

      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
        <h1 className="text-lg font-semibold text-navy">Transponder-Übergabebeleg</h1>
        <p className="mb-4 text-xs text-muted">Markus-Zentrum — Gebäudezugang</p>

        <dl className="grid grid-cols-1 gap-y-1.5 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted">Name</dt>
          <dd>
            {person.vorname} {person.nachname}
          </dd>
          <dt className="text-muted">Gruppe</dt>
          <dd>{person.gruppeName}</dd>
          <dt className="text-muted">Transponder-Nr.</dt>
          <dd>{person.transponderNr ?? "–"}</dd>
          <dt className="text-muted">Zugang zu</dt>
          <dd>{person.raeume.length > 0 ? person.raeume.join(", ") : "–"}</dd>
          <dt className="text-muted">Datum</dt>
          <dd>{person.uebergabeSignaturAm ? formatDate(person.uebergabeSignaturAm) : formatDate(new Date())}</dd>
        </dl>

        <div className="mt-6">
          <p className="mb-2 text-sm text-muted">
            Hiermit bestätige ich den Erhalt des oben genannten Transponders und die zugewiesenen Zugangsrechte.
          </p>

          {zeigtPad ? (
            <SignaturPad personId={person.id} onGespeichert={() => setNeuUnterschreiben(false)} />
          ) : (
            <div>
              <img
                src={person.uebergabeSignatur!}
                alt="Unterschrift"
                className="h-24 border-b border-ink/40 object-contain"
              />
              <p className="mt-1 text-xs text-muted print:hidden">
                Digital unterschrieben am {formatDateTime(person.uebergabeSignaturAm)}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 print:hidden"
                onClick={() => setNeuUnterschreiben(true)}
              >
                Neu unterschreiben
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SignaturPad({ personId, onGespeichert }: { personId: number; onGespeichert: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturInputRef = useRef<HTMLInputElement>(null);
  const zeichnetRef = useRef(false);
  const [leer, setLeer] = useState(true);
  const [state, formAction] = useActionState(setUebergabeSignaturAction, IDLE);

  useEffect(() => {
    if (state?.ok) onGespeichert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function position(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    // Canvas wird per CSS (w-full) auf die Bildschirmbreite skaliert, das interne
    // Koordinatensystem bleibt aber 500x140 -> Zeigerposition muss umgerechnet werden,
    // sonst zeichnet man auf kleinen Bildschirmen (Handy) neben dem tatsächlichen Stift.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    zeichnetRef.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = position(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  }

  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!zeichnetRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = position(e);
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f1c15";
    ctx.lineTo(x, y);
    ctx.stroke();
    setLeer(false);
  }

  function ende() {
    zeichnetRef.current = false;
  }

  function loeschen() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setLeer(true);
  }

  return (
    <form
      action={formAction}
      className="print:hidden"
      onSubmit={(e) => {
        const canvas = canvasRef.current;
        if (!canvas || !signaturInputRef.current) {
          e.preventDefault();
          return;
        }
        signaturInputRef.current.value = canvas.toDataURL("image/png");
      }}
    >
      <input type="hidden" name="id" value={personId} />
      <input type="hidden" name="signatur" ref={signaturInputRef} />
      <canvas
        ref={canvasRef}
        width={500}
        height={140}
        className="w-full touch-none rounded-lg border border-field-border bg-field"
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={ende}
        onPointerLeave={ende}
      />
      <p className="mt-1 text-xs text-muted">Mit Maus, Stift oder Finger im Feld oben unterschreiben.</p>
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" variant="outline" type="button" onClick={loeschen}>
          Löschen
        </Button>
        <SubmitButton size="sm" disabled={leer} pendingText="Speichere …">
          Unterschrift speichern
        </SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

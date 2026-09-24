"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Date-Input mit explizitem "Leeren"-Button. Auf dem Handy (v.a. iOS Safari)
 * fehlt beim nativen <input type="date"> oft ein Weg, ein gesetztes Datum
 * per Touch wieder zu entfernen -- daher hier zusätzlich ein Button dafür.
 */
export function DatumFeld({
  id,
  name,
  defaultValue,
  required,
}: {
  id: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [leer, setLeer] = useState(!defaultValue);

  return (
    <div className="flex items-center gap-1.5">
      <Input
        ref={ref}
        id={id}
        name={name}
        type="date"
        required={required}
        defaultValue={defaultValue ?? ""}
        onChange={(e) => setLeer(!e.target.value)}
        className="flex-1"
      />
      {!leer ? (
        <button
          type="button"
          title="Datum löschen"
          onClick={() => {
            if (ref.current) ref.current.value = "";
            setLeer(true);
          }}
          className="shrink-0 px-1.5 text-sm text-muted hover:text-red-600"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

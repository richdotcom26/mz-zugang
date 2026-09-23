"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "gz_mein_name";
const listeners = new Set<() => void>();

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot(): string {
  return "";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function emitChange() {
  for (const listener of listeners) listener();
}

/**
 * Da alle 5 Verantwortlichen dasselbe Portal-Passwort teilen (kein Login pro
 * Person), merkt sich jeder Browser lokal einen Namen (localStorage), um
 * "Eingetragen von" / "Abgeglichen von" vorzubelegen. Kein Auth-Ersatz, nur
 * Komfort — daher als externer Store gelesen (useSyncExternalStore), nicht
 * über setState-in-Effect.
 */
export function useMeinName(): [string, (v: string) => void] {
  const name = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setName = useCallback((v: string) => {
    try {
      window.localStorage.setItem(KEY, v);
    } catch {
      // localStorage nicht verfügbar (z.B. privater Modus) — Änderung bleibt lokal im State.
    }
    emitChange();
  }, []);

  return [name, setName];
}

const SPERR_HINWEIS = 'Bitte oben "Ich bin" auswählen';

/**
 * Sperrt Änderungen (Anlegen/Bearbeiten/Löschen/Status), solange niemand oben
 * als "Ich bin" ausgewählt ist — jede Änderung soll einer Person zuordenbar
 * sein. `spread` lässt sich direkt auf Buttons legen: `<Button {...spread}>`.
 */
export function useErfordertName() {
  const [meinName] = useMeinName();
  const gesperrt = !meinName;
  return {
    meinName,
    gesperrt,
    titel: gesperrt ? SPERR_HINWEIS : undefined,
    spread: { disabled: gesperrt, title: gesperrt ? SPERR_HINWEIS : undefined },
  };
}

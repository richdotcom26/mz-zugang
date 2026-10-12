# MZ-Zugang — Gebäudezugang-Portal

Kleines internes Portal für ca. 5 Verantwortliche, um eine Liste aller Personen mit
Gebäudezugang zu pflegen (Name, Gruppe, Transponder-Nr., Bemerkung) und sie als
"abgeglichen" zu markieren, sobald sie mit der Transponder-Verwaltungssoftware
abgeglichen wurden. Alle Transponder von Personen, die nicht auf der Liste bzw.
nicht abgeglichen sind, werden dort anschließend gesperrt.

Eigenständiges Projekt, unabhängig von anderen Projekten in diesem Verzeichnis.

## Stack

- Next.js (App Router, `src/`), TypeScript, Tailwind v4
- Postgres über **Drizzle** (`src/lib/db`). **Produktion:** gemeinsames Postgres 17 in
  Coolify (Projekt „Infrastruktur", DB `mz_zugang`, nur intern erreichbar, tägliches Backup).
  `.env.local` zeigt weiterhin auf das alte Supabase-Projekt (Entwicklung) — Schema-Änderungen
  müssen zusätzlich auf dem Server-Postgres eingespielt werden.
- Auth: **ein gemeinsames Portal-Passwort** (kein Nutzer-Login) — `src/proxy.ts` (Next 16:
  "Middleware" heißt jetzt "Proxy", läuft standardmäßig im Node.js-Runtime) prüft ein
  signiertes Session-Cookie (`src/lib/auth`), Passwort-Hash in `PORTAL_PASSWORD_HASH`.
- Deploy: **Coolify** auf dem eigenen Server → https://mz.wuelbeck.de. Push auf `main`
  (GitHub `richdotcom26/mz-zugang`) deployt automatisch per `Dockerfile` (standalone output).
  Seiten mit DB-Zugriff rufen `connection()` auf, damit der Build keine DB braucht.
- **Preview:** Dev-Server läuft über die Parent-`.claude/launch.json` als `mz-zugang-dev`
  auf **Port 3002** (`npm run dev --prefix … -- -p 3002`), damit 3000/3001 (Nachbarprojekte) frei bleiben.
- **Vercel-Projekt (alt, wird abgeschaltet):** `richdotcom/mz-zugang` → https://mz-zugang.vercel.app

## Struktur

- `src/lib/db/schema/` — Drizzle-Schema: `gruppen` (frei erweiterbar), `personen`.
- `src/lib/domain/` — Datenzugriff (`import "server-only"`), wirft `DomainError`.
- `src/app/actions.ts` — Server Actions (`"use server"`), dünn: `parseForm` + `runAction`
  → `ActionState` (siehe `src/lib/domain/action-state.ts`).
- `src/app/page.tsx` — einzige Seite: Formular „Person hinzufügen", Gruppen-Liste mit
  Personen, Marker-Checkbox „abgeglichen" pro Person.
- `src/app/login/` — Passwort-Formular + Login/Logout-Actions.
- `src/components/ui/` — handgerollt, Tailwind, kein Radix.
- Inline-Edit-Zeilen (`person-row.tsx`) klappen nach Speichern automatisch zurück:
  Zeilen-`key` = `personId-updatedAt` → Remount im Ansichtsmodus (kein `setState` im Effect).
- "Ich bin"-Feld (`useMeinName`, `localStorage`) füllt „Eingetragen von" /
  „Abgeglichen von" vor, da alle Verantwortlichen dasselbe Passwort teilen.

## Setup

1. Neues (kostenloses) Supabase-Projekt anlegen, Region Frankfurt.
2. `cp .env.example .env.local`, `DATABASE_URL` + `DATABASE_URL_DIRECT` eintragen.
3. Portal-Passwort festlegen und hashen: `npm run hash-password -- "DasPasswort"`,
   Ergebnis in `PORTAL_PASSWORD_HASH` eintragen. `SESSION_SECRET` z.B. mit
   `openssl rand -hex 32` erzeugen.
4. `npm install`
5. `npm run db:push` — Schema nach Supabase.
6. `npm run db:seed` — Start-Gruppen (Musiker, Jugend, Konfis, Senioren, Square-Dance) anlegen.
7. `npm run dev`

## Befehle

- `npm run dev` / `build` / `lint` / `typecheck`
- `npm run db:generate` · `db:migrate` · `db:push` · `db:studio` · `db:seed`
- `npm run hash-password -- "<passwort>"` — Hash für `PORTAL_PASSWORD_HASH` erzeugen

> Auf diesem Windows-Rechner in Terminalbefehlen `npm.cmd` / `npx.cmd` verwenden
> (PowerShell blockiert die `.ps1`-Shims per Gruppenrichtlinie).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

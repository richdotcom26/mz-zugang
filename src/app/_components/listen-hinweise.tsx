import Link from "next/link";

const linkClass = "text-brand underline-offset-2 hover:underline";

export function GruppenHinweis() {
  return (
    <>
      Gruppen ändern oder neue hinzufügen: unter{" "}
      <Link href="/einstellungen" className={linkClass}>
        Einstellungen
      </Link>
      .
    </>
  );
}

export function RaeumeHinweis() {
  return (
    <>
      Räume ändern oder neue hinzufügen: unter{" "}
      <Link href="/einstellungen" className={linkClass}>
        Einstellungen
      </Link>
      .
    </>
  );
}

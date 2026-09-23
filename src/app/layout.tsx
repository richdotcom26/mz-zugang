import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markus-Zentrum Zugang",
  description: "Liste der Personen mit Gebäudezugang, nach Gruppen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

import { exportDaten } from "@/lib/domain/backup";

export async function GET() {
  const dump = await exportDaten();
  const datum = new Date().toISOString().slice(0, 10);

  return new Response(JSON.stringify(dump, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mz-zugang-sicherung-${datum}.json"`,
    },
  });
}

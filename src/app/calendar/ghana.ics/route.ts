import { ghanaEvent, icsFile } from "@/lib/calendar";

/** /calendar/ghana.ics: the save-the-date calendar file (Apple Calendar, Outlook desktop, others). */
export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  return new Response(icsFile(ghanaEvent(origin)), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kwazi-kwasi-ghana-wedding.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}

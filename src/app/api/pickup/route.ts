import { BackendError, jsonError, rateLimited, sendToSheet } from "@/lib/backend";
import {
  ALLOWED_FILE_TYPES,
  LIMITS,
  clean,
  isFlightNumber,
  isFullName,
  isIsoDate,
  isTime,
  isWhatsApp,
} from "@/lib/validation";

export async function POST(req: Request) {
  if (rateLimited(req, "pickup", 10)) {
    return jsonError("Too many submissions from this connection. Please try again later.", 429);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError("Something went wrong. Please try again.");
  }

  if (clean(form.get("website"), 100)) return Response.json({ ok: true }); // honeypot

  const fullName = clean(form.get("fullName"), LIMITS.name);
  const whatsapp = clean(form.get("whatsapp"), LIMITS.whatsapp);
  const needsPickup = form.get("needsPickup") === "yes";

  if (!isFullName(fullName)) return jsonError("Please enter your full name (first and last).");
  if (!isWhatsApp(whatsapp)) return jsonError("Please enter your WhatsApp number with the country code, e.g. +1 416 555 0123.");
  if (form.get("needsPickup") !== "yes" && form.get("needsPickup") !== "no") {
    return jsonError("Please tell us whether you need airport pickup.");
  }

  const data: Record<string, unknown> = { fullName, whatsapp, needsPickup };

  if (needsPickup) {
    const airline = clean(form.get("airline"), LIMITS.airline);
    const flightNumber = clean(form.get("flightNumber"), LIMITS.flight).toUpperCase();
    const arrivalDate = clean(form.get("arrivalDate"), 10);
    const arrivalTime = clean(form.get("arrivalTime"), 5);
    if (!airline) return jsonError("Please enter your airline.");
    if (!isFlightNumber(flightNumber)) return jsonError("Please check your flight number, e.g. KQ 512.");
    if (!isIsoDate(arrivalDate)) return jsonError("Please enter your arrival date.");
    if (!isTime(arrivalTime)) return jsonError("Please enter your arrival time in Ghana local time.");
    Object.assign(data, { airline, flightNumber, arrivalDate, arrivalTime });

    const file = form.get("itinerary");
    if (file instanceof File && file.size > 0) {
      if (file.size > LIMITS.fileBytes) return jsonError("Your itinerary file is over 4 MB. Please upload a smaller screenshot.");
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return jsonError("Please upload your itinerary as a JPG, PNG, HEIC or PDF.");
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      data.file = {
        name: clean(file.name, 120),
        type: file.type,
        base64: bytes.toString("base64"),
      };
    }
  }

  try {
    const result = await sendToSheet("pickup", data);
    return Response.json({ ok: true, updated: result.updated });
  } catch (err) {
    const message = err instanceof BackendError ? err.message : "We couldn't save your request. Please try again.";
    console.error("Pickup request failed", err);
    return jsonError(message, 502);
  }
}

import { cookies } from "next/headers";
import { BackendError, checkInviteCode, jsonError, rateLimited, sendToSheet } from "@/lib/backend";
import { ACCESS_COOKIE, hasAccess } from "@/lib/access";
import { LIMITS, clean, isEmail, isFullName } from "@/lib/validation";

export async function POST(req: Request) {
  if (rateLimited(req, "rsvp", 15)) {
    return jsonError("Too many submissions from this connection. Please try again later.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Something went wrong. Please try again.");
  }

  // Bots fill every field, including the hidden one. Pretend success and drop it.
  if (clean(body.website, 100)) return Response.json({ ok: true });

  // The code is checked again here, so the form can't be submitted without it.
  // A browser that already unlocked the site (cookie) doesn't need to send it.
  const unlocked = await hasAccess((await cookies()).get(ACCESS_COOKIE)?.value);
  if (!unlocked && !checkInviteCode(clean(body.code, 40))) {
    return jsonError("Your invitation code has expired from this page. Please re-enter it.", 401);
  }

  const fullName = clean(body.fullName, LIMITS.name);
  if (!isFullName(fullName)) return jsonError("Please enter your full name (first and last).");

  const attending = body.attending === "accepts" ? "accepts" : body.attending === "declines" ? "declines" : null;
  if (!attending) return jsonError("Please let us know whether you'll attend.");

  const rawChildren = Array.isArray(body.children) ? body.children : [];
  const children = attending === "accepts" ? rawChildren.map((c) => clean(c, LIMITS.name)).filter(Boolean) : [];
  if (children.length > LIMITS.maxChildren) {
    return jsonError(`You can include up to ${LIMITS.maxChildren} children per RSVP.`);
  }
  if (children.some((c) => !isFullName(c))) {
    return jsonError("Please enter each child's full name (first and last).");
  }
  const lower = children.map((c) => c.toLowerCase());
  if (new Set(lower).size !== lower.length) return jsonError("Each child only needs to be listed once.");

  // Needed for guests who accept, so the couple can send them the official wedding emails later.
  const email = clean(body.email, LIMITS.email).toLowerCase();
  if (attending === "accepts" && !email) {
    return jsonError("Please add your email so we can send you the official wedding details.");
  }
  if (email && !isEmail(email)) return jsonError("Please check your email address.");

  try {
    await sendToSheet("rsvp", { fullName, attending, children, email });
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof BackendError ? err.message : "We couldn't save your RSVP. Please try again.";
    console.error("RSVP failed", err);
    return jsonError(message, 502);
  }
}

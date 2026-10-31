import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jsonError, rateLimited } from "@/lib/backend";
import { ACCESS_COOKIE, accessCookieOptions, accessToken, codeMatches, hasAccess } from "@/lib/access";
import { clean } from "@/lib/validation";
import { site } from "@/lib/site";

/** Is this browser already unlocked? Used by the RSVP form to skip its code step. */
export async function GET() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  return NextResponse.json({ unlocked: await hasAccess(token) }, { headers: { "Cache-Control": "no-store" } });
}

/** Checks the invitation code and, if it's right, remembers this browser. */
export async function POST(req: Request) {
  if (rateLimited(req, "unlock", 10)) {
    return jsonError("Too many attempts. Please wait a few minutes and try again.", 429);
  }
  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("Something went wrong. Please try again.");
  }
  const code = clean(body.code, 40);
  if (!code) return jsonError("Enter the invitation code from your invitation.");
  if (!(await codeMatches(code))) {
    return jsonError("That code doesn't match. Check your invitation and try again.", 401);
  }
  const token = await accessToken();
  if (!token) return jsonError("The website isn't fully set up yet. Please try again later.", 503);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, token, accessCookieOptions(site.gate.rememberDays));
  return res;
}

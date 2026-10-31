import { NextResponse } from "next/server";
import { checkInviteCode, jsonError, rateLimited } from "@/lib/backend";
import { ACCESS_COOKIE, accessCookieOptions, accessToken } from "@/lib/access";
import { site } from "@/lib/site";
import { clean } from "@/lib/validation";

export async function POST(req: Request) {
  if (rateLimited(req, "verify", 10)) {
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
  if (!checkInviteCode(code)) {
    return jsonError("That code doesn't match. Check your invitation and try again.", 401);
  }
  // The right code here also unlocks the rest of the site on this device.
  const res = NextResponse.json({ ok: true });
  const token = await accessToken();
  if (token) res.cookies.set(ACCESS_COOKIE, token, accessCookieOptions(site.gate.rememberDays));
  return res;
}

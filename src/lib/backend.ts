import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Talks to the Google Apps Script web app that writes to the couple's Google Sheet.
 * The script URL and shared secret stay on the server and are never sent to the browser.
 */

export const DEMO_CODE = "DEMO2027";

export function isDemoMode() {
  return !process.env.APPS_SCRIPT_URL;
}

/** Constant-time, case-insensitive comparison of the invitation code. */
export function checkInviteCode(input: string): boolean {
  const expected = isDemoMode() ? DEMO_CODE : process.env.INVITE_CODE;
  if (!expected) return false; // live mode with no code configured: refuse everything
  const norm = (s: string) => createHash("sha256").update(s.trim().toUpperCase()).digest();
  return timingSafeEqual(norm(input), norm(expected));
}

export class BackendError extends Error {}

export async function sendToSheet(action: "rsvp" | "pickup", data: Record<string, unknown>) {
  if (isDemoMode()) {
    console.info(`[demo] ${action} received (not saved)`, { ...data, file: data.file ? "[file]" : undefined });
    return { ok: true as const, demo: true, updated: false };
  }

  const res = await fetch(process.env.APPS_SCRIPT_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, secret: process.env.APPS_SCRIPT_SECRET, data }),
    cache: "no-store",
    redirect: "follow",
  });

  let json: { ok?: boolean; error?: string; updated?: boolean } = {};
  try {
    json = await res.json();
  } catch {
    throw new BackendError("We couldn't save your response just now. Please try again in a few minutes.");
  }
  if (!json.ok) {
    throw new BackendError(json.error || "We couldn't save your response just now. Please try again.");
  }
  return { ok: true as const, demo: false, updated: Boolean(json.updated) };
}

/**
 * Very small in-memory rate limit per IP. Good enough to slow down code guessing on a
 * single server instance; on serverless hosts each instance keeps its own count.
 */
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimited(req: Request, key: string, max = 10, windowMs = 10 * 60 * 1000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const entry = hits.get(id);
  if (!entry || entry.reset < now) {
    hits.set(id, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

export const jsonError = (message: string, status = 400) =>
  Response.json({ ok: false, error: message }, { status });

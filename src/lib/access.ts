/**
 * Access cookie for the gated pages.
 *
 * The cookie holds an HMAC of the current invitation code, signed with ACCESS_SECRET.
 * It contains nothing readable, can't be forged without the secret, and stops working
 * the moment INVITE_CODE changes (so changing a leaked code locks everyone out until
 * they enter the new one). Uses Web Crypto so it runs in proxy.ts and in route handlers.
 */

export const ACCESS_COOKIE = "kk_access";

const DEMO_CODE = "DEMO2027";
const isDemo = () => !process.env.APPS_SCRIPT_URL;

const normalise = (code: string) => code.trim().toUpperCase();

function inviteCode() {
  return isDemo() ? DEMO_CODE : process.env.INVITE_CODE || "";
}

function secret() {
  // In preview mode a fixed secret is fine: nothing private is behind it.
  return process.env.ACCESS_SECRET || (isDemo() ? "preview-mode-secret" : "");
}

async function hmac(message: string, key: string) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(message)));
  let bin = "";
  sig.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Constant-time string comparison. */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The token a browser gets once it has entered the right code. Empty if the site isn't configured. */
export async function accessToken() {
  const code = inviteCode();
  const key = secret();
  if (!code || !key) return "";
  return hmac("access:v1:" + normalise(code), key);
}

export async function hasAccess(token: string | undefined) {
  if (!token) return false;
  const expected = await accessToken();
  return Boolean(expected) && same(token, expected);
}

/** Checks a typed code without revealing timing differences. */
export async function codeMatches(input: string) {
  const code = inviteCode();
  const key = secret();
  if (!code || !key) return false;
  const [a, b] = await Promise.all([hmac("check:" + normalise(input), key), hmac("check:" + normalise(code), key)]);
  return same(a, b);
}

export const accessCookieOptions = (maxAgeDays: number) => ({
  httpOnly: true, // not readable by page scripts
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: maxAgeDays * 24 * 60 * 60,
});

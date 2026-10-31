import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, accessCookieOptions, accessToken, codeMatches, hasAccess } from "@/lib/access";
import { isProtectedPath, site } from "@/lib/site";

/**
 * Runs before every page request (Next.js 16 "proxy", formerly middleware).
 *
 * 1. Unlock links: any page URL with ?code=... (used in the invitation emails) checks the code,
 *    sets the access cookie, and redirects to the same page without the code in the address bar.
 * 2. Gated pages: without a valid access cookie, visitors are sent to /unlock instead.
 * 3. The airport pickup API needs the cookie too, because its form lives on a gated page.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(ACCESS_COOKIE)?.value;

  // 1. Unlock link
  const code = searchParams.get("code");
  if (code !== null && !pathname.startsWith("/api/")) {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("code");
    if (await codeMatches(code)) {
      const res = NextResponse.redirect(clean);
      res.cookies.set(ACCESS_COOKIE, await accessToken(), accessCookieOptions(site.gate.rememberDays));
      return res;
    }
    // Wrong code: show the code screen for gated pages, otherwise just drop the parameter.
    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(unlockUrl(request, clean.pathname + clean.search, true));
    }
    return NextResponse.redirect(clean);
  }

  // 3. Pickup API
  if (pathname === "/api/pickup") {
    if (await hasAccess(token)) return NextResponse.next();
    return NextResponse.json(
      { ok: false, error: "Please enter your invitation code on the travel page first." },
      { status: 401 }
    );
  }

  // 2. Gated pages
  if (isProtectedPath(pathname) && !(await hasAccess(token))) {
    return NextResponse.redirect(unlockUrl(request, pathname + request.nextUrl.search, false));
  }

  return NextResponse.next();
}

function unlockUrl(request: NextRequest, next: string, error: boolean) {
  const url = request.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = "";
  url.searchParams.set("next", next);
  if (error) url.searchParams.set("error", "1");
  return url;
}

export const config = {
  // Everything except Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|email/|robots.txt).*)"],
};

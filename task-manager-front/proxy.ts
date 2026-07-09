/**
 * Edge/server route gate (Next 16 renamed `middleware` -> `proxy`).
 *
 * The auth cookie is set by the backend on ITS OWN domain, so in a split
 * frontend (Vercel) / backend deployment this middleware — running on the
 * frontend domain — cannot see it. Any cookie-presence check here would always
 * read "logged out" and bounce every request to /login. So auth gating is left
 * entirely to the authoritative client guard in app/(dashboard)/layout.tsx
 * (which validates the session against the backend). This only handles the
 * root-path entry redirect.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // No dashboard index route: send the app home to /my-task. If the visitor
  // isn't actually authenticated, the client guard redirects them to /login.
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/my-task", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except API, Next internals, and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

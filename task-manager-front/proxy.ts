/** Route gate (Next 16 renamed `middleware` -> `proxy`); only the root-path redirect — auth gating lives in the client guard. */
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

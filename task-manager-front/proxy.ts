/**
 * Edge/server route gate (Next 16 renamed `middleware` -> `proxy`).
 *
 * This is a *fast, coarse* check based only on the presence of the auth cookie
 * — it does NOT validate the JWT (that's the backend's job, plus the
 * authoritative client guard in app/(dashboard)/layout.tsx). Its purpose is to
 * avoid rendering the app shell for obviously-unauthenticated visitors and to
 * keep logged-in users off the login/register pages.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "access_token";
const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // There is no dashboard route: the app home is /my-task.
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(hasSession ? "/my-task" : "/login", request.url),
    );
  }

  // Signed-in users shouldn't see the auth pages.
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/my-task", request.url));
  }

  // Everything else in scope is app content: require a session cookie.
  if (!hasSession && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except API, Next internals, and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

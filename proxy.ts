import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Proxy draait vóórdat een pagina wordt opgebouwd. Hier kijken we alleen of
// er een sessiecookie is, zodat je zonder omweg naar /login gaat.
// Let op: dit controleert niet of de cookie geldig is. Die echte controle
// zit in requireUser() op elke pagina en in elke Server Action.

export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/quests/:path*", "/systeem"],
};

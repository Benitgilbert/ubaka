import { NextResponse } from "next/server";

const CANONICAL_HOST = "www.kurimacye.co.rw";

export function middleware(request) {
  const host = request.headers.get("host");
  const url = request.nextUrl.clone();

  if (host && host.startsWith("kurimacye.co.rw")) {
    url.host = CANONICAL_HOST;
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

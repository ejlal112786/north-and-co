import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function guestToken(existing?: string) {
  return existing || crypto.randomUUID().replace(/-/g, "");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestHeaders = new Headers(req.headers);

  const sid = guestToken(req.cookies.get("nc_sid")?.value);
  const cart = guestToken(req.cookies.get("nc_cart")?.value);
  requestHeaders.set("x-cart-token", cart);
  requestHeaders.set("x-sid", sid);

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  if (!req.cookies.get("nc_sid")) {
    res.cookies.set("nc_sid", sid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
  }
  if (!req.cookies.get("nc_cart")) {
    res.cookies.set("nc_cart", cart, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|uploads/).*)"],
};

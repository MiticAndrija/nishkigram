import { NextResponse } from "next/server";
import { adminCookieName, isSameOrigin } from "@/lib/adminAuth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.delete(adminCookieName);
  return response;
}

import { NextResponse } from "next/server";
import {
  adminCookieName,
  adminCookieOptions,
  createAdminSessionToken,
  isSameOrigin,
  verifyAdminPassword,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const password = String(formData.get("password") || "");

  if (!verifyAdminPassword(password)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/admin/blog", request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(
    adminCookieName,
    createAdminSessionToken(),
    adminCookieOptions,
  );
  return response;
}

import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const adminCookieName = "niskigram_admin";

const sessionVersion = "v1";
const sessionLifetimeSeconds = 60 * 60 * 8;

function requireEnvironmentVariable(name: "ADMIN_PASSWORD" | "ADMIN_SESSION_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is required for admin authentication. Configure it in the server environment.`,
    );
  }
  return value;
}

function sign(value: string) {
  return createHmac(
    "sha256",
    requireEnvironmentVariable("ADMIN_SESSION_SECRET"),
  )
    .update(value)
    .digest();
}

function safeCompare(left: Buffer, right: Buffer) {
  return left.length === right.length && timingSafeEqual(left, right);
}

function safeCompareStrings(left: string, right: string) {
  return safeCompare(
    createHash("sha256").update(left).digest(),
    createHash("sha256").update(right).digest(),
  );
}

export function createAdminSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = `${sessionVersion}.${expiresAt}.${randomBytes(18).toString("base64url")}`;
  return `${payload}.${sign(payload).toString("base64url")}`;
}

export function verifyAdminSession(token?: string) {
  requireEnvironmentVariable("ADMIN_SESSION_SECRET");

  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 4) {
    return false;
  }

  const [version, expiresAtValue, nonce, signatureValue] = parts;
  const expiresAt = Number(expiresAtValue);
  if (
    version !== sessionVersion ||
    !/^\d+$/.test(expiresAtValue) ||
    !nonce ||
    !signatureValue ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  try {
    const payload = `${version}.${expiresAtValue}.${nonce}`;
    return safeCompare(Buffer.from(signatureValue, "base64url"), sign(payload));
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string) {
  return safeCompareStrings(
    password,
    requireEnvironmentVariable("ADMIN_PASSWORD"),
  );
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const expectedHost = forwardedHost?.split(",")[0].trim() || requestUrl.host;
    return originUrl.protocol === requestUrl.protocol && originUrl.host === expectedHost;
  } catch {
    return false;
  }
}

export function authorizeAdminRequest(
  request: NextRequest,
  options: { csrf?: boolean } = {},
) {
  if (!verifyAdminSession(request.cookies.get(adminCookieName)?.value)) {
    return { authorized: false as const, status: 401 as const };
  }
  if (options.csrf && !isSameOrigin(request)) {
    return { authorized: false as const, status: 403 as const };
  }
  return { authorized: true as const };
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(adminCookieName)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: sessionLifetimeSeconds,
};

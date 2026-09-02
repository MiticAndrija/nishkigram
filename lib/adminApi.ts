import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export function rejectUnauthorizedAdminRequest(
  request: NextRequest,
  options: { csrf?: boolean } = {},
) {
  const authorization = authorizeAdminRequest(request, options);
  if (authorization.authorized) return null;

  return NextResponse.json(
    { error: authorization.status === 401 ? "Unauthorized" : "Forbidden" },
    { status: authorization.status },
  );
}

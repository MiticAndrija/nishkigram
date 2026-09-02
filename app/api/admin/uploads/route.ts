import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import { deleteAdminMediaItem, getAdminMediaItems } from "@/lib/adminMedia";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request);
  if (rejection) return rejection;

  return NextResponse.json({ uploads: await getAdminMediaItems() });
}

export async function DELETE(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as { url?: string; force?: boolean };

  if (!input.url) {
    return NextResponse.json({ error: "URL slike je obavezan." }, { status: 400 });
  }

  try {
    await deleteAdminMediaItem(input.url, Boolean(input.force));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Brisanje slike nije uspelo.",
      },
      { status: 400 },
    );
  }
}

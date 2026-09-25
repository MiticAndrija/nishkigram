import { NextResponse } from "next/server";
import { ActivityValidationError } from "@/lib/activityMeta";

export function activityApiError(error: unknown) {
  const invalid = error instanceof ActivityValidationError || error instanceof SyntaxError;
  if (!invalid) console.error("Activity request failed:", error);
  return NextResponse.json({
    error: error instanceof SyntaxError ? "Neispravan JSON zahtev." : error instanceof Error ? error.message : "Zahtev nije uspeo. Pokušajte ponovo.",
  }, { status: invalid ? 400 : 500 });
}

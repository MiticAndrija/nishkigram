import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import { deleteActivity, updateActivity } from "@/lib/activities";
import { activityApiError } from "@/lib/activityApi";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: Context) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;
  try {
    const { id } = await context.params;
    const activity = await updateActivity(id, await request.json());
    if (!activity) return NextResponse.json({ error: "Aktuelnost nije pronađena." }, { status: 404 });
    revalidatePath("/aktivnosti");
    return NextResponse.json({ activity });
  } catch (error) { return activityApiError(error); }
}

export async function DELETE(request: NextRequest, context: Context) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;
  try {
    const { id } = await context.params;
    if (!(await deleteActivity(id))) return NextResponse.json({ error: "Aktuelnost nije pronađena." }, { status: 404 });
    revalidatePath("/aktivnosti");
    return NextResponse.json({ ok: true });
  } catch (error) { return activityApiError(error); }
}

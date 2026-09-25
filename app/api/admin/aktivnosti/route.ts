import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import { createActivity, getAllActivities } from "@/lib/activities";
import { activityApiError } from "@/lib/activityApi";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request);
  if (rejection) return rejection;
  try {
    return NextResponse.json({ activities: await getAllActivities(true) });
  } catch (error) { return activityApiError(error); }
}

export async function POST(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;
  try {
    const activity = await createActivity(await request.json());
    revalidatePath("/aktivnosti");
    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) { return activityApiError(error); }
}

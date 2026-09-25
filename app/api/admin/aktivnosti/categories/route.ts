import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import { addActivityCategory, deleteActivityCategory, getActivityCategories, updateActivityCategory } from "@/lib/activityCategories";
import { ActivityValidationError } from "@/lib/activityMeta";
import { activityApiError } from "@/lib/activityApi";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request);
  if (rejection) return rejection;
  try { return NextResponse.json({ categories: await getActivityCategories(true) }); }
  catch (error) { return activityApiError(error); }
}

async function mutate(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;
  try {
    const input: unknown = await request.json();
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new ActivityValidationError("Neispravna kategorija.");
    const fields = input as Record<string, unknown>;
    const name = (key: string) => {
      const value = fields[key];
      if (typeof value !== "string" || !value.trim() || value.trim().length > 40) throw new ActivityValidationError("Naziv kategorije je obavezan i može imati najviše 40 znakova.");
      return value;
    };
    const categories = request.method === "POST" ? await addActivityCategory(name("category"))
      : request.method === "PUT" ? await updateActivityCategory(name("currentCategory"), name("nextCategory"))
      : await deleteActivityCategory(name("category"));
    revalidatePath("/aktivnosti");
    return NextResponse.json({ categories }, { status: request.method === "POST" ? 201 : 200 });
  } catch (error) {
    if (error instanceof Error && ["Kategorija vec postoji.", "Kategorija nije pronadjena.", "Naziv kategorije je obavezan."].includes(error.message)) {
      return activityApiError(new ActivityValidationError(error.message));
    }
    return activityApiError(error);
  }
}

export const POST = mutate;
export const PUT = mutate;
export const DELETE = mutate;

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import {
  deleteRecommendation,
  getRecommendationById,
  updateRecommendation,
  type RecommendationInput,
} from "@/lib/recommendations";

export const dynamic = "force-dynamic";

function validateInput(input: RecommendationInput) {
  return Boolean(
    input.title?.trim() &&
      input.description?.trim() &&
      input.contentHtml?.trim(),
  );
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as RecommendationInput;

  if (!validateInput(input)) {
    return NextResponse.json(
      { error: "Naslov, opis i sadrzaj su obavezni." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const existingRecommendation = await getRecommendationById(id, true);
  const recommendation = await updateRecommendation(id, input);

  if (!recommendation) {
    return NextResponse.json(
      { error: "Preporuka nije pronadjena." },
      { status: 404 },
    );
  }

  revalidatePath("/preporuke");
  revalidatePath(`/preporuke/${recommendation.slug}`);

  if (
    existingRecommendation &&
    existingRecommendation.slug !== recommendation.slug
  ) {
    revalidatePath(`/preporuke/${existingRecommendation.slug}`);
  }

  return NextResponse.json({ recommendation });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const { id } = await context.params;
  const existingRecommendation = await getRecommendationById(id, true);
  const deleted = await deleteRecommendation(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Preporuka nije pronadjena." },
      { status: 404 },
    );
  }

  revalidatePath("/preporuke");

  if (existingRecommendation) {
    revalidatePath(`/preporuke/${existingRecommendation.slug}`);
  }

  return NextResponse.json({ ok: true });
}

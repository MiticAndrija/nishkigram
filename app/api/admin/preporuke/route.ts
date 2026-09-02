import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import {
  createRecommendation,
  getAllRecommendations,
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

export async function GET(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request);
  if (rejection) return rejection;

  return NextResponse.json({
    recommendations: await getAllRecommendations(true),
  });
}

export async function POST(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as RecommendationInput;

  if (!validateInput(input)) {
    return NextResponse.json(
      { error: "Naslov, opis i sadrzaj su obavezni." },
      { status: 400 },
    );
  }

  try {
    const recommendation = await createRecommendation(input);
    revalidatePath("/preporuke");
    revalidatePath(`/preporuke/${recommendation.slug}`);
    return NextResponse.json({ recommendation }, { status: 201 });
  } catch (error) {
    console.error("Recommendation creation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Čuvanje preporuke nije uspelo.",
      },
      { status: 500 },
    );
  }
}

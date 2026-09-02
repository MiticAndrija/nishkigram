import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import {
  addRecommendationCategory,
  deleteRecommendationCategory,
  getRecommendationCategories,
  updateRecommendationCategory,
} from "@/lib/recommendationCategories";
import { renameRecommendationCategoryReferences } from "@/lib/recommendations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request);
  if (rejection) return rejection;

  return NextResponse.json({
    categories: await getRecommendationCategories(true),
  });
}

export async function POST(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as { category?: string };

  try {
    const categories = await addRecommendationCategory(input.category ?? "");
    revalidatePath("/preporuke");
    return NextResponse.json({ categories }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Dodavanje kategorije nije uspelo.",
      },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as {
    currentCategory?: string;
    nextCategory?: string;
  };

  try {
    const categories = await updateRecommendationCategory(
      input.currentCategory ?? "",
      input.nextCategory ?? "",
    );
    await renameRecommendationCategoryReferences(
      input.currentCategory ?? "",
      input.nextCategory ?? "",
    );
    revalidatePath("/preporuke");
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Izmena kategorije nije uspela.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as { category?: string };

  try {
    const categories = await deleteRecommendationCategory(input.category ?? "");
    revalidatePath("/preporuke");
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Brisanje kategorije nije uspelo.",
      },
      { status: 400 },
    );
  }
}

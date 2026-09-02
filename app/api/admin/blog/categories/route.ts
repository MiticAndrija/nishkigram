import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import {
  addBlogCategory,
  deleteBlogCategory,
  getBlogCategories,
} from "@/lib/blogCategories";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request);
  if (rejection) return rejection;

  return NextResponse.json({ categories: await getBlogCategories(true) });
}

export async function POST(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as { category?: string };

  try {
    const categories = await addBlogCategory(input.category ?? "");
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

export async function DELETE(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as { category?: string };

  try {
    const categories = await deleteBlogCategory(input.category ?? "");
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

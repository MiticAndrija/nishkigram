import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import { createPost, getAllPosts, type BlogPostInput } from "@/lib/blog";

export const dynamic = "force-dynamic";

function validateInput(input: BlogPostInput) {
  return Boolean(
    input.title?.trim() &&
      input.excerpt?.trim() &&
      input.author?.trim() &&
      input.contentHtml?.trim(),
  );
}

export async function GET(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request);
  if (rejection) return rejection;

  return NextResponse.json({ posts: await getAllPosts(true) });
}

export async function POST(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as BlogPostInput;

  if (!validateInput(input)) {
    return NextResponse.json(
      { error: "Naslov, excerpt, autor i sadržaj su obavezni." },
      { status: 400 },
    );
  }

  try {
    const post = await createPost(input);
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Blog post creation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Čuvanje objave nije uspelo.",
      },
      { status: 500 },
    );
  }
}

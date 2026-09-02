import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import { deletePost, getPostById, updatePost, type BlogPostInput } from "@/lib/blog";

export const dynamic = "force-dynamic";

function validateInput(input: BlogPostInput) {
  return Boolean(
    input.title?.trim() &&
      input.excerpt?.trim() &&
      input.author?.trim() &&
      input.contentHtml?.trim(),
  );
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const input = (await request.json()) as BlogPostInput;

  if (!validateInput(input)) {
    return NextResponse.json(
      { error: "Naslov, excerpt, autor i sadržaj su obavezni." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const existingPost = await getPostById(id, true);
  const post = await updatePost(id, input);

  if (!post) {
    return NextResponse.json({ error: "Objava nije pronađena." }, { status: 404 });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);

  if (existingPost && existingPost.slug !== post.slug) {
    revalidatePath(`/blog/${existingPost.slug}`);
  }

  return NextResponse.json({ post });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const { id } = await context.params;
  const existingPost = await getPostById(id, true);
  const deleted = await deletePost(id);

  if (!deleted) {
    return NextResponse.json({ error: "Objava nije pronađena." }, { status: 404 });
  }

  revalidatePath("/blog");

  if (existingPost) {
    revalidatePath(`/blog/${existingPost.slug}`);
  }

  return NextResponse.json({ ok: true });
}

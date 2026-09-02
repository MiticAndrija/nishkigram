import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedAdminRequest } from "@/lib/adminApi";
import { blogImageUploadConfig, saveBlogImageUpload } from "@/lib/blogUploads";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rejection = rejectUnauthorizedAdminRequest(request, { csrf: true });
  if (rejection) return rejection;

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Slika je obavezna." }, { status: 400 });
  }

  try {
    const upload = await saveBlogImageUpload(file);
    return NextResponse.json({ upload, config: blogImageUploadConfig }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload slike nije uspeo.",
      },
      { status: 400 },
    );
  }
}

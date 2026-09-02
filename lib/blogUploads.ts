import { promises as fs } from "node:fs";
import path from "node:path";
import { put, del, list } from "@vercel/blob";

type UploadedImageReference = {
  coverImage?: string;
  contentHtml?: string;
};

export type UploadedBlogImage = {
  url: string;
  filename: string;
  source: "local" | "blob";
  size?: number;
  uploadedAt?: string;
};

const uploadPublicPath = "/uploads/blog/";
const uploadDirectory = path.join(process.cwd(), "public", "uploads", "blog");
const maxUploadSizeBytes = 4 * 1024 * 1024;

const mimeExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export const blogImageUploadConfig = {
  maxUploadSizeBytes,
  uploadPublicPath,
  accept: ".jpg,.jpeg,.png,.webp",
};

export function isSafeBlogUploadPathname(pathname: string) {
  return /^uploads\/blog\/[a-zA-Z0-9][a-zA-Z0-9_-]{0,179}\.(?:jpe?g|png|webp)$/.test(
    pathname,
  );
}

function isVercelBlobImageUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com") &&
      isSafeBlogUploadPathname(url.pathname.replace(/^\//, ""))
    );
  } catch {
    return false;
  }
}

function sanitizeBaseName(filename: string) {
  const parsed = path.parse(filename);
  const safeBase = parsed.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return safeBase || "blog-image";
}

function getOriginalExtension(filename: string) {
  return path.extname(filename).replace(".", "").toLowerCase();
}

function getSafeUploadPath(filename: string) {
  const targetPath = path.resolve(uploadDirectory, filename);
  const uploadRoot = path.resolve(uploadDirectory);

  if (!targetPath.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new Error("Invalid upload path.");
  }

  return targetPath;
}

function getUploadFilenameFromUrl(imageUrl: string) {
  if (!imageUrl.startsWith(uploadPublicPath)) {
    return null;
  }

  const filename = decodeURIComponent(imageUrl.slice(uploadPublicPath.length));

  if (!filename || filename.includes("/") || filename.includes("\\")) {
    return null;
  }

  return filename;
}

async function listLocalBlogUploads() {
  if (process.env.VERCEL) {
    return [];
  }

  try {
    const entries = await fs.readdir(uploadDirectory, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry): Promise<UploadedBlogImage | null> => {
          const extension = getOriginalExtension(entry.name);

          if (!allowedExtensions.has(extension)) {
            return null;
          }

          const stats = await fs.stat(path.join(uploadDirectory, entry.name));
          return {
            url: `${uploadPublicPath}${entry.name}`,
            filename: entry.name,
            source: "local",
            size: stats.size,
            uploadedAt: stats.birthtime.toISOString(),
          };
        }),
    );

    return files.filter((file): file is UploadedBlogImage => Boolean(file));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function listBlobBlogUploads() {
  if (
    !process.env.BLOB_READ_WRITE_TOKEN &&
    !process.env.BLOB_STORE_ID &&
    !process.env.VERCEL
  ) {
    return [];
  }

  const uploads: UploadedBlogImage[] = [];
  let cursor: string | undefined;

  do {
    const result = await list({
      prefix: "uploads/blog/",
      limit: 1000,
      cursor,
    });

    uploads.push(
      ...result.blobs
        .filter((blob) => allowedExtensions.has(getOriginalExtension(blob.pathname)))
        .map((blob) => ({
          url: blob.url,
          filename: blob.pathname,
          source: "blob" as const,
          size: blob.size,
          uploadedAt: blob.uploadedAt.toISOString(),
        })),
    );
    cursor = result.cursor;
  } while (cursor);

  return uploads;
}

export async function listUploadedBlogImages() {
  const [localUploads, blobUploads] = await Promise.all([
    listLocalBlogUploads(),
    listBlobBlogUploads(),
  ]);

  return [...localUploads, ...blobUploads].sort((a, b) => {
    const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function validateBlogImageUpload(file: File) {
  const mimeExtension = mimeExtensions.get(file.type);
  const originalExtension = getOriginalExtension(file.name);

  if (!mimeExtension || !allowedExtensions.has(originalExtension)) {
    return "Podrzani formati su JPG, JPEG, PNG i WEBP.";
  }

  if (file.size <= 0) {
    return "Fajl je prazan.";
  }

  if (file.size > maxUploadSizeBytes) {
    return "Slika moze biti velika najvise 4 MB.";
  }

  return "";
}

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value,
    );
  }
  if (file.type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

export async function saveBlogImageUpload(file: File) {
  const validationError = validateBlogImageUpload(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (!(await hasValidImageSignature(file))) {
    throw new Error("Sadrzaj fajla ne odgovara podrzanom formatu slike.");
  }

  const extension = mimeExtensions.get(file.type) || "jpg";
  const safeBaseName = sanitizeBaseName(file.name);
  const filename = `${Date.now()}-${crypto.randomUUID()}-${safeBaseName}.${extension}`;

  if (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_STORE_ID ||
    process.env.VERCEL
  ) {
    const blob = await put(`uploads/blog/${filename}`, file, {
      access: "public",
    });
    return {
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
    };
  }

  // Fallback to local filesystem upload
  await fs.mkdir(uploadDirectory, { recursive: true });
  const targetPath = getSafeUploadPath(filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(targetPath, buffer);

  return {
    url: `${uploadPublicPath}${filename}`,
    filename,
    size: file.size,
  };
}

function extractBlogUploadUrlsFromHtml(html = "") {
  const urls = new Set<string>();
  const imageSrcPattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imageSrcPattern.exec(html))) {
    const src = match[1];

    if (
      src.startsWith(uploadPublicPath) ||
      isVercelBlobImageUrl(src)
    ) {
      urls.add(src);
    }
  }

  return urls;
}

export function getBlogUploadUrls(reference: UploadedImageReference) {
  const urls = extractBlogUploadUrlsFromHtml(reference.contentHtml);

  if (
    reference.coverImage?.startsWith(uploadPublicPath) ||
    (reference.coverImage && isVercelBlobImageUrl(reference.coverImage))
  ) {
    urls.add(reference.coverImage);
  }

  return urls;
}

export async function removeUploadedBlogImage(imageUrl: string) {
  // If Vercel Blob URL, delete from Vercel Blob storage
  if (
    (process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_STORE_ID ||
      process.env.VERCEL) &&
    isVercelBlobImageUrl(imageUrl)
  ) {
    try {
      await del(imageUrl);
      return true;
    } catch (error) {
      console.warn("Failed to delete Vercel Blob image:", imageUrl, error);
      return false;
    }
  }

  // Local filesystem cleanup
  const filename = getUploadFilenameFromUrl(imageUrl);

  if (!filename) {
    return false;
  }

  try {
    await fs.unlink(getSafeUploadPath(filename));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

export async function removeUnusedBlogUploads(
  removedReference: UploadedImageReference,
  remainingReferences: UploadedImageReference[],
) {
  const candidates = getBlogUploadUrls(removedReference);
  const stillUsed = new Set<string>();

  for (const reference of remainingReferences) {
    for (const imageUrl of getBlogUploadUrls(reference)) {
      stillUsed.add(imageUrl);
    }
  }

  await Promise.all(
    [...candidates]
      .filter((imageUrl) => !stillUsed.has(imageUrl))
      .map((imageUrl) => removeUploadedBlogImage(imageUrl)),
  );
}

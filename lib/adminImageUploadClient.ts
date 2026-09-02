"use client";

export const maxAdminImageUploadSizeBytes = 4 * 1024 * 1024;
export const adminImageAccept = ".jpg,.jpeg,.png,.webp";

type AdminImageUploadResult = {
  url: string;
};

type UploadResponse = {
  upload?: {
    url: string;
  };
  error?: string;
};

function validateImage(file: File) {
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  if (!allowedTypes.has(file.type)) {
    return "Podržani formati su JPG, JPEG, PNG i WEBP.";
  }

  if (file.size <= 0) {
    return "Fajl je prazan.";
  }

  if (file.size > maxAdminImageUploadSizeBytes) {
    return "Slika može biti velika najviše 4 MB.";
  }

  return "";
}

async function serverUpload(file: File, endpoint: string) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json()) as UploadResponse;

  if (!response.ok || !payload.upload?.url) {
    throw new Error(payload.error || "Upload slike nije uspeo.");
  }

  return { url: payload.upload.url };
}

export async function uploadAdminImage(
  file: File,
  endpoint: string,
  onProgress?: (percentage: number) => void,
): Promise<AdminImageUploadResult> {
  const validationError = validateImage(file);

  if (validationError) {
    throw new Error(validationError);
  }

  onProgress?.(0);
  const upload = await serverUpload(file, endpoint);
  onProgress?.(100);
  return upload;
}

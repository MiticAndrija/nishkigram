import {
  getBlogUploadUrls,
  listUploadedBlogImages,
  removeUploadedBlogImage,
  type UploadedBlogImage,
} from "@/lib/blogUploads";
import { getAllPosts } from "@/lib/blog";
import { getAllRecommendations } from "@/lib/recommendations";
import { getAllActivities } from "@/lib/activities";

export type AdminMediaItem = UploadedBlogImage & {
  used: boolean;
  usedBy: string[];
};

async function getUsedUploadMap() {
  const [posts, recommendations, activities] = await Promise.all([
    getAllPosts(true),
    getAllRecommendations(true),
    getAllActivities(true),
  ]);
  const usedUploads = new Map<string, string[]>();

  const markUsed = (url: string, label: string) => {
    const labels = usedUploads.get(url) ?? [];
    labels.push(label);
    usedUploads.set(url, labels);
  };

  for (const post of posts) {
    for (const url of getBlogUploadUrls(post)) {
      markUsed(url, `Blog: ${post.title}`);
    }
  }

  for (const recommendation of recommendations) {
    for (const url of getBlogUploadUrls(recommendation)) {
      markUsed(url, `Preporuka: ${recommendation.title}`);
    }
  }

  for (const activity of activities) {
    for (const url of getBlogUploadUrls(activity)) {
      markUsed(url, `Aktivnost: ${activity.title}`);
    }
  }

  return usedUploads;
}

export async function getAdminMediaItems() {
  const [uploads, usedUploads] = await Promise.all([
    listUploadedBlogImages(),
    getUsedUploadMap(),
  ]);

  return uploads.map((upload): AdminMediaItem => {
    const usedBy = usedUploads.get(upload.url) ?? [];

    return {
      ...upload,
      used: usedBy.length > 0,
      usedBy,
    };
  });
}

export async function deleteAdminMediaItem(url: string, force = false) {
  const mediaItems = await getAdminMediaItems();
  const mediaItem = mediaItems.find((item) => item.url === url);

  if (!mediaItem) {
    throw new Error("Slika nije pronađena.");
  }

  if (mediaItem.used && !force) {
    throw new Error("Slika se još koristi. Potvrdite brisanje korišćene slike.");
  }

  const deleted = await removeUploadedBlogImage(url);

  if (!deleted) {
    throw new Error("Brisanje slike nije uspelo.");
  }

  return true;
}

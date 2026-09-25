import { readJsonFile, writeJsonFile } from "@/lib/github";
import { getActivityCategories } from "@/lib/activityCategories";
import { removeUnusedBlogUploads } from "@/lib/blogUploads";
import {
  ActivityValidationError, normalizeActivities, parseActivityInput, sortActivities, upcomingActivities,
  type Activity, type ActivityInput,
} from "@/lib/activityMeta";

const activitiesPath = "data/activities.json";

export async function getAllActivities(forceLive = true) {
  const { data } = await readJsonFile<unknown>(activitiesPath, [], forceLive);
  return sortActivities(normalizeActivities(data));
}

export async function getUpcomingActivities() {
  return upcomingActivities(await getAllActivities(true));
}

async function readForMutation() {
  const { data, sha } = await readJsonFile<unknown>(activitiesPath, [], true, true);
  if (!Array.isArray(data)) throw new Error("Neispravan format activities.json. Podaci nisu promenjeni.");
  // Preserve unknown/malformed rows instead of silently deleting them on save.
  return { data: data as Array<Record<string, unknown> | null>, sha };
}

async function validateCategory(input: ActivityInput, previous?: unknown) {
  const categories = await getActivityCategories(true);
  const canonical = categories.find((category) => category.toLowerCase() === input.category.toLowerCase());
  if (!canonical && input.category !== previous) throw new ActivityValidationError("Izaberite postojeću kategoriju.");
  return canonical || input.category;
}

export async function createActivity(value: unknown) {
  const input = parseActivityInput(value);
  const category = await validateCategory(input);
  const { data, sha } = await readForMutation();
  const now = new Date().toISOString();
  const activity: Activity = { ...input, category, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  await writeJsonFile(activitiesPath, [activity, ...data], `Create activity: ${activity.title}`, sha);
  return activity;
}

export async function updateActivity(id: string, value: unknown) {
  const input = parseActivityInput(value);
  const { data, sha } = await readForMutation();
  const existing = data.find((item) => item?.id === id);
  if (!existing) return null;
  const category = await validateCategory(input, existing.category);
  const now = new Date().toISOString();
  const activity: Activity = { ...input, category, id, createdAt: typeof existing.createdAt === "string" ? existing.createdAt : now, updatedAt: now };
  await writeJsonFile(activitiesPath, data.map((item) => item?.id === id ? activity : item), `Update activity: ${activity.title}`, sha);
  return activity;
}

export async function deleteActivity(id: string) {
  const { data, sha } = await readForMutation();
  const existing = data.find((item) => item?.id === id);
  if (!existing) return false;
  const remaining = data.filter((item) => item?.id !== id);
  await writeJsonFile(activitiesPath, remaining, `Delete activity: ${existing.title || id}`, sha);
  try {
    await removeUnusedBlogUploads({ coverImage: typeof existing.coverImage === "string" ? existing.coverImage : "" }, normalizeActivities(remaining));
  } catch (error) {
    console.warn("Activity deleted, but uploaded image cleanup failed.", error);
  }
  return true;
}

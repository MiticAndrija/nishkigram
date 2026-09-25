import { createCategoryStore } from "@/lib/categoryStore";
import { readJsonFile } from "@/lib/github";
import { ActivityValidationError } from "@/lib/activityMeta";

export const defaultActivityCategories = ["Muzika", "Noćni život", "Kultura", "Sport", "Festival", "Ostalo"];

const store = createCategoryStore("data/activity-categories.json", defaultActivityCategories, "activity", {
  strict: true,
  async beforeChange(category) {
    const { data } = await readJsonFile<unknown>("data/activities.json", [], true, true);
    if (!Array.isArray(data)) throw new Error("Neispravan format aktuelnosti.");
    if (data.some((item) => typeof item?.category === "string" && item.category.toLowerCase() === category.toLowerCase())) {
      throw new ActivityValidationError("Kategorija se koristi. Prvo promenite kategoriju tih aktuelnosti, pa je preimenujte ili obrišite.");
    }
  },
});

export const getActivityCategories = store.get;
export const addActivityCategory = store.add;
export const updateActivityCategory = store.update;
export const deleteActivityCategory = store.delete;

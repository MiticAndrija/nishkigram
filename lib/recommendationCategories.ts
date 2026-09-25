import { createCategoryStore } from "@/lib/categoryStore";

export const defaultRecommendationCategories = [
  "Kafici",
  "Restorani",
  "Barovi",
  "Lepota & Wellness",
  "Aktivnosti",
  "Kupovina",
];

const store = createCategoryStore(
  "data/recommendation-categories.json",
  defaultRecommendationCategories,
  "recommendation",
);

export const getRecommendationCategories = store.get;
export const addRecommendationCategory = store.add;
export const updateRecommendationCategory = store.update;
export const deleteRecommendationCategory = store.delete;

import { readJsonFile, writeJsonFile } from "@/lib/github";

export function normalizeCategoryName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 40);
}

function dedupeCategories(data: unknown) {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const value of Array.isArray(data) ? data : []) {
    if (typeof value !== "string") continue;
    const category = normalizeCategoryName(value);
    const key = category.toLowerCase();
    if (category && !seen.has(key)) {
      seen.add(key);
      categories.push(category);
    }
  }
  return categories;
}

// Shared JSON category operations; each section retains its own file and rules.
export function createCategoryStore(filePath: string, defaults: string[], label: string, options: {
  strict?: boolean;
  beforeChange?: (category: string) => Promise<void>;
} = {}) {
  const read = (live: boolean) => readJsonFile<unknown>(filePath, defaults, live, options.strict);
  const save = (categories: string[], message: string, sha: string | null) =>
    writeJsonFile(filePath, categories, message, sha);

  return {
    async get(forceLive = false) {
      return dedupeCategories((await read(forceLive)).data);
    },
    async add(category: string) {
      const name = normalizeCategoryName(category);
      if (!name) throw new Error("Naziv kategorije je obavezan.");
      const { data, sha } = await read(true);
      const categories = dedupeCategories(data);
      if (categories.some((value) => value.toLowerCase() === name.toLowerCase())) throw new Error("Kategorija vec postoji.");
      const next = [...categories, name];
      await save(next, `Add ${label} category: ${name}`, sha);
      return next;
    },
    async update(currentCategory: string, nextCategory: string) {
      const current = normalizeCategoryName(currentCategory);
      const name = normalizeCategoryName(nextCategory);
      if (!current || !name) throw new Error("Naziv kategorije je obavezan.");
      const { data, sha } = await read(true);
      const categories = dedupeCategories(data);
      const index = categories.findIndex((value) => value.toLowerCase() === current.toLowerCase());
      if (index === -1) throw new Error("Kategorija nije pronadjena.");
      if (categories.some((value, i) => i !== index && value.toLowerCase() === name.toLowerCase())) throw new Error("Kategorija vec postoji.");
      await options.beforeChange?.(categories[index]);
      const next = [...categories];
      next[index] = name;
      await save(next, `Update ${label} category: ${current}`, sha);
      return next;
    },
    async delete(category: string) {
      const name = normalizeCategoryName(category);
      const { data, sha } = await read(true);
      const categories = dedupeCategories(data);
      const next = categories.filter((value) => value.toLowerCase() !== name.toLowerCase());
      if (next.length === categories.length) throw new Error("Kategorija nije pronadjena.");
      await options.beforeChange?.(name);
      await save(next, `Delete ${label} category: ${name}`, sha);
      return next;
    },
  };
}

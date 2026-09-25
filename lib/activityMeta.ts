import { defaultCoverImage } from "@/lib/contentImages";

export type ActivityInput = {
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  url: string;
  coverImage: string;
  coverImageAlt: string;
  coverImagePosition: string;
  published: boolean;
};

export type Activity = ActivityInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export class ActivityValidationError extends Error {}

// Compare calendar dates in Niš, independently of the server/browser timezone.
export function getBelgradeDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function getBelgradeDateTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Belgrade",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function isValidActivityDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01") return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isActivityExpired(date: string, today = getBelgradeDate()) {
  return !isValidActivityDate(date) || date < today;
}

export function isActivityExpiredAt(date: string, time = "", now = new Date()) {
  if (!isValidActivityDate(date)) return true;
  if (date < getBelgradeDate(now)) return true;
  if (date > getBelgradeDate(now) || !time) return false;
  return `${date}T${time}` <= getBelgradeDateTime(now);
}

export function formatActivityDate(date: string) {
  if (!isValidActivityDate(date)) return "";
  return new Intl.DateTimeFormat("sr-Latn-RS", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function isHttpUrl(value: string) {
  if (!/^https?:\/\//i.test(value) || /[\s\\]/.test(value)) return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

// Match the existing local image directories and Next.js remote image allowlist.
export function isActivityImageUrl(value: string) {
  if (/^\/(?:images|uploads\/blog)\/[a-zA-Z0-9_./-]+$/.test(value)) {
    return !value.split("/").includes("..");
  }
  if (!isHttpUrl(value)) return false;
  const url = new URL(value);
  return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
}

function inputText(value: unknown, label: string, max: number, required = false) {
  if (value !== undefined && typeof value !== "string") {
    throw new ActivityValidationError(`${label}: neispravna vrednost.`);
  }
  const text = typeof value === "string" ? value.trim() : "";
  if ((required && !text) || text.length > max) {
    throw new ActivityValidationError(`${label}: ${required ? "obavezno polje, " : ""}najviše ${max} znakova.`);
  }
  return text;
}

export function parseActivityInput(value: unknown): ActivityInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ActivityValidationError("Neispravni podaci aktuelnosti.");
  }
  const input = value as Record<string, unknown>;
  const title = inputText(input.title, "Naziv", 160, true);
  const category = inputText(input.category, "Kategorija", 40, true).replace(/\s+/g, " ");
  const date = inputText(input.date, "Datum", 10, true);
  const time = inputText(input.time, "Vreme", 5);
  const location = inputText(input.location, "Lokacija", 200, true);
  const url = inputText(input.url, "Eksterni link", 2048, true);
  const coverImage = inputText(input.coverImage, "Slika", 2048) || defaultCoverImage;
  const coverImageAlt = inputText(input.coverImageAlt, "Alt tekst", 240);
  const coverImagePosition = inputText(input.coverImagePosition, "Fokus slike", 40) || "center bottom";

  if (!isValidActivityDate(date)) throw new ActivityValidationError("Unesite ispravan datum.");
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new ActivityValidationError("Unesite ispravno vreme (HH:MM).");
  if (!isHttpUrl(url)) throw new ActivityValidationError("Eksterni link mora biti ispravan http:// ili https:// URL.");
  if (!isActivityImageUrl(coverImage)) throw new ActivityValidationError("Izaberite sliku iz biblioteke ili uploadujte novu sliku.");
  if (!/^(?:(?:left|center|right) (?:top|center|bottom)|(?:100|\d{1,2})(?:\.\d+)?% (?:100|\d{1,2})(?:\.\d+)?%)$/.test(coverImagePosition)) {
    throw new ActivityValidationError("Neispravan fokus slike.");
  }
  if (typeof input.published !== "boolean") throw new ActivityValidationError("Neispravan status objavljivanja.");
  return { title, category, date, time, location, url, coverImage, coverImageAlt, coverImagePosition, published: input.published };
}

export function normalizeActivities(data: unknown): Activity[] {
  if (!Array.isArray(data)) return [];
  const ids = new Set<string>();
  return data.flatMap((value) => {
    try {
      if (!value || typeof value.id !== "string" || !value.id || ids.has(value.id)) return [];
      const activity = parseActivityInput({
        ...value,
        coverImage: typeof value.coverImage === "string" && isActivityImageUrl(value.coverImage) ? value.coverImage : defaultCoverImage,
        coverImageAlt: typeof value.coverImageAlt === "string" ? value.coverImageAlt : "",
        coverImagePosition: typeof value.coverImagePosition === "string" ? value.coverImagePosition : "center bottom",
      });
      ids.add(value.id);
      return [{ ...activity, id: value.id, createdAt: typeof value.createdAt === "string" ? value.createdAt : "", updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "" }];
    } catch {
      // A malformed record must never break the public list or leak as published.
      return [];
    }
  });
}

export function sortActivities(activities: Activity[]) {
  return [...activities].sort((a, b) =>
    a.date.localeCompare(b.date) || (a.time || "24:00").localeCompare(b.time || "24:00") || a.title.localeCompare(b.title, "sr-Latn"),
  );
}

export function upcomingActivities(activities: Activity[], today = getBelgradeDate()) {
  return sortActivities(activities.filter((activity) => activity.published && !isActivityExpired(activity.date, today)));
}

"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import ActivityCard from "@/components/ActivityCard";
import CoverImageFocusPicker from "@/components/CoverImageFocusPicker";
import { adminImageAccept, uploadAdminImage } from "@/lib/adminImageUploadClient";
import { defaultCoverImage } from "@/lib/contentImages";
import { isActivityImageUrl, parseActivityInput, type Activity, type ActivityInput } from "@/lib/activityMeta";
import { useUnsavedChangesWarning } from "@/lib/useUnsavedChangesWarning";
import type { AdminMediaItem } from "@/lib/adminMedia";

const emptyForm: ActivityInput = {
  title: "", category: "", date: "", time: "", location: "", url: "",
  coverImage: defaultCoverImage, coverImageAlt: "", coverImagePosition: "center bottom", published: false,
};
const inputClass = "min-w-0 w-full rounded-lg border border-[#5c4a3d]/20 bg-[#fdfaf6] px-4 py-3 text-[#4a382b] outline-none focus:ring-4 focus:ring-[#5c4a3d]/15";
const buttonClass = "rounded-lg border border-[#5c4a3d]/25 px-4 py-3 font-semibold text-[#5c4a3d] transition-colors hover:bg-[#5c4a3d]/8 disabled:opacity-60";

export default function ActivityForm({ activity, categories, onSaved, onCancelEdit, onDirtyChange, onBusyChange, disabled = false }: {
  activity: Activity | null;
  categories: string[];
  onSaved: (activity: Activity) => void;
  onCancelEdit: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const initialForm = useMemo<ActivityInput>(() => activity ? {
    title: activity.title, category: activity.category, date: activity.date, time: activity.time,
    location: activity.location, url: activity.url, coverImage: activity.coverImage,
    coverImageAlt: activity.coverImageAlt, coverImagePosition: activity.coverImagePosition, published: activity.published,
  } : { ...emptyForm }, [activity]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [library, setLibrary] = useState<AdminMediaItem[] | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const busy = saving || uploading || loadingLibrary;
  useUnsavedChangesWarning(dirty && !saving);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);
  const categoryOptions = form.category && !categories.includes(form.category) ? [form.category, ...categories] : categories;
  const preview = { ...form, coverImage: isActivityImageUrl(form.coverImage) ? form.coverImage : defaultCoverImage };

  const setText = (field: keyof ActivityInput, value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setUploadMessage("");
    try {
      const result = await uploadAdminImage(file, "/api/admin/blog/upload", (progress) => setUploadMessage(`Uploadujem sliku... ${progress}%`));
      setText("coverImage", result.url);
      setUploadMessage("Slika je uploadovana.");
    } catch (error) {
      setUploadMessage("");
      setError(error instanceof Error ? error.message : "Upload slike nije uspeo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function loadLibrary() {
    setLoadingLibrary(true);
    setError("");
    try {
      const response = await fetch("/api/admin/uploads");
      const payload = await response.json();
      if (!response.ok || !Array.isArray(payload.uploads)) throw new Error(payload.error || "Učitavanje slika nije uspelo.");
      setLibrary(payload.uploads);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Veza sa serverom nije uspela.");
    } finally { setLoadingLibrary(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || disabled) return;
    setError("");
    setSaving(true);
    try {
      const input = parseActivityInput(form);
      const response = await fetch(activity ? `/api/admin/aktivnosti/${activity.id}` : "/api/admin/aktivnosti", {
        method: activity ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
      });
      const payload = await response.json();
      if (!response.ok || !payload.activity) throw new Error(payload.error || "Čuvanje aktivnosti nije uspelo.");
      onDirtyChange(false);
      onBusyChange(false);
      onSaved(payload.activity);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Veza sa serverom nije uspela. Pokušajte ponovo.");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="grid gap-7 rounded-[1.5rem] border border-[#5c4a3d]/10 bg-[#f4efe6] p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
      <fieldset disabled={busy || disabled} className="grid min-w-0 gap-4">
        <legend className="mb-4">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6f56]">{activity ? "Izmena aktivnosti" : "Nova aktivnost"}</span>
          <h2 className="mt-2 font-serif text-3xl text-[#4a382b]">Forma aktivnosti</h2>
        </legend>
        <label><span className="mb-2 block font-semibold text-[#4a382b]">Naziv</span>
          <input required maxLength={160} value={form.title} onChange={(event) => setText("title", event.target.value)} className={inputClass} />
        </label>
        <label><span className="mb-2 block font-semibold text-[#4a382b]">Kategorija</span>
          <select required value={form.category} onChange={(event) => setText("category", event.target.value)} className={inputClass}>
            <option value="">Izaberite kategoriju</option>{categoryOptions.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="min-w-0"><span className="mb-2 block font-semibold text-[#4a382b]">Datum</span>
            <input type="date" required min="0001-01-01" max="9999-12-31" value={form.date} onChange={(event) => setText("date", event.target.value)} className={inputClass} />
          </label>
          <label className="min-w-0"><span className="mb-2 block font-semibold text-[#4a382b]">Vreme (opciono)</span>
            <input type="time" value={form.time} onChange={(event) => setText("time", event.target.value)} className={inputClass} />
          </label>
        </div>
        <label><span className="mb-2 block font-semibold text-[#4a382b]">Lokacija</span>
          <input required maxLength={200} value={form.location} onChange={(event) => setText("location", event.target.value)} className={inputClass} />
        </label>
        <label><span className="mb-2 block font-semibold text-[#4a382b]">Eksterni link</span>
          <input type="url" required maxLength={2048} placeholder="https://..." value={form.url} onChange={(event) => setText("url", event.target.value)} className={inputClass} />
        </label>
        <label><span className="mb-2 block font-semibold text-[#4a382b]">Slika (URL iz biblioteke)</span>
          <input maxLength={2048} value={form.coverImage} onChange={(event) => setText("coverImage", event.target.value)} className={inputClass} />
        </label>
        <div className="grid gap-3">
          <label><span className="mb-2 block font-semibold text-[#4a382b]">Upload slike</span>
            <input type="file" accept={adminImageAccept} onChange={upload} className="block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#5c4a3d] file:px-4 file:py-3 file:font-semibold file:text-[#fdfaf6]" />
          </label>
          <p className="text-sm text-[#5c4a3d]/65">JPG, JPEG, PNG ili WEBP, najviše 4 MB.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={loadLibrary} className={buttonClass}>{loadingLibrary ? "Učitavam..." : "Izaberi iz biblioteke"}</button>
            <button type="button" onClick={() => setText("coverImage", "")} className={buttonClass}>Ukloni sliku</button>
          </div>
          {library !== null ? library.length ? (
            <label><span className="mb-2 block font-semibold text-[#4a382b]">Biblioteka slika</span>
              <select value={library.some((item) => item.url === form.coverImage) ? form.coverImage : ""} onChange={(event) => { if (event.target.value) setText("coverImage", event.target.value); }} className={inputClass}>
                <option value="">Izaberite sliku</option>
                {library.map((item) => <option key={item.url} value={item.url}>{item.filename}{item.used ? " (koristi se)" : ""}</option>)}
              </select>
            </label>
          ) : <p className="text-sm text-[#5c4a3d]/75">Nema uploadovanih slika.</p> : null}
          {uploadMessage ? <p role="status" className="text-sm font-semibold text-[#5c4a3d]">{uploadMessage}</p> : null}
          {!form.coverImage ? <p className="text-sm text-[#5c4a3d]/65">Bez izabrane slike koristi se podrazumevana slika Niša.</p> : null}
        </div>
        <label><span className="mb-2 block font-semibold text-[#4a382b]">Alt tekst slike</span>
          <input maxLength={240} value={form.coverImageAlt} onChange={(event) => setText("coverImageAlt", event.target.value)} className={inputClass} placeholder="Kratak opis slike; podrazumevano naziv aktivnosti" />
        </label>
        <CoverImageFocusPicker imageUrl={preview.coverImage} alt={form.coverImageAlt || form.title || "Slika aktivnosti"} value={form.coverImagePosition} heightClass="h-56" onChange={(value) => { if (!busy && !disabled) setText("coverImagePosition", value); }} />
        <label className="flex items-center gap-3 font-semibold text-[#4a382b]">
          <input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} className="h-5 w-5 accent-[#5c4a3d]" />Objavljeno
        </label>
        {error ? <p role="alert" className="font-semibold text-red-700">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-lg bg-[#5c4a3d] px-6 py-3 font-semibold text-[#fdfaf6] transition-colors hover:bg-[#47382f] disabled:opacity-60">{saving ? "Čuvam..." : activity ? "Sačuvaj izmene" : "Kreiraj aktivnost"}</button>
          {activity ? <button type="button" onClick={onCancelEdit} className={buttonClass}>Odustani</button> : null}
        </div>
      </fieldset>
      <div className="min-w-0">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6f56]">Pregled kartice</p>
        <ActivityCard activity={preview} preview />
      </div>
    </form>
  );
}

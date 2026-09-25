"use client";

import { useRef, useState } from "react";
import ActivityForm from "@/components/ActivityForm";
import { formatActivityDate, getBelgradeDate, isActivityExpired, sortActivities, type Activity } from "@/lib/activityMeta";
import { unsavedChangesConfirmationMessage } from "@/lib/useUnsavedChangesWarning";

const buttonClass = "rounded-md border border-[#5c4a3d]/25 px-4 py-2 text-sm font-semibold text-[#5c4a3d] disabled:opacity-60";
const inputClass = "min-w-0 rounded-lg border border-[#5c4a3d]/20 bg-[#f4efe6] px-4 py-3 text-[#4a382b] outline-none focus:ring-4 focus:ring-[#5c4a3d]/15";

async function requestJson(url: string, method: string, body?: unknown) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Zahtev nije uspeo. Pokušajte ponovo.");
  return payload;
}

export default function AdminActivityManager({ initialActivities, initialCategories, today }: {
  initialActivities: Activity[]; initialCategories: string[]; today: string;
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [currentDate, setCurrentDate] = useState(today);
  const formRef = useRef<HTMLDivElement>(null);
  const disabled = busy || formBusy;

  function resetForm(activity: Activity | null) {
    setEditing(activity);
    setFormVersion((value) => value + 1);
    setDirty(false);
  }

  function edit(activity: Activity | null) {
    if (dirty && !window.confirm(unsavedChangesConfirmationMessage)) return;
    resetForm(activity);
    formRef.current?.scrollIntoView({ block: "start" });
  }

  async function mutateActivity(activity: Activity, method: "PUT" | "DELETE") {
    if (method === "DELETE" && !window.confirm(`Da li sigurno brišete aktivnost „${activity.title}“?`)) return;
    if (editing?.id === activity.id && dirty && !window.confirm(unsavedChangesConfirmationMessage)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = await requestJson(`/api/admin/aktivnosti/${activity.id}`, method, method === "PUT" ? { ...activity, published: !activity.published } : undefined);
      setActivities((current) => method === "DELETE" ? current.filter((item) => item.id !== activity.id) : sortActivities(current.map((item) => item.id === activity.id ? payload.activity : item)));
      if (editing?.id === activity.id) resetForm(null);
      setMessage(method === "DELETE" ? "Aktivnost je obrisana." : "Status aktivnosti je promenjen.");
      setCurrentDate(getBelgradeDate());
    } catch (error) { setError(error instanceof Error ? error.message : "Veza sa serverom nije uspela."); }
    finally { setBusy(false); }
  }

  async function mutateCategory(method: "POST" | "PUT" | "DELETE", category?: string) {
    if (method === "DELETE" && !window.confirm(`Obrisati kategoriju „${category}“?`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = await requestJson("/api/admin/aktivnosti/categories", method,
        method === "PUT" ? { currentCategory: editingCategory, nextCategory: categoryName } : { category: category || newCategory });
      setCategories(payload.categories);
      setNewCategory(""); setEditingCategory("");
      setMessage("Kategorije su sačuvane.");
    } catch (error) { setError(error instanceof Error ? error.message : "Veza sa serverom nije uspela."); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-10">
      <div ref={formRef} className="scroll-mt-28">
        <ActivityForm key={formVersion} activity={editing} categories={categories} disabled={busy} onDirtyChange={setDirty} onBusyChange={setFormBusy}
          onCancelEdit={() => edit(null)} onSaved={(activity) => {
            setActivities((current) => sortActivities([activity, ...current.filter((item) => item.id !== activity.id)]));
            resetForm(null); setMessage("Aktivnost je sačuvana."); setError(""); setCurrentDate(getBelgradeDate());
          }} />
      </div>
      <div aria-live="polite">
        {error ? <p role="alert" className="font-semibold text-red-700">{error}</p> : null}
        {message ? <p className="font-semibold text-green-800">{message}</p> : null}
      </div>
      <section className="rounded-[1.5rem] border border-[#5c4a3d]/10 bg-[#fdfaf6] p-4 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6f56]">Kategorije</p>
        <h2 className="mt-2 font-serif text-3xl text-[#4a382b]">Kategorije aktivnosti</h2>
        <p className="mt-3 text-sm leading-6 text-[#5c4a3d]/75">Preimenovanje i brisanje su dostupni kada kategoriju ne koristi nijedna aktivnost, uključujući nacrte i istekle aktivnosti.</p>
        <form onSubmit={(event) => { event.preventDefault(); void mutateCategory("POST"); }} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input aria-label="Nova kategorija" required maxLength={40} value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nova kategorija" className={inputClass} />
          <button disabled={disabled} className="rounded-lg bg-[#5c4a3d] px-5 py-3 font-semibold text-[#fdfaf6] disabled:opacity-60">Dodaj</button>
        </form>
        <div className="mt-5 grid gap-3">
          {categories.map((category) => {
            const used = activities.some((activity) => activity.category.toLowerCase() === category.toLowerCase());
            return <div key={category} className="flex flex-col gap-3 rounded-lg border border-[#5c4a3d]/20 bg-[#f4efe6] p-3 sm:flex-row sm:items-center sm:justify-between">
              {editingCategory === category ? <input aria-label="Novi naziv kategorije" maxLength={40} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className={inputClass} />
                : <span className="font-semibold text-[#5c4a3d] [overflow-wrap:anywhere]">{category}{used ? " (koristi se)" : ""}</span>}
              <div className="flex flex-wrap gap-2">
                {editingCategory === category ? <>
                  <button type="button" disabled={disabled || !categoryName.trim()} onClick={() => mutateCategory("PUT")} className={buttonClass}>Sačuvaj</button>
                  <button type="button" disabled={disabled} onClick={() => setEditingCategory("")} className={buttonClass}>Odustani</button>
                </> : <button type="button" disabled={disabled || used} onClick={() => { setEditingCategory(category); setCategoryName(category); }} className={buttonClass}>Preimenuj</button>}
                <button type="button" disabled={disabled || used} onClick={() => mutateCategory("DELETE", category)} className={`${buttonClass} text-red-800`}>Obriši</button>
              </div>
            </div>;
          })}
        </div>
      </section>
      <section className="rounded-[1.5rem] border border-[#5c4a3d]/10 bg-[#fdfaf6] p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6f56]">Upravljanje</p><h2 className="mt-2 font-serif text-3xl text-[#4a382b]">Sve aktivnosti</h2></div>
          <form action="/api/admin/logout" method="post" onSubmit={(event) => { if (dirty && !window.confirm(unsavedChangesConfirmationMessage)) event.preventDefault(); }}><button disabled={disabled} className={buttonClass}>Odjavi se</button></form>
        </div>
        <div className="mt-6 grid gap-4">
          {activities.length ? activities.map((activity) => <article key={activity.id} className="grid min-w-0 gap-4 rounded-[1rem] border border-[#5c4a3d]/10 bg-[#f4efe6] p-5 md:grid-cols-[1fr_auto]">
            <div className="min-w-0 [overflow-wrap:anywhere]">
              <div className="mb-2 flex flex-wrap gap-3 text-sm font-semibold text-[#5c4a3d]/65">
                <span>{activity.published ? "Objavljeno" : "Nacrt"}</span>
                {isActivityExpired(activity.date, currentDate) ? <span className="text-red-800">Isteklo</span> : null}
                <span>{activity.category}</span>
              </div>
              <h3 className="font-serif text-2xl text-[#4a382b]">{activity.title}</h3>
              <p className="mt-2 text-[#5c4a3d]/75"><time dateTime={activity.date}>{formatActivityDate(activity.date)}</time>{activity.time ? ` · ${activity.time}` : ""} · {activity.location}</p>
              <a href={activity.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center font-semibold text-[#5c4a3d] underline underline-offset-4">Pogledaj događaj <span aria-hidden="true"> →</span><span className="sr-only"> (novi tab)</span></a>
            </div>
            <div className="flex flex-wrap items-start gap-2 md:justify-end">
              <button type="button" disabled={disabled} onClick={() => edit(activity)} className="rounded-md bg-[#5c4a3d] px-4 py-2 text-sm font-semibold text-[#fdfaf6] disabled:opacity-60">Izmeni</button>
              <button type="button" disabled={disabled} onClick={() => mutateActivity(activity, "PUT")} className={buttonClass}>{activity.published ? "Povuci objavu" : "Objavi"}</button>
              <button type="button" disabled={disabled} onClick={() => mutateActivity(activity, "DELETE")} className={`${buttonClass} text-red-800`}>Obriši</button>
            </div>
          </article>) : <p className="rounded-lg bg-[#f4efe6] p-5 text-[#5c4a3d]/75">Nema aktivnosti. Kreirajte prvu aktivnost kroz formu iznad.</p>}
        </div>
      </section>
    </div>
  );
}

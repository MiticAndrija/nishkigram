import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminActivityManager from "@/components/AdminActivityManager";
import { isAdminSession } from "@/lib/adminAuth";
import { getAllActivities } from "@/lib/activities";
import { getActivityCategories } from "@/lib/activityCategories";
import { getBelgradeDate } from "@/lib/activityMeta";

export const dynamic = "force-dynamic";

export default async function AdminActivitiesPage() {
  if (!(await isAdminSession())) redirect("/admin/login");
  const [activities, categories] = await Promise.all([getAllActivities(true), getActivityCategories(true)]);
  return (
    <div lang="sr-Latn" className="min-h-screen bg-[#f4efe6] font-sans selection:bg-[#5c4a3d]/20">
      <Navbar />
      <main className="px-4 pb-20 pt-36 sm:px-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <div className="mb-5 flex flex-wrap gap-3">
              {[{ href: "/admin/blog", label: "Admin blog" }, { href: "/admin/preporuke", label: "Admin preporuke" }, { href: "/admin/aktivnosti", label: "Aktivnosti" }, { href: "/admin/uploads", label: "Admin media" }].map((item) =>
                <Link key={item.href} href={item.href} aria-current={item.href === "/admin/aktivnosti" ? "page" : undefined} className={item.href === "/admin/aktivnosti" ? "rounded-full bg-[#5c4a3d] px-4 py-2 text-sm font-semibold text-[#fdfaf6]" : "rounded-full border border-[#5c4a3d]/20 px-4 py-2 text-sm font-semibold text-[#5c4a3d] transition-colors hover:bg-[#5c4a3d]/8"}>{item.label}</Link>,
              )}
            </div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#8b6f56]">Admin aktivnosti</p>
            <h1 className="font-serif text-4xl text-[#4a382b] sm:text-5xl md:text-6xl">Upravljanje aktivnostima</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c4a3d]/75">Kreirajte, izmenite i objavite aktivnosti. Javna strana prikazuje samo objavljene događaje čiji datum nije prošao. Istekle aktivnosti ostaju ovde.</p>
          </div>
          <AdminActivityManager initialActivities={activities} initialCategories={categories} today={getBelgradeDate()} />
        </div>
      </main>
    </div>
  );
}

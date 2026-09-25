import Navbar from "@/components/Navbar";
import ActivityCard from "@/components/ActivityCard";
import { getUpcomingActivities } from "@/lib/activities";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Aktivnosti u Nišu - Niškigram",
  description: "Dešavanja u Nišu na jednom mestu. Koncerti, žurke, izložbe, festivali i druga mesta na kojima vredi biti.",
};

export default async function ActivitiesPage() {
  const activities = await getUpcomingActivities();
  return (
    <div lang="sr-Latn" className="min-h-screen bg-[#f4efe6] font-sans selection:bg-[#5c4a3d]/20">
      <Navbar />
      <main className="pt-24">
        <section className="px-4 pb-14 pt-12 sm:px-6 md:px-10 md:pb-24 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl md:text-7xl">AKTIVNOSTI</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5c4a3d]/80 sm:mt-8 sm:text-xl sm:leading-9">
                Dešavanja u Nišu na jednom mestu. Koncerti, žurke, izložbe, festivali i druga mesta na kojima vredi biti.
              </p>
            </div>
            {activities.length ? (
              <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-7 lg:grid-cols-3">
                {activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}
              </div>
            ) : <p className="mt-12 rounded-[1.25rem] border border-[#5c4a3d]/10 bg-[#fdfaf6] p-6 leading-7 text-[#5c4a3d]/75">Trenutno nema najavljenih aktivnosti.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

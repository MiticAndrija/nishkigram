import RecommendationSearch from "@/components/RecommendationSearch";
import Navbar from "@/components/Navbar";
import { getRecommendationCategories } from "@/lib/recommendationCategories";
import { getPublishedRecommendations } from "@/lib/recommendations";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Preporuke - Niškigram",
  description:
    "Niškigram preporuke: kafići, restorani, barovi i aktivnosti u Nišu. Otkrijte proverena lokalna mesta.",
};

export default async function PreporukePage() {
  const recommendations = await getPublishedRecommendations();
  const categories = await getRecommendationCategories();

  return (
    <div className="min-h-screen bg-[#f4efe6] font-sans selection:bg-[#5c4a3d]/20">
      <Navbar />
      <main className="pt-24">
        <section className="px-4 pb-14 pt-12 sm:px-6 md:px-10 md:pb-24 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <div data-enter className="max-w-3xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#8b6f56]">
                Niškigram preporučuje
              </p>
              <h1 className="font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl md:text-7xl">
                Proverena mesta koja volimo.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5c4a3d]/80 sm:mt-8 sm:text-xl sm:leading-9">
                Biramo lokale, usluge i iskustva u Nišu koja vredi posetiti.
                Javna strana prikazuje preporuke koje su objavljene iz admin
                panela.
              </p>
            </div>

            {recommendations.length > 0 ? (
              <RecommendationSearch
                recommendations={recommendations}
                categories={categories}
              />
            ) : (
              <div className="mt-12 rounded-[1.5rem] border border-[#5c4a3d]/10 bg-[#fdfaf6] p-6 text-center sm:p-10">
                <h2 className="font-serif text-2xl text-[#4a382b] sm:text-3xl">
                  Još nema objavljenih preporuka.
                </h2>
                <p className="mx-auto mt-4 max-w-xl leading-7 text-[#5c4a3d]/75">
                  Kada admin objavi prvu preporuku, pojaviće se ovde kao javna
                  kartica sa slikom, kategorijom i opisom.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

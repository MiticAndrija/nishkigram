import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import CinematicHero from "@/components/CinematicHero";
import FeaturedBlogCard from "@/components/FeaturedBlogCard";
import InstagramFeed from "@/components/InstagramFeed";
import Navbar from "@/components/Navbar";
import ParallaxCitySection from "@/components/ParallaxCitySection";
import RecommendationCard from "@/components/RecommendationCard";
import ScrollReveal from "@/components/ScrollReveal";
import { getPublishedPosts } from "@/lib/blog";
import { getPublishedRecommendations } from "@/lib/recommendations";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [posts, recommendations] = await Promise.all([
    getPublishedPosts(),
    getPublishedRecommendations(),
  ]);

  const latestPosts = [...posts]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);
  const latestRecommendations = [...recommendations]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);
  const [featuredPost, ...secondaryPosts] = latestPosts;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4efe6] font-sans selection:bg-[#5c4a3d]/20">
      <Navbar />
      <main>
        <CinematicHero />

        <div className="relative z-20 -mt-[32svh] overflow-hidden rounded-t-[2.5rem] bg-[#f4efe6] sm:-mt-[36svh] sm:rounded-t-[3.5rem]">
          <section className="px-4 py-24 sm:px-6 sm:py-32 md:px-10 md:py-40">
            <ScrollReveal className="mx-auto max-w-5xl text-center">
              <p className="font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl md:text-7xl">
                Niš, kako ga mi vidimo.
              </p>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#5c4a3d]/70 sm:text-xl sm:leading-9">
                Ljudi, mesta i mali trenuci koji čine grad.
              </p>
            </ScrollReveal>
          </section>

          {featuredPost ? (
            <section className="border-y border-[#5c4a3d]/10 bg-[#fdfaf6] px-4 py-16 sm:px-6 md:px-10 md:py-28">
              <div className="mx-auto max-w-6xl">
                <div className="mb-10 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#8b6f56]">
                      Novo na sajtu
                    </p>
                    <h2 className="font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl md:text-6xl">
                      Priče iz Niša
                    </h2>
                  </div>
                  <Link
                    href="/blog"
                    className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-[#5c4a3d] hover:underline sm:self-auto"
                  >
                    Pogledaj sve priče <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <FeaturedBlogCard post={featuredPost} />

                {secondaryPosts.length > 0 ? (
                  <div className="mt-7 grid gap-7 md:mt-10 md:grid-cols-2">
                    {secondaryPosts.map((post, index) => (
                      <ScrollReveal key={post.id} delay={(index + 1) * 0.1}>
                        <BlogCard post={post} />
                      </ScrollReveal>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          <ParallaxCitySection />

          <InstagramFeed />

          {latestRecommendations.length > 0 ? (
            <section className="relative overflow-hidden bg-[#4a382b] px-4 py-20 text-[#fdfaf6] sm:px-6 md:px-10 md:py-28">
              <div
                aria-hidden="true"
                className="absolute -right-24 top-8 h-72 w-72 rounded-full border border-[#fdfaf6]/10 sm:h-96 sm:w-96"
              />
              <div
                aria-hidden="true"
                className="absolute -right-8 top-24 h-48 w-48 rounded-full border border-[#fdfaf6]/10 sm:h-64 sm:w-64"
              />
              <div className="mx-auto max-w-6xl">
                <div className="relative mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#d9c4ae]">
                      Niškigram preporučuje
                    </p>
                    <h2 className="font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
                      Gde danas?
                    </h2>
                    <p className="mt-5 max-w-xl text-lg leading-8 text-[#fdfaf6]/65">
                      Mesta koja volimo, ukusi kojima se vraćamo i ideje za sledeću šetnju gradom.
                    </p>
                  </div>
                  <Link
                    href="/preporuke"
                    className="inline-flex min-h-12 items-center gap-3 self-start rounded-full border border-[#fdfaf6]/30 px-6 font-semibold transition-colors hover:bg-[#fdfaf6] hover:text-[#4a382b] sm:self-auto"
                  >
                    Sve preporuke <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {latestRecommendations.map((recommendation, index) => (
                    <ScrollReveal key={recommendation.id} delay={index * 0.1}>
                      <RecommendationCard recommendation={recommendation} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="bg-[#eadfce] px-4 py-20 sm:px-6 md:px-10 md:py-28">
            <ScrollReveal className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#5c4a3d]/10 bg-[#fdfaf6] shadow-[0_24px_70px_rgba(74,56,43,0.10)] sm:rounded-[3rem]">
              <div className="grid md:grid-cols-[0.8fr_1.2fr]">
                <div className="flex min-h-64 flex-col justify-between bg-[#c8a985] p-8 text-[#4a382b] sm:p-10 md:min-h-[30rem] md:p-12">
                  <p className="text-xs font-bold uppercase tracking-[0.24em]">
                    O Niškigramu
                  </p>
                  <p className="max-w-sm font-serif text-4xl leading-[1.08] sm:text-5xl">
                    Grad nisu samo mesta. Grad su priče koje pamtimo.
                  </p>
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10 md:p-14 lg:p-16">
                  <h2 className="font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl md:text-6xl">
                    Od fotografije do priče o Nišu.
                  </h2>
                  <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5c4a3d]/75 sm:text-xl sm:leading-9">
                    Niškigram je počeo beleženjem prizora, ljudi i svakodnevnih trenutaka iz grada. Ovde ih pretvaramo u priče, vodiče i preporuke koje ostaju na jednom mestu.
                  </p>
                  <Link
                    href="/o-nama"
                    className="mt-9 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-[#4a382b] px-6 font-semibold text-[#fdfaf6] transition-transform hover:-translate-y-0.5"
                  >
                    Upoznaj Niškigram <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </main>
    </div>
  );
}

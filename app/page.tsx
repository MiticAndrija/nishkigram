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
            <section className="px-4 py-20 sm:px-6 md:px-10 md:py-32">
              <div className="mx-auto max-w-6xl">
                <div className="mb-10 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#8b6f56]">
                      Niškigram preporučuje
                    </p>
                    <h2 className="font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl md:text-6xl">
                      Gde danas?
                    </h2>
                  </div>
                  <Link
                    href="/preporuke"
                    className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-[#5c4a3d] hover:underline sm:self-auto"
                  >
                    Sve preporuke <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {latestRecommendations.map((recommendation, index) => (
                    <ScrollReveal key={recommendation.id} delay={index * 0.1}>
                      <RecommendationCard recommendation={recommendation} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="px-4 py-24 sm:px-6 md:px-10 md:py-36">
            <ScrollReveal className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8b6f56]">
                O Niškigramu
              </p>
              <div>
                <h2 className="font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl md:text-6xl">
                  Sve je počelo na Instagramu.
                </h2>
                <p className="mt-7 max-w-3xl text-lg leading-8 text-[#5c4a3d]/75 sm:text-xl sm:leading-9">
                  Tamo smo počeli da delimo prizore, ljude i svakodnevne trenutke
                  iz Niša. Ovde za te priče imamo malo više prostora — da ih
                  ispričamo kako treba i sačuvamo na jednom mestu.
                </p>
                <Link
                  href="/o-nama"
                  className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-[#5c4a3d] hover:underline"
                >
                  Saznaj više o nama <span aria-hidden="true">→</span>
                </Link>
              </div>
            </ScrollReveal>
          </section>

          <section className="bg-[#4a382b] px-4 py-24 text-[#fdfaf6] sm:px-6 md:px-10 md:py-32">
            <ScrollReveal className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 md:flex-row md:items-end">
              <div>
                <p className="font-serif text-5xl leading-none sm:text-6xl md:text-8xl">
                  Vidimo se i na Instagramu.
                </p>
                <p className="mt-6 max-w-xl text-xl leading-8 text-[#fdfaf6]/70">
                  Tamo svakodnevno delimo fotografije i trenutke iz grada.
                </p>
              </div>
              <a
                href="https://www.instagram.com/nishkigram/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center border-b border-[#fdfaf6]/60 px-1 font-semibold text-[#fdfaf6] transition-colors hover:border-[#fdfaf6]"
              >
                Prati nas na Instagramu <span className="ml-2" aria-hidden="true">→</span>
              </a>
            </ScrollReveal>
          </section>
        </div>
      </main>
    </div>
  );
}

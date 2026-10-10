import Image from "next/image";
import Link from "@/components/MotionLink";
import Navbar from "@/components/Navbar";

const values = [
  {
    title: "Grad iz prvog reda",
    text: "Pratimo mesta, ljude i trenutke koji Nišu daju ritam: od poznatih simbola do malih svakodnevnih scena.",
  },
  {
    title: "Lokalna priča",
    text: "Niškigram je prostor za priče koje nastaju ovde, među ljudima koji grad poznaju kroz ulice, navike i događaje.",
  },
  {
    title: "Savremen pogled",
    text: "Spajamo fotografiju, preporuke i kratke vodiče tako da Niš bude pregledan, topao i lak za otkrivanje.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f4efe6] font-sans selection:bg-[#5c4a3d]/20">
      <Navbar />
      <main className="pt-24">
        <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 md:px-10 md:pb-28 md:pt-16">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
            <div data-enter className="min-w-0">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#8b6f56]">
                O Niškigramu
              </p>
              <h1 className="max-w-3xl font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl md:text-7xl">
                Digitalni kutak za Niš, njegove priče i ljude.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5c4a3d]/80 sm:mt-8 sm:text-xl sm:leading-9">
                Niškigram okuplja atmosferu grada kroz fotografije, kratke
                priče, preporuke i lokalne motive. Ideja je jednostavna:
                prikazati Niš onako kako se živi, pamti i deli.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  href="https://www.instagram.com/nishkigram/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#5c4a3d] px-7 py-4 text-base font-semibold text-[#fdfaf6] shadow-lg shadow-[#5c4a3d]/20 transition-all hover:-translate-y-0.5 hover:bg-[#47382f] focus:outline-none focus:ring-4 focus:ring-[#5c4a3d]/20"
                >
                  Posetite Instagram
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#5c4a3d]/25 px-7 py-4 text-base font-semibold text-[#5c4a3d] transition-colors hover:bg-[#5c4a3d]/8 focus:outline-none focus:ring-4 focus:ring-[#5c4a3d]/15"
                >
                  Nazad na početnu
                </Link>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-white/60 bg-[#e8e0d5] shadow-2xl sm:min-h-[440px] sm:rounded-[2rem]">
              <Image
                src="/images/nis-hero.png"
                alt="Pogled na Nis"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover object-bottom"
                priority
                unoptimized={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2f241d]/45 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-[#fdfaf6] sm:p-8">
                <p className="max-w-sm text-base font-medium leading-7 sm:text-lg sm:leading-8">
                  Mesto gde se gradski simboli, lokalne priče i svakodnevni
                  detalji čuvaju na jednom mestu.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fdfaf6] px-4 py-14 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div data-reveal className="max-w-3xl">
              <h2 className="font-serif text-3xl leading-tight text-[#4a382b] sm:text-4xl md:text-5xl">
                Šta želimo da grad dobije
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#5c4a3d]/75">
                Niškigram je zamišljen kao pregledan i lep ulaz u lokalnu
                kulturu: za one koji su iz Niša, za one koji mu se vraćaju i za
                one koji ga tek otkrivaju.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {values.map((value) => (
                <article
                  data-reveal
                  key={value.title}
                  className="rounded-[1.5rem] border border-[#5c4a3d]/10 bg-[#f4efe6] p-6 sm:p-8"
                >
                  <h3 className="font-serif text-2xl text-[#4a382b]">
                    {value.title}
                  </h3>
                  <p className="mt-4 leading-7 text-[#5c4a3d]/75">
                    {value.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div className="relative mx-auto flex h-56 w-56 items-center justify-center rounded-full bg-[#fdfaf6] shadow-xl md:h-72 md:w-72">
              <Image
                src="/images/konjanik.png"
                alt="Konjanik, simbol Niskigrama"
                width={220}
                height={220}
                className="h-40 w-40 object-contain md:h-56 md:w-56"
              />
            </div>
            <div data-reveal>
              <h2 className="font-serif text-3xl leading-tight text-[#4a382b] sm:text-4xl md:text-5xl">
                Od simbola do svakodnevnice
              </h2>
              <p className="mt-5 text-base leading-8 text-[#5c4a3d]/80 sm:mt-6 sm:text-lg sm:leading-9">
                Konjanik, tvrđava, kej, stare ulice, kafane, novi prostori i
                ljudi koji stvaraju - sve su to delovi iste slike. Niškigram
                postoji da tu sliku sačuva i učini je dostupnom kroz sadržaj
                koji je jasan, topao i lokalno prepoznatljiv.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

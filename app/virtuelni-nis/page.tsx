import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import VirtualTourLink from "@/components/VirtualTourLink";
import nisPhoto from "@/public/images/nis-hero.png";

const title = "Virtuelni Niš | Niškigram";
const description =
  "Istraži Niš i njegovo kulturno nasleđe kroz virtuelnu šetnju. Otkrij Nišku tvrđavu, Medijanu i istoriju grada kroz projekat Tabula Peutingeriana.";
const canonical = "https://nishkigram.com/virtuelni-nis";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: "Niškigram",
    locale: "sr_RS",
    type: "website",
    images: [
      {
        url: "https://nishkigram.com/images/nis-hero.png",
        width: nisPhoto.width,
        height: nisPhoto.height,
        alt: "Niška tvrđava i panorama Niša u suton",
      },
    ],
  },
};

export default function VirtualNisPage() {
  return (
    <div className="min-h-screen bg-[#f4efe6] font-sans selection:bg-[#5c4a3d]/20">
      <Navbar />
      <main>
        <section
          aria-labelledby="virtual-nis-title"
          className="relative isolate flex min-h-[min(48rem,100svh)] flex-col justify-end overflow-hidden bg-[#2f241d] text-[#fdfaf6] md:min-h-[min(54rem,100svh)]"
        >
          <Image
            src={nisPhoto}
            alt="Niška tvrđava i panorama Niša u suton"
            fill
            sizes="100vw"
            className="-z-20 object-cover object-[35%_70%] sm:object-center"
            placeholder="blur"
            preload
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#211813]/60" />

          <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-20 sm:px-6 sm:pb-12 md:px-10 md:pb-14 xl:px-0">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#fdfaf6] sm:mb-8">
              Digitalno nasleđe Niša
            </p>
            <h1
              id="virtual-nis-title"
              className="max-w-5xl font-serif text-[clamp(2.75rem,6.8vw,6.5rem)] leading-[1.06] tracking-[-0.035em]"
            >
              <span className="block">Prošetaj Nišom.</span>
              <span className="block">Odakle god želiš.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#fdfaf6] sm:mt-8 sm:text-xl sm:leading-9">
              Istraži znamenitosti Niša, upoznaj njihovu istoriju i otkrij grad iz
              potpuno nove perspektive.
            </p>
            <div className="mt-8 sm:mt-10">
              <VirtualTourLink />
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-[#fdfaf6]/30 pt-5 sm:mt-16">
              <a
                href="#o-iskustvu"
                className="inline-flex min-h-11 items-center gap-3 text-sm font-medium underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fdfaf6]"
              >
                Upoznaj iskustvo <span aria-hidden="true">↓</span>
              </a>
              <p className="text-xs tracking-wide text-[#fdfaf6]">
                Tabula Peutingeriana
              </p>
            </div>
          </div>
        </section>

        <section
          id="o-iskustvu"
          aria-labelledby="experience-title"
          className="scroll-mt-24 px-4 py-20 sm:px-6 md:px-10 md:py-32"
        >
          <ScrollReveal className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_1fr] md:gap-16 lg:gap-24">
            <h2
              id="experience-title"
              className="max-w-md font-serif text-4xl leading-[1.12] text-[#4a382b] sm:text-5xl lg:text-6xl"
            >
              Istorija Niša, na jedan klik.
            </h2>
            <div className="space-y-6 text-lg leading-8 text-[#5c4a3d]/85 sm:text-xl sm:leading-9">
              <p>
                Zahvaljujući projektu digitalizacije kulturnog nasleđa „Tabula
                Peutingeriana“, sada možeš virtuelno da istražuješ znamenitosti
                Niša, upoznaš njihovu istoriju i doživiš ih iz potpuno drugačije
                perspektive.
              </p>
              <p>
                Pomoću računara, telefona ili VR naočara, otkrij digitalizovane
                lokacije poput Niške tvrđave i arheološkog nalazišta Medijana.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section
          aria-labelledby="collaboration-title"
          className="border-y border-[#5c4a3d]/15 bg-[#fdfaf6] px-4 py-16 sm:px-6 md:px-10 md:py-24"
        >
          <ScrollReveal className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.55fr_1.45fr] md:gap-16">
            <p className="text-xs font-bold uppercase leading-6 tracking-[0.24em] text-[#765b45]">
              Saradnja i digitalizacija
            </p>
            <div>
              <h2
                id="collaboration-title"
                className="max-w-2xl font-serif text-4xl leading-[1.12] text-[#4a382b] sm:text-5xl lg:text-6xl"
              >
                Kulturno nasleđe u digitalnom svetu.
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5c4a3d]/85 sm:text-xl sm:leading-9">
                U saradnji sa Elektronskim fakultetom u Nišu, Niškigram ti
                predstavlja projekat „Tabula Peutingeriana“ i omogućava
                jednostavan pristup virtuelnom iskustvu.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section
          aria-labelledby="tour-cta-title"
          className="bg-[#4a382b] px-4 py-20 text-[#fdfaf6] sm:px-6 md:px-10 md:py-32"
        >
          <ScrollReveal className="mx-auto max-w-6xl text-center">
            <h2
              id="tour-cta-title"
              className="font-serif text-[clamp(2.5rem,5.5vw,5.5rem)] leading-[1.12] tracking-[-0.025em]"
            >
              Tvoj grad. Gde god da si.
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#fdfaf6]/85 sm:text-xl sm:leading-9">
              Bilo da živiš u Nišu ili hiljadama kilometara daleko, tvoj grad ti je
              sada malo bliži.
            </p>
            <div className="mt-9 flex justify-center">
              <VirtualTourLink />
            </div>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-[#fdfaf6]/80">
              Otvara zvaničnu platformu projekta Tabula Peutingeriana.
            </p>
          </ScrollReveal>
        </section>
      </main>
    </div>
  );
}

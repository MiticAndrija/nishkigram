import Image from "next/image";
import Link from "@/components/MotionLink";
import ScrollReveal from "@/components/ScrollReveal";
import nisPhoto from "@/public/images/nis-hero.png";

export default function VirtualNisPromo() {
  return (
    <section
      aria-labelledby="virtual-nis-promo-title"
      className="bg-[#f4efe6] px-4 py-12 sm:px-6 md:px-10 md:py-16"
    >
      <ScrollReveal className="mx-auto grid max-w-6xl items-center gap-8 border-y border-[#5c4a3d]/15 py-9 sm:gap-10 md:grid-cols-[0.8fr_1.2fr] md:py-12 lg:gap-16">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-[#eadfce]">
          <Image
            src={nisPhoto}
            alt="Niška tvrđava i grad u suton"
            fill
            sizes="(min-width: 1280px) 435px, (min-width: 768px) 40vw, 100vw"
            className="object-cover object-[35%_75%]"
            placeholder="blur"
          />
        </div>
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#765b45]">
            Novo na Niškigramu
          </p>
          <h2
            id="virtual-nis-promo-title"
            className="font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl"
          >
            Niš iz nove perspektive.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#5c4a3d]/80">
            Prošetaj znamenitostima Niša i otkrij njegovu istoriju kroz virtuelno
            iskustvo.
          </p>
          <Link
            href="/virtuelni-nis"
            className="group mt-5 inline-flex min-h-11 items-center gap-3 border-b border-[#5c4a3d]/35 font-semibold text-[#4a382b] transition-colors hover:border-[#4a382b] hover:text-[#765b45] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5c4a3d] motion-reduce:transition-none"
          >
            Istraži Virtuelni Niš
            <span
              aria-hidden="true"
              className="transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none"
            >
              ↗
            </span>
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}

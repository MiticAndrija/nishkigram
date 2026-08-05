import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[720px] w-full items-center overflow-hidden px-4 pb-32 pt-28 sm:min-h-screen sm:px-6 sm:pb-40 sm:pt-32 md:px-10">
      <div className="absolute inset-0 bg-[#e8e0d5]">
        <Image
          src="/images/nis-hero.png"
          alt="Pogled na Niš"
          fill
          sizes="100vw"
          className="object-cover object-bottom"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f4efe6]/35 via-[#f4efe6]/10 via-55% to-[#f4efe6]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="max-w-2xl rounded-3xl border border-white/60 bg-[#fdfaf6]/90 p-6 shadow-xl backdrop-blur-sm sm:rounded-[2rem] sm:p-10 md:p-12">
          <div className="mb-6 inline-flex min-h-11 items-center overflow-hidden rounded-full border border-[#5c4a3d]/15 bg-[#f4efe6]/80 text-xs font-bold uppercase tracking-[0.18em] text-[#5c4a3d] shadow-sm">
            <span className="flex min-h-11 items-center gap-2 border-r border-[#5c4a3d]/15 px-4">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8b6f56]/45" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#5c4a3d]" />
              </span>
              Niš
            </span>
            <span className="px-4 text-[#8b6f56]">U fokusu</span>
            <span className="hero-word-window mr-4 h-5 min-w-[5.75rem] overflow-hidden text-left">
              <span className="hero-word-reel flex flex-col">
                <span>Priča</span>
                <span>Mesta</span>
                <span>Ljudi</span>
                <span>Događaja</span>
                <span aria-hidden="true">Priča</span>
              </span>
            </span>
          </div>
          <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-[#4a382b] sm:text-6xl md:text-7xl lg:text-8xl">
            Niškigram
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#5c4a3d]/80 sm:mt-8 sm:text-xl sm:leading-9">
            Priče, mesta, ljudi i preporuke koje otkrivaju Niš onako kako se
            zaista živi.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              href="/blog"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#5c4a3d] px-7 py-3 text-base font-semibold text-[#fdfaf6] shadow-md shadow-[#5c4a3d]/15 transition-colors hover:bg-[#47382f] focus:outline-none focus:ring-4 focus:ring-[#5c4a3d]/20"
            >
              Istraži blog
            </Link>
            <Link
              href="/preporuke"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#5c4a3d]/25 px-7 py-3 text-base font-semibold text-[#5c4a3d] transition-colors hover:bg-[#5c4a3d]/8 focus:outline-none focus:ring-4 focus:ring-[#5c4a3d]/15"
            >
              Pogledaj preporuke
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-3 border-t border-[#5c4a3d]/10 pt-6 text-sm font-semibold text-[#5c4a3d]/70">
            <Image
              src="/images/konjanik.png"
              alt="Konjanik, simbol Niškigrama"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <span>Lokalni pogled na grad</span>
          </div>
        </div>
      </div>
    </section>
  );
}

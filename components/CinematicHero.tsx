"use client";

import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -45]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.18, 0.32]);
  const titleScale = useTransform(scrollYProgress, [0, 0.72], [1, 1.07]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.72, 0.94], [1, 0.88, 0]);
  const detailsOpacity = useTransform(scrollYProgress, [0, 0.48, 0.78], [1, 0.85, 0]);
  const detailsY = useTransform(scrollYProgress, [0, 0.78], [0, -20]);

  return (
    <MotionConfig reducedMotion="user">
    <section
      ref={sectionRef}
      className="relative h-[132svh] bg-[#2f241d] sm:h-[136svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div
          className="absolute -inset-x-3 -inset-y-12 sm:-inset-x-6 sm:-inset-y-16"
          style={{ scale: imageScale, y: imageY, willChange: "transform" }}
        >
          <Image
            src="/images/nis-hero.png"
            alt="Panorama Niša"
            fill
            sizes="100vw"
            className="object-cover object-bottom"
            priority
            unoptimized
          />
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-[#2f241d]"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-16 pt-24 text-center text-[#fdfaf6] sm:px-6">
          <motion.div
            style={{
              opacity: titleOpacity,
              scale: titleScale,
              willChange: "transform, opacity",
            }}
          >
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#fdfaf6]/80 sm:text-sm">
              Fotografije <span aria-hidden="true">·</span> Priče{" "}
              <span aria-hidden="true">·</span> Mesta{" "}
              <span aria-hidden="true">·</span> Niš
            </p>
            <h1 className="font-serif text-[clamp(3.5rem,14vw,10rem)] leading-[0.82] tracking-[-0.055em] drop-shadow-lg">
              NIŠKIGRAM
            </h1>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-col items-center"
            style={{ opacity: detailsOpacity, y: detailsY, willChange: "transform, opacity" }}
          >
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center border-b border-[#fdfaf6]/60 px-1 font-semibold text-[#fdfaf6] transition-colors hover:border-[#fdfaf6]"
            >
              Pogledaj priče
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
    </MotionConfig>
  );
}

"use client";

import Image from "next/image";
import { MotionConfig, motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function ParallaxCitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [-36, 36]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.12]);

  return (
    <MotionConfig reducedMotion="user">
    <section ref={sectionRef} className="bg-[#f4efe6] px-4 py-8 sm:px-6 md:px-10 md:py-12">
      <div className="relative mx-auto h-[68svh] min-h-[480px] max-w-[1400px] overflow-hidden rounded-[2rem] bg-[#2f241d] md:rounded-[3rem]">
        <motion.div
          className="absolute -inset-y-16 inset-x-0"
          style={{ y: imageY, scale: imageScale }}
        >
          <Image
            src="/images/nis-hero.png"
            alt="Niš iz prvog reda"
            fill
            sizes="100vw"
            className="object-cover object-bottom"
            unoptimized
          />
        </motion.div>
        <div className="absolute inset-0 bg-[#211813]/45" />
        <div className="relative z-10 flex h-full items-end p-7 sm:p-12 md:p-16">
          <h2 className="max-w-4xl font-serif text-5xl leading-[0.95] text-[#fdfaf6] sm:text-7xl md:text-8xl">
            Grad iz prvog reda.
          </h2>
        </div>
      </div>
    </section>
    </MotionConfig>
  );
}

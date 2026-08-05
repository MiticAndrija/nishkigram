import Script from "next/script";

export default function InstagramFeed() {
  return (
    <section className="bg-[#fdfaf6] px-4 py-20 sm:px-6 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl sm:mb-14">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#8b6f56]">
            @nishkigram
          </p>
          <h2 className="font-serif text-4xl leading-tight text-[#4a382b] sm:text-5xl md:text-6xl">
            Sa Instagrama
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#5c4a3d]/70">
            Fotografije i trenuci koje svakodnevno delimo iz grada.
          </p>
        </div>

        <div className="min-h-[420px] overflow-hidden rounded-[1.75rem] border border-[#5c4a3d]/10 bg-[#f4efe6] p-3 shadow-sm sm:min-h-[500px] sm:rounded-[2.5rem] sm:p-5">
          <div
            className="elfsight-app-9acd4588-e45f-4d1e-aa11-a60d1b23a5d8"
            data-elfsight-app-lazy
          />
        </div>
      </div>

      <Script
        src="https://elfsightcdn.com/platform.js"
        strategy="lazyOnload"
      />
    </section>
  );
}

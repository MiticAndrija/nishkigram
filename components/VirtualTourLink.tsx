import { virtualTourUrl } from "@/lib/virtualTour";

export default function VirtualTourLink() {
  return (
    <a
      href={virtualTourUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex min-h-14 w-fit max-w-full items-center justify-center gap-4 rounded-full border border-[#fdfaf6] bg-[#fdfaf6] px-6 py-4 text-sm font-semibold text-[#4a382b] transition-colors duration-300 hover:border-[#eadfce] hover:bg-[#eadfce] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fdfaf6] motion-reduce:transition-none sm:px-8 sm:text-base"
    >
      Započni virtuelnu šetnju
      <span
        aria-hidden="true"
        className="text-lg transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none"
      >
        ↗
      </span>
      <span className="sr-only"> (otvara se u novoj kartici)</span>
    </a>
  );
}

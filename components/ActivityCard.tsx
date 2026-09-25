import Image from "next/image";
import { getContentImageUrl, shouldUseUnoptimizedImage } from "@/lib/contentImages";
import { formatActivityDate, type ActivityInput } from "@/lib/activityMeta";

export default function ActivityCard({ activity, preview = false }: { activity: ActivityInput; preview?: boolean }) {
  const coverImage = getContentImageUrl(activity);
  const content = (
    <>
      <div className="relative h-52 bg-[#e8e0d5] sm:h-64">
        <Image src={coverImage} alt={activity.coverImageAlt || activity.title || "Slika aktivnosti"} fill
          sizes="(min-width: 1200px) 384px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: activity.coverImagePosition || "center bottom" }}
          unoptimized={shouldUseUnoptimizedImage(coverImage)} />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#5c4a3d] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#fdfaf6]">
            {activity.category || "Kategorija"}
          </span>
        </div>
        {preview ? <h3 className="font-serif text-2xl leading-tight text-[#4a382b] sm:text-3xl">{activity.title || "Naziv aktivnosti"}</h3>
          : <h2 className="font-serif text-2xl leading-tight text-[#4a382b] sm:text-3xl">{activity.title}</h2>}
        <p className="mt-4 flex flex-wrap gap-x-3 text-sm font-semibold text-[#5c4a3d]/65">
          {activity.date ? <time dateTime={activity.date}>{formatActivityDate(activity.date)}</time> : "Datum aktivnosti"}
          {activity.time ? <><span aria-hidden="true">/</span><time dateTime={activity.time}>{activity.time}</time></> : null}
        </p>
        <p className="mt-3 leading-7 text-[#5c4a3d]/75">{activity.location || "Lokacija"}</p>
        <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 font-semibold text-[#5c4a3d] group-hover:underline">
          Pogledaj događaj <span aria-hidden="true">→</span>
          <span className="sr-only"> (otvara se u novom tabu)</span>
        </span>
      </div>
    </>
  );
  const className = "group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-[#5c4a3d]/10 bg-[#fdfaf6] shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:rounded-[1.5rem] [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5c4a3d]";
  return <article className="min-w-0">{preview ? <div className={className}>{content}</div> :
    <a href={activity.url} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>}
  </article>;
}

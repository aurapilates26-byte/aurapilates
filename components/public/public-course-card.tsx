import Image from "next/image";
import Link from "next/link";

type PublicCourseCardProps = {
  slug: string;
  title: string;
  cardDescription: string;
  cardImage: string;
  variant?: "featured" | "compact" | "carousel" | "default";
  className?: string;
};

export function PublicCourseCard({
  slug,
  title,
  cardDescription,
  cardImage,
  variant = "default",
  className = "",
}: PublicCourseCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const isCarousel = variant === "carousel";

  return (
    <article
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(90,64,51,0.08)] ${className}`.trim()}
    >
      <div
        className={
          isFeatured
            ? "relative min-h-[220px] w-full flex-[1.35] sm:min-h-[260px]"
            : isCompact
              ? "relative min-h-[100px] w-full flex-1"
              : isCarousel
                ? "relative aspect-[4/3] w-full shrink-0"
                : "relative aspect-[4/3] w-full"
        }
      >
        <Image
          src={cardImage}
          alt={title}
          fill
          sizes={
            isFeatured
              ? "(max-width: 1024px) 100vw, 42vw"
              : isCompact
                ? "(max-width: 1024px) 50vw, 28vw"
                : isCarousel
                  ? "320px"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          className="object-cover"
        />
      </div>
      <div
        className={`flex flex-col ${
          isFeatured
            ? "flex-1 px-6 py-6"
            : isCompact
              ? "shrink-0 px-4 py-4"
              : isCarousel
                ? "flex-1 px-5 py-5"
                : "flex-1 px-5 py-5 sm:px-6 sm:py-6"
        }`}
      >
        <h3
          className={`font-serif leading-snug text-brand-dark ${
            isFeatured
              ? "text-2xl sm:text-[1.65rem]"
              : isCompact
                ? "text-lg sm:text-xl"
                : isCarousel
                  ? "text-xl"
                  : "text-[1.35rem] sm:text-2xl"
          }`}
        >
          {title}
        </h3>
        <p
          className={`leading-relaxed text-brand-dark/70 ${
            isFeatured
              ? "mt-3 flex-1 text-sm sm:text-[15px]"
              : isCompact
                ? "mt-2 line-clamp-3 text-xs sm:text-sm"
                : isCarousel
                  ? "mt-2 line-clamp-4 flex-1 text-sm"
                  : "mt-3 flex-1 text-sm sm:text-[15px]"
          }`}
        >
          {cardDescription}
        </p>
        <Link
          href={`/cours/${slug}`}
          className={`group inline-flex items-center gap-2 font-medium text-brand-dark transition hover:text-brand-dark/75 ${
            isCompact ? "mt-3 text-xs sm:text-sm" : "mt-4 text-sm"
          }`}
        >
          En savoir plus
          <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

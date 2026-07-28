"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PublicCourseCard } from "@/components/public/public-course-card";
import { courseContent } from "@/lib/text";

const FEATURED_COURSE_SLUG = "coaching-prive";

/** Coaching privé en dernier ; les autres cours gardent l’ordre du catalogue. */
const orderedCourses = [
  ...courseContent.filter((course) => course.slug !== FEATURED_COURSE_SLUG),
  ...courseContent.filter((course) => course.slug === FEATURED_COURSE_SLUG),
];

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

const scrollArrowClass =
  "pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-medium/35 bg-white text-brand-dark shadow-sm transition hover:bg-brand-light/80 md:h-11 md:w-11";

const edgeFadeClass =
  "pointer-events-none absolute inset-y-0 z-[1] w-14 from-[#faf7f2] via-[#faf7f2]/90 to-transparent sm:w-20 lg:w-24";

export function PublicCourseCardsGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const epsilon = 8;
    setCanScrollLeft(scrollLeft > epsilon);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - epsilon);
  }, []);

  useLayoutEffect(() => {
    updateScrollHints();
  }, [updateScrollHints]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollHints();
    el.addEventListener("scroll", updateScrollHints, { passive: true });
    const ro = new ResizeObserver(updateScrollHints);
    ro.observe(el);
    window.addEventListener("resize", updateScrollHints);
    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      ro.disconnect();
      window.removeEventListener("resize", updateScrollHints);
    };
  }, [updateScrollHints]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-course-card]");
    const cardWidth = firstCard?.offsetWidth ?? 300;
    const gap = 24;
    el.scrollBy({ left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap, behavior: "smooth" });
  }, []);

  return (
    <div className="relative -mx-6 mt-10 sm:-mx-8 md:mt-12 lg:-mx-10">
      <div className="relative min-w-0">
        <div
          ref={scrollRef}
          className="planning-days-scroll flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth touch-pan-x px-6 pb-2 sm:px-8 lg:px-10"
          aria-label="Nos cours, défilement horizontal. Utilisez les flèches ou faites glisser pour voir tous les cours."
        >
          {orderedCourses.map((course) => (
            <div
              key={course.slug}
              data-course-card
              className="w-[min(82vw,300px)] shrink-0 snap-start sm:w-[300px] lg:w-[320px]"
            >
              <PublicCourseCard {...course} variant="carousel" className="h-full" />
            </div>
          ))}
        </div>

        {canScrollLeft ? (
          <>
            <div className={`${edgeFadeClass} left-0 bg-gradient-to-r`} aria-hidden />
            <button
              type="button"
              aria-label="Faire défiler les cours vers la gauche"
              className={`${scrollArrowClass} absolute left-3 top-1/2 z-[2] -translate-y-1/2 sm:left-4 lg:left-6`}
              onClick={() => scroll("left")}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          </>
        ) : null}

        {canScrollRight ? (
          <>
            <div className={`${edgeFadeClass} right-0 bg-gradient-to-l`} aria-hidden />
            <button
              type="button"
              aria-label="Faire défiler les cours vers la droite"
              className={`${scrollArrowClass} absolute right-3 top-1/2 z-[2] -translate-y-1/2 sm:right-4 lg:right-6`}
              onClick={() => scroll("right")}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

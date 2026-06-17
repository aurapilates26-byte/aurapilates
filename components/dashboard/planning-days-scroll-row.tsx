"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type PlanningDaysScrollRowProps = {
  children: ReactNode;
  /** Classes on the outer wrapper (e.g. -mx-1 pb-2). */
  className?: string;
  /** Classes on the scroll viewport. */
  scrollClassName?: string;
  ariaLabel?: string;
  /** Re-run scroll hint detection when this value changes (e.g. item count). */
  scrollKey?: string | number;
};

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

const scrollArrowClass =
  "pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-medium/40 bg-white text-brand-dark shadow-md ring-1 ring-black/5 md:h-9 md:w-9";

/** Même logique que le planning public : flèches en bordure, zone de scroll dédiée sans compression des pastilles. */
export function PlanningDaysScrollRow({
  children,
  className = "",
  scrollClassName = "",
  ariaLabel = "Jours de la semaine, défilement horizontal",
  scrollKey,
}: PlanningDaysScrollRowProps) {
  const daysScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = useCallback(() => {
    const el = daysScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const epsilon = 8;
    setCanScrollLeft(scrollLeft > epsilon);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - epsilon);
  }, []);

  useLayoutEffect(() => {
    updateScrollHints();
  }, [updateScrollHints, scrollKey]);

  useEffect(() => {
    const el = daysScrollRef.current;
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

  const scrollDays = useCallback((direction: "left" | "right") => {
    const el = daysScrollRef.current;
    if (!el) return;
    const delta = Math.min(Math.floor(el.clientWidth * 0.65), 240);
    el.scrollBy({ left: direction === "left" ? -delta : delta, behavior: "smooth" });
  }, []);

  const scrollAriaLabel =
    canScrollLeft || canScrollRight
      ? `${ariaLabel}. Utilisez les flèches ou faites défiler pour voir tous les jours.`
      : ariaLabel;

  return (
    <div className={`pb-2 ${className}`.trim()}>
      <div className="relative min-w-0 px-1">
        <div
          ref={daysScrollRef}
          className={`planning-days-scroll flex min-h-0 min-w-0 items-center justify-start overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth touch-pan-x ${
            canScrollLeft ? "pl-10 sm:pl-11" : ""
          } ${canScrollRight ? "pr-10 sm:pr-11" : ""} ${scrollClassName}`.trim()}
          aria-label={scrollAriaLabel}
        >
          {children}
        </div>

        {canScrollLeft ? (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-white via-white/90 to-transparent sm:w-11"
              aria-hidden="true"
            />
            <button
              type="button"
              aria-label="Faire défiler les jours vers la gauche"
              className={`${scrollArrowClass} absolute left-0 top-1/2 z-[2] -translate-y-1/2`}
              onClick={() => scrollDays("left")}
            >
              <ChevronLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </>
        ) : null}

        {canScrollRight ? (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-white via-white/90 to-transparent sm:w-11"
              aria-hidden="true"
            />
            <button
              type="button"
              aria-label="Faire défiler les jours vers la droite"
              className={`${scrollArrowClass} absolute right-0 top-1/2 z-[2] -translate-y-1/2`}
              onClick={() => scrollDays("right")}
            >
              <ChevronRightIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

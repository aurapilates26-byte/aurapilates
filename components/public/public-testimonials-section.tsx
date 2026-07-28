"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PublicSectionHeading } from "@/components/public/public-section-heading";
import { homeTestimonials, homeText } from "@/lib/text";

function StarRow() {
  return (
    <div className="mt-1 flex gap-0.5" aria-label="5 étoiles sur 5">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5 fill-brand-dark/75"
          aria-hidden
        >
          <path d="M10 1.5 12.4 7l5.9.5-4.5 3.9 1.4 5.8L10 14.2 4.8 17.2l1.4-5.8L1.7 7.5 7.6 7 10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

export function PublicTestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-testimonial-card]");
    if (cards.length === 0) return;

    const scrollCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(scrollCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateActiveIndex();
    el.addEventListener("scroll", updateActiveIndex, { passive: true });
    window.addEventListener("resize", updateActiveIndex);
    return () => {
      el.removeEventListener("scroll", updateActiveIndex);
      window.removeEventListener("resize", updateActiveIndex);
    };
  }, [updateActiveIndex]);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(`[data-testimonial-card]:nth-child(${index + 1})`);
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <section id="temoignages" className="bg-[#faf7f2] px-6 pb-13 pt-4 text-brand-dark sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <PublicSectionHeading
          kicker={homeText.sections.temoignages.kicker}
          title={homeText.sections.temoignages.title}
          titleClassName="font-serif font-normal tracking-tight"
        />

        <div
          ref={scrollRef}
          className="planning-days-scroll mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth pb-2 touch-pan-x md:mt-12 md:gap-6"
          aria-label="Témoignages, défilement horizontal"
        >
          {homeTestimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              data-testimonial-card
              className="w-[min(88vw,340px)] shrink-0 snap-center rounded-2xl bg-white p-6 shadow-sm sm:w-[340px] sm:p-7"
            >
              <p className="font-serif text-4xl leading-none text-brand-dark/20" aria-hidden>
                “
              </p>
              <p className="mt-2 text-sm italic leading-relaxed text-brand-dark/80 sm:text-[15px]">
                {testimonial.quote}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-medium/90 text-sm font-semibold text-white"
                  aria-hidden
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-dark">{testimonial.name}</p>
                  <StarRow />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {homeTestimonials.map((testimonial, index) => (
            <button
              key={testimonial.name}
              type="button"
              aria-label={`Afficher le témoignage ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                activeIndex === index ? "w-6 bg-brand-dark" : "w-2 bg-brand-dark/20"
              }`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

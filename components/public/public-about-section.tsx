import Image from "next/image";
import Link from "next/link";
import { homeText } from "@/lib/text";

export function PublicAboutSection() {
  const about = homeText.sections.about;

  return (
    <section id="a-propos" className="bg-[#faf7f2] px-6 pb-13 pt-4 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src={about.image}
            alt={about.imageAlt}
            width={0}
            height={0}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="block h-auto w-full rounded-2xl"
            style={{ width: "100%", height: "auto" }}
          />

          <div className="absolute inset-0 flex items-center">
            <div className="px-7 sm:px-10 md:px-12 lg:px-14">
              <div className="max-w-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-dark/45 sm:text-[11px]">
                  {about.kicker}
                </p>
                <h2 className="mt-2.5 font-serif text-[clamp(1.45rem,3vw,2rem)] leading-tight tracking-tight text-brand-dark">
                  {about.title}
                </h2>
                <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-brand-dark/75 sm:text-sm sm:leading-6">
                  {about.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <Link
                  href="/contact"
                  className="group mt-4 inline-flex w-fit items-center gap-2 border-b border-brand-dark/30 pb-0.5 text-[13px] font-medium text-brand-dark transition hover:border-brand-dark/55 sm:text-sm"
                >
                  {about.cta}
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

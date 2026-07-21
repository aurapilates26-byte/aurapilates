import Image from "next/image";
import Link from "next/link";
import { homeText } from "@/lib/text";

export function PublicReadySection() {
  const ready = homeText.sections.ready;

  return (
    <section className="bg-[#faf7f2] px-6 pb-13 pt-4 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src={ready.image}
            alt={ready.imageAlt}
            width={0}
            height={0}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="block h-auto w-full rounded-2xl"
            style={{ width: "100%", height: "auto" }}
          />

          <div className="absolute inset-0 flex items-center justify-center px-6 text-center sm:px-10">
            <div className="max-w-lg">
              <h2 className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] leading-tight tracking-tight text-white">
                {ready.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
                {ready.subtitle}
              </p>
              <Link
                href="/planning"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-white/90"
              >
                {ready.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

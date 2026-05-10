import { courseContent } from "@/lib/text";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/15 bg-[#6E5E57] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold tracking-tight">Aura Pilates</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/85">
            Studio bien-etre et progression continue, 100% dedie aux femmes.
          </p>
          <a
            href="/#inscription"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-white/30 bg-white px-4 py-2 text-xs font-semibold text-[#6E5E57] transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Demarrer mon inscription
          </a>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/90">
            Nos cours
          </p>
          <div className="mt-3 space-y-2 text-sm text-white/85">
            {courseContent.map((course) => (
              <p key={course.slug}>
                <a
                  href={`/cours/${course.slug}`}
                  className="transition hover:text-white hover:underline"
                >
                  {course.title}
                </a>
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/90">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-white/85">
            <p>
              Email:{" "}
              <a
                href="mailto:aurapilates26@gmail.com"
                className="transition hover:text-white hover:underline"
              >
                aurapilates26@gmail.com
              </a>
            </p>
            <p>Telephone: Ajoutez votre numero</p>
            <p>Adresse: Ajoutez votre adresse du studio</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 px-6 py-4 text-center text-xs text-white/80">
        <p>{year} Aura Pilates - Tous droits reserves.</p>
      </div>
    </footer>
  );
}

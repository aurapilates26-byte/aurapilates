import { courseContent } from "@/lib/text";

export function Footer() {
  const year = new Date().getFullYear();
  const studioCoords = { lat: 36.7411865, lon: 10.3009188 };

  return (
    <footer className="w-full border-t border-white/15 bg-[#6E5E57] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
        <div>
          <p className="text-lg font-semibold tracking-tight">Aura Pilates</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/85">
            Studio bien-être et progression continue, 100 % dédié aux femmes.
          </p>
          <a
            href="/inscription"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-white/30 bg-white px-4 py-2 text-xs font-semibold text-[#6E5E57] transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Démarrer mon inscription
          </a>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/90">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-white/85">
            <p>
              Email :{" "}
              <a
                href="mailto:aurapilates26@gmail.com"
                className="transition hover:text-white hover:underline"
              >
                aurapilates26@gmail.com
              </a>
            </p>
            <p>
              Téléphone :{" "}
              <a href="tel:+21628057047" className="transition hover:text-white hover:underline">
                28057047
              </a>
            </p>
            <p>
              Adresse : Avenue de l&apos;Environnement, Ezzahra — près du rond-point Kamanja
            </p>
          </div>
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
          <p className="text-sm font-semibold uppercase tracking-wide text-white/90">Plan</p>
          <div className="mt-3 space-y-3">
            <div className="overflow-hidden rounded-xl border border-white/15 bg-white/10">
              <iframe
                title="Carte Aura Pilates"
                className="h-44 w-full"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${studioCoords.lon - 0.01}%2C${studioCoords.lat - 0.006}%2C${studioCoords.lon + 0.01}%2C${studioCoords.lat + 0.006}&layer=mapnik&marker=${studioCoords.lat}%2C${studioCoords.lon}`}
              />
            </div>
            <a
              className="inline-flex text-sm font-semibold text-white/90 transition hover:text-white hover:underline"
              href={`https://www.openstreetmap.org/?mlat=${studioCoords.lat}&mlon=${studioCoords.lon}#map=17/${studioCoords.lat}/${studioCoords.lon}`}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir la carte
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 px-6 py-4 text-center text-xs text-white/80">
        <p>{year} Aura Pilates — Tous droits réservés.</p>
      </div>
    </footer>
  );
}

import Image from "next/image";
import { prisma } from "@/lib/prisma";

function coachDisplayName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Coach";
}

function initials(firstName: string, lastName: string) {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return `${a}${b}`.toUpperCase() || "?";
}

export async function PublicCoachesSection() {
  let coaches: { id: string; firstName: string; lastName: string; imageUrl: string | null }[] = [];

  try {
    coaches = await prisma.coach.findMany({
      where: { isActive: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, imageUrl: true },
    });
  } catch {
    coaches = [];
  }

  if (coaches.length === 0) {
    return (
      <div className="mt-5 rounded-xl border border-brand-medium/25 bg-white px-5 py-13 text-center shadow-sm">
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-brand-dark/85">
          Pour l&apos;instant, il n&apos;y a pas de coach à afficher : aucune fiche n&apos;a encore été ajoutée dans la
          base du studio. Revenez un peu plus tard, ou contactez-nous si vous souhaitez des précisions.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-10">
      {coaches.map((c) => {
        const name = coachDisplayName(c.firstName, c.lastName);
        return (
          <article
            key={c.id}
            className="flex flex-col items-center rounded-xl border border-brand-medium/25 bg-white px-5 py-8 text-center shadow-sm"
          >
            <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-full border border-brand-medium/30 bg-zinc-100 sm:h-40 sm:w-40">
              {c.imageUrl ? (
                <Image src={c.imageUrl} alt={name} fill sizes="160px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-brand-dark/45">
                  {initials(c.firstName, c.lastName)}
                </div>
              )}
            </div>
            <p className="mt-4 text-base font-semibold text-brand-dark">{name}</p>
          </article>
        );
      })}
    </div>
  );
}

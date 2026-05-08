import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { courseContent } from "@/lib/text";

type CourseDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return courseContent.map((course) => ({ slug: course.slug }));
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = courseContent.find((item) => item.slug === slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="bg-zinc-50 px-4 py-14 text-brand-dark">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/#cours" className="text-sm font-medium text-brand-dark/80 transition hover:opacity-70">
          Retour aux cours
        </Link>

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-brand-medium/40 bg-white">
            <Image
              src={course.heroImage}
              alt={course.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="rounded-2xl border border-brand-medium/40 bg-white p-6">
            <h1 className="text-3xl font-semibold md:text-4xl">{course.title}</h1>
            <p className="mt-4 text-base leading-7 text-brand-dark/85">{course.intro}</p>
            <p className="mt-4 text-base leading-7 text-brand-dark/85">{course.paragraphOne}</p>
            <p className="mt-4 text-base leading-7 text-brand-dark/85">{course.paragraphTwo}</p>
            <div className="mt-6">
              <Button href="/#inscription" size="sm">
                Je reserve ma place
              </Button>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-brand-medium/40 bg-white p-6">
          <h2 className="text-2xl font-semibold">Pourquoi choisir ce cours ?</h2>
          <p className="mt-3 text-brand-dark/80">
            Ce programme est concu pour vous faire progresser etape par etape avec un encadrement de qualite.
            Vous profitez d&apos;une approche technique, d&apos;un suivi precis et d&apos;un environnement motivant pour
            atteindre vos objectifs.
          </p>
          <div className="relative mt-6 h-72 overflow-hidden rounded-xl">
            <Image
              src={course.galleryImage}
              alt={`${course.title} ambiance de cours`}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

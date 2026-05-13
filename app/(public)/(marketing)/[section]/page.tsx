import { notFound } from "next/navigation";
import { isMarketingDynamicSectionSlug } from "@/lib/public-sections";

type SectionPageProps = {
  params: Promise<{ section: string }>;
};

export default async function PublicSectionPage({ params }: SectionPageProps) {
  const { section } = await params;

  if (!isMarketingDynamicSectionSlug(section)) {
    notFound();
  }

  return null;
}
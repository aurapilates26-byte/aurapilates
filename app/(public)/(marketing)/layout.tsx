import type { ReactNode } from "react";
import { LandingPage } from "@/components/public/landing-page";
import { LandingNavScroll } from "@/components/public/landing-nav-scroll";

/** Données Prisma (packs, planning) toujours à jour — même comportement en dev et en prod (`next start`). */
export const dynamic = "force-dynamic";

type MarketingLayoutProps = {
  children: ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <LandingNavScroll />
      <LandingPage />
      {children}
    </>
  );
}

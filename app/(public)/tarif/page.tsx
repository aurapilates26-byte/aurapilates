import { Metadata } from "next";
import { TarifPageComponent } from "@/components/public/tarif-page";

export const metadata: Metadata = {
  title: "Nos Tarifs | Aura Pilates",
  description: "Découvrez nos formules d'abonnement adaptées à vos besoins.",
};

export const dynamic = "force-dynamic";

export default function TarifPage() {
  return <TarifPageComponent />;
}

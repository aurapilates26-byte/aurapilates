"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";

const publicLinks = [
  { label: "Cours", sectionId: "cours" },
  { label: "Coach", sectionId: "coach" },
  { label: "Tarif", sectionId: "tarif" },
  { label: "Inscription", sectionId: "inscription" },
  { label: "FAQ", sectionId: "faq" },
  { label: "Contact", sectionId: "contact" },
];

export function Header() {
  const handleSectionClick = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) {
      window.location.assign(`/#${sectionId}`);
      return;
    }

    window.history.replaceState(null, "", `/#${sectionId}`);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="w-full bg-[#6E5E57]">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/#accueil" className="inline-flex items-center">
          <Image
            src="/images/aura.png"
            alt="Aura Pilates"
            width={200}
            height={38}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium text-white lg:flex">
          {publicLinks.map((link) => (
            <button
              key={link.sectionId}
              type="button"
              onClick={() => handleSectionClick(link.sectionId)}
              className="appearance-none border-0 bg-transparent p-0 text-sm font-medium text-white transition hover:opacity-80"
            >
              {link.label}
            </button>
          ))}
        </nav>
        <Button
          href="/connexion"
          size="xs"
          className="border-white/40 !bg-white !text-brand-dark shadow-none transition-none hover:translate-y-0 hover:shadow-none hover:bg-white hover:text-brand-dark"
        >
          Se connecter
        </Button>
      </div>
    </header>
  );
}

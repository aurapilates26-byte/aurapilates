"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { PUBLIC_LANDING_SECTIONS } from "@/lib/public-sections";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#6E5E57]">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4">
        {/* Mobile menu button placed before the logo for standard layout */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 p-2 text-white lg:hidden mr-2"
            title={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <span className="sr-only">{menuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        <Link href="/" className="inline-flex items-center">
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
          <Link href="/" className="text-sm font-medium text-white transition hover:opacity-80">
            Accueil
          </Link>
          {PUBLIC_LANDING_SECTIONS.map((link) => (
            <Link
              key={link.slug}
              href={`/${link.slug}`}
              className="text-sm font-medium text-white transition hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            href="/connexion"
            size="xs"
            className="border-white/40 !bg-white !text-brand-dark shadow-none transition-none hover:translate-y-0 hover:shadow-none hover:bg-white hover:text-brand-dark"
          >
            Se connecter
          </Button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div id="mobile-menu" className="lg:hidden z-50 bg-[#6E5E57]/95 border-t border-white/10">
          <div className="mx-auto w-full max-w-7xl px-4 py-3">
            <nav className="flex flex-col gap-2">
              <Link href="/" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/5">
                Accueil
              </Link>
              {PUBLIC_LANDING_SECTIONS.map((link) => (
                <Link
                  key={link.slug}
                  href={`/${link.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

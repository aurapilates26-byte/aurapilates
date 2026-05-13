import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { PUBLIC_LANDING_SECTIONS } from "@/lib/public-sections";

export function Header() {
  return (
    <header className="w-full bg-[#6E5E57]">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4">
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

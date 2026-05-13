"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/connexion", redirect: true });
  };

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={isLoading}
      className="w-full rounded-lg border border-brand-medium/30 bg-white px-3 py-2 text-left text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { Button, Input } from "@/components/ui";
import { postLoginPath } from "@/lib/admin/access";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        identifier: identifier.trim(),
        secret,
        redirect: false,
      });

      if (result?.error) {
        setError(decodeLoginError(result.error));
        return;
      }

      let session = await getSession();
      if (!session?.user?.role) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        session = await getSession();
      }
      window.location.replace(postLoginPath(session?.user?.role));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Champs avec icônes */}
      <div className="space-y-5">
        <div className="relative">
          <label htmlFor="identifier" className="text-sm font-medium text-brand-dark mb-2 block">
            ✉️ Adresse e-mail
          </label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            placeholder="Entrez votre adresse e-mail"
            variant="soft"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
        </div>

        <div className="relative">
          <label htmlFor="secret" className="text-sm font-medium text-brand-dark mb-2 block">
            🔒 Mot de passe
          </label>
          <Input
            id="secret"
            name="secret"
            type="password"
            autoComplete="current-password"
            placeholder="Entrez votre mot de passe"
            variant="soft"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            required
          />
        </div>
      </div>

      {/* Lien Mot de passe oublié */}
      <div className="text-right">
        <Link
          href="/reset-password"
          className="text-xs font-medium text-brand-dark/60 hover:text-brand-dark hover:underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      {/* Message d'erreur */}
      {error ? (
        <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded">{error}</p>
      ) : null}

      {/* Bouton Se connecter */}
      <Button type="submit" size="lg" className="w-full justify-center" disabled={isLoading}>
        {isLoading ? "Connexion…" : "Se connecter"}
      </Button>

      {/* Ou */}
      <div className="relative flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-brand-dark/50">
        <span className="h-px flex-1 bg-brand-medium/20" />
        <span>ou</span>
        <span className="h-px flex-1 bg-brand-medium/20" />
      </div>
    </form>
  );
}

function decodeLoginError(raw: string): string {
  const message = raw.trim();
  if (!message || message === "CredentialsSignin") {
    return "Identifiants incorrects.";
  }
  try {
    return decodeURIComponent(message);
  } catch {
    return message;
  }
}

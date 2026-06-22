"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui";
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
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <p className="text-xs leading-relaxed text-brand-dark/65">
        Adhérentes : <span className="font-semibold">téléphone</span> +{" "}
        <span className="font-semibold">clé QR</span>. Administration :{" "}
        <span className="font-semibold">email</span> + <span className="font-semibold">mot de passe</span>.
      </p>

      <div className="space-y-2">
        <label htmlFor="identifier" className="text-sm font-medium">
          Identifiant
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="Téléphone ou email"
          className="w-full rounded-lg border border-brand-medium/40 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-dark/70 focus:ring-2 focus:ring-brand-medium/25"
          required
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="secret" className="text-sm font-medium">
          Mot de passe ou clé QR
        </label>
        <input
          id="secret"
          name="secret"
          type="password"
          autoComplete="current-password"
          placeholder="Votre mot de passe ou clé QR"
          className="w-full rounded-lg border border-brand-medium/40 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-dark/70 focus:ring-2 focus:ring-brand-medium/25"
          required
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
        />
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <div className="pt-2">
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isLoading}>
          {isLoading ? "Connexion…" : "Se connecter"}
        </Button>
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

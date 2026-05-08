"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    window.location.href = result?.url ?? "/dashboard";
  };

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="exemple@email.com"
          className="w-full rounded-lg border border-brand-medium/40 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-dark/70 focus:ring-2 focus:ring-brand-medium/25"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </label>
          <button type="button" className="text-xs font-medium text-brand-dark/80 hover:opacity-75">
            Mot de passe oublie ?
          </button>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Votre mot de passe"
          className="w-full rounded-lg border border-brand-medium/40 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-dark/70 focus:ring-2 focus:ring-brand-medium/25"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <div className="pt-2">
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isLoading}>
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
      </div>
    </form>
  );
}

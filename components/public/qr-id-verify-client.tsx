"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type AssignmentStatus = "ASSIGNED" | "UNASSIGNED";

export function QrIdVerifyClient({
  publicId,
  assignmentStatus,
  memberName,
}: {
  publicId: string;
  assignmentStatus: AssignmentStatus;
  memberName?: string | null;
}) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!key.trim()) {
      setError("Veuillez saisir une clé.");
      return;
    }

    setIsSubmitting(true);
    try {
      const signInResult = await signIn("credentials", {
        redirect: false,
        callbackUrl: "/dashboard",
        loginType: "QR_SCAN",
        publicId,
        key,
      });

      if (!signInResult || signInResult.error) {
        throw new Error("Clé invalide ou accès non autorisé.");
      }

      const session = await getSession();
      if (session?.user?.role === "ADMIN") {
        router.push(`/dashboard/presence?qr=${encodeURIComponent(publicId)}`);
        router.refresh();
        return;
      }

      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-10">
      <section className="mx-auto flex min-h-[78dvh] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-brand-medium/20 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)] sm:p-7">
          <div className="mx-auto mb-4 flex w-fit items-center justify-center">
            <Image src="/images/logo.png" alt="Aura Pilates Studio" width={160} height={30} priority className="h-8 w-auto" />
          </div>

          <div className="text-center">
            {assignmentStatus === "ASSIGNED" && memberName ? (
              <p className="mt-2 text-sm text-brand-dark/80">
                Membre: <span className="font-semibold text-brand-dark">{memberName}</span>
              </p>
            ) : null}
          </div>

          {assignmentStatus === "UNASSIGNED" ? (
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-brand-medium/20 bg-zinc-50 px-4 py-3 text-center text-sm text-brand-dark/75">
                QR disponible. Utilisez le Public ID ci-dessous pour l&apos;affecter lors de la creation d&apos;un membre.
              </div>
              <div className="rounded-2xl border border-brand-medium/25 bg-white px-4 py-3 text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand-dark/55">Public ID</p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-brand-dark">{publicId}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              <div>
                <label className="text-sm font-medium text-brand-dark">Identifiant unique</label>
                <input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSubmitting) {
                      e.preventDefault();
                      void onSubmit();
                    }
                  }}
                  placeholder="Saisir la clé qr code ou la clé staff"
                  className="mt-2 w-full rounded-xl border border-brand-medium/35 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-dark/60 focus:ring-2 focus:ring-brand-medium/20"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}

              <button
                onClick={() => void onSubmit()}
                disabled={isSubmitting}
                className="rounded-full bg-brand-dark px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting ? "Ouverture de session..." : "Valider"}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AdminOverviewRefreshProps = {
  children: React.ReactNode;
};

const REFRESH_MS = 30_000;

/** Rafraîchit les données (créneaux / réservations / présences) sans indicateur visible. */
export function AdminOverviewRefresh({ children }: AdminOverviewRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => router.refresh();
    const id = window.setInterval(refresh, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return <>{children}</>;
}

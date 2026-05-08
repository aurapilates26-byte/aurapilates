"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMemberBookingStore } from "@/store/member/member-booking-store";

/**
 * Un flux SSE par session membre : resynchronise le store Zustand et les RSC
 * (cartes dashboard) lorsqu’une réservation ou une présence change côté serveur.
 */
export function MemberBookingRealtime() {
  const router = useRouter();
  const loadAll = useMemberBookingStore((s) => s.loadAll);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/member/booking-stream");

    const scheduleRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void loadAll()
          .catch(() => {})
          .finally(() => router.refresh());
      }, 320);
    };

    es.onmessage = (ev) => {
      try {
        const p = JSON.parse(ev.data) as { type?: string };
        if (p.type === "refresh") scheduleRefresh();
      } catch {
        /* ignore */
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      es.close();
    };
  }, [loadAll, router]);

  return null;
}

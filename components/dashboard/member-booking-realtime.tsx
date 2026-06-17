"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { refreshMemberBookingUi } from "@/lib/member/member-booking-sync";
import { useMemberBookingStore } from "@/store/member/member-booking-store";

const RECONNECT_MS = 4_000;

/**
 * Un flux SSE par session membre : resynchronise le store Zustand et les RSC
 * (cartes dashboard) lorsqu'une réservation ou une présence change côté serveur.
 */
export function MemberBookingRealtime() {
  const router = useRouter();
  const loadAll = useMemberBookingStore((s) => s.loadAll);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    let es: EventSource | null = null;

    const scheduleRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void refreshMemberBookingUi(loadAll, router).catch(() => {});
      }, 320);
    };

    const connect = () => {
      if (!alive) return;
      es = new EventSource("/api/member/booking-stream");

      es.onmessage = (ev) => {
        try {
          const p = JSON.parse(ev.data) as { type?: string };
          if (p.type === "refresh") scheduleRefresh();
        } catch {
          /* ignore */
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (!alive) return;
        reconnectRef.current = setTimeout(connect, RECONNECT_MS);
      };
    };

    connect();

    return () => {
      alive = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      es?.close();
    };
  }, [loadAll, router]);

  return null;
}

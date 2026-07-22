import { useEffect } from "react";

/**
 * Hook qui écoute les événements de rafraîchissement des réservations
 * via Server-Sent Events (SSE).
 *
 * Quand une action affecte les réservations (présence marquée, annulation, etc.),
 * un broadcast est envoyé à tous les clients connectés.
 *
 * @param onRefresh - Callback invoqué quand une action de réservation est détectée
 * @param enabled - Activer/désactiver le listener (par défaut: true)
 */
export function useMemberBookingRefresh(
  onRefresh: () => void,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const eventSource = new EventSource("/api/member/booking-stream");
    let heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleOpen = () => {
      console.debug("[Booking Refresh] SSE connected");
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Refresh event: quelque chose a changé dans les réservations
        if (data.type === "refresh") {
          console.debug("[Booking Refresh] Refresh event received at", new Date(data.at).toLocaleTimeString("fr-FR"));
          onRefresh();
        }

        // Connected event: initial connection
        if (data.type === "connected") {
          console.debug("[Booking Refresh] Connected to booking stream");
        }

        // Reset heartbeat timeout
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
        heartbeatTimeout = setTimeout(() => {
          console.warn("[Booking Refresh] Heartbeat timeout - reconnecting");
          eventSource.close();
        }, 40000); // 40s timeout (heartbeat every 25s)
      } catch (err) {
        console.error("[Booking Refresh] Failed to parse message:", err);
      }
    };

    const handleError = () => {
      console.warn("[Booking Refresh] SSE connection error");
      eventSource.close();
    };

    eventSource.addEventListener("open", handleOpen);
    eventSource.addEventListener("message", handleMessage);
    eventSource.addEventListener("error", handleError);

    return () => {
      if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
      eventSource.removeEventListener("open", handleOpen);
      eventSource.removeEventListener("message", handleMessage);
      eventSource.removeEventListener("error", handleError);
      eventSource.close();
      console.debug("[Booking Refresh] SSE disconnected");
    };
  }, [onRefresh, enabled]);
}

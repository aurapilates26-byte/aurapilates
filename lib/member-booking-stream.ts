/**
 * Registre SSE (instance Node). Tous les onglets membres connectés reçoivent un
 * rafraîchissement quand une réservation change (ou présence enregistrée).
 * En déploiement multi-instances, remplacer par Redis pub/sub.
 */

type SendFn = (data: string) => void;

const subscribers = new Set<SendFn>();

export function registerMemberBookingSubscriber(send: SendFn): () => void {
  subscribers.add(send);
  return () => {
    subscribers.delete(send);
  };
}

export function broadcastMemberBookingRefresh(): void {
  const payload = JSON.stringify({ type: "refresh", at: Date.now() });
  for (const send of subscribers) {
    try {
      send(payload);
    } catch {
      subscribers.delete(send);
    }
  }
}

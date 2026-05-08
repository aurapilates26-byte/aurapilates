import { requireMemberSession } from "@/lib/require-member";
import { registerMemberBookingSubscriber } from "@/lib/member-booking-stream";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await requireMemberSession();
  if ("error" in guard) return guard.error;

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const cleanup = () => {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    unsubscribe?.();
    unsubscribe = null;
  };

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          /* stream fermée */
        }
      };

      send(JSON.stringify({ type: "connected" }));
      unsubscribe = registerMemberBookingSubscriber(send);

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          cleanup();
        }
      }, 25000);
    },
    cancel() {
      cleanup();
    },
  });

  request.signal.addEventListener("abort", cleanup);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

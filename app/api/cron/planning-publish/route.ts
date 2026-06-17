import { NextResponse } from "next/server";
import { maybeRunStaggeredDraftPublication } from "@/lib/admin/planning-staggered-publish";

/**
 * Tick publication échelonnée (samedi / dimanche 13h).
 * Appelé par cron horaire ou manuellement avec CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  const urlSecret = new URL(request.url).searchParams.get("secret");

  if (secret && auth !== `Bearer ${secret}` && urlSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const changed = await maybeRunStaggeredDraftPublication();
  return NextResponse.json({ ok: true, changed });
}

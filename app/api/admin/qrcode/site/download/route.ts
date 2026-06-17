import { readFile } from "node:fs/promises";
import { ensureSiteWebQrCodeFile, siteQrPngPath } from "@/lib/admin/site-qr-code";
import { errorResponse, requireAdmin } from "@/lib/admin/pack-promotion-auth";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  await ensureSiteWebQrCodeFile({ force: true });
  const buffer = await readFile(siteQrPngPath());

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="aurapilates-site-web.png"',
      "Cache-Control": "no-store",
    },
  });
}

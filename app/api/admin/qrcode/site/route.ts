import { SITE_QR_TARGET_URL, ensureSiteWebQrCodeFile } from "@/lib/admin/site-qr-code";
import { requireAdmin } from "@/lib/admin/pack-promotion-auth";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  await ensureSiteWebQrCodeFile({ force: true });

  return Response.json({
    targetUrl: SITE_QR_TARGET_URL,
    imageUrl: `/api/admin/qrcode/site/image?v=${Date.now()}`,
    downloadUrl: "/api/admin/qrcode/site/download",
    kind: "website",
  });
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";

type Params = {
  params: Promise<{ publicId: string }>;
};

function buildScanUrl(publicId: string) {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "https://aurapilates.tn";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  return `${baseUrl}/id/${publicId}`;
}

export async function GET(_request: Request, { params }: Params) {
  const { publicId } = await params;

  // Serve from disk if already generated.
  const outputDir = join(process.cwd(), "public", "qrcode");
  const outputPath = join(outputDir, `${publicId}.png`);
  try {
    const existing = await readFile(outputPath);
    return new Response(new Uint8Array(existing), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Fall through to generate below.
  }

  const pngBuffer = await QRCode.toBuffer(buildScanUrl(publicId), {
    width: 512,
    color: { dark: "#000000", light: "#FFFFFF" },
    margin: 1,
  });

  // Best-effort write for future requests (ignore write errors).
  try {
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, pngBuffer);
  } catch {
    // ignore
  }

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}


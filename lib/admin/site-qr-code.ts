import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";

/**
 * QR marketing du site — fichier dans `public/qrcode/` mais contenu différent des QR adhérents :
 * scan → ouverture directe du site (pas de page /id/ ni d'identifiant membre).
 */
export const SITE_QR_FILE_ID = "site-web";

/** URL encodée dans le QR — toujours https, lien direct vers le site. */
export const SITE_QR_TARGET_URL = "https://aurapilates.tn";

export function siteQrPngPath() {
  return join(process.cwd(), "public", "qrcode", `${SITE_QR_FILE_ID}.png`);
}

export function siteQrImageUrl(version?: number) {
  const v = version ?? Date.now();
  return `/qrcode/${SITE_QR_FILE_ID}.png?v=${v}`;
}

export async function writeSiteWebQrCodeFile() {
  const outputPath = siteQrPngPath();
  const outputDir = join(process.cwd(), "public", "qrcode");
  await mkdir(outputDir, { recursive: true });

  const pngBuffer = await QRCode.toBuffer(SITE_QR_TARGET_URL, {
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    margin: 1,
  });
  await writeFile(outputPath, pngBuffer);
  return outputPath;
}

/** Génère ou régénère le PNG (force utile si un ancien fichier pointait vers /id/…). */
export async function ensureSiteWebQrCodeFile(options?: { force?: boolean }) {
  const outputPath = siteQrPngPath();
  if (!options?.force) {
    try {
      await access(outputPath);
      return { outputPath, created: false as const };
    } catch {
      // Fichier absent.
    }
  }
  await writeSiteWebQrCodeFile();
  return { outputPath, created: true as const };
}

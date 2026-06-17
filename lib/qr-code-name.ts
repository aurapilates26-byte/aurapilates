/** Extrait le numéro de fin du nom (ex. « Nouveau QR 07 » → 7). */
export function extractQrSequenceNumber(name: string): number {
  const match = name.trim().match(/(\d+)\s*$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number.parseInt(match[1], 10);
}

export function compareQrCodesBySequenceName(
  a: { name: string },
  b: { name: string }
): number {
  const na = extractQrSequenceNumber(a.name);
  const nb = extractQrSequenceNumber(b.name);
  if (na !== nb) return na - nb;
  return a.name.localeCompare(b.name, "fr");
}

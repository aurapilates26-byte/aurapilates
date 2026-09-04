export type NextAvailableQrCode = {
  qrId: string;
  qrKey: string;
  name?: string;
  assignmentStatus: "UNASSIGNED";
  assignedMemberId: null;
};

export async function fetchNextAvailableQrCode(): Promise<NextAvailableQrCode> {
  const response = await fetch("/api/admin/qrcode/next-available", { cache: "no-store" });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Aucun QR code disponible.");
  }
  return (await response.json()) as NextAvailableQrCode;
}

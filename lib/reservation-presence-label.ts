/** Libellé colonne « Présence » (check-in enregistré ou statut présent). */
export function formatReservationPresenceLabel(input: {
  status: string;
  attendance: { markedAt: string } | null;
}): string {
  if (input.attendance?.markedAt) {
    const time = new Date(input.attendance.markedAt).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Oui (${time})`;
  }
  if (input.status === "ATTENDED") return "Oui";
  return "Non";
}

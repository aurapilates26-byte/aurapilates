export function formatUserDisplayName(user: { name: string | null; email: string } | null | undefined) {
  if (!user) return null;
  const trimmed = user.name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : user.email;
}

export type ReservationActorBadge = {
  label: string;
  className: string;
};

/** Badge court pour l’historique pack (gauche) : Admin · Adhérente · Historique */
export function getReservationActorBadge(source: "ADMIN" | "MEMBER" | null): ReservationActorBadge {
  if (source === "ADMIN") {
    return {
      label: "Admin",
      className: "border border-sky-200 bg-sky-50 text-sky-900",
    };
  }
  if (source === "MEMBER") {
    return {
      label: "Adhérente",
      className: "border border-violet-200 bg-violet-50 text-violet-900",
    };
  }
  return {
    label: "Historique",
    className: "border border-zinc-200 bg-zinc-50 text-zinc-700",
  };
}
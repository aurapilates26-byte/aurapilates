export function reservationStatusBadgeClass(status: string) {
  if (status === "ATTENDED") return "border border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "BOOKED") return "border border-sky-200 bg-sky-50 text-sky-900";
  if (status === "WAITLIST") return "border border-amber-200 bg-amber-50 text-amber-900";
  if (status === "CANCELLED") return "border border-zinc-200 bg-zinc-100 text-zinc-700";
  return "border border-brand-medium/20 bg-zinc-50 text-brand-dark/80";
}

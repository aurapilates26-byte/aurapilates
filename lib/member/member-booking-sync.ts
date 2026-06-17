import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/** Recharge planning + réservations + cartes dashboard (RSC) après une action membre. */
export async function refreshMemberBookingUi(
  loadAll: () => Promise<void>,
  router: Pick<AppRouterInstance, "refresh">,
): Promise<void> {
  await loadAll();
  router.refresh();
}

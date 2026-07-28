export const dynamic = "force-dynamic";

/**
 * La home est rendue par `app/(public)/(marketing)/layout.tsx` via `<LandingPage />`.
 * Cette page existe pour que la route `/` soit résolue (et ne tombe plus en 404).
 */
export default function MarketingHomePage() {
  return null;
}

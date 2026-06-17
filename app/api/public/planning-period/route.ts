import { getPlanningPeriodConfigEnriched } from "@/lib/admin/planning-period-config";

/** Période planning (lecture seule, site public). */
export async function GET() {
  const config = await getPlanningPeriodConfigEnriched();
  return Response.json(config);
}

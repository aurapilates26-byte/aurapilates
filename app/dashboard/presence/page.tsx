import { PresenceRosterClient } from "@/components/dashboard/presence-roster-client";
import { requireStaff } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ qr?: string }>;
};

export default async function PresencePage({ searchParams }: PageProps) {
  await requireStaff();
  const { qr } = await searchParams;

  return <PresenceRosterClient initialQrPublicId={qr ?? ""} />;
}

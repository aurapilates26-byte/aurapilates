import { DashboardHeader } from "@/components/dashboard/header";
import { QrCodeHeaderActions } from "@/components/dashboard/qr-code-header-actions";
import { QrCodeManager } from "@/components/dashboard/qr-code-manager";
import { requireStaff } from "@/lib/auth";

export default async function AdminQrCodePage() {
  await requireStaff();

  return (
    <div className="space-y-6">
      <DashboardHeader
        role="ADMIN"
        showRoleLine={false}
        title="QR codes"
        description="Préparez ici les QR codes pour l'accès, le pointage et le suivi des séances."
        actions={<QrCodeHeaderActions />}
      />

      <QrCodeManager />
    </div>
  );
}


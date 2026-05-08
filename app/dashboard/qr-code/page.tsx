import { DashboardHeader } from "@/components/dashboard/header";
import { QrCodeHeaderActions } from "@/components/dashboard/qr-code-header-actions";
import { QrCodeManager } from "@/components/dashboard/qr-code-manager";
import { requireRole } from "@/lib/auth";

export default async function AdminQrCodePage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <DashboardHeader
        role="ADMIN"
        showRoleLine={false}
        title="QR codes"
        description="Preparez ici les QR codes pour l'acces, le check-in et le suivi des seances. Cette etape reste volontairement concentree sur l'interface avant l'integration backend."
        actions={<QrCodeHeaderActions />}
      />

      <QrCodeManager />
    </div>
  );
}

